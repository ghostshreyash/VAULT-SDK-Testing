import { createContext, useContext, useState, type ReactNode } from "react";
import Vault, { VaultError, ValidationError } from "vault-sdk-dev";
import { toast } from "sonner";

interface VaultConfig {
  VAULT_ACCESS_KEY: string;
  VAULT_SECRET_KEY: string;
  VAULT_CLIENT_API_KEY: string;
  VAULT_BASE_URL: string;
  VAULT_WS_URL?: string;
  BOT_CHAT_WS_URL?: string;
}

interface VaultContextType {
  vault: any | null;
  config: VaultConfig | null;
  logs: LogEntry[];
  isConnected: boolean;
  wsConnected: boolean;
  initVault: (config: VaultConfig) => Promise<void>;
  disconnect: () => void;
  connectWebsocket: () => Promise<void>;
  addLog: (
    type: LogEntry["type"],
    method: string,
    message: string,
    data?: any
  ) => void;
  clearLogs: () => void;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  type: "info" | "success" | "error" | "warning";
  method: string;
  data?: any;
  message: string;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider = ({ children }: { children: ReactNode }) => {
  const [vault, setVault] = useState<any | null>(null);
  const [config, setConfig] = useState<VaultConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const addLog = (
    type: LogEntry["type"],
    method: string,
    message: string,
    data?: any
  ) => {
    let displayData = data;
    let displayMessage = message;

    if (data instanceof ValidationError) {
      displayMessage = `${message} (${data.message})`;
      displayData = {
        code: data.code,
        param: data.param,
        operation: data.operation,
      };
    } else if (data instanceof VaultError) {
      displayMessage = `${message} (${data.message})`;
      displayData = {
        code: data.code,
        status: data.status,
        operation: data.operation,
        serverData: data.data,
      };
    } else if (data instanceof Error) {
      displayMessage = `${message} (${data.message})`;
    }

    const newLog: LogEntry = {
      id: Math.random().toString(36).slice(2, 9),
      timestamp: Date.now(),
      type,
      method,
      message: displayMessage,
      data: displayData,
    };
    setLogs((prev) => [newLog, ...prev]);

    if (type === "error") {
      toast.error(`${method}: ${displayMessage}`);
    } else if (type === "success") {
      toast.success(`${method}: ${displayMessage}`);
    }
  };

  const attachWsEventListeners = (instance: any) => {
    if (!instance?.on) {
      return;
    }

    instance.removeAllListeners?.("message");
    instance.removeAllListeners?.("stream_error");

    instance.on("message", (data: unknown) => {
      addLog("info", "websocket.message", "Message received", data);
    });

    instance.on("stream_error", (error: unknown) => {
      setWsConnected(false);
      addLog("error", "websocket.stream_error", "Stream error", error);
    });
  };

  const connectWebsocketForInstance = async (instance: any) => {
    try {
      addLog("info", "connectToWebsocket", "Opening WebSocket connection...");
      await instance.connectToWebsocket();
      attachWsEventListeners(instance);

      if (instance?.ws) {
        instance.ws.onclose = () => {
          setWsConnected(false);
          addLog("warning", "websocket.close", "WebSocket disconnected");
        };
      }

      setWsConnected(true);
      addLog("success", "connectToWebsocket", "WebSocket connected");
    } catch (error) {
      setWsConnected(false);
      addLog(
        "error",
        "connectToWebsocket",
        "Failed to establish WebSocket connection",
        error
      );
      throw error;
    }
  };

  const connectWebsocket = async () => {
    if (!vault) {
      addLog(
        "warning",
        "connectToWebsocket",
        "Initialize the SDK before opening WebSocket connection"
      );
      return;
    }

    if (!config?.VAULT_WS_URL?.trim()) {
      addLog(
        "warning",
        "connectToWebsocket",
        "VAULT_WS_URL is empty. Add a WS URL in configuration first."
      );
      return;
    }

    await connectWebsocketForInstance(vault);
  };

  const initVault = async (newConfig: VaultConfig) => {
    try {
      addLog("info", "initVault", "Initializing Vault SDK...", {
        ...newConfig,
        VAULT_ACCESS_KEY: "***",
        VAULT_SECRET_KEY: "***",
        VAULT_CLIENT_API_KEY: "***",
      });

      const vaultInstance = new Vault(newConfig);
      setVault(vaultInstance);
      setConfig(newConfig);
      setIsConnected(true);
      setWsConnected(false);
      addLog("success", "initVault", "Vault SDK initialized");

      if (newConfig.VAULT_WS_URL?.trim()) {
        try {
          await connectWebsocketForInstance(vaultInstance);
        } catch {
          // Keep SDK connected even if WebSocket fails.
        }
      } else {
        addLog(
          "warning",
          "connectToWebsocket",
          "WebSocket URL is not set. API testing still works without WS."
        );
      }
    } catch (error) {
      addLog("error", "initVault", "Failed to initialize Vault SDK", error);
      setVault(null);
      setConfig(null);
      setIsConnected(false);
      setWsConnected(false);
    }
  };

  const disconnect = () => {
    try {
      if (vault?.ws && vault.ws.readyState !== 3) {
        vault.ws.close();
      }
      vault?.removeAllListeners?.("message");
      vault?.removeAllListeners?.("stream_error");
    } catch (error) {
      addLog("warning", "disconnect", "Failed to close WebSocket cleanly", error);
    }

    setVault(null);
    setConfig(null);
    setIsConnected(false);
    setWsConnected(false);
    addLog("info", "disconnect", "Disconnected from Vault SDK");
  };

  const clearLogs = () => setLogs([]);

  return (
    <VaultContext.Provider
      value={{
        vault,
        config,
        logs,
        isConnected,
        wsConnected,
        initVault,
        disconnect,
        connectWebsocket,
        addLog,
        clearLogs,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
};
