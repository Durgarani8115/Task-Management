import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
    const { id } = await params;

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
}

export async function PATCH(request: Request, { params }: RouteContext) {
    const { id } = await params;
    const body = await request.json();

    if (!body.name) {
        return NextResponse.json(
            { message: "Workspace name is required" },
            { status: 400 }
        );
    }

    const workspace = await prisma.workspace.update({
        where: { id },
        data: {
            name: body.name,
            slug: slugify(body.name),
        },
    });

    return NextResponse.json(workspace);
}

export async function DELETE(_request: Request, { params }: RouteContext) {
    const { id } = await params;

    await prisma.project.deleteMany({
        where: { workspaceId: id },
    });

    await prisma.workspace.delete({
        where: { id },
    });

    return NextResponse.json({
        message: "Workspace deleted successfully",
    });
}
