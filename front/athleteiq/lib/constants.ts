import { ethers } from 'ethers';

export const LocalStorageKeys = {
  keylessAccounts: "@sepolia-connect/keyless-accounts",
};

// Sepolia provider
export const sepoliaProvider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_ID"
);

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export const REDIRECT_URI = (process.env.NEXT_PUBLIC_URLL || "http://localhost:3000") + "/auth/callback";

export const JWT_SECRET = process.env.JWT_SECRET || "superstrongkey"

export const KEY_EXPIRY = 86400;