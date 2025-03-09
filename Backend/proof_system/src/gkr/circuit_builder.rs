use core::arch::x86_64::*;
use std::collections::HashMap;

use crate::gkr::circuit::{Circuit, Gate};
use crate::mul_128_simd;
use crate::barrett_reduce_64_simd;
use crate::gkr::utils; // Import utils

/// The GKR prover.
pub struct Prover {
    circuit: Circuit,
    // Add any other prover-specific data here
}

impl Prover {
    /// Creates a new GKR prover.
    pub fn new(circuit: Circuit) -> Self {
        Prover {
            circuit,
        }
    }

    /// Generates a GKR proof for the given circuit and input values.
    pub unsafe fn generate_proof(&self, input_values: &HashMap<usize, u64>) -> Vec<__m256i> {
        let num_layers = self.circuit.num_layers;
        let mut layer_values: Vec<Vec<__m256i>> = Vec::with_capacity(num_layers);

        // === Step 1: Initialize Input Layer ===
        let mut input_layer: Vec<__m256i> = vec![_mm256_set1_epi64x(0); self.circuit.gates_per_layer[0]]; // Assuming gates_per_layer is added to Circuit
        
        for (&input_gate_id, &value) in input_values.iter() {
            let index = self.get_input_gate_index(input_gate_id);
            input_layer[index] = _mm256_set1_epi64x(value as i64);
        }
        
        layer_values.push(input_layer);

        // === Step 2: Process Each Layer Sequentially ===
        for layer_idx in 1..num_layers {
            let num_gates = self.circuit.gates_per_layer[layer_idx]; // Assuming gates_per_layer is added to Circuit
            let mut current_layer: Vec<__m256i> = vec![_mm256_set1_epi64x(0); num_gates];

            for gate_index in 0..num_gates {
                // let gate = self.get_gate_by_layer_and_index(layer_idx, gate_index); // No longer needed

                // Access gate directly from the precomputed layer order
                let gate_id = self.circuit.layer_gate_ids[layer_idx][gate_index]; // Assuming layer_gate_ids is added to Circuit
                let gate = &self.circuit.gates[&gate_id]; // Access gate by ID

                match gate {
                    Gate::Add { input1, input2 } => {
                        // Use precomputed indices (if you also precompute these in circuit_builder)
                        let input1_index = self.circuit.layer_gate_indices[layer_idx - 1][*input1]; // Example: Precomputed indices
                        let input2_index = self.circuit.layer_gate_indices[layer_idx - 1][*input2]; // Example: Precomputed indices

                        let input1_vec = layer_values[layer_idx - 1][input1_index];
                        let input2_vec = layer_values[layer_idx - 1][input2_index];
                        current_layer[gate_index] = _mm256_add_epi64(input1_vec, input2_vec);
                    }
                    Gate::Mul { input1, input2 } => {
                        // Use precomputed indices
                        let input1_index = self.circuit.layer_gate_indices[layer_idx - 1][*input1];
                        let input2_index = self.circuit.layer_gate_indices[layer_idx - 1][*input2];

                        let input1_vec = layer_values[layer_idx - 1][input1_index];
                        let input2_vec = layer_values[layer_idx - 1][input2_index];
                        let (prod_low, _) = mul_128_simd(input1_vec, input2_vec);
                        current_layer[gate_index] = barrett_reduce_64_simd(prod_low);
                    }
                    Gate::Relu { input } => {
                        // Use precomputed index
                        let input_index = self.circuit.layer_gate_indices[layer_idx - 1][*input];

                        let input_vec = layer_values[layer_idx - 1][input_index];
                        current_layer[gate_index] = _mm256_max_epi64(input_vec, _mm256_set1_epi64x(0));
                    }
                    Gate::Conv { input } => {
                        // Use precomputed index
                        let input_index = self.circuit.layer_gate_indices[layer_idx - 1][*input];

                        let input_vec = layer_values[layer_idx - 1][input_index];
                        current_layer[gate_index] = simd_convolution(input_vec); // Placeholder SIMD
                    }
                    Gate::Gemm { input1, input2 } => {
                        // Use precomputed indices
                        let input1_index = self.circuit.layer_gate_indices[layer_idx - 1][*input1];
                        let input2_index = self.circuit.layer_gate_indices[layer_idx - 1][*input2];

                        let input1_vec = layer_values[layer_idx - 1][input1_index];
                        let input2_vec = layer_values[layer_idx - 1][input2_index];
                        current_layer[gate_index] = simd_gemm(input1_vec, input2_vec); // Placeholder SIMD
                    }
                    Gate::Input { .. } => {} // Already handled
                }
            }
            layer_values.push(current_layer);
        }

        layer_values.last().unwrap().clone()
    }

    // --- Helper Functions (Placeholders - To be removed or replaced) ---

    /// Placeholder: Maps an input gate ID to its index in the input layer.
    fn get_input_gate_index(&self, gate_id: usize) -> usize {
        // Implement logic to determine the index of the input gate
        // based on your circuit structure.
        gate_id // Placeholder: Assuming gate ID is the index for simplicity
    }

    // Add other prover functions as needed
    // - Functions for generating proof messages
    // - Functions for handling communication with the verifier
    // - Helper functions for GKR computations
}