from xgboost import XGBClassifier
from orion import generate_proof
import pandas as pd

# Load the pre-trained XGBoost model
model = XGBClassifier()
model.load_model("../Data/xgb_model.json")

def generate_zkp(input_data_path):
    # Load input data
    input_data = pd.read_csv(input_data_path)

    # Generate proof
    proof = generate_proof(model, input_data)

    # Save proof
    with open("proof.json", "w") as f:
        json.dump(proof, f)
    return proof

def verify_zkp(proof_path):
    from gkr import verify_with_gkr
    with open(proof_path, "r") as f:
        proof = json.load(f)
    return verify_with_gkr(proof)