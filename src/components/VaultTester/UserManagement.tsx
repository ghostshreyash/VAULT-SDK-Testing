import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserManagement() {
  const { vault, addLog } = useVault();
  const [loading, setLoading] = useState(false);

  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createUserPlatformId, setCreateUserPlatformId] = useState("");
  const [createUserResult, setCreateUserResult] = useState<unknown>(null);

  const [importVaultId, setImportVaultId] = useState("");
  const [importPlatformId, setImportPlatformId] = useState("");
  const [importResult, setImportResult] = useState<unknown>(null);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "createPlatformUser", "Initialize SDK before creating users");
      return;
    }

    setLoading(true);
    try {
      const normalizedPlatformId = createUserPlatformId.trim();
      addLog("info", "createPlatformUser", `Creating user ${createUserEmail}...`);
      const response = await vault.createPlatformUser(
        createUserEmail,
        normalizedPlatformId || undefined
      );
      setCreateUserResult(response);
      addLog("success", "createPlatformUser", "Platform user created", response);
    } catch (error) {
      addLog("error", "createPlatformUser", "Failed to create platform user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportVault = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "importVault", "Initialize SDK before importing vaults");
      return;
    }

    setLoading(true);
    try {
      const normalizedPlatformId = importPlatformId.trim();
      addLog("info", "importVault", `Importing vault ${importVaultId}...`);
      const response = await vault.importVault(
        importVaultId,
        normalizedPlatformId || undefined
      );
      setImportResult(response);
      addLog("success", "importVault", "Vault import completed", response);
    } catch (error) {
      addLog("error", "importVault", "Failed to import vault", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
        Test platform onboarding methods here: `createPlatformUser` and `importVault`.
      </div>

      <Tabs defaultValue="create-user">
        <TabsList>
          <TabsTrigger value="create-user">Create Platform User</TabsTrigger>
          <TabsTrigger value="import-vault">Import Vault</TabsTrigger>
        </TabsList>

        <TabsContent value="create-user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Platform User</CardTitle>
              <CardDescription>
                Runs `createPlatformUser(email, platformId?)`. Platform ID is optional.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateUser}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="user@example.com"
                    value={createUserEmail}
                    onChange={(e) => setCreateUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformId">Platform ID</Label>
                  <Input
                    id="platformId"
                    placeholder="Optional platform ID"
                    value={createUserPlatformId}
                    onChange={(e) => setCreateUserPlatformId(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Run createPlatformUser"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {createUserResult
                  ? JSON.stringify(createUserResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-vault" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Vault</CardTitle>
              <CardDescription>
                Runs `importVault(vaultId, platformId?)`. If omitted, it links client + enables SDK access.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleImportVault}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="importVaultId">Vault ID</Label>
                  <Input
                    id="importVaultId"
                    placeholder="Enter Vault ID"
                    value={importVaultId}
                    onChange={(e) => setImportVaultId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importPlatformId">Platform ID</Label>
                  <Input
                    id="importPlatformId"
                    placeholder="Optional platform ID"
                    value={importPlatformId}
                    onChange={(e) => setImportPlatformId(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Importing..." : "Run importVault"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {importResult ? JSON.stringify(importResult, null, 2) : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
