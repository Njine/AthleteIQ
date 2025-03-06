
import { ethers } from 'ethers';
import { EphemeralKeyPair, isValidEphemeralKeyPair } from './ephemeral';
import { decodeIdToken, isValidIdToken } from './idToken';
import { KeylessAccount } from './types';

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
    decodedJwt: e.decodedJwt,
  }),
};

/**
 * Derive a deterministic Ethereum address from an OAuth ID token and an ephemeral key pair
 */
export const deriveKeylessAccount = async (
  jwt: string,
  ephemeralKeyPair: EphemeralKeyPair
): Promise<KeylessAccount> => {
  const decodedJwt = decodeIdToken(jwt);
  
  // Create a deterministic seed from the JWT subject and the ephemeral key
  const seed = ethers.solidityPackedKeccak256(
    ['string', 'string', 'string'],
    [decodedJwt.sub, ephemeralKeyPair.nonce, ephemeralKeyPair.privateKey]
  );
  
  // Create a deterministic wallet from the seed
  const wallet = new ethers.Wallet(seed);
  
  return {
    address: wallet.address,
    ephemeralKeyPair,
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