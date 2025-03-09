use core::arch::x86_64::*;

// Field Prime: p = 2^64 - 2^32 + 1
const P: u64 = 0xFFFFFFFF00000001;

// Precomputed Barrett Reduction multiplier μ = floor(2^128 / p)
const MU: u128 = (1u128 << 128) / (P as u128);

#[inline(always)]
unsafe fn mul_128_simd(a: __m256i, b: __m256i) -> (__m256i, __m256i) {
    // 1. Split 64-bit integers into 32-bit parts
    let a_lo = _mm256_and_si256(a, _mm256_set1_epi64x(0xFFFFFFFF));
    let a_hi = _mm256_srli_epi64(a, 32);
    let b_lo = _mm256_and_si256(b, _mm256_set1_epi64x(0xFFFFFFFF));
    let b_hi = _mm256_srli_epi64(b, 32);

    // 2. Perform 32x32 multiplications
    let lo_lo = _mm256_mul_epu32(a_lo, b_lo);
    let lo_hi = _mm256_mul_epu32(a_lo, b_hi);
    let hi_lo = _mm256_mul_epu32(a_hi, b_lo);
    let hi_hi = _mm256_mul_epu32(a_hi, b_hi);

    // 3. Combine the results to form 64-bit low and high parts of the 128-bit product

    // Expand to 64-bit: lo_lo, lo_hi, hi_lo, hi_hi are 32-bit, need to become 64-bit
    let lo_lo_wide = _mm256_cvtepu32_epi64( _mm_unpacklo_epi32(_mm256_castsi256_m128i(lo_lo), _mm_setzero_si128()));
    let lo_hi_wide = _mm256_cvtepu32_epi64( _mm_unpacklo_epi32(_mm256_castsi256_m128i(lo_hi), _mm_setzero_si128()));
    let hi_lo_wide = _mm256_cvtepu32_epi64( _mm_unpacklo_epi32(_mm256_castsi256_m128i(hi_lo), _mm_setzero_si128()));
    let hi_hi_wide = _mm256_cvtepu32_epi64( _mm_unpacklo_epi32(_mm256_castsi256_m128i(hi_hi), _mm_setzero_si128()));


    // Shift the intermediate products to their correct positions and add them together
    let low = lo_lo_wide; // No shift needed for the lowest part
    let mid_lo = _mm256_slli_epi64(lo_hi_wide, 32);
    let mid_hi = _mm256_slli_epi64(hi_lo_wide, 32);

    // Add the middle parts
    let mid = _mm256_add_epi64(mid_lo, mid_hi);

    // Add the low and middle parts
    let low = _mm256_add_epi64(low, mid);

    //high part
    let high = _mm256_add_epi64(hi_hi_wide, _mm256_srli_epi64(lo_hi_wide, 32));
    let high = _mm256_add_epi64(high, _mm256_srli_epi64(hi_lo_wide, 32));
    //4. Return the low and high 64-bit parts of the 128-bit product
    (low, high)
}

const P: u64 = 0xFFFFFFFF00000001;
const MU: u128 = (1u128 << 128) / (P as u128);

#[inline(always)]
unsafe fn barrett_reduce_64_simd(x: __m256i) -> __m256i {
    let mu_vec = _mm256_set1_epi64x(MU as i64);
    let p_vec = _mm256_set1_epi64x(P as i64);

    // Step 1: Multiply x by MU (approximate division)
    let (q_low, q_high) = mul_128_simd(x, _mm256_set1_epi64x(MU as i64));

    // Step 2: Extract relevant high bits
    // This is the crucial part that needs careful calculation based on MU
    // For this example, let's assume MU is precomputed for a 128-bit approximation
    // You'll need to adjust the shift based on your MU calculation and prime size
    let q = q_high; // Assuming q_high contains the relevant bits

    // Step 3: Multiply q by P to get approximate remainder
    let (r_low, r_high) = mul_128_simd(q, p_vec);

    // Step 4: Compute x - r
    let reduced = _mm256_sub_epi64(x, r_low);

    // Step 5: Conditional subtraction if reduced >= P
    let mask = _mm256_cmpgt_epi64(reduced, p_vec);
    let final_res = _mm256_sub_epi64(reduced, _mm256_and_si256(mask, p_vec));

    final_res
}

fn main() {
    unsafe {
        let test_vals: [u64; 4] = [P + 5, P + 10, P + 15, P + 20]; // Test inputs
        let x = _mm256_set_epi64x(test_vals[3] as i64, test_vals[2] as i64, test_vals[1] as i64, test_vals[0] as i64);

        let reduced_x = barrett_reduce_64_simd(x);

        let mut result: [u64; 4] = [0; 4];
        _mm256_storeu_si256(result.as_mut_ptr() as *mut __m256i, reduced_x);

        println!("Reduced Values: {:?}", result);
    }
}