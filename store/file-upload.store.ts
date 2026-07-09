import { api_client } from "@/lib/api/api-client";
import { create } from "zustand";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UploadingFile {
  /** The raw File object from the file picker */
  file: File;
  /** Upload progress percentage (0–100) */
  progress: number;
  /** publicUrl returned after successful upload */
  publicUrl?: string;
  /** Error message if upload failed */
  error?: string;
}

interface SignedUploadResult {
  fileName: string;
  signedUrl: string;
  publicUrl: string;
}

interface FileUploadState {
  /** List of files currently being uploaded or queued */
  uploadingFiles: UploadingFile[];
}

interface FileUploadActions {
  /**
   * Pick files via a hidden `<input type="file">` and start uploading.
   *
   * @deprecated Use `uploadFiles` instead — files should only be uploaded on form submit.
   */
  pickAndUpload: (params: {
    accept?: string;
    folder: string;
    maxFiles?: number;
    currentCount?: number;
  }) => Promise<string[]>;

  /**
   * Upload pre-selected files to R2 and return their public URLs.
   * Call this on form submit, after collecting File objects from FileUploadDropzone.
   *
   * @param files - Array of File objects to upload
   * @param folder - R2 folder prefix (e.g. "gig-images", "job-attachments")
   * @returns Promise resolving to the array of successfully uploaded public URLs
   */
  uploadFiles: (files: File[], folder: string) => Promise<string[]>;

  /** Remove a file from the uploading list by index */
  removeFile: (index: number) => void;

  /** Clear all finished uploads */
  clearFinished: () => void;

  /** Reset entire upload state */
  reset: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function createFileInput(accept?: string): HTMLInputElement {
  const input = document.createElement("input");
  input.type = "file";
  if (accept) input.accept = accept;
  input.multiple = true;
  input.style.display = "none";
  return input;
}

function uploadViaXHR(
  file: File,
  signedUrl: string,
  publicUrl: string,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(publicUrl);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useFileUploadStore = create<FileUploadState & FileUploadActions>(
  (set, get) => ({
    uploadingFiles: [],

    pickAndUpload: async ({
      accept,
      folder,
      maxFiles = 10,
      currentCount = 0,
    }) => {
      // Create a hidden file input and trigger it
      const input = createFileInput(accept);
      document.body.appendChild(input);
      input.click();

      const files = await new Promise<File[]>((resolve) => {
        input.onchange = () => {
          const selected = input.files ? Array.from(input.files) : [];
          document.body.removeChild(input);
          resolve(selected);
        };
        // If user cancels the dialog, the change event won't fire.
        // Use a blur/focus fallback — if focus returns to window without files, resolve empty.
        window.addEventListener(
          "focus",
          () => {
            setTimeout(() => {
              if (document.body.contains(input)) {
                document.body.removeChild(input);
                resolve([]);
              }
            }, 500);
          },
          { once: true },
        );
      });

      if (files.length === 0) return [];

      // Enforce max files limit
      if (currentCount + files.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} files allowed`);
      }

      // Add files to uploading list
      const uploadingFiles: UploadingFile[] = files.map((file) => ({
        file,
        progress: 0,
      }));

      set((state) => ({
        uploadingFiles: [...state.uploadingFiles, ...uploadingFiles],
      }));

      // 1. Request presigned URLs
      const filesPayload = files.map((file) => ({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      }));

      const { data: response } = await api_client.post("/signed-upload-url", {
        files: filesPayload,
        folder,
      });

      const signedResults: SignedUploadResult[] = response.data;

      // 2. Upload each file
      const uploadPromises = files.map(async (file, index) => {
        const signed = signedResults[index];
        if (!signed) throw new Error(`No signed URL for ${file.name}`);

        try {
          const url = await uploadViaXHR(
            file,
            signed.signedUrl,
            signed.publicUrl,
            (pct) => {
              set((state) => {
                const list = [...state.uploadingFiles];
                const idx = list.findIndex(
                  (uf) =>
                    uf.file.name === file.name && !uf.publicUrl && !uf.error,
                );
                if (idx !== -1) {
                  list[idx] = { ...list[idx], progress: pct };
                }
                return { uploadingFiles: list };
              });
            },
          );

          // Mark as completed
          set((state) => {
            const list = [...state.uploadingFiles];
            const idx = list.findIndex(
              (uf) => uf.file.name === file.name && !uf.publicUrl,
            );
            if (idx !== -1) {
              list[idx] = { ...list[idx], progress: 100, publicUrl: url };
            }
            return { uploadingFiles: list };
          });

          return url;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";

          set((state) => {
            const list = [...state.uploadingFiles];
            const idx = list.findIndex(
              (uf) => uf.file.name === file.name && !uf.publicUrl,
            );
            if (idx !== -1) {
              list[idx] = { ...list[idx], error: msg };
            }
            return { uploadingFiles: list };
          });

          throw err;
        }
      });

      return Promise.all(uploadPromises);
    },

    uploadFiles: async (files, folder) => {
      if (files.length === 0) return [];

      // Add files to uploading list
      const uploadingFiles: UploadingFile[] = files.map((file) => ({
        file,
        progress: 0,
      }));

      set((state) => ({
        uploadingFiles: [...state.uploadingFiles, ...uploadingFiles],
      }));

      // 1. Request presigned URLs
      const filesPayload = files.map((file) => ({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      }));

      const { data: response } = await api_client.post("/signed-upload-url", {
        files: filesPayload,
        folder,
      });

      const signedResults: SignedUploadResult[] = response.data;

      // 2. Upload each file
      const uploadPromises = files.map(async (file, index) => {
        const signed = signedResults[index];
        if (!signed) throw new Error(`No signed URL for ${file.name}`);

        try {
          const url = await uploadViaXHR(
            file,
            signed.signedUrl,
            signed.publicUrl,
            (pct) => {
              set((state) => {
                const list = [...state.uploadingFiles];
                const idx = list.findIndex(
                  (uf) =>
                    uf.file.name === file.name && !uf.publicUrl && !uf.error,
                );
                if (idx !== -1) {
                  list[idx] = { ...list[idx], progress: pct };
                }
                return { uploadingFiles: list };
              });
            },
          );

          // Mark as completed
          set((state) => {
            const list = [...state.uploadingFiles];
            const idx = list.findIndex(
              (uf) => uf.file.name === file.name && !uf.publicUrl,
            );
            if (idx !== -1) {
              list[idx] = { ...list[idx], progress: 100, publicUrl: url };
            }
            return { uploadingFiles: list };
          });

          return url;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";

          set((state) => {
            const list = [...state.uploadingFiles];
            const idx = list.findIndex(
              (uf) => uf.file.name === file.name && !uf.publicUrl,
            );
            if (idx !== -1) {
              list[idx] = { ...list[idx], error: msg };
            }
            return { uploadingFiles: list };
          });

          throw err;
        }
      });

      return Promise.all(uploadPromises);
    },

    removeFile: (index) =>
      set((state) => ({
        uploadingFiles: state.uploadingFiles.filter((_, i) => i !== index),
      })),

    clearFinished: () =>
      set((state) => ({
        uploadingFiles: state.uploadingFiles.filter(
          (f) => !f.publicUrl && !f.error,
        ),
      })),

    reset: () => set({ uploadingFiles: [] }),
  }),
);
