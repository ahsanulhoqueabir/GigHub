import { fb } from "@/config/env.config";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

/**
 * Env vars holding a multi-line PEM key are prone to mangling depending on
 * how the hosting platform stores them — some strip the outer quotes,
 * some keep them literally, some preserve real newlines. Normalize all of
 * those shapes so cert() always gets a clean PEM string.
 */
function normalizePrivateKey(key: string): string {
  const trimmed = key.trim();
  const unquoted =
    trimmed.startsWith('"') && trimmed.endsWith('"')
      ? trimmed.slice(1, -1)
      : trimmed;
  return unquoted.replace(/\\n/g, "\n");
}

/**
 * Returns the singleton Firebase Admin App instance.
 *
 * Relies on firebase-admin's internal singleton registry (`getApps()`)
 * rather than a module-level variable because Next.js serverless
 * functions may get a fresh module scope per invocation.
 */
function getFirebaseAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) {
    return existing[0];
  }

  return initializeApp({
    credential: cert({
      projectId: fb.projectId,
      clientEmail: fb.clientEmail,
      privateKey: normalizePrivateKey(fb.privateKey),
    }),
  });
}

/**
 * Returns the Firebase Messaging instance.
 *
 * The app is lazily initialized and then cached inside firebase-admin's
 * internal singleton registry — safe to call repeatedly across
 * serverless invocations.
 */
export function getFirebaseMessaging(): Messaging {
  return getMessaging(getFirebaseAdminApp());
}
