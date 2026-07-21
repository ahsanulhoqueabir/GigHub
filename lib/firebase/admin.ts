import { fb } from "@/config/env.config";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

let app: App | undefined;

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

function getFirebaseAdminApp(): App {
  if (app) return app;

  const existing = getApps();
  if (existing.length > 0) {
    app = existing[0];
    return app;
  }

  app = initializeApp({
    credential: cert({
      projectId: fb.projectId,
      clientEmail: fb.clientEmail,
      privateKey: normalizePrivateKey(fb.privateKey),
    }),
  });

  return app;
}

export function getFirebaseMessaging(): Messaging {
  return getMessaging(getFirebaseAdminApp());
}
