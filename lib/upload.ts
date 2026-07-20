import { api_client } from "@/lib/api/api-client";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export interface StagedFile {
  id: string;
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  isRemote?: boolean;
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function isImageFile(name: string, mimeType?: string): boolean {
  if (mimeType?.toLowerCase().startsWith("image/")) return true;
  const ext = name.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp", "heic"].includes(
    ext || "",
  );
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateStagedFile(
  name: string,
  size?: number,
  mimeType?: string,
): { valid: boolean; error?: string } {
  const isImg = isImageFile(name, mimeType);
  if (size && size > 0) {
    if (isImg && size > MAX_IMAGE_SIZE) {
      return {
        valid: false,
        error: `Image "${name}" exceeds maximum allowed size of 5MB`,
      };
    }
    if (!isImg && size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File "${name}" exceeds maximum allowed size of 50MB`,
      };
    }
  }
  return { valid: true };
}

/**
 * Single image upload for legacy callers (if needed)
 */
export async function pickAndUploadImage(
  folder: string,
): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Photo library permission is required to select an image.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  const name = asset.fileName ?? `${Date.now()}.jpg`;
  const validation = validateStagedFile(name, asset.fileSize, asset.mimeType);
  if (!validation.valid) throw new Error(validation.error);

  const staged: StagedFile = {
    id: `${Date.now()}_${Math.random()}`,
    uri: asset.uri,
    name,
    mimeType: asset.mimeType ?? "image/jpeg",
    size: asset.fileSize,
  };

  const [uploadedUrl] = await uploadStagedFilesWithProgress([staged], folder);
  return uploadedUrl;
}

/**
 * Pick multiple image files locally without uploading immediately.
 */
export async function pickLocalImages(
  currentCount = 0,
  maxAllowed = 8,
): Promise<StagedFile[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Photo library permission is required to select images.");
  }

  const remaining = maxAllowed - currentCount;
  if (remaining <= 0) {
    throw new Error(`Maximum ${maxAllowed} images allowed.`);
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images",
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return [];
  }

  const staged: StagedFile[] = [];
  for (const asset of result.assets) {
    const name =
      asset.fileName ??
      `image_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
    const validation = validateStagedFile(name, asset.fileSize, asset.mimeType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    staged.push({
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      uri: asset.uri,
      name,
      mimeType: asset.mimeType ?? "image/jpeg",
      size: asset.fileSize,
      isRemote: false,
    });
  }

  return staged;
}

/**
 * Pick documents/files locally without uploading immediately.
 */
export async function pickLocalDocuments(
  currentCount = 0,
  maxAllowed = 5,
): Promise<StagedFile[]> {
  const remaining = maxAllowed - currentCount;
  if (remaining <= 0) {
    throw new Error(`Maximum ${maxAllowed} attachment files allowed.`);
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: "*/*",
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return [];
  }

  const staged: StagedFile[] = [];
  for (const asset of result.assets) {
    const name = asset.name ?? `attachment_${Date.now()}`;
    const validation = validateStagedFile(name, asset.size, asset.mimeType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    staged.push({
      id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      uri: asset.uri,
      name,
      mimeType: asset.mimeType ?? "application/octet-stream",
      size: asset.size,
      isRemote: false,
    });
  }

  return staged;
}

interface SignedUploadResult {
  key: string;
  signedUrl: string;
  publicUrl: string;
}

/**
 * Uploads staged local files to R2 via signed URLs, reporting overall percentage progress.
 * Returns array of public URLs corresponding 1:1 with input files.
 */
export async function uploadStagedFilesWithProgress(
  files: StagedFile[],
  folder: string,
  onProgress?: (percent: number) => void,
): Promise<string[]> {
  if (files.length === 0) return [];

  // Separate remote files (already uploaded) from local URIs
  const localIndexes: number[] = [];
  const localPayload: Array<{ fileName: string; contentType: string }> = [];

  const results: string[] = new Array(files.length);

  files.forEach((file, idx) => {
    if (
      file.isRemote ||
      file.uri.startsWith("http://") ||
      file.uri.startsWith("https://")
    ) {
      results[idx] = file.uri;
    } else {
      localIndexes.push(idx);
      localPayload.push({
        fileName: file.name,
        contentType: file.mimeType || "application/octet-stream",
      });
    }
  });

  if (localIndexes.length === 0) {
    if (onProgress) onProgress(100);
    return results;
  }

  // Request signed upload URLs
  const { data: response } = await api_client.post("/signed-upload-url", {
    files: localPayload,
    folder,
  });

  const signedResults = response.data as SignedUploadResult[];
  if (!signedResults || signedResults.length !== localIndexes.length) {
    throw new Error("Failed to obtain signed upload URLs for files.");
  }

  // Track progress across all uploads
  const totalFiles = localIndexes.length;
  const progressMap = new Array(totalFiles).fill(0);

  const updateGlobalProgress = () => {
    if (!onProgress) return;
    const sum = progressMap.reduce((acc, curr) => acc + curr, 0);
    const overallPercent = Math.round(sum / totalFiles);
    onProgress(overallPercent);
  };

  // Upload each file using XHR for progress tracking
  const uploadPromises = localIndexes.map(async (originalIdx, localIdx) => {
    const file = files[originalIdx];
    const signed = signedResults[localIdx];
    results[originalIdx] = signed.publicUrl;

    const fileBlob = await (await fetch(file.uri)).blob();
    const contentType = file.mimeType || "application/octet-stream";

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", signed.signedUrl);
      xhr.setRequestHeader("Content-Type", contentType);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          progressMap[localIdx] = (e.loaded / e.total) * 100;
          updateGlobalProgress();
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          progressMap[localIdx] = 100;
          updateGlobalProgress();
          resolve();
        } else {
          reject(
            new Error(`Upload failed for ${file.name} (Status: ${xhr.status})`),
          );
        }
      };

      xhr.onerror = () =>
        reject(new Error(`Network error uploading ${file.name}`));
      xhr.ontimeout = () =>
        reject(new Error(`Upload timed out for ${file.name}`));

      xhr.send(fileBlob);
    });
  });

  await Promise.all(uploadPromises);

  if (onProgress) onProgress(100);
  return results;
}
