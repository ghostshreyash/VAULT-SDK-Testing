import { useEffect, useState, type FormEvent } from "react";
import { useVault } from "@/context/VaultContext";
import { useSettingsStore } from "@/store/settingsStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LlmModel {
  id: string;
  label: string;
}

interface LlmProvider {
  id: string;
  label: string;
  requiresBaseUrl?: boolean;
  models?: LlmModel[];
}

const fallbackProviders: LlmProvider[] = [
  { id: "OPENAI", label: "OPENAI" },
  { id: "ANTHROPIC", label: "ANTHROPIC" },
  { id: "GEMINI", label: "GEMINI" },
  { id: "CUSTOM", label: "CUSTOM" },
];

export function BotLlmPanel() {
  const { vault, isConnected, addLog } = useVault();
  const vaultId = useSettingsStore((state) => state.vaultId);
  const [botId, setBotId] = useState("");
  const [provider, setProvider] = useState("OPENAI");
  const [model, setModel] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [providers, setProviders] = useState<LlmProvider[]>([]);

  useEffect(() => {
    if (!vault || !vaultId.trim()) return;
    const loadProviders = async () => {
      try {
        const response = await vault.getLlmProviders(vaultId.trim());
        const catalog: LlmProvider[] = Array.isArray(response?.data?.providers)
          ? response.data.providers
          : [];
        setProviders(catalog);
        if (catalog.length) {
          setProvider((current: string) =>
            catalog.some((item) => item.id === current) ? current : catalog[0].id
          );
        }
        addLog("success", "getLlmProviders", "LLM providers loaded", response);
      } catch (error) {
        addLog("error", "getLlmProviders", "Could not load LLM providers", error);
      }
    };
    void loadProviders();
    // `addLog` is recreated by the context provider; including it would refetch indefinitely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vault, vaultId]);

  const selectedProvider = providers.find((item) => item.id === provider);
  const llmConfig = () => ({
    provider,
    model: model.trim(),
    ...(baseUrl.trim() ? { baseUrl: baseUrl.trim() } : {}),
    ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
  });

  const test = async () => {
    if (!vault || !vaultId.trim() || !botId.trim()) {
      addLog("warning", "testBotLlm", "Initialize SDK and provide Target Vault and Bot IDs first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await vault.testBotLlm(vaultId.trim(), botId.trim(), llmConfig());
      setResult(response);
      addLog("success", "testBotLlm", "Custom LLM connection verified", response);
    } catch {
      // Request errors can contain the provider key in their request configuration.
      addLog("error", "testBotLlm", "Could not verify the custom LLM. Check the provider, model, key and server configuration.");
    } finally {
      setLoading(false);
    }
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vault || !vaultId.trim()) {
      addLog("warning", "setBotLlm", "Initialize SDK and provide a Target Vault ID first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const response = await vault.setBotLlm(vaultId.trim(), botId.trim(), llmConfig());
      setApiKey("");
      setResult(response);
      addLog("success", "setBotLlm", "Custom LLM saved, verified and enabled", response);
    } catch {
      // Request errors can contain the provider key in their request configuration.
      addLog("error", "setBotLlm", "Could not save custom LLM. Check the provider, model, key and server configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom LLM</CardTitle>
        <CardDescription>Verify, save and enable your own provider for this bot using setBotLlm.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="llm-vault">Target Vault ID</Label><Input id="llm-vault" value={vaultId} readOnly /></div>
          <div className="space-y-2"><Label htmlFor="llm-bot">Bot ID</Label><Input id="llm-bot" value={botId} onChange={(e) => setBotId(e.target.value)} required pattern=".*\S.*" /></div>
          <div className="space-y-2">
            <Label htmlFor="llm-provider">Provider</Label>
            <select id="llm-provider" className="w-full rounded-md border bg-background p-2" value={provider} onChange={(e) => setProvider(e.target.value)}>
              {(providers.length ? providers : fallbackProviders).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label htmlFor="llm-model">Model</Label>{selectedProvider?.models?.length ? <select id="llm-model" className="w-full rounded-md border bg-background p-2" value={model} onChange={(e) => setModel(e.target.value)} required><option value="">Select a model</option>{selectedProvider.models.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select> : <Input id="llm-model" value={model} onChange={(e) => setModel(e.target.value)} required pattern=".*\S.*" />}</div>
          <div className="space-y-2"><Label htmlFor="llm-url">Base URL (required for custom providers)</Label><Input id="llm-url" type="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} required={selectedProvider?.requiresBaseUrl ?? provider === "CUSTOM"} /></div>
          <div className="space-y-2">
            <Label htmlFor="llm-key">Provider API key</Label>
            <Input id="llm-key" type="password" autoComplete="new-password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            <p className="text-sm text-muted-foreground">Required for first setup. Leave blank to reuse the stored key.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={test} disabled={loading || !isConnected}>{loading ? "Verifying..." : "Test connection"}</Button>
            <Button type="submit" disabled={loading || !isConnected}>{loading ? "Verifying..." : "Save and enable custom LLM"}</Button>
          </div>
          {result !== null && <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(result, null, 2)}</pre>}
        </form>
      </CardContent>
    </Card>
  );
}

export function LlmProvidersPanel() {
  const { vault, isConnected, addLog } = useVault();
  const vaultId = useSettingsStore((state) => state.vaultId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);

  const loadProviders = async () => {
    if (!vault || !vaultId.trim()) {
      addLog("warning", "getLlmProviders", "Initialize SDK and provide a Target Vault ID first");
      return;
    }

    setLoading(true);
    try {
      const response = await vault.getLlmProviders(vaultId.trim());
      setResult(response);
      addLog("success", "getLlmProviders", "LLM providers loaded", response);
    } catch (error) {
      addLog("error", "getLlmProviders", "Could not load LLM providers", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get LLM Providers</CardTitle>
        <CardDescription>
          Fetch the providers and models supported by the Vault configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="providers-vault">Target Vault ID</Label>
          <Input id="providers-vault" value={vaultId} readOnly />
        </div>
        <Button type="button" onClick={loadProviders} disabled={loading || !isConnected}>
          {loading ? "Loading..." : "Run getLlmProviders"}
        </Button>
        <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
          {result !== null ? JSON.stringify(result, null, 2) : "No response yet."}
        </pre>
      </CardContent>
    </Card>
  );
}
