import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LocalStorageKeys } from "./constants";
import { validateIdToken } from "./idToken";
import { EphemeralKeyPair, validateEphemeralKeyPair, isValidEphemeralKeyPair } from "./ephemeral";
import { EncryptedScopedIdToken, KeylessAccount } from "./types";
import { KeylessAccountEncoding, deriveKeylessAccount, validateKeylessAccount } from "./keyless";

interface KeylessAccountsState {
  accounts: KeylessAccount[];
  activeAccount?: KeylessAccount;
  ephemeralKeyPair?: EphemeralKeyPair;
}

interface KeylessAccountsActions {
  /**
   * Add an Ephemeral key pair to the store. If the account is invalid, an error is thrown.
   */
  commitEphemeralKeyPair: (account: EphemeralKeyPair) => void;
  /**
   * Disconnects the active account from the store.
   */
  disconnectKeylessAccount: () => void;
  /**
   * Retrieve the Ephemeral key pair from the store.
   */
  getEphemeralKeyPair: () => EphemeralKeyPair | undefined;
  /**
   * Switches the active account to the one associated with the provided idToken.
   */
  switchKeylessAccount: (
    idToken: string
  ) => Promise<KeylessAccount | undefined>;
}

// Helper function for localStorage handling with bigint support
const storage = createJSONStorage<KeylessAccountsState>(() => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
  return localStorage;
}, {
  replacer: (_, e) => {
    if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
    if (e instanceof Uint8Array)
      return { __type: "Uint8Array", value: Array.from(e) };
    return e;
  },
  reviver: (_, e: any) => {
    if (e && e.__type === "bigint") return BigInt(e.value);
    if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
    return e;
  },
});

export const useKeylessAccounts = create<
  KeylessAccountsState & KeylessAccountsActions
>()(
  persist(
    (set, get) => ({
      accounts: [],
      commitEphemeralKeyPair: (keyPair) => {
        const valid = isValidEphemeralKeyPair(keyPair);
        if (!valid)
          throw new Error(
            "addEphemeralKeyPair: Invalid ephemeral key pair provided"
          );
        set({ ephemeralKeyPair: keyPair });
      },

      disconnectKeylessAccount: () => set({ activeAccount: undefined }),

      getEphemeralKeyPair: () => {
        const account = get().ephemeralKeyPair;
        return account ? validateEphemeralKeyPair(account) : undefined;
      },

      switchKeylessAccount: async (idToken: string) => {
        set({ ...get(), activeAccount: undefined }, true);

        // If the idToken is invalid, return undefined
        const decodedToken = validateIdToken(idToken);
        if (!decodedToken) {
          throw new Error(
            "switchKeylessAccount: Invalid idToken provided, could not decode"
          );
        }

        // If a corresponding Ephemeral key pair is not found, return undefined
        const ephemeralKeyPair = get().getEphemeralKeyPair();
        if (
          !ephemeralKeyPair ||
          ephemeralKeyPair?.nonce !== decodedToken.nonce
        ) {
          throw new Error(
            "switchKeylessAccount: Ephemeral key pair not found or nonce mismatch"
          );
        }

        // Derive the keyless account
        const activeAccount = await deriveKeylessAccount(idToken, ephemeralKeyPair);

        // Update the state with the new account
        set((state) => {
          const existingAccountIndex = state.accounts.findIndex(
            (a) => a.decodedJwt.sub === decodedToken.sub
          );

          const newAccounts = [...state.accounts];
          if (existingAccountIndex !== -1) {
            // Update existing account
            newAccounts[existingAccountIndex] = activeAccount;
          } else {
            // Add new account
            newAccounts.push(activeAccount);
          }

          return {
            accounts: newAccounts,
            activeAccount,
          };
        });

        return activeAccount;
      },
    }),
    {
      name: LocalStorageKeys.keylessAccounts,
      storage,
      partialize: (state) => ({
        ...state,
        activeAccount: state.activeAccount && validateKeylessAccount(state.activeAccount),
        ephemeralKeyPair: state.ephemeralKeyPair && validateEphemeralKeyPair(state.ephemeralKeyPair),
      }),
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as object) };
        return {
          ...merged,
          activeAccount:
            merged.activeAccount &&
            validateKeylessAccount(merged.activeAccount as KeylessAccount),
          ephemeralKeyPair:
            merged.ephemeralKeyPair &&
            validateEphemeralKeyPair(merged.ephemeralKeyPair as EphemeralKeyPair),
        };
      },
      version: 1,
    }
  )
);