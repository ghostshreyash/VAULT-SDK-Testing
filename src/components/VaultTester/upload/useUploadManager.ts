import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LogEntry } from "@/context/VaultContext";
import type { UploadItem, UploadMode, UploadStatus } from "./types";

interface BatchUploadResult {
  status: "success" | "failed";
  fileName: string;
  error?: string;
  code?: string;
}

interface UploadCapableVault {
  uploadFile: (
    file: File,
    vaultId: string,
    parentId?: string | null
  ) => Promise<unknown>;
  uploadFiles: (
    files: File[],
    vaultId: string,
    parentId?: string | null
  ) => Promise<BatchUploadResult[]>;
}

interface UseUploadManagerArgs {
  vault: UploadCapableVault | null;
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

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024;

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
  const [batchRunning, setBatchRunning] = useState(0);
  const [toastOpen, setToastOpen] = useState(false);

  // Latest items snapshot for use inside async upload routines.
  const itemsRef = useRef<UploadItem[]>(items);
  itemsRef.current = items;

  const abandoned = useRef<Set<string>>(new Set());
  const idCounter = useRef(0);

  // Keep onUploaded fresh without re-triggering the queue/drain effects.
  const onUploadedRef = useRef(onUploaded);
  onUploadedRef.current = onUploaded;

  const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  }, []);

  const runUpload = useCallback(
    async (id: string) => {
      const item = itemsRef.current.find((it) => it.id === id);
      if (!item || !vault) return;

      const { file, parentId } = item;
      updateItem(id, { status: "uploading", error: undefined });

      try {
        const result = await vault.uploadFile(file, vaultId, parentId);

        if (abandoned.current.has(id)) return;

        updateItem(id, { status: "success", progress: 100, result });
        addLog(
          "success",
          "uploadFile",
          `${file.name} uploaded successfully`,
          result
        );
      } catch (error) {
        if (abandoned.current.has(id)) return;

        const message =
          (error as { message?: string })?.message ?? "Upload failed";
        const code = (error as { code?: string })?.code;

        updateItem(id, {
          status: "error",
          progress: 0,
          error: code ? `[${code}] ${message}` : message,
        });
        addLog("error", "uploadFile", `${file.name} upload failed`, error);
      } finally {
        abandoned.current.delete(id);
        setActiveIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [vault, vaultId, addLog, updateItem]
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

  const runBatch = useCallback(
    async (batchItems: UploadItem[]) => {
      if (!vault || batchItems.length === 0) return;

      const ids = batchItems.map((it) => it.id);
      setBatchRunning((n) => n + 1);
      setItems((prev) =>
        prev.map((it) =>
          ids.includes(it.id)
            ? { ...it, status: "uploading", error: undefined }
            : it
        )
      );

      try {
        const results = await vault.uploadFiles(
          batchItems.map((it) => it.file),
          vaultId,
          batchItems[0].parentId
        );

        setItems((prev) =>
          prev.map((it) => {
            const index = ids.indexOf(it.id);
            if (index === -1) return it;
            if (it.status === "cancelled") return it;

            const result = results?.[index];
            if (result?.status === "success") {
              return { ...it, status: "success", progress: 100, result };
            }

            const message = result?.error ?? "Upload failed";
            return {
              ...it,
              status: "error",
              progress: 0,
              error: result?.code ? `[${result.code}] ${message}` : message,
              result,
            };
          })
        );

        const failed = (results ?? []).filter((r) => r?.status !== "success");
        if (failed.length === 0) {
          addLog(
            "success",
            "uploadFiles",
            `All ${batchItems.length} file(s) uploaded`,
            results
          );
        } else {
          addLog(
            "warning",
            "uploadFiles",
            `${failed.length} of ${batchItems.length} file(s) failed`,
            results
          );
        }
      } catch (error) {
        const message =
          (error as { message?: string })?.message ?? "Batch upload failed";
        setItems((prev) =>
          prev.map((it) =>
            ids.includes(it.id) && it.status !== "cancelled"
              ? { ...it, status: "error", progress: 0, error: message }
              : it
          )
        );
        addLog("error", "uploadFiles", "Batch upload failed", error);
      } finally {
        ids.forEach((id) => abandoned.current.delete(id));
        setBatchRunning((n) => n - 1);
      }
    },
    [vault, vaultId, addLog]
  );

  // Fire onUploaded once when an active batch fully drains.
  const wasBusy = useRef(false);
  useEffect(() => {
    const busy = activeIds.size > 0 || queueIds.length > 0 || batchRunning > 0;
    if (wasBusy.current && !busy) {
      onUploadedRef.current?.();
    }
    wasBusy.current = busy;
  }, [activeIds, queueIds, batchRunning]);

  const enqueue = useCallback(
    (
      files: File[],
      parentId: string | null,
      mode: UploadMode = "single"
    ): boolean => {
      if (files.length === 0) return false;
      if (files.length > maxFilesPerBatch) {
        addLog(
          "warning",
          mode === "batch" ? "uploadFiles" : "uploadFile",
          `You can only upload ${maxFilesPerBatch} files at a time`
        );
        return false;
      }

      const accepted: File[] = [];
      for (const file of files) {
        if (file.size === 0) {
          addLog(
            "warning",
            "uploadFile",
            `${file.name} is empty (0 bytes) and cannot be uploaded`
          );
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          addLog(
            "warning",
            "uploadFile",
            `${file.name} exceeds the 10 GB maximum upload size`
          );
          continue;
        }
        accepted.push(file);
      }

      if (accepted.length === 0) return false;

      const newItems: UploadItem[] = accepted.map((file) => {
        idCounter.current += 1;
        return {
          id: `upload-${idCounter.current}`,
          file,
          parentId,
          progress: 0,
          status: "pending",
        };
      });

      setItems((prev) => [...prev, ...newItems]);
      setToastOpen(true);

      if (mode === "batch") {
        addLog(
          "info",
          "uploadFiles",
          `Uploading ${accepted.length} file(s) in a single uploadFiles() call`,
          { parentId: parentId ?? "root" }
        );
        void runBatch(newItems);
      } else {
        setQueueIds((prev) => [...prev, ...newItems.map((it) => it.id)]);
        addLog(
          "info",
          "uploadFile",
          `Queued ${accepted.length} file(s) for upload`,
          { parentId: parentId ?? "root" }
        );
      }

      return true;
    },
    [addLog, maxFilesPerBatch, runBatch]
  );

  const cancel = useCallback((id: string) => {
    const item = itemsRef.current.find((it) => it.id === id);
    if (!item || TERMINAL.includes(item.status)) return;

    if (item.status === "uploading") {
      abandoned.current.add(id);
      setActiveIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setQueueIds((prev) => prev.filter((qid) => qid !== id));
    }

    setItems((prev) =>
      prev.map((it) =>
        it.id === id && !TERMINAL.includes(it.status)
          ? { ...it, status: "cancelled" }
          : it
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((it) => !TERMINAL.includes(it.status)));
  }, []);

  const closeToast = useCallback(() => setToastOpen(false), []);

  const isUploading =
    activeIds.size > 0 || queueIds.length > 0 || batchRunning > 0;

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
