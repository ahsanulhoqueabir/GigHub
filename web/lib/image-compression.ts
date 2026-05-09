/**
 * Compresses an image file client-side before upload.
 * Uses Canvas API to resize/compress — no extra dependencies.
 * Quality is configurable; defaults to 0.8 (good balance).
 */

export interface CompressOptions {
  /** Max width in px (default: 1200) */
  maxWidth?: number;
  /** Max height in px (default: 1200) */
  maxHeight?: number;
  /** JPEG/WebP quality 0–1 (default: 0.8) */
  quality?: number;
  /** Output format (default: 'webp') */
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: 'image/webp',
};

/**
 * Reads a File, draws it onto a canvas at a constrained size,
 * and exports as a compressed Blob.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<Blob> {
  const opts = { ...DEFAULTS, ...options };

  const bitmap = await createImageBitmap(file);

  let { width, height } = bitmap;

  // Constrain dimensions while preserving aspect ratio
  if (width > opts.maxWidth) {
    height = Math.round(height * (opts.maxWidth / width));
    width = opts.maxWidth;
  }
  if (height > opts.maxHeight) {
    width = Math.round(width * (opts.maxHeight / height));
    height = opts.maxHeight;
  }

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await canvas.convertToBlob({
    type: opts.format,
    quality: opts.quality,
  });

  bitmap.close();

  return blob;
}

/**
 * Convenience: compresses a File and returns a new File object
 * with a .webp (or chosen format) extension.
 */
export async function compressImageToFile(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const blob = await compressImage(file, options);

  const ext = blob.type === 'image/webp' ? 'webp' : blob.type.split('/')[1] || 'jpg';

  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${ext}`, {
    type: blob.type,
  });
}
