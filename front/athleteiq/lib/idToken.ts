import { jwtDecode } from "jwt-decode";
import { EncryptedScopedIdToken, scopedPayloadSchema } from "./types";

export const decodeIdToken = (jwt: string): EncryptedScopedIdToken => {
  const decoded = jwtDecode(jwt);
  console.log(decoded);
  return scopedPayloadSchema.parse(decoded);
};

export const isValidIdToken = (
  jwt: string | EncryptedScopedIdToken
): boolean => {
  if (typeof jwt === "string") return isValidIdToken(decodeIdToken(jwt));

  // Check whether the token has an expiration, nonce, and is not expired
  console.log(jwt)
  if (!jwt.nonce) return false;
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (jwt.exp && jwt.exp < now) return false;

  return true;
};

export const validateIdToken = (
  jwt: string | EncryptedScopedIdToken
): EncryptedScopedIdToken | null => {
  if (typeof jwt === "string") {
    try {
      return validateIdToken(decodeIdToken(jwt));
    } catch (error) {
      return null;
    }
  }
  return isValidIdToken(jwt) ? jwt : null;
};