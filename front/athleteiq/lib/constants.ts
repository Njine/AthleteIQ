import { ethers } from 'ethers';

export const LocalStorageKeys = {
  keylessAccounts: "@sepolia-connect/keyless-accounts",
};

// Sepolia provider
export const provider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/oKxs-03sij-U_N0iOlrSsZFr29-IqbuF"
);

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export const REDIRECT_URI = (process.env.NEXT_PUBLIC_URLL || "http://localhost:3000") + "/auth/callback";

export const JWT_SECRET = process.env.JWT_SECRET || "superstrongkey"

export const KEY_EXPIRY = 86400;

export const NEXT_PUBLIC_ZK_PROVER_URL = process.env.NEXT_PUBLIC_ZK_PROVER_URL || "http://127.0.0.1:8080/api/zklogin";
export const NEXT_PUBLIC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x00EA3c8270868B9cF9C24a5E78cACDa9DfE8B485" 
export const NEXT_PUBLIC_GAS_WALLET = process.env.NEXT_PUBLIC_GAS_WALLET || "0x000"
