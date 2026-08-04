import { useMemo, useState } from "react";
import { useVault } from "@/context/VaultContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CloudUpload,
  Edit2,
  File,
  Folder,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useUploadManager } from "./upload/useUploadManager";
import { UploadDialog } from "./upload/UploadDialog";
import { UploadToast } from "./upload/UploadToast";
import type { UploadMode } from "./upload/types";
import { useSettingsStore } from "@/store/settingsStore";

interface FileItem {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  folderId?: string | null;
  isStarred?: boolean;
  size?: string;
  sizeBytes?: number;
  createdAt?: string;
  mimeType?: string;
}

type RenameMethod = "renameItem" | "renameFile";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeParentId(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized || normalized.toLowerCase() === "root") {
    return null;
  }

  return normalized;
}

function normalizeItem(value: unknown): FileItem {
  if (!isRecord(value)) {
    return {
      id: "",
      name: "Unnamed",
      type: "file",
      parentId: null,
    };
  }

  const rawType = typeof value.type === "string" ? value.type : "file";
  return {
    id: String(value.id ?? value._id ?? ""),
    name: String(value.name ?? value.fileName ?? "Unnamed"),
    type: rawType,
    parentId: normalizeParentId(value.parentId),
    folderId: normalizeParentId(value.folderId),
    isStarred: Boolean(value.isStarred),
    size: typeof value.size === "string" ? value.size : undefined,
    sizeBytes: typeof value.sizeBytes === "number" ? value.sizeBytes : undefined,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : undefined,
    mimeType: typeof value.mimeType === "string" ? value.mimeType : undefined,
  };
}

function extractPayload(response: unknown): unknown {
  if (isRecord(response) && "data" in response) {
    return response.data;
  }
  return response;
}

