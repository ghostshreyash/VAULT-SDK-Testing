import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { ConfigPanel } from "./ConfigPanel";
import { ActionLog } from "./ActionLog";
import { FileBrowser } from "./FileBrowser";
import { StoragePanel } from "./StoragePanel";
import { UserManagement } from "./UserManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
    LayoutDashboard, 
    FolderOpen, 
    Database, 
    Settings, 
    Terminal, 
    LogOut, 
    Wifi, 
    User,
    // WifiOff 
} from "lucide-react";

export function Dashboard() {
  const { isConnected, disconnect } = useVault();
  const [vaultId, setVaultId] = useState("");
  const [activeView, setActiveView] = useState<"files" | "storage" | "settings" | "users">("files");
  const [showLogs, setShowLogs] = useState(true);

  if (!isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md space-y-4">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Vault SDK Tester</h1>
                <p className="text-muted-foreground">Enter your credentials to begin testing.</p>
            </div>
            <ConfigPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
        <div className="flex items-center gap-2 font-semibold">
           <LayoutDashboard className="h-5 w-5" />
           <span>Vault SDK Tester</span>
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                <Wifi className="h-3 w-3" /> Connected
            </Badge>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Target Vault ID:</label>
                <Input 
                    className="h-8 w-64 font-mono text-xs" 
                    placeholder="Enter Vault ID..." 
                    value={vaultId}
                    onChange={(e) => setVaultId(e.target.value)}
                />
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="icon" onClick={disconnect} title="Disconnect">
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/10 flex flex-col">
            <nav className="flex-1 p-4 space-y-2">
                <Button 
                    variant={activeView === "files" ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveView("files")}
                >
                    <FolderOpen className="h-4 w-4" />
                    File Browser
                </Button>
                <Button 
                    variant={activeView === "storage" ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveView("storage")}
                >
                    <Database className="h-4 w-4" />
                    Storage & Plans
                </Button>
                <Button 
                    variant={activeView === "users" ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveView("users")}
                >
                    <User className="h-4 w-4" />
                    User Management
                </Button>
                <Separator className="my-2"/>
                <Button 
                    variant={activeView === "settings" ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveView("settings")}
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Button>
            </nav>
            <div className="p-4 border-t">
                 <Button 
                    variant={showLogs ? "secondary" : "outline"} 
                    className="w-full justify-start gap-2" 
                    onClick={() => setShowLogs(!showLogs)}
                >
                    <Terminal className="h-4 w-4" />
                    {showLogs ? "Hide Logs" : "Show Logs"}
                 </Button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-900/10">
                {activeView === "files" && (
                    <div className="h-full flex flex-col">
                         <div className="mb-4">
                            <h2 className="text-2xl font-bold tracking-tight">File Browser</h2>
                            <p className="text-muted-foreground">Manage files and folders in the vault.</p>
                         </div>
                         <div className="flex-1 min-h-0">
                            <FileBrowser vaultId={vaultId} />
                         </div>
                    </div>
                )}
                {activeView === "storage" && (
                    <div className="h-full flex flex-col">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold tracking-tight">Storage & Plans</h2>
                            <p className="text-muted-foreground">View storage usage and manage subscriptions.</p>
                        </div>
                        <StoragePanel vaultId={vaultId} />
                    </div>
                )}
                {activeView === "users" && (
                    <div className="max-w-2xl">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
                            <p className="text-muted-foreground">Create users and import vaults.</p>
                        </div>
                        <UserManagement />
                    </div>
                )}
                {activeView === "settings" && (
                    <div className="max-w-2xl">
                         <div className="mb-4">
                            <h2 className="text-2xl font-bold tracking-tight">SDK Configuration</h2>
                            <p className="text-muted-foreground">Manage your SDK connection parameters.</p>
                        </div>
                        <ConfigPanel />
                    </div>
                )}
            </div>

            {/* Logs Panel */}
            {showLogs && (
                <div className="h-72 border-t bg-background flex flex-col shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)]">
                    <ActionLog />
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
