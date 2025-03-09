// proof_system/src/gkr/utils.rs

/// Helper functions for GKR implementation.

// Example: Function for bit reversal (used in some GKR variants)
pub fn bit_reverse(x: usize, num_bits: usize) -> usize {
    let mut result = 0;
    for i in 0..num_bits {
        if (x >> i) & 1 != 0 {
            result |= 1 << (num_bits - 1 - i);
        }
    }
    result
}

// Add other utility functions as needed (e.g.,
// - Functions for field arithmetic operations (SIMD and potentially scalar)
// - Functions for data structure manipulation
// )