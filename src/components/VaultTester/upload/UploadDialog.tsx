import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CloudUpload } from "lucide-react";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the selected/dropped files. */
  onFiles: (files: File[]) => void;
  /** Human-readable destination shown in the dialog (e.g. folder name / "Root"). */
  destinationLabel: string;
  maxFiles?: number;
}

export function UploadDialog({
  open,
  onOpenChange,
  onFiles,
  destinationLabel,
  maxFiles = 10,
}: UploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const submit = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    onFiles(files);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Files are uploaded via the vault SDK presigned-URL flow into{" "}
            <span className="font-medium text-foreground">{destinationLabel}</span>.
            Up to {maxFiles} files per batch.
          </DialogDescription>
        </DialogHeader>

        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            submit(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer select-none flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-cyan-500 bg-cyan-50"
              : "border-slate-300 hover:border-cyan-500 hover:bg-slate-50"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-100">
            <CloudUpload className="h-6 w-6 text-cyan-600" />
          </div>
          <p className="mt-3 text-sm font-medium text-slate-700">
            Drag and drop files here
          </p>
          <p className="mt-1 text-xs text-slate-500">Supported formats: all file types</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>or</span>
        </div>

        <div className="flex justify-center">
          <Button type="button" onClick={() => inputRef.current?.click()}>
            <CloudUpload className="mr-2 h-4 w-4" />
            Browse files
          </Button>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            submit(e.target.files);
            e.target.value = "";
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
