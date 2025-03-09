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

    // A map to store node output names and their corresponding gate IDs
    let mut node_outputs: HashMap<String, usize> = HashMap::new();

    for node_idx in 0..graph.node_count() {
        let node = graph.node_by_index(node_idx).map_err(|e| e.to_string())?;
        let op_type = node.op_type();

        // Get input and output names for wire creation
        let input_names: Vec<String> = (0..node.input_count())
            .map(|i| node.input_name(i).map_err(|e| e.to_string()))
            .collect::<Result<Vec<String>, String>>()?;
        let output_names: Vec<String> = (0..node.output_count())
            .map(|i| node.output_name(i).map_err(|e| e.to_string()))
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
            "Conv" => { // Example: Handling Convolution
                let gate = Gate::Conv { // Or a specific ConvGate if needed
                    id: gate_id_counter,
                    input: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &node_outputs, &input_names, gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Relu" => { // Example: Handling ReLU
                let gate = Gate::Relu { // Or a specific ReluGate if needed
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
            // Handle other ONNX operators (e.g., "MaxPool", "Gemm", etc.)
            _ => {
                // For unsupported operations, you might return an error or skip them
                println!("Unsupported ONNX operator: {}", op_type);
            }
        }
    }

    // 5. Determine the number of layers in the circuit
    num_layers = calculate_num_layers(&gates, &wires, &input_gate_ids).unwrap_or(0); // Placeholder

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

    // Handle potential errors (e.g., cycle detection) - omitted for brevity

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