import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";

// validation schema for project creation
const createProjectSchema = z.object({
  name: z.string().min(1, "project name is required").max(50),
  workspaceId: z.string().min(1, "workspace id is required"),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // 1. authenticate the user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 2. validate the incoming request body
    const body = await request.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, workspaceId, color, icon } = validation.data;

    // 3. authorize: check if user is a member of the workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "you do not have permission to create projects in this workspace" },
        { status: 403 }
      );
    }

    // 4. database transaction: create project and default columns together
    const newProject = await prisma.$transaction(async (tx) => {
      // create the project record
      const project = await tx.project.create({
        data: {
          name,
          workspaceId,
          color,
          icon,
        },
      });

      // create default kanban columns for the new project
      await tx.taskColumn.createMany({
        data: [
          { title: "To Do", position: 1, projectId: project.id },
          { title: "In Progress", position: 2, projectId: project.id },
          { title: "Done", position: 3, projectId: project.id },
        ],
      });

      return project;
    });

    // 5. return the created project
    return NextResponse.json(newProject, { status: 201 });

  } catch (error) {
    // generic error handling for unexpected issues
    console.error("project creation error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
