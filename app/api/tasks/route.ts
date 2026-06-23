import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

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
