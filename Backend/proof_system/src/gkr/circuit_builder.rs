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
                let gate = Gate::Mul { // Or a specific ConvGate if needed
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
                };
                gates.insert(gate_id_counter, gate);
                create_wires_for_gate(&mut gates, &mut wires, &node_outputs, &input_names, gate_id_counter);
                store_output_gate_id(&mut node_outputs, &output_names, gate_id_counter);
                gate_id_counter += 1;
            }
            "Relu" => { // Example: Handling ReLU
                let gate = Gate::Mul { // Or a specific ReluGate if needed
                    id: gate_id_counter,
                    input1: 0,
                    input2: 0,
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

    let circuit = Circuit::new(
        gates,
        wires,
        input_gate_ids,
        output_gate_ids,
        num_layers,
    );

    Ok(circuit)
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
                    _ => {}
                }
            }
        }
    }
}

fn store_output_gate_id(
    node_outputs: &mut HashMap<String, usize>,
    output_names: &[String],
    current_gate_id: usize,
) {
    if let Some(output_name) = output_names.get(0) {
        node_outputs.insert(output_name.clone(), current_gate_id);
    }
}

fn calculate_num_layers(
    gates: &HashMap<usize, Gate>,
    wires: &Vec<Wire>,
    input_gate_ids: &[usize],
) -> Option<usize> {
    // Implement topological sort here (Kahn's algorithm or DFS)
    // and calculate the number of layers based on the sorted order.
    // Placeholder:
    Some(1)
}

fn identify_output_gates(
    session: &onnxruntime::Session,
    node_outputs: &HashMap<String, usize>,
) -> Result<Vec<usize>, String> {
    let graph = session.graph();
    let mut output_gate_ids = Vec::new();
    for output_idx in 0..graph.output_count() {
        let output = graph.output_by_index(output_idx).map_err(|e| e.to_string())?;
        let output_name = output.name().map_err(|e| e.to_string())?;
        if let Some(gate_id) = node_outputs.get(output_name) {
            output_gate_ids.push(*gate_id);
        }
    }
    Ok(output_gate_ids)
}