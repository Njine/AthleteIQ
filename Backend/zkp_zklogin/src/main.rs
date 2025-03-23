use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

use ethers::core::k256::ecdsa::SigningKey;
use ethers::signers::{LocalWallet, Signer};
use ethers::core::k256::SecretKey;
use expander_compiler::frontend::*;
// use extra::*;
use keccak_hash::keccak;
use blake2::{Blake2s256, Digest};
use hex;
use std::time::{SystemTime, UNIX_EPOCH};


fn rc() -> Vec<u64> {
    vec![
        0x0000000000000001,
        0x0000000000008082,
        0x800000000000808A,
        0x8000000080008000,
        0x000000000000808B,
        0x0000000080000001,
        0x8000000080008081,
        0x8000000000008009,
        0x000000000000008A,
        0x0000000000000088,
        0x0000000080008009,
        0x000000008000000A,
        0x000000008000808B,
        0x800000000000008B,
        0x8000000000008089,
        0x8000000000008003,
        0x8000000000008002,
        0x8000000000000080,
        0x000000000000800A,
        0x800000008000000A,
        0x8000000080008081,
        0x8000000000008080,
        0x0000000080000001,
        0x8000000080008008,
    ]
}

fn xor_in<C: Config, B: RootAPI<C>>(
    api: &mut B,
    mut s: Vec<Vec<Variable>>,
    buf: Vec<Vec<Variable>>,
) -> Vec<Vec<Variable>> {
    for y in 0..5 {
        for x in 0..5 {
            if x + 5 * y < buf.len() {
                s[5 * x + y] = xor(api, s[5 * x + y].clone(), buf[x + 5 * y].clone())
            }
        }
    }
    s
}

fn keccak_f<C: Config, B: RootAPI<C>>(
    api: &mut B,
    mut a: Vec<Vec<Variable>>,
) -> Vec<Vec<Variable>> {
    let mut b = vec![vec![api.constant(0); 64]; 25];
    let mut c = vec![vec![api.constant(0); 64]; 5];
    let mut d = vec![vec![api.constant(0); 64]; 5];
    let mut da = vec![vec![api.constant(0); 64]; 5];
    let rc = rc();

    for i in 0..24 {
        for j in 0..5 {
            let t1 = xor(api, a[j * 5 + 1].clone(), a[j * 5 + 2].clone());
            let t2 = xor(api, a[j * 5 + 3].clone(), a[j * 5 + 4].clone());
            c[j] = xor(api, t1, t2);
        }

        for j in 0..5 {
            d[j] = xor(
                api,
                c[(j + 4) % 5].clone(),
                rotate_left::<C>(&c[(j + 1) % 5], 1),
            );
            da[j] = xor(
                api,
                a[((j + 4) % 5) * 5].clone(),
                rotate_left::<C>(&a[((j + 1) % 5) * 5], 1),
            );
        }

        for j in 0..25 {
            let tmp = xor(api, da[j / 5].clone(), a[j].clone());
            a[j] = xor(api, tmp, d[j / 5].clone());
        }

        /*Rho and pi steps*/
        b[0] = a[0].clone();

        b[8] = rotate_left::<C>(&a[1], 36);
        b[11] = rotate_left::<C>(&a[2], 3);
        b[19] = rotate_left::<C>(&a[3], 41);
        b[22] = rotate_left::<C>(&a[4], 18);

        b[2] = rotate_left::<C>(&a[5], 1);
        b[5] = rotate_left::<C>(&a[6], 44);
        b[13] = rotate_left::<C>(&a[7], 10);
        b[16] = rotate_left::<C>(&a[8], 45);
        b[24] = rotate_left::<C>(&a[9], 2);

        b[4] = rotate_left::<C>(&a[10], 62);
        b[7] = rotate_left::<C>(&a[11], 6);
        b[10] = rotate_left::<C>(&a[12], 43);
        b[18] = rotate_left::<C>(&a[13], 15);
        b[21] = rotate_left::<C>(&a[14], 61);

        b[1] = rotate_left::<C>(&a[15], 28);
        b[9] = rotate_left::<C>(&a[16], 55);
        b[12] = rotate_left::<C>(&a[17], 25);
        b[15] = rotate_left::<C>(&a[18], 21);
        b[23] = rotate_left::<C>(&a[19], 56);

        b[3] = rotate_left::<C>(&a[20], 27);
        b[6] = rotate_left::<C>(&a[21], 20);
        b[14] = rotate_left::<C>(&a[22], 39);
        b[17] = rotate_left::<C>(&a[23], 8);
        b[20] = rotate_left::<C>(&a[24], 14);

        /*Xi state*/

        for j in 0..25 {
            let t = not(api, b[(j + 5) % 25].clone());
            let t = and(api, t, b[(j + 10) % 25].clone());
            a[j] = xor(api, b[j].clone(), t);
        }

        /*Last step*/

        for j in 0..64 {
            if rc[i] >> j & 1 == 1 {
                a[0][j] = api.sub(1, a[0][j]);
            }
        }
    }

    a
}

