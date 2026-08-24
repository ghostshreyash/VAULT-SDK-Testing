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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/store/settingsStore";

export function UserManagement() {
  const { vault, addLog } = useVault();
  const vaultId = useSettingsStore((state) => state.vaultId);
  const setVaultId = useSettingsStore((state) => state.setVaultId);
  const [loading, setLoading] = useState(false);

  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createUserPlatformId, setCreateUserPlatformId] = useState("");
  const [createUserResult, setCreateUserResult] = useState<unknown>(null);

  const [importVaultId, setImportVaultId] = useState("");
  const [importPlatformId, setImportPlatformId] = useState("");
  const [importResult, setImportResult] = useState<unknown>(null);

  const [botName, setBotName] = useState("");
  const [botProfession, setBotProfession] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [createBotResult, setCreateBotResult] = useState<unknown>(null);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "createVault", "Initialize SDK before creating users");
      return;
    }

    setLoading(true);
    try {
      const normalizedPlatformId = createUserPlatformId.trim();
      addLog("info", "createVault", `Creating vault for ${createUserEmail}...`);
      const response = await vault.createVault(
        createUserEmail,
        normalizedPlatformId || undefined
      );
      setCreateUserResult(response);
      const createdVaultId = response?.data?.vaultId;
      if (typeof createdVaultId === "string" && createdVaultId.trim()) {
        setVaultId(createdVaultId);
      }
      addLog("success", "createVault", "Vault created for user", response);
    } catch (error) {
      addLog("error", "createVault", "Failed to create vault", error);
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
      setVaultId(importVaultId.trim());
      addLog("success", "importVault", "Vault import completed", response);
    } catch (error) {
      addLog("error", "importVault", "Failed to import vault", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "createBot", "Initialize SDK before creating bots");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "createBot",
        "Provide Target Vault ID in the dashboard header before creating a bot"
      );
      return;
    }

    setLoading(true);
    try {
      addLog("info", "createBot", `Creating bot '${botName}' for vault ${activeVaultId}...`);
      const response = await vault.createBot(activeVaultId, {
        name: botName.trim(),
        profession: botProfession.trim() || undefined,
        description: botDescription.trim() || undefined,
      });
      setCreateBotResult(response);
      addLog("success", "createBot", "Bot created successfully", response);
    } catch (error) {
      addLog("error", "createBot", "Failed to create bot", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
        Test platform onboarding and SDK bot setup here: `createVault`, `importVault`, and `createBot`.
        Bot creation works after the vault is linked to the same `clientApiKey`, and successful
        onboarding will auto-fill the shared Target Vault ID for the next step.
      </div>

      <Tabs defaultValue="create-user">
        <TabsList>
          <TabsTrigger value="create-user">Create Vault</TabsTrigger>
          <TabsTrigger value="import-vault">Import Vault</TabsTrigger>
          <TabsTrigger value="create-bot">Create Bot</TabsTrigger>
        </TabsList>

        <TabsContent value="create-user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Vault</CardTitle>
              <CardDescription>
                Runs `createVault(email, platformId?)`. Platform ID is optional — omit it
                for a platform-less SDK user. Idempotent: an existing user is linked to
                your client and returned rather than erroring.
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
                  {loading ? "Creating..." : "Run createVault"}
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

        <TabsContent value="create-bot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Bot</CardTitle>
              <CardDescription>
                Runs `createBot(vaultId, bot)`. It uses the Target Vault ID from the dashboard
                header and creates the bot plus its dedicated folder through the SDK route.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateBot}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="createBotVaultId">Target Vault ID</Label>
                  <Input
                    id="createBotVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botName">Bot Name</Label>
                  <Input
                    id="botName"
                    placeholder="Support Bot"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botProfession">Profession</Label>
                  <Input
                    id="botProfession"
                    placeholder="Optional profession"
                    value={botProfession}
                    onChange={(e) => setBotProfession(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botDescription">Description</Label>
                  <Textarea
                    id="botDescription"
                    placeholder="Optional personality / bot description"
                    value={botDescription}
                    onChange={(e) => setBotDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Run createBot"}
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
                {createBotResult
                  ? JSON.stringify(createBotResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
