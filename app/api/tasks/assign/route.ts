import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { sendPushNotificationToUser } from "@/lib/fcm-admin";

// handle assigning a user to a task and triggering push notification
export async function POST(request: Request) {
  try {
    // authenticate requesting user
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // parse request body parameters
    const body = await request.json();
    const { taskId, targetUserId } = body;

    if (!taskId || !targetUserId) {
      return NextResponse.json(
        { error: "taskId and targetUserId are required" },
        { status: 400 }
      );
    }

    // verify target task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, projectId: true },
    });

    if (!task) {
      return NextResponse.json({ error: "task not found" }, { status: 404 });
    }

    // assign user to task using upsert to avoid duplication
    await prisma.taskAssignee.upsert({
      where: {
        taskId_userId: {
          taskId,
          userId: targetUserId,
        },
      },
      update: {},
      create: {
        taskId,
        userId: targetUserId,
      },
    });

    // dispatch fcm browser push notification to assigned user
    await sendPushNotificationToUser({
      userId: targetUserId,
      title: "New Task Assigned",
      body: `You have been assigned to task: "${task.title}"`,
      url: `/dashboard`,
    });

    return NextResponse.json({ success: true, message: "user assigned and push notification dispatched" });
  } catch (error) {
    // log error during task assignment
    console.error("failed to assign task and send push notification:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
