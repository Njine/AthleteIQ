// proof_system/src/gkr/circuit_builder.rs

use onnxruntime::{environment::Environment, GraphOptimizationLevel, Session, SessionOptions};
use std::collections::HashMap;

use crate::gkr::circuit::{Circuit, Gate, Wire};

/// Builds a GKR circuit from an ONNX model.
pub fn build_circuit_from_onnx(onnx_model_path: &str) -> Result<Circuit, String> {
    // 1. Load the ONNX model using onnxruntime (or your preferred library)
    let environment = Environment::new().map_err(|e| e.to_string())?;
    let mut session_options = SessionOptions::new().map_err(|e| e.to_string())?;
    session_options.set_graph_optimization_level(GraphOptimizationLevel::Basic);
    let session = Session::new(&environment, onnx_model_path, session_options)
        .map_err(|e| e.to_string())?;

    // 2. Iterate through the ONNX model's nodes (operators)
    let graph = session.graph();
    let mut gates = HashMap::new();
    let mut wires = Vec::new();
    let mut input_gate_ids = Vec::new();
    let mut output_gate_ids = Vec::new();
    let mut gate_id_counter: usize = 0;
    let mut num_layers: usize = 0;
    let mut gemm_weights: HashMap<usize, Vec<f32>> = HashMap::new(); // Initialize gemm_weights

    // A map to store node output names and their corresponding gate IDs
    let mut node_outputs: HashMap<String, usize> = HashMap::new();

    for node_idx in 0..graph.node_count() {
        let node = graph.node_by_index(node_idx).map_err(|e| e.to_string())?;
        let op_type = node.op_type();

        // Get input and output names for wire creation
        let input_names: Vec<String> = (0..node.input_count())
            .map(|i| node.input_name(i).map_err(|e| e.to_string()))
            .collect::<Result<Vec<String>, String>>()?;
        let output_names: Vec<String> = (0..node.output_name(i).map_err(|e| e.to_string()))
            .collect::<Result<Vec<String>, String>>()?;

        // 3. Create GKR gates based on ONNX operators
        match op_type {
            "Add" => {
                let gate = Gate::Add {
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &node_outputs, &input_names, gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Mul" => {
                let gate = Gate::Mul {
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &node_outputs, &input_names, gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Input" => {
                let gate = Gate::Input {
                    id: gate_id_counter,
                };
                gates.insert(gate_id_counter, gate);
                input_gate_ids.push(gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Conv" => {
                let gate = Gate::Conv {
                    id: gate_id_counter,
                    input: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &node_outputs, &input_names, gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Relu" => {
                let gate = Gate::Relu {
                    id: gate_id_counter,
                    input: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &node_outputs, &input_names, gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Gemm" => {
                let gate = Gate::Gemm {
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &node_outputs, &input_names, gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);

                // --- Extract weights and convert to column-major ---
                if let Some(weight_tensor) = node.input_by_index(1) { // Assuming weights are the second input
                    if let Ok(float_data) = weight_tensor.float_data() {
                        let dims = weight_tensor.dimensions().unwrap();
                        let rows = dims[0];
                        let cols = dims[1];

                        let mut column_major_weights = Vec::with_capacity(float_data.len());
                        for c in 0..cols {
                            for r in 0..rows {
                                column_major_weights.push(float_data[r * cols + c]);
                            }
                        }
                        gemm_weights.insert(gate_id_counter, column_major_weights);
                    }
                }

                gate_id_counter += 1;
            }
            "MaxPool" => {
                let gate = Gate::MaxPool {
                    id: gate_id_counter,
                    input: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &node_outputs, &input_names, gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            _ => {
                println!("Unsupported ONNX operator: {}", op_type);
            }
        }
    }

    // 5. Determine the number of layers in the circuit
    num_layers = calculate_num_layers(&gates, &wires, &input_gate_ids).unwrap_or(0);

    // 6. Identify output gates
    output_gate_ids = identify_output_gates(&session, &node_outputs)?;

    // --- New Logic for Layer Ordering and Indexing ---

    // 7. Calculate gates per layer and layer gate IDs
    let (gates_per_layer, layer_gate_ids) = calculate_gates_per_layer(&gates, &wires, num_layers);

    // 8. Calculate layer gate indices (mapping gate ID to index within layer)
    let layer_gate_indices = calculate_layer_gate_indices(&layer_gate_ids);

    let circuit = Circuit::new(
        gates,
        wires,
        input_gate_ids,
        output_gate_ids,
        num_layers,
        gates_per_layer,
        layer_gate_ids,
        layer_gate_indices,
        gemm_weights, // Pass gemm_weights to the Circuit
    );

    Ok(circuit)
}

// --- Helper Functions for Layer Ordering and Indexing ---

/// Calculates the number of gates per layer and the gate IDs for each layer.
fn calculate_gates_per_layer(
    gates: &HashMap<usize, Gate>,
    wires: &Vec<Wire>,
    num_layers: usize,
) -> (Vec<usize>, Vec<Vec<usize>>) {
    // 1. Calculate in-degrees for each gate
    let mut in_degree: HashMap<usize, usize> = HashMap::new();
    for gate_id in gates.keys() {
        in_degree.insert(*gate_id, 0);
    }
    for wire in wires {
        *in_degree.get_mut(&wire.to_gate).unwrap() += 1;
    }

    // Initialize data structures
    let mut gates_per_layer = vec![0; num_layers];
    let mut layer_gate_ids = vec![Vec::new(); num_layers];

    // 2. Perform topological sort layer by layer
    let mut queue: Vec<usize> = Vec::new();
    let mut layer_map: HashMap<usize, usize> = HashMap::new(); // Maps gate ID to layer
    let mut visited_count = 0;

    // Find initial input gates (in-degree 0)
    for &gate_id in gates.keys() {
        if in_degree[&gate_id] == 0 {
            queue.push(gate_id);
            layer_map.insert(gate_id, 0); // Input gates are in layer 0
        }
    }

    while let Some(u) = queue.pop() {
        visited_count += 1;
        let layer = layer_map[&u];

        gates_per_layer[layer] += 1;
        layer_gate_ids[layer].push(u);

        for wire in wires {
            if wire.from_gate == u {
                let v = wire.to_gate;
                *in_degree.get_mut(&v).unwrap() -= 1;
                if in_degree[&v] == 0 {
                    // Determine the layer of the next gate
                    let next_layer = layer + 1; // Assuming a simple layer progression
                    layer_map.insert(v, next_layer);
                    queue.push(v);
                }
            }
        }
    }

    (gates_per_layer, layer_gate_ids)
}

/// Calculates a mapping from gate ID to its index within its layer.
fn calculate_layer_gate_indices(
    layer_gate_ids: &Vec<Vec<usize>>,
) -> Vec<HashMap<usize, usize>> {
    let mut layer_gate_indices = Vec::new();

    for layer in layer_gate_ids {
        let mut indices = HashMap::new();
        for (index, &gate_id) in layer.iter().enumerate() {
            indices.insert(gate_id, index);
        }
        layer_gate_indices.push(indices);
    }

    layer_gate_indices
}

fn create_wires_for_gate(
    gates: &mut HashMap<usize, Gate>,
    wires: &mut Vec<Wire>,
    node_outputs: &HashMap<String, usize>,
    input_names: &[String],
    current_gate_id: usize,
) {
    for (i, input_name) in input_names.iter().enumerate() {
        if let Some(input_gate_id) = node_outputs.get(input_name) {
            wires.push(Wire {
                from_gate: *input_gate_id,
                to_gate: current_gate_id,
                to_input: i,
            });
            if let Some(gate) = gates.get_mut(&current_gate_id) {
                match gate {
                    Gate::Add { input1, input2, .. } => {
                        if i == 0 {
                            *input1 = *input_gate_id;
                        } else if i == 1 {
                            *input2 = *input_gate_id;
                        }
                    }
                    Gate::Mul { input1, input2, .. } => {
                        if i == 0 {
                            *input1 = *input_gate_id;
                        } else if i == 1 {
                            *input2 = *input_gate_id;
                        }
                    }
                    Gate::Relu { input, .. } => {
                        if i == 0 {
                            *input = *input_gate_id;
                        }
                    }
                    Gate::Conv { input, .. } => {
                        if i == 0 {
                            *input = *input_gate_id;
                        }
                    }
                    Gate::Gemm { input1, input2, .. } => {
                        if i == 0 {
                            *input1 = *input_gate_id;
                        } else if i == 1 {
                            *input2 = *input_gate_id;
                        }
                    }
                    Gate::MaxPool { input, .. } => {
                        if i == 0 {
                            *input = *input_gate_id;
                        }
                    }
                    _ => {}
                }
            }
        }
    }
}

/// Helper function to extract weight data from an ONNX tensor (assuming float).
fn extract_weight_data(tensor: &onnxruntime::Value) -> Result<Vec<f32>, String> {
    if let Ok(float_data) = tensor.float_data() {
        Ok(float_data)
    } else {
        Err("Failed to extract float data from tensor".to_string())
    }
}

/// Helper function to identify output gates.
fn identify_output_gates(
    session: &onnxruntime::Session,
    node_outputs: &HashMap<String, usize>,
) -> Result<Vec<usize>, String> {
    let mut output_gate_ids = Vec::new();
    let graph = session.graph();
    for output_idx in 0..graph.output_count() {
        let output_name = graph.output_name(output_idx).map_err(|e| e.to_string())?;
        if let Some(gate_id) = node_outputs.get(&output_name) {
            output_gate_ids.push(*gate_id);
        }
    }
    Ok(output_gate_ids)
}

/// Helper function to calculate the number of layers in the circuit.
fn calculate_num_layers(
    gates: &HashMap<usize, Gate>,
    wires: &Vec<Wire>,
    input_gate_ids: &Vec<usize>,
) -> Result<usize, String> {
    if gates.is_empty() {
        return Ok(0);
    }

    let mut max_layer = 0;
    let mut gate_layers: HashMap<usize, usize> = HashMap::new();

    // Assign layer 0 to input gates
    for &input_id in input_gate_ids.iter() {
        gate_layers.insert(input_id, 0);
    }

    // Calculate layers for other gates based on their inputs
    let mut changed = true;
    while changed {
        changed = false;
        for (gate_id, gate) in gates.iter() {
            if gate_layers.contains_key(gate_id) {
                continue; // Already assigned a layer
            }

            match gate {
                Gate::Add { input1, input2, .. } |
                Gate::Mul { input1, input2, .. } |
                Gate::Gemm { input1, input2, .. } => {
                    if let (Some(&layer1), Some(&layer2)) = (gate_layers.get(input1), gate_layers.get(input2)) {
                        let layer = std::cmp::max(layer1, layer2) + 1;
                        gate_layers.insert(*gate_id, layer);
                        max_layer = std::cmp::max(max_layer, layer);
                        changed = true;
                    }
                }
                Gate::Relu { input, .. } |
                Gate::Conv { input, .. } |
                Gate::MaxPool { input, .. } => {
                    if let Some(&layer) = gate_layers.get(input) {
                        let layer = layer + 1;
                        gate_layers.insert(*gate_id, layer);
                        max_layer = std::cmp::max(max_layer, layer);
                        changed = true;
                    }
                }
                Gate::Input { .. } => {} // Input gates already handled
            }
        }
    }

    Ok(max_layer + 1) // Add 1 to account for layer 0
}