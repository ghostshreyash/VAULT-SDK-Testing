export type UploadStatus =
  | "pending"
  | "uploading"
  | "success"
  | "error"
  | "cancelled";

export type UploadMode = "single" | "batch";

export interface UploadItem {
  id: string;
  file: File;
  parentId: string | null;
  progress: number;
  status: UploadStatus;
  error?: string;
  result?: unknown;
}

export const STATUS_LABELS: Record<UploadStatus, string> = {
  pending: "Queued",
  uploading: "Uploading",
  success: "Uploaded",
  error: "Failed",
  cancelled: "Cancelled",
};
