
import { ethers } from 'ethers';
import { EphemeralKeyPair, isValidEphemeralKeyPair } from './ephemeral';
import { decodeIdToken, isValidIdToken } from './idToken';
import { KeylessAccount, ZkLoginResponse } from './types';
import { blake2s } from 'blakejs';
import { NEXT_PUBLIC_ZK_PROVER_URL } from "./constants";

/**
 * Encoding for the KeylessAccount class to be stored in localStorage
 */
export const KeylessAccountEncoding = {
  decode: (e: any): KeylessAccount => ({
    address: e.address,
    ephemeralKeyPair: {
      privateKey: e.ephemeralKeyPair.privateKey,
      publicKey: e.ephemeralKeyPair.publicKey,
      address: e.ephemeralKeyPair.address,
      nonce: e.ephemeralKeyPair.nonce,
      expiryDateSecs: BigInt(e.ephemeralKeyPair.expiryDateSecs),
    },
    jwt: e.jwt,
    salt: e.salt,
    decodedJwt: e.decodedJwt,
  }),
  encode: (e: KeylessAccount) => ({
    __type: "KeylessAccount",
    address: e.address,
    ephemeralKeyPair: {
      privateKey: e.ephemeralKeyPair.privateKey,
      publicKey: e.ephemeralKeyPair.publicKey,
      address: e.ephemeralKeyPair.address,
      nonce: e.ephemeralKeyPair.nonce,
      expiryDateSecs: e.ephemeralKeyPair.expiryDateSecs.toString(),
    },
    jwt: e.jwt,
    salt: e.salt,
    decodedJwt: e.decodedJwt,
  }),
};

/**
 * Derive a deterministic Ethereum address from an OAuth ID token and an ephemeral key pair
 */
export const deriveKeylessAccount = async (
  jwt: string,
  salt: string,
  ephemeralKeyPair: EphemeralKeyPair
): Promise<KeylessAccount> => {
  const decodedJwt = decodeIdToken(jwt);
  
  // Create a deterministic seed from the JWT subject and the ephemeral key
  const hash1 = blake2s(decodedJwt.sub + decodedJwt.email + decodedJwt.aud + salt); // 256 bits = 32 bytes
  const hash2 = blake2s(salt + decodedJwt.email + decodedJwt.aud + decodedJwt.sub + salt); // 256 bits = 32 bytes
  const final_hash = new Uint8Array([...hash1, ...hash2]);

  const seed = ethers.solidityPackedKeccak256(
    ['bytes'],
    [final_hash]
  );
  // Create a deterministic wallet from the seed
  const wallet = new ethers.Wallet(seed);
  console.log(`blake: ${final_hash}\n\nkeccak256: ${seed}\n\nWallet: ${wallet.address}`);

  const prf = await getZkProof(jwt, salt);

  return {
    address: wallet.address,
    ephemeralKeyPair,
    salt,
    jwt,
    decodedJwt,
    proof_hash: prf.proof_hash,
    signature: prf.signature,
    timestamp: prf.timestamp,
  };
};

/**
 * If the account has an invalid Ephemeral key pair or idToken, the account needs to be refreshed with either
 * a new nonce or idToken. If the account is valid, it is returned.
 */
export const validateKeylessAccount = (
  account: KeylessAccount
): KeylessAccount | undefined =>
  // Check the Ephemeral key pair expiration
  isValidEphemeralKeyPair(account.ephemeralKeyPair) &&
  // Check the idToken for nonce
  isValidIdToken(account.jwt) &&
  // Verify that the nonce in the JWT matches the ephemeral key pair
  decodeIdToken(account.jwt).nonce === account.ephemeralKeyPair.nonce
    ? account
    : undefined;


/**
 * Get a ZK proof from the proving service
 */
async function getZkProof(
  jwt: string, 
  salt: string,
): Promise<ZkLoginResponse> {
  const decodedJwt = decodeIdToken(jwt);

  try {
    const payload = JSON.stringify({
      sub: decodedJwt.sub,
      email: decodedJwt.email,
      aud: decodedJwt.aud,
      salt,
    });
    
    const response = await fetch(NEXT_PUBLIC_ZK_PROVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    
    if (!response.ok) {
      throw new Error(`ZK prover returned ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: data.success,
      proof_hash: data.proof_hash,
      message: data.message,
      signature: data.signature,
      timestamp: data.timestamp,
      ethereum_address: data.ethereum_address
    };
  } catch (error) {
    console.error("Failed to get ZK proof:", error);
    return {
      success: false,
      message: `Failed to get ZK proof: ${error}`,
    };
  }
}
