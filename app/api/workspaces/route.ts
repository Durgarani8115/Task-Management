import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getUserFromRequest } from "@/lib/auth";

// GET: Fetch workspaces for the logged-in user

export async function GET(request: Request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // find all workspaces the user is a member of
        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: { userId: user.id }
                }
            },
            include: { projects: true } // optionally include connected projects
        });

        return NextResponse.json(workspaces, { status: 200 });
    } catch (error) {
        console.error("GET workspace error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST: Create a new workspace
export async function POST(request: Request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.redirect(new URL('/sign-in', request.url));

        // support for your existing HTML form submissions
        const formData = await request.formData();
        const referer = request.headers.get("referer");
        const redirectUrl = new URL(referer ?? "/", request.url);

        const name = formData.get("name")?.toString().trim();
        const description = formData.get("description")?.toString().trim();

        if (!name) {
            return NextResponse.json({ message: "Workspace name is required" }, { status: 400 });
        }

        const slug = slugify(name);
        const existingWorkspace = await prisma.workspace.findUnique({ where: { slug } });

        if (existingWorkspace) {
            return NextResponse.json({ message: "Workspace name already exists" }, { status: 400 });
        }

        const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
        if (!adminRole) {
            return NextResponse.json({ message: "System default roles are missing. Please run seed script." }, { status: 500 });
        }

        const newWorkspace = await prisma.workspace.create({
            data: {
                name,
                slug,
                description,
                members: {
                    create: { 
                        userId: user.id, 
                        role: 'OWNER',
                        roleId: adminRole.id
                    }
                }
            },
        });

        // redirect back for HTML forms
        if (referer) return NextResponse.redirect(redirectUrl);
        return NextResponse.json(newWorkspace, { status: 201 });

    } catch (error) {
        console.error("POST workspace error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT: Update an existing workspace (e.g. rename)
export async function PUT(request: Request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // PUT requests usually send JSON instead of form data
        const body = await request.json();
        const { workspaceId, name } = body;

        if (!workspaceId || !name) {
            return NextResponse.json({ message: "Missing workspaceId or name" }, { status: 400 });
        }

        const updatedWorkspace = await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                name,
                slug: slugify(name),
            },
        });

        return NextResponse.json(updatedWorkspace, { status: 200 });
    } catch (error) {
        console.error("PUT workspace error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE: Remove a workspace
export async function DELETE(request: Request) {
    try {
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // We can accept the ID from the URL (e.g. /api/workspaces?workspaceId=123)
        const url = new URL(request.url);
        const workspaceId = url.searchParams.get("workspaceId");

        if (!workspaceId) {
            return NextResponse.json({ message: "Workspace ID is required in the URL parameters" }, { status: 400 });
        }

        // Delete related data first
        await prisma.project.deleteMany({ where: { workspaceId } });
        await prisma.workspaceMember.deleteMany({ where: { workspaceId } });

        // Delete the workspace itself
        await prisma.workspace.delete({ where: { id: workspaceId } });

        return NextResponse.json({ message: "Workspace deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("DELETE workspace error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
