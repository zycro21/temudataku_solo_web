import { google } from "googleapis";
import axios from "axios";
import { PrismaClient, Prisma } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

// Derive __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Path ke file service account JSON yang diunduh
const SERVICE_ACCOUNT_KEY_PATH = path.resolve(
  __dirname,
  "../configs/temudataku-web-solo-firebase-adminsdk-fbsvc-4fe0d51db7.json"
);

// Fungsi untuk mendapatkan access token menggunakan OAuth 2.0
const getAccessToken = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_PATH,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const authClient = await auth.getClient();
  const token = await authClient.getAccessToken();
  return token.token;
};

// Fungsi untuk mengirim push notification
export const sendPushNotification = async ({
  userId,
  title,
  message,
  actionUrl,
  meta,
}: {
  userId: string;
  title: string;
  message?: string;
  actionUrl?: string;
  meta?: Record<string, any>;
}) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user?.fcmToken) {
    console.error("FCM Token not found for user", userId);
    return;
  }

  const fcmToken = user.fcmToken;

  // Ambil access token
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error("Failed to obtain access token.");
    return;
  }
  
  const payload = {
    message: {
      token: fcmToken,
      notification: {
        title: title,
        body: message,
      },
      data: {
        actionUrl: actionUrl ?? "",
        meta: JSON.stringify(meta ?? {}),
      },
    },
  };

  try {
    const response = await axios.post(
      "https://fcm.googleapis.com/v1/projects/temudataku-web-solo/messages:send",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("Push notification sent successfully", response.data);
  } catch (error: any) {
    console.error("Error sending push notification", {
      message: error.message,
      response: error.response?.data,
    });
  }
};
