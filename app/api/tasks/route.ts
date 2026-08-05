import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { request } from "http";


export async function POST(request: Request) {
  try {
    // 1. authenticate the user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // 2. parse form data
    const formData = await request.formData();
    const referer = request.headers.get("referer");
    const redirectUrl = new URL(referer ?? "/", request.url);

    const title = formData.get("title")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const priority = formData.get("priority")?.toString() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    const dueDateStr = formData.get("dueDate")?.toString();
    const columnId = formData.get("columnId")?.toString();
    const projectId = formData.get("projectId")?.toString();

    if (!title || !columnId || !projectId) {
      return NextResponse.json({ error: "missing required fields" }, { status: 400 });
    }

    // verify permission to create task
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project) {
      return NextResponse.json({ error: "project not found" }, { status: 404 });
    }

    const isAllowed = await hasPermission(user.id, project.workspaceId, "canCreateTask");
    if (!isAllowed) {
      return NextResponse.json({ error: "you do not have permission to create tasks in this workspace" }, { status: 403 });
    }

    // 3. figure out the position (put the new task at the bottom of the list)
    const existingTasksCount = await prisma.task.count({
      where: { columnId }
    });

    // 4. create the task
    await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
        position: existingTasksCount + 1,
        columnId,
        projectId,
        createdById: user.id
      }
    });

    // 5. redirect back to the board
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("task creation error:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
