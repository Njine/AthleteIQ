// proof_system/src/gkr/circuit.rs

use std::collections::HashMap;

/// Represents a gate in the arithmetic circuit.
#[derive(Debug, Clone)]
pub enum Gate {
    Add {
        id: usize,
        input1: usize,
        input2: usize,
    },
    Mul {
        id: usize,
        input1: usize,
        input2: usize,
    },
    // Add other gate types as needed (e.g., constants, inputs)
    Input {
        id: usize,
    },
    // Example: A gate type for ReLU (you might need more specific gates)
    Relu {
        id: usize,
        input: usize,
    },
    Conv {
        id: usize,
        input: usize,
    },
    Gemm {
        id: usize,
        input1: usize,
        input2: usize,
    },
    MaxPool {
        id: usize,
        input: usize,
    },
    // ... other gate types
}

/// Represents a wire connecting two gates.
#[derive(Debug, Clone)]
pub struct Wire {
    pub from_gate: usize,
    pub to_gate: usize,
    pub to_input: usize, // Which input of the 'to_gate' this wire connects to
}

/// Represents the entire arithmetic circuit.
#[derive(Debug, Clone)]
pub struct Circuit {
    pub gates: HashMap<usize, Gate>,
    pub wires: Vec<Wire>,
    pub input_gate_ids: Vec<usize>,       // IDs of the input gates
    pub output_gate_ids: Vec<usize>,      // IDs of the output gates
    pub num_layers: usize,                // Number of layers in the circuit
    pub gates_per_layer: Vec<usize>,      // Number of gates per layer
    pub layer_gate_ids: Vec<Vec<usize>>,  // Gate IDs for each layer
    pub layer_gate_indices: Vec<HashMap<usize, usize>>, // Gate ID to index mapping
    pub gemm_weights: HashMap<usize, Vec<f32>>, // Store column-major weights for Gemm gates
}

impl Circuit {
    /// Creates a new circuit.
    pub fn new(
        gates: HashMap<usize, Gate>,
        wires: Vec<Wire>,
        input_gate_ids: Vec<usize>,
        output_gate_ids: Vec<usize>,
        num_layers: usize,
        gates_per_layer: Vec<usize>,
        layer_gate_ids: Vec<Vec<usize>>,
        layer_gate_indices: Vec<HashMap<usize, usize>>,
        gemm_weights: HashMap<usize, Vec<f32>>,
    ) -> Self {
        Circuit {
            gates,
            wires,
            input_gate_ids,
            output_gate_ids,
            num_layers,
            gates_per_layer,
            layer_gate_ids,
            layer_gate_indices,
            gemm_weights,
        }
    }

    // Add methods for:
    // - Getting a gate by its ID
    // - Getting the inputs of a gate
    // - (Optional) Methods for circuit traversal or manipulation
}