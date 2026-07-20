import { api_client } from "@/lib/api/api-client";
import { getErrorMessage } from "@/lib/api/api-response";
import * as DocumentPicker from "expo-document-picker";
import { create } from "zustand";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface UploadingFile {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  size?: number;
  progress: number;
  publicUrl?: string;
  error?: string;
}

interface SignedUploadResult {
  fileName: string;
  signedUrl: string;
  publicUrl: string;
}

interface FileUploadState {
  uploadingFiles: UploadingFile[];
}

interface FileUploadActions {
  /**
   * Opens the native document picker (multi-select) and immediately uploads
   * each chosen file straight to R2 via a pre-signed PUT URL, tracking
   * per-file progress in state.
   *
   * @returns the public URLs of files that finished uploading successfully.
   */
  pickAndUploadDocuments: (params: {
    folder: string;
    maxFiles?: number;
  }) => Promise<string[]>;
  removeFile: (id: string) => void;
  reset: () => void;
}

type FileUploadStore = FileUploadState & FileUploadActions;

function uploadViaXHR(
  blob: Blob,
  mimeType: string,
  signedUrl: string,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader(
      "Content-Type",
      mimeType || "application/octet-stream",
    );

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(blob);
  });
}

export const useFileUploadStore = create<FileUploadStore>()((set, get) => ({
  uploadingFiles: [],

  pickAndUploadDocuments: async ({ folder, maxFiles = 5 }) => {
    const currentCount = get().uploadingFiles.length;

    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/*",
      ],
    });

    if (result.canceled || !result.assets || result.assets.length === 0)
      return [];

    let assets = result.assets;
    if (currentCount + assets.length > maxFiles) {
      const allowed = Math.max(0, maxFiles - currentCount);
      assets = assets.slice(0, allowed);
    }
    if (assets.length === 0) return [];

    const entries: UploadingFile[] = assets.map((asset) => ({
      id: `${Date.now()}-${asset.name}`,
      name: asset.name,
      uri: asset.uri,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size,
      progress: 0,
    }));

    set((state) => ({ uploadingFiles: [...state.uploadingFiles, ...entries] }));

    try {
      const { data: response } = await api_client.post("/signed-upload-url", {
        files: entries.map((e) => ({
          fileName: e.name,
          contentType: e.mimeType,
        })),
        folder,
      });
      const signedResults: SignedUploadResult[] = response.data;

      const uploads = entries.map(async (entry, index) => {
        const signed = signedResults[index];
        if (!signed) {
          set((state) => ({
            uploadingFiles: state.uploadingFiles.map((f) =>
              f.id === entry.id ? { ...f, error: "No upload URL returned" } : f,
            ),
          }));
          return null;
        }

        try {
          const blob = await (await fetch(entry.uri)).blob();
          await uploadViaXHR(blob, entry.mimeType, signed.signedUrl, (pct) => {
            set((state) => ({
              uploadingFiles: state.uploadingFiles.map((f) =>
                f.id === entry.id ? { ...f, progress: pct } : f,
              ),
            }));
          });

          set((state) => ({
            uploadingFiles: state.uploadingFiles.map((f) =>
              f.id === entry.id
                ? { ...f, progress: 100, publicUrl: signed.publicUrl }
                : f,
            ),
          }));

          return signed.publicUrl;
        } catch (err) {
          const message = getErrorMessage(err);
          set((state) => ({
            uploadingFiles: state.uploadingFiles.map((f) =>
              f.id === entry.id ? { ...f, error: message } : f,
            ),
          }));
          return null;
        }
      });

      const urls = await Promise.all(uploads);
      return urls.filter((u): u is string => !!u);
    } catch (err) {
      const message = getErrorMessage(err);
      set((state) => ({
        uploadingFiles: state.uploadingFiles.map((f) =>
          entries.some((e) => e.id === f.id) ? { ...f, error: message } : f,
        ),
      }));
      return [];
    }
  },

  removeFile: (id) =>
    set((state) => ({
      uploadingFiles: state.uploadingFiles.filter((f) => f.id !== id),
    })),

  reset: () => set({ uploadingFiles: [] }),
}));
