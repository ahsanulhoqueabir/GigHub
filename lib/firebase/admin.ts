import { fb } from "@/config/env.config";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

let app: App | undefined;

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
      privateKey: fb.privateKey.replace(/\\n/g, "\n"),
    }),
  });

  return app;
}

export function getFirebaseMessaging(): Messaging {
  return getMessaging(getFirebaseAdminApp());
}
