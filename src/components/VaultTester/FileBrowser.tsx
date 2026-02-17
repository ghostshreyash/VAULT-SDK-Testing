import { useState, useMemo } from "react";
import { useVault } from "@/context/VaultContext";
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
      addLog("info", "getAllFiles", "Fetching all files...");
      const res = await vault.getAllFiles(vaultId);
      // Ensure we handle the response structure correctly.
      const items = res.data?.files || []; 
      if (Array.isArray(items)) {
          setFiles(items);
          addLog("success", "getAllFiles", `Fetched ${items.length} items`, items);
      } else {
          setFiles([]);
           addLog("warning", "getAllFiles", "Unexpected response format", res);
      }
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
    if (!e.target.files?.length) return;
    const fileList = Array.from(e.target.files);
    
    // We can use uploadFile or uploadFiles
    // Let's use uploadFiles for batch data
    try {
        addLog("info", "uploadFiles", `Uploading ${fileList.length} files...`);
        // We need to convert FileList to the format SDK expects.
        // The SDK uploadFile uses `const { buffer, name, type } = file;`
        // Validation says "files" should be array.
        // In browser, File object has .arrayBuffer(), name, type.
        // The SDK seems designed for Node.js (Buffer).
        // If this frontend runs in browser, `buffer` property doesn't exist on File.
        // We must polyfill/convert it.
        
        const processedFiles = await Promise.all(fileList.map(async (f) => {
            const arrayBuffer = await f.arrayBuffer();
            return {
                name: f.name,
                type: f.type,
                buffer: new Uint8Array(arrayBuffer) // Convert to Uint8Array which behaves like Buffer
            };
        }));

        await vault.uploadFiles(processedFiles, vaultId, currentFolderId);
        addLog("success", "uploadFiles", "Upload completed");
        fetchFiles();
    } catch (error) {
        addLog("error", "uploadFiles", "Upload failed", error);
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
        
        // Strict equality check for folderId.
        // Root means folderId is null or missing?
        // Strict equality check for parentId.
        const itemParent = item.parentId || null;
        const currentParent = currentFolderId || null;
        return itemParent === currentParent;
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
