import * as snarkjs from "snarkjs";
import { writeFileSync } from "fs";

async function generateProof() {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { secret: "user-secret", hash: "hashed-secret" },
        "circuit.wasm",
        "circuit_final.zkey"
    );

    console.log("Proof:", proof);
    console.log("Public Signals:", publicSignals);

    writeFileSync("proof.json", JSON.stringify(proof));
    writeFileSync("publicSignals.json", JSON.stringify(publicSignals));
}

generateProof().catch(console.error);