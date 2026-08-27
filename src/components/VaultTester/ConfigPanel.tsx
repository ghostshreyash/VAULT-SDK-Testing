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
import { Eye, EyeOff, Trash2, Wifi, WifiOff } from "lucide-react";
import { useSettingsStore, type VaultConfig } from "@/store/settingsStore";

type SecretField =
  | "VAULT_ACCESS_KEY"
  | "VAULT_SECRET_KEY"
  | "VAULT_CLIENT_API_KEY";

interface SecretInputProps {
  id: SecretField;
  label: string;
  value: string;
  revealed: boolean;
  onToggle: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function SecretInput({
  id,
  label,
  value,
  revealed,
  onToggle,
  onChange,
}: SecretInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={revealed ? "text" : "password"}
          className={`pr-10 ${revealed ? "font-mono text-xs" : ""}`}
          value={value}
          onChange={onChange}
          autoComplete="off"
          spellCheck={false}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={`${revealed ? "Hide" : "Show"} ${label}`}
          aria-pressed={revealed}
          title={revealed ? `Hide ${label}` : `Show ${label}`}
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {revealed ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function ConfigPanel() {
  const { initVault, connectWebsocket, isConnected, wsConnected, disconnect } =
    useVault();

  const config = useSettingsStore((state) => state.config);
  const setConfig = useSettingsStore((state) => state.setConfig);
  const setConfigField = useSettingsStore((state) => state.setConfigField);
  const clearCredentials = useSettingsStore((state) => state.clearCredentials);

  const [revealed, setRevealed] = useState<Record<SecretField, boolean>>({
    VAULT_ACCESS_KEY: false,
    VAULT_SECRET_KEY: false,
    VAULT_CLIENT_API_KEY: false,
  });

  const allRevealed = Object.values(revealed).every(Boolean);

  const toggleField = (field: SecretField) =>
    setRevealed((prev) => ({ ...prev, [field]: !prev[field] }));

  const toggleAll = () =>
    setRevealed({
      VAULT_ACCESS_KEY: !allRevealed,
      VAULT_SECRET_KEY: !allRevealed,
      VAULT_CLIENT_API_KEY: !allRevealed,
    });

  const sanitizedConfig = useMemo(
    () => ({ ...config, VAULT_WS_URL: config.VAULT_WS_URL.trim() }),
    [config]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfigField(name as keyof VaultConfig, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await initVault(sanitizedConfig);
  };

  const handleClearCredentials = () => {
    clearCredentials();
    setRevealed({
      VAULT_ACCESS_KEY: false,
      VAULT_SECRET_KEY: false,
      VAULT_CLIENT_API_KEY: false,
    });
  };

  const applyPreset = (mode: "proxy" | "vault") => {
    if (mode === "proxy") {
      setConfig({
        ...config,
        VAULT_BASE_URL: "http://localhost:8000",
        VAULT_WS_URL: "ws://localhost:8000/ws/chat",
        BOT_CHAT_WS_URL: "ws://localhost:8000/ws/chat",
      });
      return;
    }

    setConfig({
      ...config,
      VAULT_BASE_URL: "http://localhost:7000/api",
      VAULT_WS_URL: "ws://localhost:7000/ws/chat",
      BOT_CHAT_WS_URL: "ws://localhost:7000/ws/chat",
    });
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
            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Local presets</span>
                <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("proxy")}>
                  Proxy SDK :8000
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("vault")}>
                  Direct Vault :7000
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Use `:8000` when routing through `twin-backend-sdk`. Use `:7000` when calling
                `twin-vault-backend` directly with `vault-sdk-dev` via the `/api` base path.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="VAULT_BASE_URL">Vault Base URL</Label>
                <Input
                  id="VAULT_BASE_URL"
                  name="VAULT_BASE_URL"
                  placeholder="https://api.your-service.com"
                  value={config.VAULT_BASE_URL}
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
                  value={config.VAULT_WS_URL}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="BOT_CHAT_WS_URL">Bot Chat WS URL (Optional)</Label>
                <Input
                  id="BOT_CHAT_WS_URL"
                  name="BOT_CHAT_WS_URL"
                  placeholder="wss://sdk.twns.ai/ws/chat"
                  value={config.BOT_CHAT_WS_URL}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  Used only by `connectToBotChat`. Leave empty to derive `/ws/chat`
                  from `VAULT_BASE_URL`.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium">Credentials</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={toggleAll}
                  className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {allRevealed ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {allRevealed ? "Hide all" : "Show all"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCredentials}
                  title="Remove the saved keys from this browser"
                  className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear
                </Button>
              </div>
            </div>

            <SecretInput
              id="VAULT_ACCESS_KEY"
              label="Access Key"
              value={config.VAULT_ACCESS_KEY}
              revealed={revealed.VAULT_ACCESS_KEY}
              onToggle={() => toggleField("VAULT_ACCESS_KEY")}
              onChange={handleChange}
            />
            <SecretInput
              id="VAULT_SECRET_KEY"
              label="Secret Key"
              value={config.VAULT_SECRET_KEY}
              revealed={revealed.VAULT_SECRET_KEY}
              onToggle={() => toggleField("VAULT_SECRET_KEY")}
              onChange={handleChange}
            />
            <SecretInput
              id="VAULT_CLIENT_API_KEY"
              label="Client API Key"
              value={config.VAULT_CLIENT_API_KEY}
              revealed={revealed.VAULT_CLIENT_API_KEY}
              onToggle={() => toggleField("VAULT_CLIENT_API_KEY")}
              onChange={handleChange}
            />
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
