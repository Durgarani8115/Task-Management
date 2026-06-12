// import prisma  from "@/lib/db";

// // export async function GET() {
// //   const workspaces = await prisma.workspace.findMany();
// //     return Response.json(workspaces);
// // }

// export async function POST(req: Request) {
//   const body = await req.json();

//   const workspace = await prisma.workspace.create({
//     data: {
//       name: body.name,
//       slug: body.slug,
//     },
//   });

//   return Response.json(workspace);
// }

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { slugify } from "@/lib/utils";
export async function POST(request: Request) {
    const formData = await request.formData();
    const action = formData.get("_action")?.toString() ?? "create";
    const referer = request.headers.get("referer");
    const redirectUrl = new URL(referer ?? "/", request.url);

    //create 

    if (action === "create") {
        const name = formData.get("name")?.toString().trim();

        if (!name) {
            return NextResponse.json(
                {
                    message: "Workspace name is required",
                },
                {
                    status: 400,
                }
            );
        }


        await prisma.workspace.create({
            data: {
                name,
                slug: slugify(name),
            },
        });
    }
    // RENAME

    if (action === "rename") {
        const workspaceId = formData.get("workspaceId")?.toString();

        const name = formData.get("name")?.toString().trim();

        if (workspaceId && name) {
            await prisma.workspace.update({
                where: { id: workspaceId, },
                data: {
                    name, slug: slugify(name),

                },
            });
        }
    }

    // delete

    if (action === "delete") {
        const workspaceId = formData.get("workspaceId")?.toString();
        if (workspaceId) {
            await prisma.project.deleteMany({
                where: { workspaceId, },
            });
            await prisma.workspace.delete(
                { where: { id: workspaceId, }, });
        }
    }
    return NextResponse.redirect(redirectUrl);


}