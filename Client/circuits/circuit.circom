pragma circom 2.0.0;

template Main() {
    signal input secret;
    signal input hash;
    signal output verified;

    // Verify that the hash of the secret matches the input hash
    component hashCheck = Sha256(256);
    hashCheck.in <== secret;
    verified <== hashCheck.out == hash;
}

component main = Main();