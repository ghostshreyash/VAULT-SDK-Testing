import { useMemo, useState } from "react";
import { useVault } from "@/context/VaultContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

const STORAGE_KEY = "vault-sdk-config";

type VaultFormData = {
  VAULT_ACCESS_KEY: string;
  VAULT_SECRET_KEY: string;
  VAULT_CLIENT_API_KEY: string;
  VAULT_BASE_URL: string;
  VAULT_WS_URL: string;
};

const defaultConfig: VaultFormData = {
  VAULT_ACCESS_KEY: "",
  VAULT_SECRET_KEY: "",
  VAULT_CLIENT_API_KEY: "",
  VAULT_BASE_URL: "http://localhost:7000/api",
  VAULT_WS_URL: "ws://localhost:8000",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getInitialConfig(): VaultFormData {
  if (typeof window === "undefined") {
    return defaultConfig;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return defaultConfig;
  }

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!isRecord(parsed)) {
      return defaultConfig;
    }

    return {
      ...defaultConfig,
      VAULT_ACCESS_KEY:
        typeof parsed.VAULT_ACCESS_KEY === "string" ? parsed.VAULT_ACCESS_KEY : defaultConfig.VAULT_ACCESS_KEY,
      VAULT_SECRET_KEY:
        typeof parsed.VAULT_SECRET_KEY === "string" ? parsed.VAULT_SECRET_KEY : defaultConfig.VAULT_SECRET_KEY,
      VAULT_CLIENT_API_KEY:
        typeof parsed.VAULT_CLIENT_API_KEY === "string"
          ? parsed.VAULT_CLIENT_API_KEY
          : defaultConfig.VAULT_CLIENT_API_KEY,
      VAULT_BASE_URL:
        typeof parsed.VAULT_BASE_URL === "string" ? parsed.VAULT_BASE_URL : defaultConfig.VAULT_BASE_URL,
      VAULT_WS_URL:
        typeof parsed.VAULT_WS_URL === "string" ? parsed.VAULT_WS_URL : defaultConfig.VAULT_WS_URL,
    };
  } catch (error) {
    console.error("Failed to parse saved vault config", error);
    return defaultConfig;
  }
}

export function ConfigPanel() {
  const { initVault, connectWebsocket, isConnected, wsConnected, disconnect } =
    useVault();
  const [formData, setFormData] = useState<VaultFormData>(getInitialConfig);

  const sanitizedConfig = useMemo(
    () => ({
      ...formData,
      VAULT_WS_URL: formData.VAULT_WS_URL.trim(),
    }),
    [formData]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedConfig));
    await initVault(sanitizedConfig);
  };

  return (
    <div className="space-y-4">
      {isConnected && (
        <Card className="border-emerald-200/70 bg-emerald-50/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Connection Status</CardTitle>
            <CardDescription>
              SDK is initialized. You can keep testing API calls even if WebSocket is
              disconnected.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm md:grid-cols-2">
            <div className="flex items-center justify-between rounded-md border bg-background/80 px-3 py-2">
              <span className="text-muted-foreground">SDK Session</span>
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border bg-background/80 px-3 py-2">
              <span className="text-muted-foreground">WebSocket</span>
              {wsConnected ? (
                <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                  <Wifi className="h-3 w-3" /> Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <WifiOff className="h-3 w-3" /> Not Connected
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={connectWebsocket}
              disabled={!sanitizedConfig.VAULT_WS_URL}
            >
              Reconnect WebSocket
            </Button>
            <Button type="button" variant="outline" onClick={disconnect}>
              Disconnect SDK
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Vault Configuration</CardTitle>
          <CardDescription>
            Save once, then reinitialize quickly while testing different credentials and
            environments.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="VAULT_BASE_URL">Vault Base URL</Label>
                <Input
                  id="VAULT_BASE_URL"
                  name="VAULT_BASE_URL"
                  placeholder="https://api.your-service.com"
                  value={formData.VAULT_BASE_URL}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="VAULT_WS_URL">Vault WS URL (Optional)</Label>
                <Input
                  id="VAULT_WS_URL"
                  name="VAULT_WS_URL"
                  placeholder="wss://api.your-service.com/ws"
                  value={formData.VAULT_WS_URL}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="VAULT_ACCESS_KEY">Access Key</Label>
              <Input
                id="VAULT_ACCESS_KEY"
                name="VAULT_ACCESS_KEY"
                type="password"
                value={formData.VAULT_ACCESS_KEY}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="VAULT_SECRET_KEY">Secret Key</Label>
              <Input
                id="VAULT_SECRET_KEY"
                name="VAULT_SECRET_KEY"
                type="password"
                value={formData.VAULT_SECRET_KEY}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="VAULT_CLIENT_API_KEY">Client API Key</Label>
              <Input
                id="VAULT_CLIENT_API_KEY"
                name="VAULT_CLIENT_API_KEY"
                type="password"
                value={formData.VAULT_CLIENT_API_KEY}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              {isConnected ? "Reinitialize SDK with This Config" : "Connect to Vault SDK"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
