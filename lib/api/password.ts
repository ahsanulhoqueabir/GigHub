import argon2 from "argon2";

export function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}
