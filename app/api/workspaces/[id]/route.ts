import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getUserFromRequest } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // check if user is member of the workspace
        const membership = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: id,
                    userId: user.id,
                },
            },
        });
        if (!membership) {
            return NextResponse.json({ error: "you do not have access to this workspace" }, { status: 403 });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id },
            include: {
                projects: true,
                members: true,
            },
        });

        if (!workspace) {
            return NextResponse.json(
                { message: "Workspace not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(workspace);
    } catch (error) {
        console.error("GET workspace detail API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: RouteContext) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // check permission
        const allowed = await hasPermission(user.id, id, "canManageWorkspace");
        if (!allowed) {
            return NextResponse.json({ error: "you do not have permission to manage this workspace" }, { status: 403 });
        }

        const body = await request.json();
        const updateData: { name?: string; slug?: string; description?: string | null } = {};

        if (body.name !== undefined) {
            if (!body.name.trim()) {
                return NextResponse.json(
                    { message: "Workspace name cannot be empty" },
                    { status: 400 }
                );
            }
            updateData.name = body.name.trim();
            updateData.slug = slugify(body.name);
        }

        if (body.description !== undefined) {
            updateData.description = body.description;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { message: "At least one field (name or description) is required" },
                { status: 400 }
            );
        }

        const workspace = await prisma.workspace.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(workspace);
    } catch (error) {
        console.error("PATCH workspace API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteContext) {
    try {
        const { id } = await params;
        const user = await getUserFromRequest(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // check permission
        const allowed = await hasPermission(user.id, id, "canManageWorkspace");
        if (!allowed) {
            return NextResponse.json({ error: "you do not have permission to delete this workspace" }, { status: 403 });
        }

        // Deletion logic (delete child tables first)
        const projects = await prisma.project.findMany({
            where: { workspaceId: id },
            select: { id: true }
        });
        const projectIds = projects.map(p => p.id);

        await prisma.$transaction(async (tx) => {
            // Delete task-level children
            await tx.comment.deleteMany({ where: { task: { projectId: { in: projectIds } } } });
            await tx.checklistItem.deleteMany({ where: { task: { projectId: { in: projectIds } } } });
            await tx.attachment.deleteMany({ where: { task: { projectId: { in: projectIds } } } });
            await tx.activityLog.deleteMany({ where: { task: { projectId: { in: projectIds } } } });
            await tx.taskAssignee.deleteMany({ where: { task: { projectId: { in: projectIds } } } });
            await tx.taskTag.deleteMany({ where: { task: { projectId: { in: projectIds } } } });

            // Delete tasks, columns, tags, projects, workspace members, and workspace
            await tx.task.deleteMany({ where: { projectId: { in: projectIds } } });
            await tx.taskColumn.deleteMany({ where: { projectId: { in: projectIds } } });
            await tx.tag.deleteMany({ where: { projectId: { in: projectIds } } });
            await tx.project.deleteMany({ where: { workspaceId: id } });
            await tx.workspaceMember.deleteMany({ where: { workspaceId: id } });
            await tx.workspace.delete({ where: { id } });
        });

        return NextResponse.json({
            message: "Workspace deleted successfully",
        });
    } catch (error) {
        console.error("DELETE workspace API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
