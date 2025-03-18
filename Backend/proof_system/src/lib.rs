use pyo3::prelude::*;
use pyo3::exceptions::{PyRuntimeError, PyValueError};
use poly_commit::orion::OrionSIMDFieldPCS;
use gkr_field_config::M31; // Example - Replace with your GKR config
use transcript::Sha256Transcript; // Example - Replace with your transcript
use crate::gkr::circuit_builder::build_circuit_from_onnx; // Import the function
use crate::gkr::prover::Prover; // Import the Prover
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};

/// Generate a proof from an input file path
#[pyfunction]
fn generate_proof(input_path: String) -> PyResult<String> {
    // 1. Construct the circuit from the ONNX model.
    let circuit = match build_circuit_from_onnx(&input_path) {
        Ok(c) => c,
        Err(e) => return Err(PyRuntimeError::new_err(format!("Failed to build circuit: {}", e))),
    };

    // 2. Read input values from the input file.
    let input_values = match read_input_values(&input_path) {
        Ok(values) => values,
        Err(e) => return Err(PyRuntimeError::new_err(format!("Failed to read input values: {}", e))),
    };

    // 3. Create a Prover instance.
    let prover = Prover::new(circuit);

    // 4. Generate the proof.
    let proof = unsafe { prover.generate_proof(&input_values) }; // Assuming generate_proof is unsafe

    // 5. Serialize the proof (for now, convert to a string).
    let proof_string = format!("{:?}", proof); // Placeholder serialization.

    // 6. Return the proof string.
    Ok(proof_string)
}

/// Reads input values from a file and returns them as a HashMap.
fn read_input_values(input_path: &str) -> Result<HashMap<usize, u64>, String> {
    let file = File::open(input_path).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);

    let mut input_values = HashMap::new();
    let mut gate_id = 0; // Assuming input gate IDs start from 0.
    let mut input_count = 0; // Track the number of inputs read.

    for line in reader.lines() {
        let line = line.map_err(|e| e.to_string())?;
        let value: f64 = line.parse().map_err(|e| e.to_string())?;

        // Convert f64 to u64 (adjust based on your field representation).
        let value_u64 = value.to_bits();

        input_values.insert(gate_id, value_u64);
        gate_id += 1;
        input_count += 1;
    }

    if input_count != 11 {
        return Err("Input file must contain 11 values.".to_string());
    }

    Ok(input_values)
}

/// Verify a proof from a given proof file path
#[pyfunction]
fn verify_proof(proof_path: String) -> PyResult<bool> {
    // Example - You'll need to initialize these correctly based on your setup
    // let pcs = ...; // Instantiate OrionSIMDFieldPCS or access it appropriately

    // Example - Adapt this to call the correct methods on pcs
    // let verify_result = pcs.verify(&proof_path); // Example - Replace with actual call

    // For now, let's just return a placeholder
    Ok(true)
}

/// Python module definition
#[pymodule]
fn proof_system(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(generate_proof, m)?)?;
    m.add_function(wrap_pyfunction!(verify_proof, m)?)?;
    Ok(())
}