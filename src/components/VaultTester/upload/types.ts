export type UploadStatus =
  | "pending"
  | "uploading"
  | "success"
  | "error"
  | "cancelled";

// Mirrors the vault SDK upload pipeline: hash -> presign -> PUT to storage -> register.
export type UploadStage =
  | "queued"
  | "hashing"
  | "presigning"
  | "uploading"
  | "registering"
  | "done";

export interface UploadItem {
  id: string;
  file: File;
  parentId: string | null;
  /** Byte-level progress of the storage PUT (0-100). */
  progress: number;
  status: UploadStatus;
  stage: UploadStage;
  error?: string;
  result?: unknown;
}

export const STAGE_LABELS: Record<UploadStage, string> = {
  queued: "Queued",
  hashing: "Hashing",
  presigning: "Requesting URL",
  uploading: "Uploading",
  registering: "Registering",
  done: "Done",
};
