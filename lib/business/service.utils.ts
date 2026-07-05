import { OrderSource } from "@/types/db/order.types";

/**
 * Generate a username from the user's name.
 * Takes the last word of the name + 6 random digits.
 * e.g. "Abir" -> "abir-452187", "John Doe" -> "doe-729134"
 */
export function generateUsername(name: string): string {
  const parts = name.trim().split(/\s+/);
  const lastWord = parts[parts.length - 1]?.toLowerCase() ?? "user";
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `${lastWord}-${digits}`;
}

/**
 * Utility function to convert a title to a slug with timestamp suffix
 * @param title - The title string to convert
 * @param date - Optional date object (defaults to current date)
 * @returns Slugified string with YYMMDDHHMMSS suffix
 *
 * @example
 * slugify("Hello World! @#$%")
 * // Returns: "hello-world-260705120530" (assuming current time)
 */

export function slugify(title: string, date: Date = new Date()): string {
  // Remove harmful characters and convert to slug
  const clean = title
    .toLowerCase()
    // Keep only alphanumeric characters and spaces (remove everything else)
    .replace(/[^a-z0-9\s]/g, "")
    // Replace multiple spaces with single space
    .replace(/\s+/g, " ")
    // Trim leading/trailing spaces
    .trim()
    // Replace spaces with hyphens
    .replace(/\s/g, "-")
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-+/g, "-");

  // Generate timestamp: YYMMDDHHMMSS
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

  return `${clean}-${timestamp}`;
}

const ORDER_CODE_PREFIX: Record<OrderSource, string> = {
  GIG: "GG",
  JOB: "JB",
};

/**
 * Generates a unique-looking order code.
 *
 * Pattern:
 * PREFIX-YYMMDD-MNOQ
 *
 * Examples:
 * GG-260706-483k
 * JB-260706-127m
 */
export function generateOrderCode(source: OrderSource): string {
  const prefix = ORDER_CODE_PREFIX[source];

  const now = new Date();

  const date = [
    String(now.getFullYear()).slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  // Random 3-digit number (100-999)
  const number = Math.floor(Math.random() * 900) + 100;

  // Random lowercase letter (a-z)
  const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));

  return `${prefix}-${date}-${number}${letter}`;
}