fn xor<C: Config, B: RootAPI<C>>(api: &mut B, a: Vec<Variable>, b: Vec<Variable>) -> Vec<Variable> {
    let nbits = a.len();
    let mut bits_res = vec![api.constant(0); nbits];
    for i in 0..nbits {
        bits_res[i] = api.add(a[i].clone(), b[i].clone());
    }
    bits_res
}

fn and<C: Config, B: RootAPI<C>>(api: &mut B, a: Vec<Variable>, b: Vec<Variable>) -> Vec<Variable> {
    let nbits = a.len();
    let mut bits_res = vec![api.constant(0); nbits];
    for i in 0..nbits {
        bits_res[i] = api.mul(a[i].clone(), b[i].clone());
    }
    bits_res
}

fn not<C: Config, B: RootAPI<C>>(api: &mut B, a: Vec<Variable>) -> Vec<Variable> {
    let mut bits_res = vec![api.constant(0); a.len()];
    for i in 0..a.len() {
        bits_res[i] = api.sub(1, a[i].clone());
    }
    bits_res
}

fn rotate_left<C: Config>(bits: &Vec<Variable>, k: usize) -> Vec<Variable> {
    let n = bits.len();
    let s = k & (n - 1);
    let mut new_bits = bits[(n - s) as usize..].to_vec();
    new_bits.append(&mut bits[0..(n - s) as usize].to_vec());
    new_bits
}

fn copy_out_unaligned(s: Vec<Vec<Variable>>, rate: usize, output_len: usize) -> Vec<Variable> {
    let mut out = vec![];
    let w = 8;
    let mut b = 0;
    while b < output_len {
        for y in 0..5 {
            for x in 0..5 {
                if x + 5 * y < rate / w && b < output_len {
                    out.append(&mut s[5 * x + y].clone());
                    b += 8;
                }
            }
        }
    }
    out
}

fn compute_keccak<C: Config, B: RootAPI<C>>(api: &mut B, p: &Vec<Variable>) -> Vec<Variable> {
    let mut ss = vec![vec![api.constant(0); 64]; 25];
    let mut new_p = p.clone();
    let mut append_data = vec![0; 136 - 64];
    append_data[0] = 1;
    append_data[135 - 64] = 0x80;
    for i in 0..136 - 64 {
        for j in 0..8 {
            new_p.push(api.constant(((append_data[i] >> j) & 1) as u32));
        }
    }
    let mut p = vec![vec![api.constant(0); 64]; 17];
    for i in 0..17 {
        for j in 0..64 {
            p[i][j] = new_p[i * 64 + j].clone();
        }
    }
    ss = xor_in(api, ss, p);
    ss = keccak_f(api, ss);
    copy_out_unaligned(ss, 136, 32)
}

declare_circuit!(ZkLoginCircuit {
    input: [Variable; 64 * 8], // Private input [(sub+email+aud+salt) blake 32] + [(salt+email+aud+sub+salt) blake 32] => 64
    output: [PublicVariable; 20 * 8], // Public output to be verified eth wallet key => 20
});

impl Define<GF2Config> for ZkLoginCircuit<Variable> {
    fn define<Builder: RootAPI<GF2Config>>(&self, api: &mut Builder) {
        let expected_output = &self.output;
        let circuit_output = compute_keccak(api, &self.input.to_vec());

        let eth_address = api.new_hint("myhint.hi", &circuit_output, 20 * 8);

        // Assert that generated address is equal to the provided address
        for i in 0..20 {
            api.assert_is_equal(eth_address[i].clone(), expected_output[i].clone());
        }
    }
}

