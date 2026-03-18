import { useState, useMemo } from "react";
import { useVault } from "@/context/VaultContext";
import crypto from "crypto";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Folder, File, ArrowLeft, RefreshCw, Trash2, Star, Edit2 } from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: string; // 'folder' or 'file'
  parentId: string | null;
  isStarred?: boolean;
  size?: string;
  sizeBytes?: number;
  createdAt?: string;
  mimeType?: string;
}

export function FileBrowser({ vaultId }: { vaultId: string }) {
  const { vault, addLog } = useVault();
  const [currentPath, setCurrentPath] = useState<{id: string | null, name: string}[]>([{ id: null, name: 'Root' }]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const currentFolderId = currentPath[currentPath.length - 1].id;

  const fetchFiles = async () => {
    if (!vault || !vaultId) return;
    setLoading(true);
    try {
      const res = await vault.getAllFiles(vaultId);
      // Resiliently handle different response structures
      let items = [];
      if (Array.isArray(res)) {
          items = res;
      } else if (res?.data?.files && Array.isArray(res.data.files)) {
          items = res.data.files;
      } else if (res?.files && Array.isArray(res.files)) {
          items = res.files;
      } else if (res?.data && Array.isArray(res.data)) {
          items = res.data;
      }

      setFiles(items);
      addLog("success", "getAllFiles", `Fetched ${items.length} items`, items);
    } catch (error) {
      addLog("error", "getAllFiles", "Failed to fetch files", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
        addLog("info", "createFolder", `Creating folder '${newFolderName}'...`);
        await vault.createFolder(vaultId, newFolderName, currentFolderId);
        addLog("success", "createFolder", "Folder created");
        setNewFolderName("");
        fetchFiles();
    } catch (error) {
        addLog("error", "createFolder", "Failed to create folder", error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !vault) return;
    const fileList = Array.from(e.target.files);
    
    try {
        addLog("info", "upload", `Starting manual presigned upload for ${fileList.length} files...`);
        
        for (const f of fileList) {
            addLog("info", "upload", `Processing ${f.name}...`);
            const arrayBuffer = await f.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            
            // Step 1: Compute SHA-256 Hash
            // Note: crypto-browserify is used via Vite alias
            const hash = crypto.createHash("sha256").update(buffer).digest("hex");
            addLog("info", "upload", `Computed hash for ${f.name}: ${hash}`);

            // Step 2: Get Presigned URL from SDK
            addLog("info", "getPresignedUrl", `Requesting upload URL for ${f.name}...`);
            const presignedRes = await vault.getPresignedUrl({
                vaultId,
                fileName: f.name,
                fileType: f.type || "application/octet-stream",
                fileSize: buffer.length,
                contentHash: hash,
                folderId: currentFolderId || null,
            });
            
            if (!presignedRes?.data) {
                throw new Error(`Failed to get presigned URL for ${f.name}`);
            }

            const { url, key, contentType, sanitizedName } = presignedRes.data;
            addLog("success", "getPresignedUrl", `Received URL for ${f.name}`);

            // Step 3: Upload directly to Storage (S3/Filebase) from the UI
            addLog("info", "storageUpload", `Uploading ${f.name} directly to storage...`);
            await axios.put(url, buffer, {
                headers: {
                    "Content-Type": contentType,
                    "x-amz-meta-original-filename": sanitizedName,
                    "x-amz-meta-content-hash": hash,
                    "x-amz-meta-user-id": vaultId,
                    "x-amz-meta-folder-id": currentFolderId || "root",
                    "x-amz-meta-file-size": buffer.length.toString(),
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        if (percent % 25 === 0) {
                            addLog("info", "storageProgress", `${f.name}: ${percent}%`);
                        }
                    }
                }
            });
            addLog("success", "storageUpload", `${f.name} uploaded to storage`);

            // Step 4: Register the upload with the backend via SDK
            addLog("info", "registerUpload", `Registering ${f.name} with backend...`);
            await vault.registerUpload({
                vaultId,
                fileName: f.name,
                filebaseKey: key,
                fileSize: buffer.length,
                contentHash: hash,
                folderId: currentFolderId || null,
            });
            addLog("success", "registerUpload", `${f.name} registered successfully`);
        }
        
        addLog("success", "upload", "All files uploaded successfully via direct storage access");
        fetchFiles();
    } catch (error) {
        addLog("error", "upload", "Manual upload flow failed", error);
    }
  };

  const handleDelete = async (item: FileItem) => {
      try {
          if (item.type === 'folder') {
              addLog("info", "deleteFolder", `Deleting folder ${item.name}...`);
              await vault.deleteFolder(vaultId, item.id);
          } else {
              addLog("info", "deleteFile", `Deleting file ${item.name}...`);
              await vault.deleteFile(vaultId, item.id);
          }
          addLog("success", "delete", "Item deleted");
          fetchFiles();
      } catch (error) {
          addLog("error", "delete", "Failed to delete item", error);
      }
  };

  const handleRename = async (item: FileItem) => {
      const newName = prompt("Enter new name", item.name);
      if (!newName || newName === item.name) return;
      try {
           addLog("info", "renameFile", `Renaming ${item.name} to ${newName}...`);
           await vault.renameFile(vaultId, item.id, newName);
           addLog("success", "renameFile", "Renamed successfully");
           fetchFiles();
      } catch (error) {
           addLog("error", "renameFile", "Rename failed", error);
      }
  };

  const handleStar = async (item: FileItem) => {
      try {
           const newStatus = !item.isStarred;
           addLog("info", "addToStarred", `Setting starred to ${newStatus}...`);
           await vault.addToStarred(vaultId, item.id, newStatus);
           addLog("success", "addToStarred", "Updated star status");
           fetchFiles();
      } catch (error) {
           addLog("error", "addToStarred", "Failed to update star", error);
      }
  };

  // Filter files for current view
  const currentItems = useMemo(() => {
    return files.filter(item => {
        // If searching, ignore folder structure
        if (searchQuery) return item.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Handle both 'parentId' and 'folderId' from backend
        const itemParentId = item.parentId || item.folderId || null;
        const currentParentId = currentFolderId || null;
        
        // Normalize strings for comparison (cases where one might be "" and other null)
        return (itemParentId === currentParentId) || 
               (!itemParentId && !currentParentId);
    });
  }, [files, currentFolderId, searchQuery]);

  const navigateTo = (folder: FileItem) => {
      setCurrentPath(prev => [...prev, { id: folder.id, name: folder.name }]);
      setSearchQuery("");
  };

  const navigateUp = () => {
      if (currentPath.length > 1) {
          setCurrentPath(prev => prev.slice(0, -1));
      }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
             <div>
                <CardTitle>File Browser</CardTitle>
                <CardDescription>
                    {currentPath.map(p => p.name).join(" / ")}
                </CardDescription>
             </div>
             <div className="flex gap-2">
                 <Button variant="outline" size="icon" onClick={fetchFiles} disabled={!vaultId} title="Refresh">
                     <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                 </Button>
             </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mt-4">
             {currentPath.length > 1 && (
                 <Button variant="ghost" onClick={navigateUp}>
                     <ArrowLeft className="mr-2 h-4 w-4"/> Back
                 </Button>
             )}
             <div className="flex-1 flex gap-2">
                 <Input 
                    placeholder="Search files..." 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)}
                 />
                 <Input 
                    placeholder="New Folder Name" 
                    value={newFolderName} 
                    onChange={e => setNewFolderName(e.target.value)}
                 />
                 <Button onClick={handleCreateFolder} disabled={!newFolderName}>Create Folder</Button>
             </div>
             <div className="w-full md:w-auto">
                 <Button variant="secondary" className="relative w-full">
                    Upload Files
                    <input 
                        type="file" 
                        multiple 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleUpload}
                    />
                 </Button>
             </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0 overflow-auto">
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {currentItems.length === 0 && (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              {files.length === 0 ? "No files loaded. Click Refresh." : "Empty folder."}
                          </TableCell>
                      </TableRow>
                  )}
                  {currentItems.map(item => (
                      <TableRow key={item.id}>
                          <TableCell>
                              {item.type === 'folder' ? <Folder className="text-blue-500"/> : <File className="text-gray-500"/>}
                          </TableCell>
                          <TableCell className="font-medium">
                              {item.type === 'folder' ? (
                                  <button onClick={() => navigateTo(item)} className="hover:underline">{item.name}</button>
                              ) : (
                                  item.name
                              )}
                          </TableCell>
                          <TableCell>{item.type === 'folder' ? 'Folder' : (item.mimeType || item.type)}</TableCell>
                          <TableCell>{item.size || '-'}</TableCell>
                          <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => handleStar(item)}>
                                      <Star className={`h-4 w-4 ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleRename(item)}>
                                      <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item)}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
      </CardContent>
    </Card>
  );
}
