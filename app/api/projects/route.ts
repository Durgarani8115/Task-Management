import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import {
  getWorkspaceMembership,
  getProjectsByWorkspace,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "./repositories/project-repository";

// get all projects for a workspace (pass workspace id as query param)
export async function GET(request: Request) {
  try {
    // authenticate the user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // get workspace id from query params
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required " },
        { status: 400 }
      );
    }

    // check if the user is a member of the workspace
    const membership = await getWorkspaceMembership(workspaceId, user.id);

    if (!membership) {
      return NextResponse.json(
        { error: "you are not a member of this workspace " },
        { status: 403 }
      );
    }

    // fetch all projects with their columns and task count
    const projects = await getProjectsByWorkspace(workspaceId);
    return NextResponse.json(projects);
  } catch (error) {
    console.error("fetch project error: ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

// create a new project inside a workspace
export async function POST(request: Request) {
  try {
    // authenticate the user
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // parse form data
    const formData = await request.formData();
    const action = formData.get("_action")?.toString() ?? "create";
    const referer = request.headers.get("referer");
    const redirecturl = new URL(referer ?? "/", request.url);

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

      // authorize: check if user is a member of the workspace
      const isAllowed = await hasPermission(user.id, workspaceId, "canManageProject");
      if (!isAllowed) {
        return NextResponse.json(
          { error: "you do not have permission to create projects in this workspace" },
          { status: 403 }
        );
      }

      // create project and default columns together
      await createProject(name, description, workspaceId);

      return NextResponse.redirect(redirecturl);
    }
    return NextResponse.redirect(redirecturl);
  } catch (error) {
    console.error("project creation error: ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // authenticate user
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      );
    }

    // get request body
    const { projectId, name, description } = await request.json();

    if (!projectId || !name) {
      return NextResponse.json(
        { error: "project id & name are required" },
        { status: 400 }
      );
    }

    // find project
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "project not found" },
        { status: 404 }
      );
    }

    // authorization: check workspace membership
    const isAllowed = await hasPermission(user.id, project.workspaceId, "canManageProject");
    if (!isAllowed) {
      return NextResponse.json(
        { error: "you do not have permission to update" },
        { status: 403 }
      );
    }

    // update project
    const UpdatedProject = await updateProject(projectId, { name, description });

    return NextResponse.json(UpdatedProject);
  } catch (error) {
    console.error("update project error : ", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

// delete project and all its related child data
export async function DELETE(request: Request) {
  try {
    // authenticate
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 401 }
      );
    }

    // get projectId from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    // find project
    const project = await getProjectById(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "project not found" },
        { status: 404 }
      );
    }

    // authorization: check workspace membership
    const isAllowed = await hasPermission(user.id, project.workspaceId, "canManageProject");
    if (!isAllowed) {
      return NextResponse.json(
        { error: "you do not have permission to delete this project" },
        { status: 403 }
      );
    }

    // delete everything in a transaction because there are no cascade deletes in schema
    await deleteProject(projectId);

    return NextResponse.json({
      message: "project deleted successfully",
    });
  } catch (error) {
    console.error("delete project error", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
