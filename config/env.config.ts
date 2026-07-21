export const jt = {
  secret: process.env.JWT_SECRET!,
  expiresIn: process.env.JWT_EXPIRES_IN!,
};

export const app = {
  name: process.env.APP_NAME!,
  env: process.env.NODE_ENV!,
  url: process.env.NEXT_PUBLIC_APP_URL!,
  timezone: process.env.APP_TIMEZONE!,
};

export const r2 = {
  id: process.env.R2_ACCOUNT_ID!,
  key: process.env.R2_ACCESS_KEY_ID!,
  secret: process.env.R2_SECRET_ACCESS_KEY!,
  bucket: process.env.R2_BUCKET!,
  publicUrl: process.env.R2_PUBLIC_URL!,
};

export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  apiKey: process.env.CLOUDINARY_API_KEY!,
  apiSecret: process.env.CLOUDINARY_API_SECRET!,
};

export const fb = {
  projectId: process.env.FCM_PROJECT_ID!,
  clientEmail: process.env.FCM_CLIENT_EMAIL!,
  privateKey: process.env.FCM_PRIVATE_KEY!,
};

export const sb = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  secret: process.env.SUPABASE_SECRET_KEY!,
  publish: process.env.NEXT_PUBLIC_PUBLISH_KEY!,
};

export const sslcmz = {
  name: process.env.SSLCOMMERZ_STORE_NAME!,
  store: process.env.SSLCOMMERZ_STORE_ID!,
  password: process.env.SSLCOMMERZ_STORE_PASSWORD!,
  status: process.env.SSLCOMMERZ_IS_LIVE!,
};

export const cron = {
  apiKey: process.env.CRON_API_KEY!,
};

export const telegram = {
  botToken: process.env.TELEGRAM_BOT_TOKEN!,
  chatId: process.env.TELEGRAM_CHAT_ID!,
  threadId: process.env.TELEGRAM_THREAD_ID!,
  chats: [
    {
      chat: -1003852059194,
      thread: 199,
    },
    {
      chat: -1004450663284,
      thread: 25,
    },
  ],
};
