import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
// import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const PEPPER = process.env.PEPPER_SECRET || "";
// const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12); // Generate unique salt
  const hashedPassword = await bcrypt.hash(password + PEPPER, salt);
  return { hashedPassword, salt };
};

export const verifyPassword = async (password: string, hashedPassword: string, salt: string) => {
  return bcrypt.compare(password + PEPPER, hashedPassword);
};


// src/core/utils.ts

export const collapseAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isBrowser = () => typeof window !== 'undefined';