use pyo3::prelude::*;
use pyo3::exceptions::{PyRuntimeError, PyValueError};
use gkr::prover::Expander;

/// Generate a proof from an input file path
#[pyfunction]
fn generate_proof(input_path: String) -> PyResult<String> {
    let mut expander = Expander::new("proof_data");

    let proof_result = expander.generate(&input_path); // Get the Result

    let proof = proof_result
        .map_err(|e| PyErr::new::<PyRuntimeError, _>(format!("Proof generation failed: {}", e)))?;

    Ok(proof)
}

/// Verify a proof from a given proof file path
#[pyfunction]
fn verify_proof(proof_path: String) -> PyResult<bool> {
    let expander = Expander::new("proof_data");

    let verify_result = expander.verify(&proof_path); // Get the Result

    let result = verify_result
        .map_err(|e| PyErr::new::<PyValueError, _>(format!("Proof verification failed: {}", e)))?;

    Ok(result)
}

/// Python module definition
#[pymodule]
fn proof_system(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(generate_proof, m)?)?;
    m.add_function(wrap_pyfunction!(verify_proof, m)?)?;
    Ok(())
}