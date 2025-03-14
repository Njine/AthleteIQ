
import { ethers } from 'ethers';
import { EphemeralKeyPair, isValidEphemeralKeyPair } from './ephemeral';
import { decodeIdToken, isValidIdToken } from './idToken';
import { KeylessAccount, ZkLoginResponse } from './types';

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
  const seed = ethers.solidityPackedKeccak256(
    ['string', 'string', 'string', 'string'],
    [decodedJwt.sub, decodedJwt.email, decodedJwt.aud, salt, ]
  );
  // Create a deterministic wallet from the seed
  const wallet = new ethers.Wallet(seed);
  
  return {
    address: wallet.address,
    ephemeralKeyPair,
    salt,
    jwt,
    decodedJwt,
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
// export async function getZkProof(
//   jwt: string, 
//   salt: string, 
//   ephemeralPublicKey: string,
//   maxEpoch: number,
//   randomness: string
// ): Promise<ZkLoginResponse> {
//   try {
//     const payload = JSON.stringify({
//       jwt,
//       salt,
//       maxEpoch,
//       ephemeralPublicKey,
//       randomness,
//     });
    
//     const response = await fetch(ZK_PROVER_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: payload,
//     });
    
//     if (!response.ok) {
//       throw new Error(`ZK prover returned ${response.status}`);
//     }
    
//     const data = await response.json();
//     return {
//       success: true,
//       proof: data,
//     };
//   } catch (error) {
//     console.error("Failed to get ZK proof:", error);
//     return {
//       success: false,
//       message: `Failed to get ZK proof: ${error}`,
//     };
//   }
// }