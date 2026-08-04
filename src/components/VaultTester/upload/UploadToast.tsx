import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Ban,
  FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, type UploadItem } from "./types";

interface UploadToastProps {
  open: boolean;
  items: UploadItem[];
  isUploading: boolean;
  counts: { total: number; done: number; failed: number };
  onCancel: (id: string) => void;
  onClearCompleted: () => void;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function StatusIcon({ item }: { item: UploadItem }) {
  switch (item.status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "cancelled":
      return <Ban className="h-4 w-4 text-slate-400" />;
    case "uploading":
      return <Loader2 className="h-4 w-4 animate-spin text-cyan-500" />;
    default:
      return <FileIcon className="h-4 w-4 text-slate-400" />;
  }
}

export function UploadToast({
  open,
  items,
  isUploading,
  counts,
  onCancel,
  onClearCompleted,
  onClose,
}: UploadToastProps) {
  if (!open || items.length === 0) return null;

  const headline = isUploading
    ? `Uploading ${counts.done}/${counts.total}`
    : counts.failed > 0
      ? `Completed with ${counts.failed} issue${counts.failed > 1 ? "s" : ""}`
      : "All uploads complete";

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {isUploading && <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />}
          <span className="text-sm font-semibold text-slate-700">{headline}</span>
        </div>
        <div className="flex items-center gap-1">
          {!isUploading && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={onClearCompleted}
            >
              Clear
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="max-h-72 overflow-auto p-2">
        {items.map((item) => {
          const active = item.status === "uploading" || item.status === "pending";
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
            >
              <StatusIcon item={item} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {item.file.name}
                  </p>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {formatBytes(item.file.size)}
                  </span>
                </div>

                {active ? (
                  <div className="mt-1.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      {item.status === "uploading" ? (
                        <div className="h-full w-1/3 animate-[upload-slide_1.2s_ease-in-out_infinite] rounded-full bg-cyan-500" />
                      ) : (
                        <div className="h-full w-0 rounded-full bg-cyan-500" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {STATUS_LABELS[item.status]}
                    </p>
                  </div>
                ) : (
                  <p
                    className={`mt-0.5 truncate text-[11px] ${
                      item.status === "error" ? "text-red-500" : "text-slate-400"
                    }`}
                  >
                    {item.status === "success" && "Uploaded"}
                    {item.status === "cancelled" && "Cancelled"}
                    {item.status === "error" && (item.error ?? "Failed")}
                  </p>
                )}
              </div>

              {active && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-red-500"
                  onClick={() => onCancel(item.id)}
                  title={
                    item.status === "uploading"
                      ? "Stop tracking (the transfer cannot be aborted once started)"
                      : "Cancel"
                  }
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