// New hint function to derive Ethereum address from keccak hash
fn keccak_to_eth_address_hint(hash: &[GF2], address: &mut [GF2]) -> Result<(), Error> {
    // Convert GF2 array to bytes
    let mut hash_bytes = [0u8; 32];
    for i in 0..32 {
        for j in 0..8 {
            if hash[i*8 + j] == GF2::from(1u32) {
                hash_bytes[i] |= 1 << j;
            }
        }
    }
    
    let private_key = SecretKey::from_slice(&hash_bytes).expect("Failed to generate valid private key");
    let wallet = LocalWallet::from(SigningKey::from(private_key));
    let eth_address = wallet.address();
    // println!("Ethereum Hint Address: {}", hex::encode(&eth_address));
    
    let address_bytes = eth_address.as_bytes();
    for i in 0..20 {
        for j in 0..8 {
            let bit = (address_bytes[i] >> j) & 1;
            address[i*8 + j] = GF2::from(bit as u32);
        }
    }
    
    Ok(())
}


/// Convert 32-byte Keccak hash into a valid Ethereum private key
fn hash_to_private_key(hash: [u8; 32]) -> SecretKey {
    // Ensure it's a valid secret key for secp256k1
    SecretKey::from_slice(&hash).expect("Failed to generate valid private key")
}

/// Generate an Ethereum wallet from the seed
fn generate_wallet(hash: [u8; 32]) -> [u8; 20] {
    // Convert seed to a private key
    let private_key = hash_to_private_key(hash);
    // println!("SecretKey (hex): {}", hex::encode(private_key.to_bytes()));


    // Create an Ethereum wallet
    let wallet = LocalWallet::from(SigningKey::from(private_key));

    wallet.address().into()
}

fn bytes_to_bits_20(bytes: &[u8], num_bytes: usize) -> [GF2; 20 * 8] {
    let mut result = [GF2::from(0u32); 20 * 8];

    for (i, &byte) in bytes.iter().enumerate().take(num_bytes) {
        for j in 0..8 {
            let bit = (byte >> j) & 1;
            result[i * 8 + j] = GF2::from(bit as u32);
        }
    }

    result
}

// Helper function to convert bytes to bits (as GF2 values) for the total input
fn bytes_to_bits_64(bytes: &[u8], num_bytes: usize) -> [GF2; 64 * 8] {
    let mut result = [GF2::from(0u32); 64 * 8];

    for (i, &byte) in bytes.iter().enumerate().take(num_bytes) {
        for j in 0..8 {
            let bit = (byte >> j) & 1;
            result[i * 8 + j] = GF2::from(bit as u32);
        }
    }

    result
}


// Shared state to store the compiled circuit
struct AppState {
    compiled_circuit: Mutex<CompileResult<GF2Config>>,
}



// Request/response structures
#[derive(Deserialize)]
struct ZkLoginRequest {
    sub: String,
    email: String,
    aud: String,
    salt: String,
}

#[derive(Serialize)]
struct ZkLoginResponse {
    success: bool,
    ethereum_address: String,
    proof_hash: String,
    timestamp: u64,
    signature: String,
    message: String,
}


// Initialize the circuit once during server startup
fn initialize_circuit() -> CompileResult<GF2Config> {
    let mut hint_registry = HintRegistry::<GF2>::new();
    hint_registry.register("myhint.hi", keccak_to_eth_address_hint);
    
    let compile_result = compile(&ZkLoginCircuit::default(), CompileOptions::default()).unwrap();
    
    compile_result
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}


