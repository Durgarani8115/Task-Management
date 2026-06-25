import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";


//get all project for a workspaces (pass workspace id as querry param)
export async function GET(request: Request){
  try{
    // authenticate the user

    const user = await  getUserFromRequest(request);
    if(!user){
      return NextResponse.json({error: "unauthorized"}, {status: 401});

    }

    //get workspaceid from query params

    const {searchParams} = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if(!workspaceId) {
      return NextResponse.json({
        error: "workspaceId is required "},
        {status: 400}
      );
    }
    // chk oif the user is a member of workspces

    const membership = await prisma.workspaceMember.findUnique({
      where:{
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    if(!membership){
      return NextResponse.json(
        {error : "you are not a member of this workspace "}
         , {status: 403}
      )
    };
    //fetchh all projects with thier colmns and task count 

    const projects = await prisma.project.findMany({
      where : {workspaceId},
      include : {
        columns : {
          orderBy: {position: "asc"},
        },
        _count: {
          select : {tasks: true},
        },
      },
      orderBy : {createdAt: "desc"},
    });
    return NextResponse.json(projects);
  }catch(error){
  console.error("fetch project error: ", error);
    return NextResponse.json(
  {error: "internal server error"},
  {status: 500}
);
  }}


// creat en new project inside a workspace

export async function POST(request : Request){
  try{
    //authenticate the user

    const user = await getUserFromRequest(request);
    if(!user){
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // parse form data
    const formData = await request.formData();
    const action = formData.get("_action")?.toString() ?? "cretae";
  const referer = request.headers.get("referer");
  const redirecturl = new URL(referer ?? "/", request.url);

  if(action === "create"){
    const name = formData.get("name")?.toString().trim();
    const descrption = formData.get("description")?.toString().trim();
    const workspaceId = formData.get("workspaceId")?.toString();

    if(!name || !workspaceId){
      return NextResponse.json({
        eroor: "name and workspace id are required"
      },
    {status : 400})
    };

  }

  


  }catch(error){}
}



// export async function POST(request: Request) {
//   try {
//     // 1. authenticate the user
//     const user = await getUserFromRequest(request);
//     if (!user) {
//       return NextResponse.redirect(new URL('/sign-in', request.url));
//     }

//     // 2. parse form data
//     const formData = await request.formData();
//     const action = formData.get("_action")?.toString() ?? "create";
//     const referer = request.headers.get("referer");
//     const redirectUrl = new URL(referer ?? "/", request.url);

//     if (action === "create") {
//       const name = formData.get("name")?.toString().trim();
//       const description = formData.get("description")?.toString().trim();
//       const workspaceId = formData.get("workspaceId")?.toString();

//       if (!name || !workspaceId) {
//         return NextResponse.json(
//           { error: "name and workspace id are required" },
//           { status: 400 }
//         );
//       }

//       // 3. authorize: check if user is a member of the workspace
//       const membership = await prisma.workspaceMember.findUnique({
//         where: {
//           workspaceId_userId: {
//             workspaceId,
//             userId: user.id,
//           },
//         },
//       });

//       if (!membership) {
//         return NextResponse.json(
//           { error: "you do not have permission to create projects in this workspace" },
//           { status: 403 }
//         );
//       }

//       // 4. database transaction: create project and default columns together
//       await prisma.$transaction(async (tx) => {
//         // create the project record
//         const project = await tx.project.create({
//           data: {
//             name,
//             description,
//             workspaceId,
//           },
//         });

//         // create default kanban columns for the new project
//         await tx.taskColumn.createMany({
//           data: [
//             { title: "To Do", position: 1, projectId: project.id },
//             { title: "In Progress", position: 2, projectId: project.id },
//             { title: "Done", position: 3, projectId: project.id },
//           ],
//         });

//         return project;
//       });
      
//       // 5. redirect back to the workspace page to see the new project
//       return NextResponse.redirect(redirectUrl);
//     }
    
//     return NextResponse.redirect(redirectUrl);

//   } catch (error) {
//     // generic error handling for unexpected issues
//     console.error("project creation error:", error);
//     return NextResponse.json(
//       { error: "internal server error" },
//       { status: 500 }
//     );
//   }
// }
