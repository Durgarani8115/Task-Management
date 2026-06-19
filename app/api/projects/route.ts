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
    const action = formData.get("_action")?.toString() ?? "create";
    const referer = request.headers.get("referer");
    const redirectUrl = new URL(referer ?? "/", request.url);

    if (action === "create") {
      const name = formData.get("name")?.toString().trim();
      const description = formData.get("description")?.toString().trim();
      const workspaceId = formData.get("workspaceId")?.toString();

      if (!name || !workspaceId) {
        return NextResponse.json(
          { error: "name and workspace id are required" },
          { status: 400 }
        );
      }

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
      await prisma.$transaction(async (tx) => {
        // create the project record
        const project = await tx.project.create({
          data: {
            name,
            description,
            workspaceId,
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
      
      // 5. redirect back to the workspace page to see the new project
      return NextResponse.redirect(redirectUrl);
    }
    
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    // generic error handling for unexpected issues
    console.error("project creation error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
