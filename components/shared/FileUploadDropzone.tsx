"use client";

import { Button } from "@/components/ui/button";
import {
  IconCamera,
  IconPaperclip,
  IconPlus,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
// ─── Types ──────────────────────────────────────────────────────────────────

interface FileUploadDropzoneProps {
  /**
   * Called with the array of selected File objects.
   * Upload does NOT happen here — the parent is responsible for uploading
   * when the form is submitted.
   */
  onFilesSelected: (files: File[]) => void;
  /** MIME types or extensions to accept (e.g. "image/*", ".pdf,.doc") */
  accept?: string;
  /** Maximum number of files allowed (default 10) */
  maxFiles?: number;
  /** How many files are already attached (to enforce maxFiles) */
  currentCount?: number;
  /**
   * Visual variant:
   * - "dropzone": dashed drop area (default)
   * - "button": simple button trigger
   * - "compact": single-line inline trigger, good for tight forms
   * - "avatar": circular preview for a single profile/cover image
   * - "grid": thumbnail grid of existing files + an "add" tile
   */
  variant?: "dropzone" | "button" | "compact" | "avatar" | "grid";
  /** Button label (only used when variant="button") */
  buttonLabel?: string;
  /** Disable the upload trigger */
  disabled?: boolean;
  /**
   * Already-uploaded public URLs to preview.
   * Used by "avatar" (first item) and "grid" (all items).
   */
  existingUrls?: string[];
  /**
   * Called when the user removes an existing file.
   * Used by "avatar" and "grid" variants only.
   */
  onRemove?: (url: string) => void;
  /**
   * Currently selected file names (for display in grid/compact variants).
   * The parent manages this state.
   */
  selectedFiles?: File[];
}

// ─── Component ──────────────────────────────────────────────────────────────

export function FileUploadDropzone({
  onFilesSelected,
  accept,
  maxFiles = 10,
  currentCount = 0,
  variant = "dropzone",
  buttonLabel = "Select Files",
  disabled,
  existingUrls = [],
  onRemove,
  selectedFiles = [],
}: FileUploadDropzoneProps) {
  const handlePick = () => {
    // Create a hidden file input
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.multiple = true;
    input.style.display = "none";

    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      document.body.removeChild(input);
      if (files.length === 0) return;

      // Enforce max files limit
      if (currentCount + files.length > maxFiles) {
        return; // Parent can show a toast
      }

      onFilesSelected(files);
    };

    // Fallback: if user cancels, clean up
    window.addEventListener(
      "focus",
      () => {
        setTimeout(() => {
          if (document.body.contains(input)) {
            document.body.removeChild(input);
          }
        }, 500);
      },
      { once: true },
    );

    document.body.appendChild(input);
    input.click();
  };

  // ── Button variant ──────────────────────────────────────────────
  if (variant === "button") {
    return (
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handlePick}
          disabled={disabled}
        >
          <IconUpload className="size-4" />
          {buttonLabel}
        </Button>
      </div>
    );
  }

  // ── Compact variant: single inline row ─────────────────────────
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePick}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <IconPaperclip className="size-3.5" />
          {buttonLabel}
        </button>

        {selectedFiles.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
            selected
          </span>
        )}
      </div>
    );
  }

  // ── Avatar variant: single circular preview ────────────────────
  if (variant === "avatar") {
    const currentUrl = existingUrls[0];

    return (
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0">
          <button
            type="button"
            onClick={handlePick}
            disabled={disabled}
            className="group relative size-20 rounded-full overflow-hidden border border-border bg-muted/40 flex items-center justify-center disabled:cursor-not-allowed"
            aria-label="Select profile image"
          >
            {currentUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUrl}
                alt="Preview"
                className="size-full object-cover"
              />
            ) : (
              <IconCamera className="size-6 text-muted-foreground" />
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <IconCamera className="size-5 text-white" />
            </div>
          </button>

          {currentUrl && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(currentUrl)}
              className="absolute -top-1 -right-1 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
              aria-label="Remove image"
            >
              <IconX className="size-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Grid variant: thumbnail grid + add tile ────────────────────
  if (variant === "grid") {
    const canAddMore = existingUrls.length + selectedFiles.length < maxFiles;

    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {existingUrls.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/40 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Uploaded file"
                className="size-full object-cover"
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <IconX className="size-3" />
                </button>
              )}
            </div>
          ))}

          {selectedFiles.map((file, idx) => (
            <div
              key={`selected-${idx}`}
              className="relative aspect-square rounded-lg overflow-hidden border border-dashed border-primary/40 bg-muted/20 flex flex-col items-center justify-center gap-1"
            >
              <IconPaperclip className="size-5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground text-center px-1 leading-tight truncate w-full">
                {file.name}
              </span>
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={handlePick}
              disabled={disabled}
              className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add files"
            >
              <IconPlus className="size-5" />
              <span className="text-[10px] font-medium">Add</span>
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {existingUrls.length + selectedFiles.length}/{maxFiles} images
          &middot; max size 5MB each
        </p>
      </div>
    );
  }

  // ── Dropzone variant (default) ─────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="relative border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer">
        <button
          type="button"
          onClick={handlePick}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Select files"
        />
        <IconUpload className="size-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">
          Click or drag images here to select
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Select up to {maxFiles} images (max size 5MB each)
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2 max-w-md">
          <p className="text-xs font-semibold text-muted-foreground">
            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}{" "}
            selected
          </p>
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm bg-muted/30 rounded px-3 py-2 border border-border"
            >
              <IconPaperclip className="size-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate text-xs text-muted-foreground">
                {file.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
