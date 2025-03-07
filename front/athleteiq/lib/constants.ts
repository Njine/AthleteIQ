import { ethers } from 'ethers';

export const LocalStorageKeys = {
  keylessAccounts: "@sepolia-connect/keyless-accounts",
};

// Sepolia provider
export const sepoliaProvider = new ethers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_ID"
);

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export const REDIRECT_URI = (process.env.VERCEL_PROJECT_PRODUCTION_URL || "http://localhost:3000") + "/auth/callback";
