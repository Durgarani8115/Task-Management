import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        // fetch the logged in user
        const user = await getUserFromRequest(request);
        if (!user) {
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        const formData = await request.formData();
        const action = formData.get("_action")?.toString() ?? "create";
        const referer = request.headers.get("referer");
        const redirectUrl = new URL(referer ?? "/", request.url);

        // create workspace
        if (action === "create") {
            const name = formData.get("name")?.toString().trim();
            const description = formData.get("description")?.toString().trim();
            if (!name) {
                return NextResponse.json(
                    { message: "Workspace name is required" },
                    { status: 400 }
                );
            }

            if (!description || description.length < 5 || description.length > 25) {
                return NextResponse.json(
                    { message: "Workspace description is required and must be 5 to 25 characters" },
                    { status: 400 }
                );
            }

            const slug = slugify(name);

            // check if workspace slug already exists
            const existingWorkspace = await prisma.workspace.findUnique({
                where: { slug },
            });

            if (existingWorkspace) {
                return NextResponse.json(
                    { message: "Workspace name already exists" },
                    { status: 400 }
                );
            }

            const newWorkspace = await prisma.workspace.create({
                data: {
                    name,
                    slug,
                    description,
                    members: {
                        create: {
                            userId: user.id,
                            role: 'OWNER'
                        }
                    }
                },
            });

            // return json response if called directly as an api (no referer header)
            if (!referer) {
                return NextResponse.json(newWorkspace, { status: 201 });
            }
        }

        // rename workspace
        if (action === "rename") {
            const workspaceId = formData.get("workspaceId")?.toString();
            const name = formData.get("name")?.toString().trim();

            if (!workspaceId || !name) {
                return NextResponse.json(
                    { message: "Missing workspaceId or name" },
                    { status: 400 }
                );
            }

            const updatedWorkspace = await prisma.workspace.update({
                where: { id: workspaceId },
                data: {
                    name,
                    slug: slugify(name),
                },
            });

            // return json response if called directly as an api
            if (!referer) {
                return NextResponse.json(updatedWorkspace, { status: 200 });
            }
        }

        // delete workspace
        if (action === "delete") {
            const workspaceId = formData.get("workspaceId")?.toString();
            if (!workspaceId) {
                return NextResponse.json(
                    { message: "Workspace ID is required" },
                    { status: 400 }
                );
            }

            await prisma.project.deleteMany({
                where: { workspaceId },
            });
            
            // need to delete workspace members before deleting the workspace due to foreign key constraints
            await prisma.workspaceMember.deleteMany({
                 where: { workspaceId }
            });

            await prisma.workspace.delete({
                where: { id: workspaceId },
            });

            // return json response if called directly as an api
            if (!referer) {
                return NextResponse.json(
                    { message: "Workspace deleted successfully" },
                    { status: 200 }
                );
            }
        }

        return NextResponse.redirect(redirectUrl);

    } catch (error) {
        console.error("workspace operation error:", error);
        return NextResponse.json(
            { error: "internal server error" },
            { status: 500 }
        );
    }
}