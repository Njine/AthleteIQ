import { ethers } from 'ethers';

export interface EphemeralKeyPair {
  privateKey: string;
  publicKey: string;
  address: string;
  nonce: string;
  expiryDateSecs: bigint;
}

export const EphemeralKeyPairEncoding = {
  decode: (e: any): EphemeralKeyPair => ({
    privateKey: e.privateKey,
    publicKey: e.publicKey,
    address: e.address,
    nonce: e.nonce,
    expiryDateSecs: BigInt(e.expiryDateSecs),
  }),
  encode: (e: EphemeralKeyPair) => ({
    __type: "EphemeralKeyPair",
    privateKey: e.privateKey,
    publicKey: e.publicKey,
    address: e.address,
    nonce: e.nonce,
    expiryDateSecs: e.expiryDateSecs.toString(),
  }),
};

export const isValidEphemeralKeyPair = (keyPair: EphemeralKeyPair): boolean => {
  if (isExpired(keyPair)) return false;
  return true;
};

export const isExpired = (keyPair: EphemeralKeyPair): boolean => {
  const currentTimeSecs = BigInt(Math.floor(Date.now() / 1000));
  return keyPair.expiryDateSecs <= currentTimeSecs;
};

export const validateEphemeralKeyPair = (
  keyPair: EphemeralKeyPair
): EphemeralKeyPair | undefined =>
  isValidEphemeralKeyPair(keyPair) ? keyPair : undefined;

/**
 * Create a new ephemeral key pair with a random private key and nonce.
 */
export const createEphemeralKeyPair = ({
  expiryDateSecs = BigInt(Math.floor(Date.now() / 1000)) + BigInt(24 * 60 * 60),
}: { expiryDateSecs?: bigint } = {}): EphemeralKeyPair => {
  // Generate random wallet
  const wallet = ethers.Wallet.createRandom();
  
  // Generate a nonce
  const nonce = ethers.randomBytes(16).toString('hex');
  
  return {
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
    address: wallet.address,
    nonce,
    expiryDateSecs,
  };
};