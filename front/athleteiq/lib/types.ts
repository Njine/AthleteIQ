import { z } from "zod";

export const idTokenSchema = z.object({
  aud: z.string(),
  exp: z.number(),
  iat: z.number(),
  iss: z.string(),
  sub: z.string(),
});

export const nonceEncryptedIdTokenSchema = idTokenSchema.extend({
  nonce: z.string(),
});

export const profileScopedPayloadSchema = nonceEncryptedIdTokenSchema.extend({
  family_name: z.string().optional(),
  given_name: z.string().optional(),
  locale: z.string().optional(),
  name: z.string(),
  picture: z.string().optional(),
});

export const emailScopedPayloadSchema = nonceEncryptedIdTokenSchema.extend({
  email: z.string().optional(),
  email_verified: z.boolean(),
});

export const scopedPayloadSchema = profileScopedPayloadSchema.merge(
  emailScopedPayloadSchema
);

export type IDToken = z.infer<typeof idTokenSchema>;
export type NonceEncryptedIdToken = z.infer<typeof nonceEncryptedIdTokenSchema>;
export type ProfileScopedPayloadSchema = z.infer<typeof profileScopedPayloadSchema>;
export type EmailScopedPayloadSchema = z.infer<typeof emailScopedPayloadSchema>;
export type EncryptedScopedIdToken = z.infer<typeof scopedPayloadSchema>;

// Keyless account structure for Sepolia
export interface KeylessAccount {
  address: string;
  ephemeralKeyPair: {
    privateKey: string;
    publicKey: string;
    address: string;
    nonce: string;
    expiryDateSecs: bigint;
  };
  salt: string;
  jwt: string;
  decodedJwt: EncryptedScopedIdToken;
  timestamp?: string;
  signature?: string;
  proof_hash?: string;
}

export interface ZkLoginResponse {
  success: boolean;
  timestamp?: string;
  message?: string;
  signature?: string;
  proof_hash?: string;
  ethereum_address?: string;
}
