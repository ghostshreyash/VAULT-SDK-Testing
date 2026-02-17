import { useState, useEffect } from "react";
import { useVault } from "@/context/VaultContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "vault-sdk-config";

export function ConfigPanel() {
  const { initVault, isConnected, disconnect } = useVault();
  const [formData, setFormData] = useState({
    VAULT_ACCESS_KEY: "",
    VAULT_SECRET_KEY: "",
    VAULT_CLIENT_API_KEY: "",
    VAULT_BASE_URL: "http://localhost:7000/api", // Default suggestion
    VAULT_WS_URL: "ws://localhost:8000",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    initVault(formData);
  };

  if (isConnected) {
    return (
        <div className="space-y-4">
             <div className="rounded-md border bg-muted/40 p-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M5 12l5 5l10 -10"></path></svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium">Vault Connected</h3>
                        <p className="text-xs text-muted-foreground">URL: {formData.VAULT_BASE_URL}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnect} className="ml-auto">Disconnect</Button>
                </div>
            </div>
            
            <Card>
                 <CardHeader>
                     <CardTitle className="text-base">Configuration Details</CardTitle>
                     <CardDescription>Current connection parameters</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-2">
                     <div className="grid grid-cols-1 gap-2 text-sm">
                         <div className="flex justify-between py-1 border-b border-border/50">
                             <span className="text-muted-foreground">Base URL</span>
                             <span className="font-mono">{formData.VAULT_BASE_URL}</span>
                         </div>
                         <div className="flex justify-between py-1 border-b border-border/50">
                             <span className="text-muted-foreground">WebSocket URL</span>
                             <span className="font-mono">{formData.VAULT_WS_URL}</span>
                         </div>
                         <div className="flex justify-between py-1 border-b border-border/50">
                             <span className="text-muted-foreground">Access Key</span>
                             <span className="font-mono">••••••••</span>
                         </div>
                     </div>
                 </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vault Configuration</CardTitle>
        <CardDescription>Enter your Vault credentials to initialize the SDK.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="VAULT_BASE_URL">Vault Base URL</Label>
            <Input
              id="VAULT_BASE_URL"
              name="VAULT_BASE_URL"
              placeholder="http://localhost:8000/api"
              value={formData.VAULT_BASE_URL}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="VAULT_WS_URL">Vault WS URL</Label>
            <Input
              id="VAULT_WS_URL"
              name="VAULT_WS_URL"
              placeholder="ws://localhost:8000"
              value={formData.VAULT_WS_URL}
              onChange={handleChange}
              required
            />
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
          <Button type="submit" className="w-full">Connect to Vault</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
