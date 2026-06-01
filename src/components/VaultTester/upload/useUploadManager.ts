import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { type CancelTokenSource } from "axios";
import type { LogEntry } from "@/context/VaultContext";
import type { UploadItem, UploadStatus, UploadStage } from "./types";

interface UseUploadManagerArgs {
  vault: any | null;
  vaultId: string;
  addLog: (
    type: LogEntry["type"],
    method: string,
    message: string,
    data?: unknown
  ) => void;
  /** Called once after a batch of uploads drains (success or otherwise). */
  onUploaded?: () => void;
  concurrency?: number;
  maxFilesPerBatch?: number;
}

const TERMINAL: UploadStatus[] = ["success", "error", "cancelled"];

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Drives a vault-style upload experience: a concurrent queue of files, each
 * pushed through the SDK presigned-URL pipeline (getPresignedUrl -> PUT to
 * storage with live byte progress -> registerUpload), with per-file status,
 * progress and cancellation.
 */
export function useUploadManager({
  vault,
  vaultId,
  addLog,
  onUploaded,
  concurrency = 3,
  maxFilesPerBatch = 10,
}: UseUploadManagerArgs) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);

  // Latest items snapshot for use inside async upload routines.
  const itemsRef = useRef<UploadItem[]>(items);
  itemsRef.current = items;

  const cancelSources = useRef<Map<string, CancelTokenSource>>(new Map());
  const idCounter = useRef(0);

  // Keep onUploaded fresh without re-triggering the queue/drain effects.
  const onUploadedRef = useRef(onUploaded);
  onUploadedRef.current = onUploaded;

  const updateItem = useCallback(
    (id: string, patch: Partial<UploadItem>) => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
      );
    },
    []
  );

  const setStage = useCallback(
    (id: string, stage: UploadStage) => updateItem(id, { stage }),
    [updateItem]
  );

  const runUpload = useCallback(
    async (id: string) => {
      const item = itemsRef.current.find((it) => it.id === id);
      if (!item || !vault) return;

      const { file, parentId } = item;
      updateItem(id, { status: "uploading", stage: "hashing", error: undefined });

      try {
        // 1. Hash the file contents (SHA-256), as the vault SDK does.
        const arrayBuffer = await file.arrayBuffer();
        const hash = await sha256Hex(arrayBuffer);
        const size = file.size;

        // 2. Ask the SDK for a presigned upload URL.
        setStage(id, "presigning");
        const presigned = await vault.getPresignedUrl({
          vaultId,
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSize: size,
          contentHash: hash,
          folderId: parentId,
        });

        const { url, key, contentType, sanitizedName } = presigned;

        // 3. PUT the file straight to storage with live byte progress.
        setStage(id, "uploading");
        const source = axios.CancelToken.source();
        cancelSources.current.set(id, source);

        await axios.put(url, file, {
          headers: {
            "Content-Type": contentType,
            "x-amz-meta-original-filename": encodeURIComponent(
              sanitizedName || file.name
            ),
            "x-amz-meta-content-hash": hash,
            "x-amz-meta-vault-id": vaultId,
            "x-amz-meta-folder-id": parentId || "root",
            "x-amz-meta-file-size": size.toString(),
          },
          cancelToken: source.token,
          onUploadProgress: (event) => {
            const total = event.total ?? size;
            const percent = total
              ? Math.min(100, Math.round((event.loaded * 100) / total))
              : 0;
            updateItem(id, { progress: percent });
          },
        });

        // 4. Register the completed upload with the vault backend.
        setStage(id, "registering");
        const result = await vault.registerUpload({
          vaultId,
          fileName: file.name,
          filebaseKey: key,
          fileSize: size,
          contentHash: hash,
          folderId: parentId,
        });

        updateItem(id, {
          status: "success",
          stage: "done",
          progress: 100,
          result,
        });
        addLog("success", "uploadFile", `${file.name} uploaded successfully`, result);
      } catch (error) {
        if (axios.isCancel(error)) {
          updateItem(id, { status: "cancelled", stage: "done" });
          addLog("warning", "uploadFile", `${file.name} upload cancelled`);
        } else {
          const message =
            (error as { message?: string })?.message ?? "Upload failed";
          updateItem(id, { status: "error", stage: "done", error: message });
          addLog("error", "uploadFile", `${file.name} upload failed`, error);
        }
      } finally {
        cancelSources.current.delete(id);
        setActiveIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [vault, vaultId, addLog, updateItem, setStage]
  );

  // Pump the queue: start uploads until the concurrency budget is full.
  useEffect(() => {
    if (queueIds.length === 0) return;
    const availableSlots = concurrency - activeIds.size;
    if (availableSlots <= 0) return;

    const toStart = queueIds.slice(0, availableSlots);
    const remaining = queueIds.slice(availableSlots);

    setQueueIds(remaining);
    setActiveIds((prev) => {
      const next = new Set(prev);
      toStart.forEach((id) => next.add(id));
      return next;
    });
    toStart.forEach((id) => void runUpload(id));
  }, [queueIds, activeIds, concurrency, runUpload]);

  // Fire onUploaded once when an active batch fully drains.
  const wasBusy = useRef(false);
  useEffect(() => {
    const busy = activeIds.size > 0 || queueIds.length > 0;
    if (wasBusy.current && !busy) {
      onUploadedRef.current?.();
    }
    wasBusy.current = busy;
  }, [activeIds, queueIds]);

  const enqueue = useCallback(
    (files: File[], parentId: string | null): boolean => {
      if (files.length === 0) return false;
      if (files.length > maxFilesPerBatch) {
        addLog(
          "warning",
          "uploadFiles",
          `You can only upload ${maxFilesPerBatch} files at a time`
        );
        return false;
      }

      const newItems: UploadItem[] = files.map((file) => {
        idCounter.current += 1;
        return {
          id: `upload-${idCounter.current}`,
          file,
          parentId,
          progress: 0,
          status: "pending",
          stage: "queued",
        };
      });

      setItems((prev) => [...prev, ...newItems]);
      setQueueIds((prev) => [...prev, ...newItems.map((it) => it.id)]);
      setToastOpen(true);
      addLog(
        "info",
        "uploadFiles",
        `Queued ${files.length} file(s) for upload`,
        { parentId: parentId ?? "root" }
      );
      return true;
    },
    [addLog, maxFilesPerBatch]
  );

  const cancel = useCallback((id: string) => {
    const source = cancelSources.current.get(id);
    if (source) {
      source.cancel("Upload cancelled by user");
      return;
    }
    // Not yet active — drop it from the queue and mark cancelled.
    setQueueIds((prev) => prev.filter((qid) => qid !== id));
    setItems((prev) =>
      prev.map((it) =>
        it.id === id && !TERMINAL.includes(it.status)
          ? { ...it, status: "cancelled", stage: "done" }
          : it
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((it) => !TERMINAL.includes(it.status)));
  }, []);

  const closeToast = useCallback(() => setToastOpen(false), []);

  const isUploading = activeIds.size > 0 || queueIds.length > 0;

  const counts = useMemo(() => {
    const total = items.length;
    const done = items.filter((it) => TERMINAL.includes(it.status)).length;
    const failed = items.filter(
      (it) => it.status === "error" || it.status === "cancelled"
    ).length;
    return { total, done, failed };
  }, [items]);

  return {
    items,
    toastOpen,
    isUploading,
    counts,
    enqueue,
    cancel,
    clearCompleted,
    closeToast,
    setToastOpen,
  };
}
