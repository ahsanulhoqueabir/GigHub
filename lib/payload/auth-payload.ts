/**
 * Auth Payload Sanitization
 *
 * Sanitizes incoming request bodies for auth-related endpoints.
 * Ensures only expected fields are passed through to service layer.
 */

export interface SanitizedSignUpPayload {
  name: string;
  email: string;
  password: string;
  student_id: string;
  department: string;
}

export interface SanitizedLoginPayload {
  emailOrUsername: string;
  password: string;
}

/**
 * Sanitize signup request body — strips any unexpected fields.
 */
export function sanitizeSignUpPayload(
  body: Record<string, unknown>,
): SanitizedSignUpPayload {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const student_id =
    typeof body.student_id === "string" ? body.student_id.trim() : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "";

  return { name, email, password, student_id, department };
}

/**
 * Sanitize login request body — strips any unexpected fields.
 */
export function sanitizeLoginPayload(
  body: Record<string, unknown>,
): SanitizedLoginPayload {
  const emailOrUsername =
    typeof body.emailOrUsername === "string" ? body.emailOrUsername.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  return { emailOrUsername, password };
}

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
