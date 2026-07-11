import { cloudinaryConfig } from "@/config/env.config";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";

// Configure Cloudinary - these should be in your environment variables
cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key: cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
});

/**
 * Uploads a document (image or PDF) to Cloudinary from base64 data
 * @param base64Data - Base64 string of the document (with data:... prefix)
 * @param folder - Optional folder name for organization
 * @param fileName - Optional original file name
 * @returns Promise<string> - The secure URL of the uploaded document
 */
export const uploadDocumentFromBase64 = async (
  base64Data: string,
  folder?: string,
  fileName?: string,
): Promise<string> => {
  try {
    // Validate base64 data
    if (!base64Data || typeof base64Data !== "string") {
      throw new Error("Invalid base64 data provided");
    }

    // Check if it's a valid base64 string with data URI
    if (!base64Data.startsWith("data:")) {
      throw new Error("Base64 data must include data URI prefix");
    }

    const uploadOptions: UploadApiOptions = {
      resource_type: "auto", // Supports images and raw files (PDFs)
      quality: "auto",
      fetch_format: "auto",
      timeout: 60000, // 60 seconds timeout
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    if (fileName) {
      // Generate public_id from filename without extension
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;
    }

    const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(
      base64Data,
      uploadOptions,
    );

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error("Upload failed: No secure URL returned");
    }

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary document upload error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload document: ${error.message}`);
    }
    throw new Error("Failed to upload document to cloud storage");
  }
};

/**
 * Uploads a remote image/document URL to Cloudinary.
 * Useful for external sources such as Pixabay image URLs.
 */
export const uploadDocumentFromUrl = async (
  remoteUrl: string,
  folder?: string,
  fileName?: string,
): Promise<string> => {
  try {
    if (!remoteUrl || typeof remoteUrl !== "string") {
      throw new Error("Invalid remote URL provided");
    }

    const uploadOptions: UploadApiOptions = {
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
      timeout: 60000,
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    if (fileName) {
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;
    }

    const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(
      remoteUrl,
      uploadOptions,
    );

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error("Upload failed: No secure URL returned");
    }

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary remote URL upload error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload remote image: ${error.message}`);
    }
    throw new Error("Failed to upload remote image to cloud storage");
  }
};

/**
 * Uploads a document from File object (for browser usage)
 * @param file - File object from form input
 * @param folder - Optional folder name for organization
 * @returns Promise<string> - The secure URL of the uploaded document
 */
export const uploadDocumentFromFile = async (
  file: File,
  folder?: string,
): Promise<string> => {
  try {
    // Validate file
    if (!file || !(file instanceof File)) {
      throw new Error("Invalid file provided");
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File size exceeds 10MB limit");
    }

    // Convert File to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to read file as string"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

    return await uploadDocumentFromBase64(base64Data, folder, file.name);
  } catch (error) {
    console.error("File upload error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    throw new Error("Failed to process and upload document");
  }
};

/**
 * Uploads a document from buffer (for server-side usage)
 * @param buffer - Document buffer
 * @param fileName - Original file name
 * @param folder - Optional folder name for organization
 * @returns Promise<string> - The secure URL of the uploaded document
 */
export const uploadDocumentFromBuffer = async (
  buffer: Buffer,
  fileName: string,
  folder?: string,
): Promise<string> => {
  try {
    // Validate buffer
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid buffer provided");
    }

    if (buffer.length === 0) {
      throw new Error("Buffer is empty");
    }

    const uploadOptions: UploadApiOptions = {
      resource_type: "auto", // Supports images and raw files (PDFs)
      quality: "auto",
      fetch_format: "auto",
      timeout: 60000, // 60 seconds timeout
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    // Generate public_id from filename
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    uploadOptions.public_id = `${nameWithoutExt}_${Date.now()}`;

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error("Upload failed without error"));
            }
          },
        );
        uploadStream.end(buffer);
      },
    );

    if (!uploadResult || !uploadResult.secure_url) {
      throw new Error("Upload failed: No secure URL returned");
    }

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Cloudinary buffer upload error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload buffer: ${error.message}`);
    }
    throw new Error("Failed to upload document to cloud storage");
  }
};