async fn generate_proof(
    data: web::Json<ZkLoginRequest>,
    app_state: web::Data<AppState>,
) -> impl Responder {
    
    if data.sub.is_empty() || data.email.is_empty() || data.aud.is_empty() || data.salt.is_empty() {
        return HttpResponse::NotFound()
        .json(ErrorResponse { 
            error: "Access denied: Missing required fields".to_string() 
            });
        }
        
    let request = data.into_inner();
    
    // Hash the inputs using Blake2s (as in your original code)
    let mut hash_1 = Blake2s256::new();
    hash_1.update(request.sub.as_bytes());
    hash_1.update(request.email.as_bytes());
    hash_1.update(request.aud.as_bytes());
    hash_1.update(request.salt.as_bytes());
    let hash1 = hash_1.finalize();

    let mut hash_2 = Blake2s256::new();
    hash_2.update(request.salt.as_bytes());
    hash_2.update(request.email.as_bytes());
    hash_2.update(request.aud.as_bytes());
    hash_2.update(request.sub.as_bytes());
    hash_2.update(request.salt.as_bytes());
    let hash2 = hash_2.finalize();

    // Combine hashes
    let mut final_hash = [0u8; 64];
    final_hash[..32].copy_from_slice(&hash1);
    final_hash[32..].copy_from_slice(&hash2);
    
    let output: [u8; 32] = keccak(&final_hash).into();
    
    // Generate wallet address from keccak256
    let address = generate_wallet(output);
    let address_hex = hex::encode(&address);
    
    // Convert bytes to bits for the circuit
    let input_bits = bytes_to_bits_64(&final_hash, 64);
    let output_bits = bytes_to_bits_20(&address, 20);
    
    let assignment = ZkLoginCircuit::<GF2> {
        input: input_bits,
        output: output_bits,
    };
    
    let assignments = vec![assignment.clone(); 8];
    
    // Access the shared circuit and hint registry
    let compile_result = &app_state.compiled_circuit.lock().unwrap();

    let mut hint_registry = HintRegistry::<GF2>::new();
    hint_registry.register("myhint.hi", keccak_to_eth_address_hint);
    
    
    // Generate witness and proof
    let witness = compile_result
        .witness_solver
        .solve_witnesses_with_hints(&assignments, &mut hint_registry)
        .unwrap();
    
    let output = compile_result.layered_circuit.run(&witness);
    
    // Export to expander flatten
    let mut expander_circuit = compile_result.layered_circuit.export_to_expander_flatten();
    let config = GF2Config::new_expander_config();
    
    let (simd_input, simd_public_input) = witness.to_simd();
    expander_circuit.layers[0].input_vals = simd_input;
    expander_circuit.public_input = simd_public_input.clone();
    
    // Generate proof
    expander_circuit.evaluate();
    let (claimed_v, proof) = gkr::executor::prove(&mut expander_circuit, &config);
    
    // Get proof data
    let proof_data = gkr::executor::dump_proof_and_claimed_v(&proof, &claimed_v).unwrap();
    
    // Hash the proof
    let mut blake_hasher = Blake2s256::new();
    blake_hasher.update(&proof_data);
    let blake_hash = blake_hasher.finalize();
    let proof_hash = hex::encode(&blake_hash);
    
    // Get current timestamp
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_secs();
    
    // Create message to sign: (timestamp, proof_hash, address)
    let message = format!("{}:{}:0x{}", timestamp, proof_hash, address_hex);

    // Sign the message with the wallet
    let key: [u8; 32] = hex::decode("4c0883a69102937d6231471b5dbb6204fe512961708279826f9569e293e3837e").expect("Invalid hex private key").try_into().expect("Private key must be 32 bytes");
    let priv_key =  hash_to_private_key(key);
    let wallet = LocalWallet::from(SigningKey::from(priv_key));
    let message_hash = keccak(message.as_bytes());
    let signature = wallet.sign_message(message_hash).await.unwrap();
    let signature_hex = format!("0x{}", hex::encode(signature.to_vec()));
    // println!("msg: {:?}\nhash: {:?}\nSign: {:?}\n", message, message_hash, signature_hex);
    
    // Return JSON response with the signature
    HttpResponse::Ok().json(ZkLoginResponse {
        success: output[0],
        ethereum_address: address_hex,
        proof_hash,
        timestamp,
        message,
        signature: signature_hex,
    })
}


async fn options_handler() -> impl Responder {
    HttpResponse::Ok()
        .append_header(("Access-Control-Allow-Origin", "*"))
        .append_header(("Access-Control-Allow-Methods", "POST, OPTIONS"))
        .append_header(("Access-Control-Allow-Headers", "*"))
        .finish()
}

async fn index() -> impl Responder {
    HttpResponse::Ok().body("nothing to see here")
}

async fn ping() -> impl Responder {
    HttpResponse::Ok()
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize circuit only once
    let compile_result = initialize_circuit();
    
    // Create shared application state
    let app_state = web::Data::new(AppState {
        compiled_circuit: Mutex::new(compile_result),
    });
    
    println!("Server starting at http://127.0.0.1:8080");
    
    // Start HTTP server
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allowed_methods(vec!["GET", "POST", "OPTIONS"])
                    .allowed_headers(vec!["Content-Type"])
            )
            .route("/api/zklogin", web::post().to(generate_proof))
            .route("/api/zklogin", web::method(actix_web::http::Method::OPTIONS).to(options_handler))
            .route("/", web::get().to(index))
            .route("/live", web::get().to(ping))
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}