import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VaultConfig {
  VAULT_ACCESS_KEY: string;
  VAULT_SECRET_KEY: string;
  VAULT_CLIENT_API_KEY: string;
  VAULT_BASE_URL: string;
  VAULT_WS_URL: string;
  BOT_CHAT_WS_URL: string;
}

export const emptyConfig: VaultConfig = {
  VAULT_ACCESS_KEY: "",
  VAULT_SECRET_KEY: "",
  VAULT_CLIENT_API_KEY: "",
  VAULT_BASE_URL: "http://localhost:7000/api",
  VAULT_WS_URL: "",
  BOT_CHAT_WS_URL: "",
};

interface SettingsState {
  config: VaultConfig;
  vaultId: string;
  stripePublishableKey: string;

  setConfigField: (field: keyof VaultConfig, value: string) => void;
  setConfig: (config: VaultConfig) => void;
  clearCredentials: () => void;
  setVaultId: (vaultId: string) => void;
  setStripePublishableKey: (key: string) => void;
}

const STORAGE_KEY = "vault-sdk-settings";
const LEGACY_CONFIG_KEY = "vault-sdk-config";
const LEGACY_STRIPE_PK_KEY = "vault-sdk-tester-stripe-pk";

function migrateLegacyStorage(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(STORAGE_KEY)) return;

  try {
    const legacyConfigRaw = window.localStorage.getItem(LEGACY_CONFIG_KEY);
    const legacyStripePk = window.localStorage.getItem(LEGACY_STRIPE_PK_KEY);
    if (!legacyConfigRaw && !legacyStripePk) return;

    const parsed: unknown = legacyConfigRaw ? JSON.parse(legacyConfigRaw) : null;
    const legacyConfig =
      typeof parsed === "object" && parsed !== null
        ? (parsed as Partial<VaultConfig>)
        : {};

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          config: { ...emptyConfig, ...legacyConfig },
          vaultId: "",
          stripePublishableKey: legacyStripePk ?? "",
        },
        version: 1,
      })
    );

    window.localStorage.removeItem(LEGACY_CONFIG_KEY);
    window.localStorage.removeItem(LEGACY_STRIPE_PK_KEY);
  } catch (error) {
    console.error("Failed to migrate legacy vault settings", error);
  }
}

migrateLegacyStorage();

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      config: emptyConfig,
      vaultId: "",
      stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "",

      setConfigField: (field, value) =>
        set((state) => ({ config: { ...state.config, [field]: value } })),

      setConfig: (config) => set({ config }),

      clearCredentials: () =>
        set((state) => ({
          config: {
            ...state.config,
            VAULT_ACCESS_KEY: "",
            VAULT_SECRET_KEY: "",
            VAULT_CLIENT_API_KEY: "",
          },
        })),

      setVaultId: (vaultId) => set({ vaultId }),

      setStripePublishableKey: (stripePublishableKey) =>
        set({ stripePublishableKey }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...saved,
          config: { ...emptyConfig, ...(saved.config ?? {}) },
        };
      },
    }
  )
);

export const selectSanitizedConfig = (state: SettingsState): VaultConfig => ({
  ...state.config,
  VAULT_WS_URL: state.config.VAULT_WS_URL.trim(),
  BOT_CHAT_WS_URL: state.config.BOT_CHAT_WS_URL.trim(),
});
