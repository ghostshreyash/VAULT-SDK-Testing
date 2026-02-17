import { createContext, useContext, useState, type ReactNode } from 'react';
import Vault from 'vault-sdk-dev';
import { toast } from 'sonner';

interface VaultConfig {
  VAULT_ACCESS_KEY: string;
  VAULT_SECRET_KEY: string;
  VAULT_CLIENT_API_KEY: string;
  VAULT_BASE_URL: string;
  VAULT_WS_URL: string;
}

interface LogEntry {
  id: string;
  timestamp: number;
  type: 'info' | 'success' | 'error' | 'warning';
  method: string;
  data?: any;
  message: string;
}

interface VaultContextType {
  vault: any | null; // Typed as any because SDK doesn't have types
  config: VaultConfig | null;
  logs: LogEntry[];
  isConnected: boolean;
  initVault: (config: VaultConfig) => void;
  disconnect: () => void;
  addLog: (type: LogEntry['type'], method: string, message: string, data?: any) => void;
  clearLogs: () => void;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider = ({ children }: { children: ReactNode }) => {
  const [vault, setVault] = useState<any | null>(null);
  const [config, setConfig] = useState<VaultConfig | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const addLog = (type: LogEntry['type'], method: string, message: string, data?: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      type,
      method,
      message,
      data,
    };
    setLogs((prev) => [newLog, ...prev]);
    
    if (type === 'error') {
      toast.error(`${method}: ${message}`);
    } else if (type === 'success') {
      toast.success(`${method}: ${message}`);
    }
  };

  const initVault = async (newConfig: VaultConfig) => {
    try {
      addLog('info', 'initVault', 'Initializing Vault SDK...', newConfig);
      const vaultInstance = new Vault(newConfig);
      
      // Basic validation by trying to connect WS or just setting it
      // The SDK doesn't throw immediately on constructor, usually.
      
      setVault(vaultInstance);
      setConfig(newConfig);
      setIsConnected(true); // Tentative, we should validat
      
      addLog('success', 'initVault', 'Vault instance created');
      
      // Try to connect WS if available
        try {
            await vaultInstance.connectToWebsocket();
            addLog('success', 'connectToWebsocket', 'WebSocket Connected');
             vaultInstance.on('message', (data: any) => {
                addLog('info', 'WebSocket', 'Message received', data);
             });
             vaultInstance.on('stream_error', (data: any) => {
                addLog('error', 'WebSocket', 'Stream error', data);
             });
        } catch (e: any) {
            addLog('error', 'connectToWebsocket', 'Failed to connect WS', e);
        }

    } catch (error: any) {
      addLog('error', 'initVault', 'Failed to initialize Vault', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    setVault(null);
    setConfig(null);
    setIsConnected(false);
    addLog('info', 'disconnect', 'Disconnected from Vault');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <VaultContext.Provider
      value={{
        vault,
        config,
        logs,
        isConnected,
        initVault,
        disconnect,
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
  if (context === undefined) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
