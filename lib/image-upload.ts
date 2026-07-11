import { uploadDocumentFromBase64 } from "@/services/cloudinary.service";

const BASE64_PREFIX = "data:";

/**
 * Checks if a string is a base64 data URI (starts with "data:").
 */
export function isBase64Image(value: string): boolean {
  return value.startsWith(BASE64_PREFIX);
}

/**
 * Uploads an image to Cloudinary if it's a base64 string.
 * If it's already a URL, returns it as-is.
 *
 * @param value - Either a base64 data URI or a regular URL
 * @param folder - Cloudinary folder name
 * @returns The Cloudinary URL (or the original URL if not base64)
 */
export async function uploadIfBase64(
  value: string | null | undefined,
  folder: string,
): Promise<string | null> {
  if (!value) return null;
  if (!isBase64Image(value)) return value;
  return await uploadDocumentFromBase64(value, folder);
}
