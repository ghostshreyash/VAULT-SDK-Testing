import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UserManagement() {
  const { vault, addLog } = useVault();
  const [loading, setLoading] = useState(false);

  // Create User State
  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createUserPlatformId, setCreateUserPlatformId] = useState("");

  // Import Vault State
  const [importVaultId, setImportVaultId] = useState("");
  const [importPlatformId, setImportPlatformId] = useState("");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vault) return;
    setLoading(true);
    try {
        addLog("info", "createPlatformUser", `Creating user for ${createUserEmail}...`);
        const res = await vault.createPlatformUser(createUserEmail, createUserPlatformId);
        addLog("success", "createPlatformUser", "User created successfully", res);
    } catch (error) {
        addLog("error", "createPlatformUser", "Failed to create user", error);
    } finally {
        setLoading(false);
    }
  };

  const handleImportVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vault) return;
    setLoading(true);
    try {
        addLog("info", "importVault", `Importing vault ${importVaultId}...`);
        const res = await vault.importVault(importVaultId, importPlatformId);
        addLog("success", "importVault", "Vault imported successfully", res);
    } catch (error) {
        addLog("error", "importVault", "Failed to import vault", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <Tabs defaultValue="create-user">
            <TabsList>
                <TabsTrigger value="create-user">Create Platform User</TabsTrigger>
                <TabsTrigger value="import-vault">Import Vault</TabsTrigger>
            </TabsList>

            <TabsContent value="create-user">
                <Card>
                    <CardHeader>
                        <CardTitle>Create Platform User</CardTitle>
                        <CardDescription>Register a new user on the platform.</CardDescription>
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
                                    placeholder="Enter Platform ID"
                                    value={createUserPlatformId}
                                    onChange={(e) => setCreateUserPlatformId(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create User"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>

            <TabsContent value="import-vault">
                <Card>
                    <CardHeader>
                        <CardTitle>Import Vault</CardTitle>
                        <CardDescription>Import an existing vault using its ID.</CardDescription>
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
                                    placeholder="Enter Platform ID"
                                    value={importPlatformId}
                                    onChange={(e) => setImportPlatformId(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Importing..." : "Import Vault"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
