import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import {
  getWorkspaceMembership,
  getProjectWorkspaceId,
  getProjectWithDetails,
  updateProject,
  deleteProject,
} from "../repositories/project-repository";

type RouteContext = { params: Promise<{ id: string }> };

// helper to verify that the user is a member of the project's workspace
async function verifyProjectAccess(projectId: string, userId: string) {
  const workspaceId = await getProjectWorkspaceId(projectId);
  if (!workspaceId) return null;

  const membership = await getWorkspaceMembership(workspaceId, userId);

  // return null if not a member, otherwise return the membership + project info
  return membership ? { membership, workspaceId } : null;
}

// get a single project with its columns, tasks, and tags
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    // authenticate the user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // check project exists and user has access
    const access = await verifyProjectAccess(id, user.id);
    if (!access) {
      return NextResponse.json(
        { error: "project not found or access denied" },
        { status: 404 }
      );
    }

    // fetch the full project with related data
    const project = await getProjectWithDetails(id);

    return NextResponse.json(project);
  } catch (error) {
    console.error("project get error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

// update a project (name, description, color, icon)
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    // authenticate the user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // check project exists and user has access
    const access = await verifyProjectAccess(id, user.id);
    if (!access) {
      return NextResponse.json(
        { error: "project not found or access denied" },
        { status: 404 }
      );
    }

    // verify permission to update project
    const isAllowed = await hasPermission(user.id, access.workspaceId, "canManageProject");
    if (!isAllowed) {
      return NextResponse.json(
        { error: "you do not have permission to update projects in this workspace" },
        { status: 403 }
      );
    }

    // parse the request body and build the update data
    const body = await request.json();
    const updateData: Record<string, string | undefined> = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.icon !== undefined) updateData.icon = body.icon;

    // at least one field must be provided
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "at least one field (name, description, color, icon) is required" },
        { status: 400 }
      );
    }

    // update the project
    const updatedProject = await updateProject(id, updateData);

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("project update error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

// delete a project and all its related data
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    // authenticate the user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // check project exists and user has access
    const access = await verifyProjectAccess(id, user.id);
    if (!access) {
      return NextResponse.json(
        { error: "project not found or access denied" },
        { status: 404 }
      );
    }

    // verify permission to delete project
    const isAllowed = await hasPermission(user.id, access.workspaceId, "canManageProject");
    if (!isAllowed) {
      return NextResponse.json(
        { error: "you do not have permission to delete projects in this workspace" },
        { status: 403 }
      );
    }

    // delete project and all related child records in a transaction
    await deleteProject(id);

    return NextResponse.json({ message: "project deleted successfully" });
  } catch (error) {
    console.error("project delete error:", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
