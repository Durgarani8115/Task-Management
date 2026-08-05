import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// get list of in-app notifications for authenticated user
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // fetch latest 30 notifications for user
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        actor: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    // count unread notifications
    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    // log error fetching notifications
    console.error("error fetching user notifications:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}

// mark notifications as read for authenticated user
export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      // mark all notifications read for user
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      // mark specific notifications read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: user.id,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // log error updating notifications
    console.error("error updating notifications:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
