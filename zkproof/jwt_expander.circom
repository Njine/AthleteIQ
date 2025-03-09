pragma circom 2.0.0;

include "expander/expander.circom"; // Hypothetical include from Polyhedra’s Expander library

template WalletKeyProof() {
    // Public input: The wallet key derived on the client
    signal input publicWalletKey;

    // Private inputs: The components used to derive the wallet key
    signal input salt;      // 32-byte salt as a field element
    signal input userSub;   // User unique ID (converted to field element)
    signal input userAud;   // Client identifier (converted to field element)

    // Compute the wallet key inside the circuit.
    signal computedWalletKey;
    computedWalletKey <== expanderHash([salt, userSub, userAud]);

    // Constraint: Ensure the computed wallet key equals the public wallet key.
    computedWalletKey === publicWalletKey;
}

component main = WalletKeyProof();
