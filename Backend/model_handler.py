from flask import Flask, request, jsonify
import json
import pandas as pd
import pickle
from orion import generate_proof
from gkr import verify_with_gkr

app = Flask(__name__)

# Load the pre-trained XGBoost model from .pkl file
with open("/workspaces/AthleteIQ/Data/ATHLETEIQ.pkl", "rb") as f:
    model = pickle.load(f)

def generate_zkp(input_data_path):
    """
    Generate a Zero-Knowledge Proof (ZKP) for the given input data.
    """
    try:
        # Load input data
        input_data = pd.read_csv(input_data_path)

        # Generate proof using Orion
        proof = generate_proof(model, input_data)

        # Save proof to a file
        proof_path = "/workspaces/AthleteIQ/Data/proof.json"
        with open(proof_path, "w") as f:
            json.dump(proof, f)

        return proof
    except Exception as e:
        return {"error": str(e)}

def verify_zkp(proof_path):
    """
    Verify a Zero-Knowledge Proof (ZKP) using GKR.
    """
    try:
        # Load proof from file
        with open(proof_path, "r") as f:
            proof = json.load(f)

        # Verify proof using GKR
        return verify_with_gkr(proof)
    except Exception as e:
        return {"error": str(e)}

@app.route("/generate_proof", methods=["POST"])
def generate_proof_route():
    """
    API endpoint to generate a ZKP.
    """
    data = request.json
    input_data_path = data.get("input_data_path")

    if not input_data_path:
        return jsonify({"status": "error", "message": "input_data_path is required"}), 400

    proof = generate_zkp(input_data_path)
    if "error" in proof:
        return jsonify({"status": "error", "message": proof["error"]}), 500

    return jsonify({"proof": proof})

@app.route("/verify_proof", methods=["POST"])
def verify_proof_route():
    """
    API endpoint to verify a ZKP.
    """
    data = request.json
    proof_path = data.get("proof_path")

    if not proof_path:
        return jsonify({"status": "error", "message": "proof_path is required"}), 400

    verification_result = verify_zkp(proof_path)
    if "error" in verification_result:
        return jsonify({"status": "error", "message": verification_result["error"]}), 500

    if verification_result:
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "error", "message": "Proof verification failed"})

if __name__ == "__main__":
    app.run(debug=True)