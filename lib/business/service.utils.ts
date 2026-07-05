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