function extractItems(response: unknown): FileItem[] {
  const payload = extractPayload(response);

  if (Array.isArray(payload)) {
    return payload.map(normalizeItem).filter((item) => item.id && item.name);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const folders = Array.isArray(payload.folders) ? payload.folders : [];
  const files = Array.isArray(payload.files) ? payload.files : [];
  const items = Array.isArray(payload.items) ? payload.items : [];

  const combined = folders.length || files.length ? [...folders, ...files] : items;
  return combined.map(normalizeItem).filter((item) => item.id && item.name);
}

function isFolder(item: FileItem): boolean {
  return item.type.toLowerCase() === "folder";
}

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function formatSize(item: FileItem): string {
  if (item.size) {
    return item.size;
  }

  if (typeof item.sizeBytes === "number") {
    return formatBytes(item.sizeBytes);
  }

  return "-";
}

export function FileBrowser() {
  const { vault, addLog } = useVault();
  const vaultId = useSettingsStore((state) => state.vaultId);
  const [currentPath, setCurrentPath] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: "Root" },
  ]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [serverResults, setServerResults] = useState<FileItem[]>([]);
  const [starredFiles, setStarredFiles] = useState<FileItem[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [apiSearchQuery, setApiSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [manualParentId, setManualParentId] = useState("");
  const [renameMethod, setRenameMethod] = useState<RenameMethod>("renameItem");
  const [uploadMode, setUploadMode] = useState<UploadMode>("single");

  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const activeVaultId = vaultId.trim();
  const currentFolderId = currentPath[currentPath.length - 1]?.id ?? null;

  const setLoading = (key: string, value: boolean) => {
    setLoadingMap((prev) => ({ ...prev, [key]: value }));
  };

  const upload = useUploadManager({
    vault,
    vaultId: activeVaultId,
    addLog,
    // Refresh the listing once a batch of uploads finishes.
    onUploaded: () => {
      void fetchAllFiles();
    },
  });

  const currentFolderName =
    currentPath[currentPath.length - 1]?.name ?? "Root";

  const ensureReady = () => {
    if (!vault) {
      addLog("warning", "vault", "Initialize SDK before running operations");
      return false;
    }

    if (!activeVaultId) {
      addLog("warning", "vaultId", "Provide Target Vault ID in the dashboard header");
      return false;
    }

    return true;
  };

  const resolveOperationParentId = () => {
    const fromInput = normalizeParentId(manualParentId);
    if (fromInput) {
      return fromInput;
    }
    return normalizeParentId(currentFolderId);
  };

  const fetchAllFiles = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading("getAllFiles", true);
    try {
      addLog("info", "getAllFiles", "Fetching all files and folders...");
      const response = await vault.getAllFiles(activeVaultId);
      const items = extractItems(response);
      setFiles(items);
      addLog("success", "getAllFiles", `Loaded ${items.length} total items`, response);
    } catch (error) {
      addLog("error", "getAllFiles", "Failed to fetch files", error);
    } finally {
      setLoading("getAllFiles", false);
    }
  };

  const fetchBySearch = async () => {
    if (!ensureReady()) {
      return;
    }

    const query = apiSearchQuery.trim();
    if (!query) {
      addLog("warning", "getFiles", "Enter a search query before running getFiles");
      return;
    }

    setLoading("getFiles", true);
    try {
      addLog("info", "getFiles", `Searching for '${query}' ...`);
      const response = await vault.getFiles(activeVaultId, query);
      const items = extractItems(response);
      setServerResults(items);
      addLog("success", "getFiles", `Search returned ${items.length} item(s)`, response);
    } catch (error) {
      addLog("error", "getFiles", "Search request failed", error);
    } finally {
      setLoading("getFiles", false);
    }
  };

  const fetchStarredFiles = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading("getStarredFiles", true);
    try {
      addLog("info", "getStarredFiles", "Fetching starred files...");
      const response = await vault.getStarredFiles(activeVaultId);
      const items = extractItems(response);
      setStarredFiles(items);
      addLog(
        "success",
        "getStarredFiles",
        `Loaded ${items.length} starred item(s)`,
        response
      );
    } catch (error) {
      addLog("error", "getStarredFiles", "Failed to fetch starred files", error);
    } finally {
      setLoading("getStarredFiles", false);
    }
  };

  const handleCreateFolder = async () => {
    if (!ensureReady()) {
      return;
    }

    const folderName = newFolderName.trim();
    if (!folderName) {
      addLog("warning", "createFolder", "Folder name cannot be empty");
      return;
    }

    setLoading("createFolder", true);
    try {
      const parentId = normalizeParentId(currentFolderId);
      addLog("info", "createFolder", `Creating folder '${folderName}' ...`, {
        parentId: parentId ?? "root",
      });
      const response = await vault.createFolder(activeVaultId, folderName, parentId);
      addLog("success", "createFolder", `Folder '${folderName}' created`, response);
      setNewFolderName("");
      await fetchAllFiles();
    } catch (error) {
      addLog("error", "createFolder", "Failed to create folder", error);
    } finally {
      setLoading("createFolder", false);
    }
  };

  const handleSelectedFiles = (files: File[]) => {
    if (!ensureReady()) {
      return;
    }
    upload.enqueue(files, resolveOperationParentId(), uploadMode);
  };

  const handleTabDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleSelectedFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const handleDelete = async (item: FileItem) => {
    if (!ensureReady()) {
      return;
    }

    if (!item.id) {
      addLog("warning", "delete", "Cannot delete item without an id");
      return;
    }

    setLoading("delete", true);
    try {
      if (isFolder(item)) {
        addLog("info", "deleteFolder", `Deleting folder '${item.name}'...`);
        await vault.deleteFolder(activeVaultId, item.id);
      } else {
        addLog("info", "deleteFile", `Deleting file '${item.name}'...`);
        await vault.deleteFile(activeVaultId, item.id);
      }
      addLog("success", "delete", `'${item.name}' deleted successfully`);
      await fetchAllFiles();
    } catch (error) {
      addLog("error", "delete", `Failed to delete '${item.name}'`, error);
    } finally {
      setLoading("delete", false);
    }
  };

  const handleRename = async (item: FileItem) => {
    if (!ensureReady()) {
      return;
    }

    const newName = window.prompt("Enter new name", item.name)?.trim();
    if (!newName || newName === item.name) {
      return;
    }

    setLoading("rename", true);
    try {
      if (renameMethod === "renameFile") {
        addLog("info", "renameFile", `Renaming '${item.name}' to '${newName}'...`);
        await vault.renameFile(activeVaultId, item.id, newName);
      } else {
        addLog("info", "renameItem", `Renaming '${item.name}' to '${newName}'...`);
        await vault.renameItem(activeVaultId, item.id, newName);
      }
      addLog("success", renameMethod, "Rename successful");
      await fetchAllFiles();
    } catch (error) {
      addLog("error", renameMethod, "Rename failed", error);
    } finally {
      setLoading("rename", false);
    }
  };

  const handleStarToggle = async (item: FileItem) => {
    if (!ensureReady()) {
      return;
    }

    if (isFolder(item)) {
      addLog("warning", "addToStarred", "Folders cannot be starred");
      return;
    }

    setLoading("addToStarred", true);
    try {
      const nextValue = !item.isStarred;
      addLog("info", "addToStarred", `Setting '${item.name}' starred=${nextValue}`);
      await vault.addToStarred(activeVaultId, item.id, nextValue);
      addLog("success", "addToStarred", "Star status updated");
      await fetchAllFiles();
    } catch (error) {
      addLog("error", "addToStarred", "Failed to update star status", error);
    } finally {
      setLoading("addToStarred", false);
    }
  };

  const currentItems = useMemo(() => {
    const normalizedCurrentParent = normalizeParentId(currentFolderId);
    const localSearch = searchQuery.trim().toLowerCase();

    return files
      .filter((item) => {
        if (localSearch) {
          return item.name.toLowerCase().includes(localSearch);
        }

        const itemParent = normalizeParentId(item.parentId ?? item.folderId ?? null);
        return itemParent === normalizedCurrentParent;
      })
      .sort((a, b) => {
        const folderDiff = Number(isFolder(b)) - Number(isFolder(a));
        if (folderDiff !== 0) {
          return folderDiff;
        }
        return a.name.localeCompare(b.name);
      });
  }, [files, currentFolderId, searchQuery]);

  const navigateTo = async (folder: FileItem) => {
    if (!isFolder(folder)) {
      return;
    }

    setCurrentPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchQuery("");
    await fetchAllFiles();
  };

  const navigateUp = async () => {
    if (currentPath.length <= 1) {
      return;
    }

    setCurrentPath((prev) => prev.slice(0, -1));
    await fetchAllFiles();
  };

  const renderItemsTable = (
    items: FileItem[],
    emptyState: string,
    allowFolderNavigation: boolean
  ) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="w-44 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                {emptyState}
              </TableCell>
            </TableRow>
          )}
          {items.map((item) => (
            <TableRow key={`${item.id}-${item.name}`}>
              <TableCell>
                {isFolder(item) ? (
                  <Folder className="h-4 w-4 text-sky-600" />
                ) : (
                  <File className="h-4 w-4 text-slate-500" />
                )}
              </TableCell>
              <TableCell className="font-medium">
                {allowFolderNavigation && isFolder(item) ? (
                  <button
                    type="button"
                    className="text-left hover:underline"
                    onClick={() => navigateTo(item)}
                  >
                    {item.name}
                  </button>
                ) : (
                  item.name
                )}
              </TableCell>
              <TableCell>{isFolder(item) ? "Folder" : item.mimeType || item.type}</TableCell>
              <TableCell>{formatSize(item)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isFolder(item)}
                    onClick={() => handleStarToggle(item)}
                    title="Toggle star"
                  >
                    <Star
                      className={`h-4 w-4 ${item.isStarred ? "fill-amber-400 text-amber-500" : ""}`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRename(item)}
                    title={`Rename via ${renameMethod}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(item)}
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
    <Card className="h-full border-slate-200/70 bg-white/90 shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>File Test Lab</CardTitle>
            <CardDescription>
              Covers `getAllFiles`, `getFiles`, `uploadFile`, folder/file operations,
              and starring.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{files.length} cached items</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAllFiles}
              disabled={loadingMap.getAllFiles}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loadingMap.getAllFiles ? "animate-spin" : ""}`}
              />
              Refresh Files
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Current path: </span>
            <span className="font-medium">{currentPath.map((segment) => segment.name).join(" / ")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rename API</span>
            <Select
              value={renameMethod}
              onValueChange={(value) => setRenameMethod(value as RenameMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renameItem">renameItem</SelectItem>
                <SelectItem value="renameFile">renameFile (legacy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Tabs defaultValue="explorer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 gap-1 md:grid-cols-5">
            <TabsTrigger value="explorer">Explorer</TabsTrigger>
            <TabsTrigger value="search">SDK Search</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="uploads">Upload Lab</TabsTrigger>
          </TabsList>

          <TabsContent value="explorer" className="space-y-3">
            <div className="grid gap-2 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
              <Button
                variant="outline"
                onClick={navigateUp}
                disabled={currentPath.length <= 1}
                className="lg:w-28"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Input
                placeholder="Filter currently loaded items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || loadingMap.createFolder}
                >
                  Create
                </Button>
              </div>
            </div>
            {renderItemsTable(
              currentItems,
              files.length
                ? "No items in this folder for current filter."
                : "No files loaded yet. Run Refresh Files.",
              true
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-3">
            <div className="flex flex-col gap-2 md:flex-row">
              <Input
                placeholder="Search query for vault.getFiles()"
                value={apiSearchQuery}
                onChange={(e) => setApiSearchQuery(e.target.value)}
              />
              <Button onClick={fetchBySearch} disabled={loadingMap.getFiles}>
                <Search className="mr-2 h-4 w-4" />
                Run getFiles
              </Button>
            </div>
            {renderItemsTable(
              serverResults,
              "No server search results. Run getFiles with a query.",
              false
            )}
          </TabsContent>

          <TabsContent value="starred" className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Use this to validate `getStarredFiles` independently of local cache.
              </p>
              <Button onClick={fetchStarredFiles} disabled={loadingMap.getStarredFiles}>
                <Star className="mr-2 h-4 w-4" />
                Run getStarredFiles
              </Button>
            </div>
            {renderItemsTable(
              starredFiles,
              "No starred files found yet.",
              false
            )}
          </TabsContent>

          <TabsContent value="uploads" className="space-y-4">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_280px]">
              <Input
                placeholder="Optional parent folder ID override (default: current folder)"
                value={manualParentId}
                onChange={(e) => setManualParentId(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-muted-foreground">
                  Upload API
                </span>
                <Select
                  value={uploadMode}
                  onValueChange={(value) => setUploadMode(value as UploadMode)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">uploadFile (per file)</SelectItem>
                    <SelectItem value="batch">uploadFiles (batch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="rounded-md border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              {uploadMode === "single"
                ? "uploadFile() runs one call per file on a 3-at-a-time queue and throws on failure, so each file reports its own error."
                : "uploadFiles() sends the whole selection in one call. It never throws for per-file failures — it resolves with a status array, so partial success is normal."}
            </p>

            <div
              role="button"
              tabIndex={0}
              onClick={() => setUploadDialogOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setUploadDialogOpen(true);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleTabDrop}
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-8 text-center transition-colors hover:border-cyan-500 hover:bg-slate-50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100">
                <CloudUpload className="h-6 w-6 text-cyan-600" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-700">
                Drag and drop files here, or click to browse
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Destination: {manualParentId.trim() || currentFolderName} · via{" "}
                {uploadMode === "single" ? "uploadFile()" : "uploadFiles()"}, which
                handles hashing, presigning, transfer and registration internally
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setUploadDialogOpen(true)}>
                <CloudUpload className="mr-2 h-4 w-4" />
                Upload files
              </Button>
              {upload.items.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => upload.setToastOpen(true)}
                  disabled={upload.toastOpen}
                >
                  Show upload status
                </Button>
              )}
            </div>

            {upload.items.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upload.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.file.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "success"
                                ? "default"
                                : item.status === "error"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {item.status}
                          </Badge>
                          {item.error && (
                            <span className="ml-2 text-xs text-red-500">{item.error}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {formatBytes(item.file.size)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>

    <UploadDialog
      open={uploadDialogOpen}
      onOpenChange={setUploadDialogOpen}
      onFiles={handleSelectedFiles}
      destinationLabel={manualParentId.trim() || currentFolderName}
    />

    <UploadToast
      open={upload.toastOpen}
      items={upload.items}
      isUploading={upload.isUploading}
      counts={upload.counts}
      onCancel={upload.cancel}
      onClearCompleted={upload.clearCompleted}
      onClose={upload.closeToast}
    />
    </>
  );
}