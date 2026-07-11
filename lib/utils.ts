import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract a human-readable name from an image file name.
 * Strips the extension, replaces hyphens/underscores with spaces,
 * and capitalises each word.
 *
 * @example
 * extractNameFromFile("summer-sale-banner.jpg")   // "Summer Sale Banner"
 * extractNameFromFile("my_hero_image.png")         // "My Hero Image"
 * extractNameFromFile("gigphoto.PNG")              // "Gigphoto"
 */
export function extractNameFromFile(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/[-_]+/g, " ") // hyphens/underscores → spaces
    .replace(/\s+/g, " ") // collapse multiple spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalise each word
    .trim();
}
