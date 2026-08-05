import prisma from "@/lib/db";
import { sendPushNotificationToUser } from "@/lib/fcm-admin";
import { NotificationType } from "@/generated/prisma";

interface DispatchNotificationParams {
  recipientIds: string[];
  actorId?: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  taskId?: string;
  workspaceId?: string;
}

// helper function to save in-app database notifications and trigger fcm push for recipients
export async function dispatchNotification({
  recipientIds,
  actorId,
  type,
  title,
  message,
  linkUrl = "/dashboard",
  taskId,
  workspaceId,
}: DispatchNotificationParams) {
  try {
    // filter out duplicate user ids and empty values
    const uniqueRecipients = Array.from(new Set(recipientIds.filter(Boolean)));

    if (uniqueRecipients.length === 0) {
      return;
    }

    // create persistent notification records in database for each recipient
    const createPromises = uniqueRecipients.map((recipientId) =>
      prisma.notification.create({
        data: {
          userId: recipientId,
          actorId: actorId || null,
          type,
          title,
          message,
          linkUrl,
          taskId: taskId || null,
          workspaceId: workspaceId || null,
        },
      })
    );

    await Promise.all(createPromises);

    // dispatch fcm browser push notification for each recipient user
    const pushPromises = uniqueRecipients.map((recipientId) =>
      sendPushNotificationToUser({
        userId: recipientId,
        title,
        body: message,
        url: linkUrl,
      })
    );

    await Promise.all(pushPromises);
  } catch (error) {
    // log notification processing error without throwing exception
    console.error("error dispatching in-app and fcm notifications:", error);
  }
}
