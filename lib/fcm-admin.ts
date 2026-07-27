import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import prisma from "@/lib/db";

// initialize firebase admin sdk instance safely
if (!getApps().length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || "project-management-saas-1d4f0";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  url?: string;
}

// send web push notification to all active devices of a specified user
export async function sendPushNotificationToUser({ userId, title, body, url }: PushPayload) {
  try {
    // verify admin sdk initialization status
    if (!getApps().length) {
      console.warn("firebase admin sdk not initialized. missing service account credentials in environment variables.");
      return;
    }

    // fetch registered device tokens for target user
    const tokens = await prisma.userFcmToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) {
      // no registered devices found for user
      return;
    }

    const tokenStrings = tokens.map((t) => t.token);

    // dispatch push payload to all user device tokens
    const response = await getMessaging().sendEachForMulticast({
      tokens: tokenStrings,
      notification: { title, body },
      data: { url: url || "/dashboard" },
    });

    // identify invalid or expired tokens for cleanup
    const failedTokens: string[] = [];
    response.responses.forEach((resp: { success: boolean }, idx: number) => {
      if (!resp.success) {
        failedTokens.push(tokenStrings[idx]);
      }
    });

    // remove stale tokens from database
    if (failedTokens.length > 0) {
      await prisma.userFcmToken.deleteMany({
        where: { token: { in: failedTokens } },
      });
    }
  } catch (error) {
    // log error while sending push notification
    console.error("failed to send fcm notification:", error);
  }
}
