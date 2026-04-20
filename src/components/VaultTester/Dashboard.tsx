import { useMemo, useState, type ReactNode } from "react";
import { useVault } from "@/context/VaultContext";
import { ConfigPanel } from "./ConfigPanel";
import { ActionLog } from "./ActionLog";
import { FileBrowser } from "./FileBrowser";
import { StoragePanel } from "./StoragePanel";
import { UserManagement } from "./UserManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Boxes,
  FolderOpen,
  LogOut,
  Settings,
  Terminal,
  User,
  Wifi,
  WifiOff,
} from "lucide-react";

const methodGroups = [
  {
    title: "File, Search and Media",
    methods: [
      "uploadFile",
      "uploadFiles",
      "getFiles",
      "getAllFiles",
      "createFolder",
      "renameItem",
      "renameFile",
      "deleteFile",
      "deleteFolder",
      "addToStarred",
      "getStarredFiles",
      "getMedia",
    ],
  },
  {
    title: "Storage and Billing",
    methods: [
      "getStorageDetails",
      "getAllPlans",
      "buyPlan",
      "getSubscriptions",
      "cancelSubscription",
      "createUpcomingPlan",
      "cancelUpcomingPlan",
    ],
  },
  {
    title: "Platform",
    methods: ["createPlatformUser", "importVault"],
  },
  {
    title: "Connection",
    methods: ["connectToWebsocket"],
  },
] as const;

export function Dashboard() {
  const { isConnected, wsConnected, disconnect } = useVault();
  const [vaultId, setVaultId] = useState("");
  const [showLogs, setShowLogs] = useState(true);
  const [activeView, setActiveView] = useState<"files" | "storage" | "users" | "settings">(
    "files"
  );

  const methodCount = useMemo(
    () => methodGroups.reduce((count, group) => count + group.methods.length, 0),
    []
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.18),_transparent_45%),_linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="border-cyan-200/70 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-600 p-2 text-white">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Vault SDK Testing Console</CardTitle>
                  <CardDescription>
                    Configure once, then run every SDK method from one place.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                The UI is grouped by test intent so teams can validate file flows, plans,
                users, media, and WebSocket behavior with less switching and cleaner logs.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {methodGroups.map((group) => (
                  <div key={group.title} className="rounded-lg border bg-white/80 p-3">
                    <p className="text-sm font-semibold">{group.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {group.methods.length} methods available
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <ConfigPanel />
        </div>
      </div>
    );
  }

  const renderPanelWithLogs = (content: ReactNode) => (
    <div
      className={`grid gap-4 ${
        showLogs ? "2xl:grid-cols-[minmax(0,1fr)_380px]" : "grid-cols-1"
      }`}
    >
      <div className="min-w-0">{content}</div>
      {showLogs && (
        <Card className="h-[720px] min-h-[420px] overflow-hidden border-slate-200/70 bg-white/90">
          <ActionLog />
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.14),_transparent_45%),_linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-4 py-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl bg-cyan-600 p-2 text-white">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Vault SDK Testing Console</h1>
              <p className="text-xs text-muted-foreground">
                Full method coverage with focused test surfaces
              </p>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Badge className="gap-1 bg-emerald-600 text-white hover:bg-emerald-600">
                <Wifi className="h-3 w-3" /> SDK Connected
              </Badge>
              {wsConnected ? (
                <Badge className="gap-1 bg-cyan-600 text-white hover:bg-cyan-600">
                  <Wifi className="h-3 w-3" /> WS Online
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <WifiOff className="h-3 w-3" /> WS Offline
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <Input
              className="h-9 font-mono text-xs"
              placeholder="Target Vault ID for test operations"
              value={vaultId}
              onChange={(e) => setVaultId(e.target.value)}
            />
            <Button
              type="button"
              variant={showLogs ? "secondary" : "outline"}
              onClick={() => setShowLogs((prev) => !prev)}
            >
              <Terminal className="mr-2 h-4 w-4" />
              {showLogs ? "Hide Logs" : "Show Logs"}
            </Button>
            <Button type="button" variant="outline" onClick={disconnect}>
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-5 lg:px-6 lg:py-6">
        <Card className="border-cyan-200/70 bg-white/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SDK Method Coverage</CardTitle>
            <CardDescription>
              {methodCount} public methods are now reachable from this testing UI.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {methodGroups.map((group) => (
              <div key={group.title} className="rounded-lg border bg-muted/20 p-3">
                <p className="text-sm font-semibold">{group.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{group.methods.join(", ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Tabs
          value={activeView}
          onValueChange={(value) =>
            setActiveView(value as "files" | "storage" | "users" | "settings")
          }
        >
          <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-4">
            <TabsTrigger value="files">
              <FolderOpen className="mr-2 h-4 w-4" />
              File and Media
            </TabsTrigger>
            <TabsTrigger value="storage">Storage and Plans</TabsTrigger>
            <TabsTrigger value="users">
              <User className="mr-2 h-4 w-4" />
              Platform
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Connection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-4">
            {renderPanelWithLogs(<FileBrowser vaultId={vaultId} />)}
          </TabsContent>

          <TabsContent value="storage" className="mt-4">
            {renderPanelWithLogs(<StoragePanel vaultId={vaultId} />)}
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            {renderPanelWithLogs(<UserManagement />)}
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            {renderPanelWithLogs(<ConfigPanel />)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
