use onnxruntime::{environment::Environment, GraphOptimizationLevel, Session, SessionOptions, Value, NodeInfo};
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
    let mut gemm_weights: HashMap<usize, Vec<f32>> = HashMap::new();
    let mut node_outputs: HashMap<String, Vec<usize>> = HashMap::new(); // Store multiple outputs
    let mut node_names_to_indices: HashMap<String, usize> = HashMap::new(); // Map node names to indices for easier access

    // First, build a map of node names to indices for easier access later
    for node_idx in 0..graph.node_count() {
        if let Ok(node) = graph.node_by_index(node_idx) {
            if let Some(name) = node.name() {
                node_names_to_indices.insert(name.to_string(), node_idx);
            }
        }
    }

    for node_idx in 0..graph.node_count() {
        let node = graph.node_by_index(node_idx).map_err(|e| e.to_string())?;
        let op_type = node.op_type();
        let node_name = node.name().map_or("".to_string(), |name| name.to_string());

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
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Mul" => {
                let gate = Gate::Mul {
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Input" => {
                let gate = Gate::Input {
                    id: gate_id_counter,
                };
                gates.insert(gate_id_counter, gate);
                input_gate_ids.push(gate_id_counter);
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Conv" => {
                // Extract attributes (simplified)
                let kernel_shape = get_attribute_int_array(&node, "kernel_shape")?;
                let pads = get_attribute_int_array(&node, "pads")?;
                let strides = get_attribute_int_array(&node, "strides")?;

                let gate = Gate::Conv {
                    id: gate_id_counter,
                    input: 0,
                    kernel_shape,
                    pads,
                    strides,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Relu" => {
                let gate = Gate::Relu {
                    id: gate_id_counter,
                    input: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Gemm" => {
                // Extract attributes (simplified)
                let alpha = get_attribute_float(&node, "alpha")?.unwrap_or(1.0);
                let beta = get_attribute_float(&node, "beta")?.unwrap_or(1.0);
                let trans_a = get_attribute_int(&node, "transA")?.unwrap_or(0) != 0;
                let trans_b = get_attribute_int(&node, "transB")?.unwrap_or(0) != 0;

                let gate = Gate::Gemm {
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
                    alpha,
                    beta,
                    trans_a,
                    trans_b,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);

                // --- Extract weights and convert to column-major ---
                if let Some(weight_tensor) = node.input_by_index(1) {
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
                // Extract attributes (simplified)
                let kernel_shape = get_attribute_int_array(&node, "kernel_shape")?;
                let pads = get_attribute_int_array(&node, "pads")?;
                let strides = get_attribute_int_array(&node, "strides")?;

                let gate = Gate::MaxPool {
                    id: gate_id_counter,
                    input: 0,
                    kernel_shape,
                    pads,
                    strides,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Identity" => {
                let gate = Gate::Identity { // Specific Identity gate
                    id: gate_id_counter,
                    input: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
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

// --- Helper Functions ---

fn create_wires_for_gate(
    gates: &mut HashMap<usize, Gate>,
    wires: &mut Vec<Wire>,
    node_outputs: &mut HashMap<String, Vec<usize>>,
    node_names_to_indices: &HashMap<String, usize>,
    node: &onnxruntime::NodeInfo,
    current_gate_id: usize,
) -> Result<(), String> {
    for i in 0..node.input_count() {
        if let Ok(input_name) = node.input_name(i) {
            // Find the node and output index that produces this input
            if let Some((producer_node_idx, producer_output_idx)) =
                find_node_producing_specific_output(node.graph(), input_name)
            {
                if let Ok(producer_node) = node.graph().node_by_index(producer_node_idx) {
                    if let Some(output_gate_ids) = node_outputs.get(producer_node.name().unwrap_or("unknown")) {
                        // Assuming the producer node's outputs are stored in the same order
                        if producer_output_idx < output_gate_ids.len() {
                            let from_gate_id = output_gate_ids[producer_output_idx];
                            wires.push(Wire {
                                from_gate: from_gate_id,
                                to_gate: current_gate_id,
                                to_input: i,
                            });
                            set_gate_input(gates, current_gate_id, i, from_gate_id);
                        } else {
                            return Err(format!(
                                "Producer node '{}' output index out of bounds",
                                producer_node.name().unwrap_or("unknown")
                            ));
                        }
                    } else {
                        return Err(format!(
                            "Producer node '{}' has no outputs",
                            producer_node.name().unwrap_or("unknown")
                        ));
                    }
                } else {
                    return Err(format!(
                        "Could not find producer node with index: {}",
                        producer_node_idx
                    ));
                }
            } else {
                return Err(format!("Could not find producer for input name: {}", input_name));
            }
        } else {
            return Err("Could not get input name".to_string());
        }
    }
    Ok(())
}

// Helper function to find the node and output index producing a specific output
fn find_node_producing_specific_output(
    graph: &onnxruntime::Graph,
    output_name: &str,
) -> Option<(usize, usize)> {
    for node_idx in 0..graph.node_count() {
        if let Ok(node) = graph.node_by_index(node_idx) {
            for i in 0..node.output_count() {
                if let Ok(name) = node.output_name(i) {
                    if name == output_name {
                        return Some((node_idx, i));
                    }
                }
            }
        }
    }
    None
}

fn set_gate_input(gates: &mut HashMap<usize, Gate>, gate_id: usize, input_index: usize, from_gate_id: usize) {
    if let Some(gate) = gates.get_mut(&gate_id) {
        match gate {
            Gate::Add { input1, input2, .. } |
            Gate::Mul { input1, input2, .. } |
            Gate::Gemm { input1, input2, .. } => {
                if input_index == 0 {
                    *input1 = from_gate_id;
                } else if input_index == 1 {
                    *input2 = from_gate_id;
                }
            }
            Gate::Relu { input, .. } |
            Gate::Conv { input, .. } |
            Gate::MaxPool { input, .. } |
            Gate::Identity { input, .. } => {
                if input_index == 0 {
                    *input = from_gate_id;
                }
            }
            Gate::Input { .. } => {} // No inputs to set
        }
    }
}

fn store_output_gate_ids(
    node_outputs: &mut HashMap<String, Vec<usize>>,
    output_names: &[String],
    gate_id: usize,
) {
    for output_name in output_names {
        node_outputs
            .entry(output_name.clone())
            .or_insert_with(Vec::new)
            .push(gate_id);
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

/// Helper function to extract an integer attribute from an ONNX node.
fn get_attribute_int(node: &onnxruntime::NodeInfo, name: &str) -> Result<Option<i64>, String> {
    if let Ok(attr) = node.attribute_by_name(name) {
        if let Ok(int_value) = attr.i() {
            return Ok(Some(int_value));
        } else {
            return Err(format!("Attribute '{}' is not an integer", name));
        }
    }
    Ok(None) // Attribute not found
}

/// Helper function to extract a float attribute from an ONNX node.
fn get_attribute_float(node: &onnxruntime::NodeInfo, name: &str) -> Result<Option<f32>, String> {
    if let Ok(attr) = node.attribute_by_name(name) {
        if let Ok(float_value) = attr.f() {
            return Ok(Some(float_value));
        } else {
            return Err(format!("Attribute '{}' is not a float", name));
        }
    }
    Ok(None) // Attribute not found
}

/// Helper function to extract an integer array attribute from an ONNX node.
fn get_attribute_int_array(node: &onnxruntime::NodeInfo, name: &str) -> Result<Vec<i64>, String> {
    if let Ok(attr) = node.attribute_by_name(name) {
        if let Ok(int_array) = attr.ints() {
            return Ok(int_array);
        } else {
            return Err(format!("Attribute '{}' is not an integer array", name));
        }
    }
    Err(format!("Attribute '{}' not found", name))
}

/// Helper function to identify output gates.
fn identify_output_gates(
    session: &onnxruntime::Session,
    node_outputs: &HashMap<String, Vec<usize>>,
) -> Result<Vec<usize>, String> {
    let mut output_gate_ids = Vec::new();
    let graph = session.graph();

    for output_idx in 0..graph.output_count() {
        if let Ok(output_name) = graph.output_name(output_idx) {
            if let Some(gate_ids) = node_outputs.get(output_name) {
                // Assuming the last gate producing the output is the final output gate
                if let Some(&gate_id) = gate_ids.last() {
                    output_gate_ids.push(gate_id);
                } else {
                    return Err(format!("No gate found for output '{}'", output_name));
                }
            } else {
                return Err(format!("Output '{}' not found in node outputs", output_name));
            }
        } else {
            return Err("Failed to get output name".to_string());
        }
    }
    Ok(output_gate_ids)
}

/// Helper function to calculate the number of layers in the circuit.
fn calculate_num_layers(
    gates: &HashMap<usize, Gate>,
    wires: &Vec<Wire>,
    input_gate_ids: &Vec<usize>,
) -> Option<usize> {
    if input_gate_ids.is_empty() {
        return Some(0); // Empty circuit
    }

    let mut max_depth = 0;
    let mut visited = HashMap::new();
    let mut queue = input_gate_ids.clone();

    while let Some(gate_id) = queue.pop() {
        let depth = *visited.get(&gate_id).unwrap_or(&0);
        max_depth = max_depth.max(depth);

        for wire in wires.iter().filter(|w| w.from_gate == gate_id) {
            let next_gate_id = wire.to_gate;
            if !visited.contains_key(&next_gate_id) {
                visited.insert(next_gate_id, depth + 1);
                queue.push(next_gate_id);
            }
        }
    }

    Some(max_depth + 1)
}

/// Helper function to calculate gates per layer and layer gate IDs.
fn calculate_gates_per_layer(
    gates: &HashMap<usize, Gate>,
    wires: &Vec<Wire>,
    num_layers: usize,
) -> (Vec<usize>, Vec<Vec<usize>>) {
    let mut layer_gate_ids: Vec<Vec<usize>> = vec![Vec::new(); num_layers];
    let mut gates_per_layer: Vec<usize> = vec![0; num_layers];

    let mut visited = HashMap::new();
    let mut queue: Vec<(usize, usize)> = gates
        .iter()
        .filter(|(_, gate)| matches!(gate, Gate::Input { .. }))
        .map(|(id, _)| (*id, 0))
        .collect();

    while let Some((gate_id, layer)) = queue.pop() {
        if visited.contains_key(&gate_id) {
            continue;
        }
        visited.insert(gate_id, layer);

        if layer < num_layers {
            layer_gate_ids[layer].push(gate_id);
            gates_per_layer[layer] += 1;

            for wire in wires.iter().filter(|w| w.from_gate == gate_id) {
                queue.push((wire.to_gate, layer + 1));
            }
        }
    }

    (gates_per_layer, layer_gate_ids)
}

/// Helper function to calculate layer gate indices.
fn calculate_layer_gate_indices(
    layer_gate_ids: &Vec<Vec<usize>>,
) -> HashMap<usize, usize> {
    let mut layer_gate_indices = HashMap::new();
    for (layer_idx, gate_ids)// filepath: /workspaces/AthleteIQ/Backend/proof_system/src/gkr/circuit_builder.rs

use onnxruntime::{environment::Environment, GraphOptimizationLevel, Session, SessionOptions, Value, NodeInfo};
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
    let mut gemm_weights: HashMap<usize, Vec<f32>> = HashMap::new();
    let mut node_outputs: HashMap<String, Vec<usize>> = HashMap::new(); // Store multiple outputs
    let mut node_names_to_indices: HashMap<String, usize> = HashMap::new(); // Map node names to indices for easier access

    // First, build a map of node names to indices for easier access later
    for node_idx in 0..graph.node_count() {
        if let Ok(node) = graph.node_by_index(node_idx) {
            if let Some(name) = node.name() {
                node_names_to_indices.insert(name.to_string(), node_idx);
            }
        }
    }

    for node_idx in 0..graph.node_count() {
        let node = graph.node_by_index(node_idx).map_err(|e| e.to_string())?;
        let op_type = node.op_type();
        let node_name = node.name().map_or("".to_string(), |name| name.to_string());

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
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Mul" => {
                let gate = Gate::Mul {
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Input" => {
                let gate = Gate::Input {
                    id: gate_id_counter,
                };
                gates.insert(gate_id_counter, gate);
                input_gate_ids.push(gate_id_counter);
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Conv" => {
                // Extract attributes (simplified)
                let kernel_shape = get_attribute_int_array(&node, "kernel_shape")?;
                let pads = get_attribute_int_array(&node, "pads")?;
                let strides = get_attribute_int_array(&node, "strides")?;

                let gate = Gate::Conv {
                    id: gate_id_counter,
                    input: 0,
                    kernel_shape,
                    pads,
                    strides,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Relu" => {
                let gate = Gate::Relu {
                    id: gate_id_counter,
                    input: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Gemm" => {
                // Extract attributes (simplified)
                let alpha = get_attribute_float(&node, "alpha")?.unwrap_or(1.0);
                let beta = get_attribute_float(&node, "beta")?.unwrap_or(1.0);
                let trans_a = get_attribute_int(&node, "transA")?.unwrap_or(0) != 0;
                let trans_b = get_attribute_int(&node, "transB")?.unwrap_or(0) != 0;

                let gate = Gate::Gemm {
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
                    alpha,
                    beta,
                    trans_a,
                    trans_b,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);

                // --- Extract weights and convert to column-major ---
                if let Some(weight_tensor) = node.input_by_index(1) {
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
                // Extract attributes (simplified)
                let kernel_shape = get_attribute_int_array(&node, "kernel_shape")?;
                let pads = get_attribute_int_array(&node, "pads")?;
                let strides = get_attribute_int_array(&node, "strides")?;

                let gate = Gate::MaxPool {
                    id: gate_id_counter,
                    input: 0,
                    kernel_shape,
                    pads,
                    strides,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Identity" => {
                let gate = Gate::Identity { // Specific Identity gate
                    id: gate_id_counter,
                    input: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &mut node_outputs, &node_names_to_indices, &node, gate_id_counter)?;
                store_output_gate_ids(&mut node_outputs, &output_names, gate_id_counter);
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

// --- Helper Functions ---

fn create_wires_for_gate(
    gates: &mut HashMap<usize, Gate>,
    wires: &mut Vec<Wire>,
    node_outputs: &mut HashMap<String, Vec<usize>>,
    node_names_to_indices: &HashMap<String, usize>,
    node: &onnxruntime::NodeInfo,
    current_gate_id: usize,
) -> Result<(), String> {
    for i in 0..node.input_count() {
        if let Ok(input_name) = node.input_name(i) {
            // Find the node and output index that produces this input
            if let Some((producer_node_idx, producer_output_idx)) =
                find_node_producing_specific_output(node.graph(), input_name)
            {
                if let Ok(producer_node) = node.graph().node_by_index(producer_node_idx) {
                    if let Some(output_gate_ids) = node_outputs.get(producer_node.name().unwrap_or("unknown")) {
                        // Assuming the producer node's outputs are stored in the same order
                        if producer_output_idx < output_gate_ids.len() {
                            let from_gate_id = output_gate_ids[producer_output_idx];
                            wires.push(Wire {
                                from_gate: from_gate_id,
                                to_gate: current_gate_id,
                                to_input: i,
                            });
                            set_gate_input(gates, current_gate_id, i, from_gate_id);
                        } else {
                            return Err(format!(
                                "Producer node '{}' output index out of bounds",
                                producer_node.name().unwrap_or("unknown")
                            ));
                        }
                    } else {
                        return Err(format!(
                            "Producer node '{}' has no outputs",
                            producer_node.name().unwrap_or("unknown")
                        ));
                    }
                } else {
                    return Err(format!(
                        "Could not find producer node with index: {}",
                        producer_node_idx
                    ));
                }
            } else {
                return Err(format!("Could not find producer for input name: {}", input_name));
            }
        } else {
            return Err("Could not get input name".to_string());
        }
    }
    Ok(())
}

// Helper function to find the node and output index producing a specific output
fn find_node_producing_specific_output(
    graph: &onnxruntime::Graph,
    output_name: &str,
) -> Option<(usize, usize)> {
    for node_idx in 0..graph.node_count() {
        if let Ok(node) = graph.node_by_index(node_idx) {
            for i in 0..node.output_count() {
                if let Ok(name) = node.output_name(i) {
                    if name == output_name {
                        return Some((node_idx, i));
                    }
                }
            }
        }
    }
    None
}

fn set_gate_input(gates: &mut HashMap<usize, Gate>, gate_id: usize, input_index: usize, from_gate_id: usize) {
    if let Some(gate) = gates.get_mut(&gate_id) {
        match gate {
            Gate::Add { input1, input2, .. } |
            Gate::Mul { input1, input2, .. } |
            Gate::Gemm { input1, input2, .. } => {
                if input_index == 0 {
                    *input1 = from_gate_id;
                } else if input_index == 1 {
                    *input2 = from_gate_id;
                }
            }
            Gate::Relu { input, .. } |
            Gate::Conv { input, .. } |
            Gate::MaxPool { input, .. } |
            Gate::Identity { input, .. } => {
                if input_index == 0 {
                    *input = from_gate_id;
                }
            }
            Gate::Input { .. } => {} // No inputs to set
        }
    }
}

fn store_output_gate_ids(
    node_outputs: &mut HashMap<String, Vec<usize>>,
    output_names: &[String],
    gate_id: usize,
) {
    for output_name in output_names {
        node_outputs
            .entry(output_name.clone())
            .or_insert_with(Vec::new)
            .push(gate_id);
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

/// Helper function to extract an integer attribute from an ONNX node.
fn get_attribute_int(node: &onnxruntime::NodeInfo, name: &str) -> Result<Option<i64>, String> {
    if let Ok(attr) = node.attribute_by_name(name) {
        if let Ok(int_value) = attr.i() {
            return Ok(Some(int_value));
        } else {
            return Err(format!("Attribute '{}' is not an integer", name));
        }
    }
    Ok(None) // Attribute not found
}

/// Helper function to extract a float attribute from an ONNX node.
fn get_attribute_float(node: &onnxruntime::NodeInfo, name: &str) -> Result<Option<f32>, String> {
    if let Ok(attr) = node.attribute_by_name(name) {
        if let Ok(float_value) = attr.f() {
            return Ok(Some(float_value));
        } else {
            return Err(format!("Attribute '{}' is not a float", name));
        }
    }
    Ok(None) // Attribute not found
}

/// Helper function to extract an integer array attribute from an ONNX node.
fn get_attribute_int_array(node: &onnxruntime::NodeInfo, name: &str) -> Result<Vec<i64>, String> {
    if let Ok(attr) = node.attribute_by_name(name) {
        if let Ok(int_array) = attr.ints() {
            return Ok(int_array);
        } else {
            return Err(format!("Attribute '{}' is not an integer array", name));
        }
    }
    Err(format!("Attribute '{}' not found", name))
}

/// Helper function to identify output gates.
fn identify_output_gates(
    session: &onnxruntime::Session,
    node_outputs: &HashMap<String, Vec<usize>>,
) -> Result<Vec<usize>, String> {
    let mut output_gate_ids = Vec::new();
    let graph = session.graph();

    for output_idx in 0..graph.output_count() {
        if let Ok(output_name) = graph.output_name(output_idx) {
            if let Some(gate_ids) = node_outputs.get(output_name) {
                // Assuming the last gate producing the output is the final output gate
                if let Some(&gate_id) = gate_ids.last() {
                    output_gate_ids.push(gate_id);
                } else {
                    return Err(format!("No gate found for output '{}'", output_name));
                }
            } else {
                return Err(format!("Output '{}' not found in node outputs", output_name));
            }
        } else {
            return Err("Failed to get output name".to_string());
        }
    }
    Ok(output_gate_ids)
}

/// Helper function to calculate the number of layers in the circuit.
fn calculate_num_layers(
    gates: &HashMap<usize, Gate>,
    wires: &Vec<Wire>,
    input_gate_ids: &Vec<usize>,
) -> Option<usize> {
    if input_gate_ids.is_empty() {
        return Some(0); // Empty circuit
    }

    let mut max_depth = 0;
    let mut visited = HashMap::new();
    let mut queue = input_gate_ids.clone();

    while let Some(gate_id) = queue.pop() {
        let depth = *visited.get(&gate_id).unwrap_or(&0);
        max_depth = max_depth.max(depth);

        for wire in wires.iter().filter(|w| w.from_gate == gate_id) {
            let next_gate_id = wire.to_gate;
            if !visited.contains_key(&next_gate_id) {
                visited.insert(next_gate_id, depth + 1);
                queue.push(next_gate_id);
            }
        }
    }

    Some(max_depth + 1)
}

/// Helper function to calculate gates per layer and layer gate IDs.
fn calculate_gates_per_layer(
    gates: &HashMap<usize, Gate>,
    wires: &Vec<Wire>,
    num_layers: usize,
) -> (Vec<usize>, Vec<Vec<usize>>) {
    let mut layer_gate_ids: Vec<Vec<usize>> = vec![Vec::new(); num_layers];
    let mut gates_per_layer: Vec<usize> = vec![0; num_layers];

    let mut visited = HashMap::new();
    let mut queue: Vec<(usize, usize)> = gates
        .iter()
        .filter(|(_, gate)| matches!(gate, Gate::Input { .. }))
        .map(|(id, _)| (*id, 0))
        .collect();

    while let Some((gate_id, layer)) = queue.pop() {
        if visited.contains_key(&gate_id) {
            continue;
        }
        visited.insert(gate_id, layer);

        if layer < num_layers {
            layer_gate_ids[layer].push(gate_id);
            gates_per_layer[layer] += 1;

            for wire in wires.iter().filter(|w| w.from_gate == gate_id) {
                queue.push((wire.to_gate, layer + 1));
            }
        }
    }

    (gates_per_layer, layer_gate_ids)
}

/// Helper function to calculate layer gate indices.
fn calculate_layer_gate_indices(
    layer_gate_ids: &Vec<Vec<usize>>,
) -> HashMap<usize, usize> {
    let mut layer_gate_indices = HashMap::new();
    for (layer_idx, gate_ids) in layer_gate_ids.iter().enumerate() {
        for (gate_idx, &gate_id) in gate_ids.iter().enumerate() {
            layer_gate_indices.insert(gate_id, gate_idx);
        }
    }
    layer_gate_indices
}
        .enumerate() {
            for (gate_idx, &gate_id) in gate_ids.iter().enumerate() {
                layer_gate_indices.insert(gate_id, gate_idx);
            }
        }
    layer_gate_indices
}