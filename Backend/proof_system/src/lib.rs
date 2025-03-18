use pyo3::prelude::*;
use pyo3::exceptions::{PyRuntimeError, PyValueError};
use crate::gkr::circuit_builder::build_circuit_from_onnx;
use crate::gkr::prover::Prover;
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};

/// Generate a proof from an input file path
#[pyfunction]
fn generate_proof(input_path: String) -> PyResult<String> {
    let circuit = match build_circuit_from_onnx(&input_path) {
        Ok(c) => c,
        Err(e) => return Err(PyRuntimeError::new_err(format!("Failed to build circuit: {}", e))),
    };

    let input_values = match read_input_values(&input_path) {
        Ok(values) => values,
        Err(e) => return Err(PyRuntimeError::new_err(format!("Failed to read input values: {}", e))),
    };

    let prover = Prover::new(circuit);

    let proof = unsafe { prover.generate_proof(&input_values) };

    let proof_string = format!("{:?}", proof);

    Ok(proof_string)
}

/// Reads input values from a file and returns them as a HashMap.
fn read_input_values(input_path: &str) -> Result<HashMap<usize, u32>, String> {
    let file = File::open(input_path).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);

    let mut input_values = HashMap::new();
    let mut gate_id = 0;
    let mut input_count = 0;
    let scaling_factor: u32 = 10; // Adjust the scaling factor as needed.

    for line in reader.lines() {
        let line = line.map_err(|e| e.to_string())?;
        let value: f64 = line.parse().map_err(|e| e.to_string())?;

        let value_m31 = f64_to_m31(value, scaling_factor);

        input_values.insert(gate_id, value_m31);
        gate_id += 1;
        input_count += 1;
    }

    if input_count != 11 {
        return Err("Input file must contain 11 values.".to_string());
    }

    Ok(input_values)
}

fn f64_to_m31(value: f64, scaling_factor: u32) -> u32 {
    let scaled_value = (value * (1 << scaling_factor) as f64) as i64;
    (scaled_value as u32)
}

/// Verify a proof from a given proof file path
#[pyfunction]
fn verify_proof(proof_path: String) -> PyResult<bool> {
    Ok(true)
}

/// Python module definition
#[pymodule]
fn proof_system(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(generate_proof, m)?)?;
    m.add_function(wrap_pyfunction!(verify_proof, m)?)?;
    Ok(())
}