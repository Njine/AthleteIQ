from flask import Flask, request, jsonify
import json

app = Flask(__name__)

@app.route("/generate_proof", methods=["POST"])
def generate_proof():
    data = request.json
    input_data_path = data["input_data_path"]
    proof = generate_zkp(input_data_path)
    return jsonify({"proof": proof})

@app.route("/verify_proof", methods=["POST"])
def verify_proof():
    data = request.json
    proof_path = data["proof_path"]
    if verify_zkp(proof_path):
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "error", "message": "Proof verification failed"})

if __name__ == "__main__":
    app.run(debug=True)