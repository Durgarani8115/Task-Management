import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";


// get all projects for a workspace (pass workspace id as query param)
export async function GET(request: Request){
  try{
    // authenticate the user

    const user = await  getUserFromRequest(request);
    if(!user){
      return NextResponse.json({error: "unauthorized"}, {status: 401});

    }

    // get workspace id from query params

    const {searchParams} = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if(!workspaceId) {
      return NextResponse.json({
        error: "workspaceId is required "},
        {status: 400}
      );
    }
    // check if the user is a member of the workspace

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
    // fetch all projects with their columns and task count 

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
 }
}


// create a new project inside a workspace

export async function POST(request : Request){
  try{
    // authenticate the user

    const user = await getUserFromRequest(request);
    if(!user){
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // parse form data
    const formData = await request.formData();
    const action = formData.get("_action")?.toString() ?? "create";
  const referer = request.headers.get("referer");
  const redirecturl = new URL(referer ?? "/", request.url);

  if(action === "create"){
    const name = formData.get("name")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const workspaceId = formData.get("workspaceId")?.toString();

    if(!name || !workspaceId){
      return NextResponse.json({
        error: "name and workspace id are required"
      },
    {status : 400})
    };

  
  // authorize: check if user is a member of the workspace

   const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId ,
            userId: user.id,
          },
        },
      });
  if(!membership){
    return NextResponse.json({error:"you do not have permission to create projects in this workspace" },
          { status: 403 });

  }

  // database transaction: create project and default columns together
      await prisma.$transaction(async (tx) => {
        // create the project record
        const project = await tx.project.create({
          data: {
            name,
            description,
            workspaceId,
          },
        });

    // create default columns for the new project

    await tx.taskColumn.createMany({
      data:[
        {title: "To Do", position: 1, projectId: project.id},
        {title:"In Progress",position: 2, projectId: project.id},
        {title: "Done", position: 3, projectId: project.id},
      ],
    });
    return project;
  });
  
  return NextResponse.redirect(redirecturl);
}
return NextResponse.redirect(redirecturl);
  }
catch(error){
  console.error("project creation error: ", error);
  return NextResponse.json(
    {error: "internal server error"},
    {status: 500}
  );
}}

export async function PUT(request:Request){
  try{
    // authenticate user
    const user = await getUserFromRequest(request);

    if(!user){
      return NextResponse.json(
        {error:"unauthorized"},
        {status: 401}
      );
    }

    // get request body

    const {projectId,name, description} = await request.json();

    if(!projectId || !name){
      return NextResponse.json(
        {error: "project id & name are required"},
        {status : 400}
      );
    }
    // find project

    const project = await prisma.project.findUnique({
      where : {
        id : projectId
      },
    });
    if(!project){
      return NextResponse.json(
        {error: "project not found"},
        {status: 404}
      );
    }

    // authorization: check workspace membership

    const membership = await prisma.workspaceMember.findUnique({
     where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId: user.id,
        },
      },
    });

    if(!membership){
      return NextResponse.json(
        {error: "you do not have permission to update"},
        {status: 403}
      )
    }
    // update project

    const UpdatedProject = await prisma.project.update({
      where:{
        id: projectId,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(UpdatedProject);
  }catch(error){
    console.error("update project error : ", error);
    return NextResponse.json({
      error: "internal server error"
    },
  {status: 500}
);
  }
}

// delete project and all its related child data

export async function DELETE(request: Request){
  try{

    // authenticate

    const user = await getUserFromRequest(request);

      if(!user){
        return NextResponse.json(
          {error:"unauthorized"},
          {status:401}
        )
      }

      // get projectId from query params

      const {searchParams} = new URL(request.url);

      const projectId = searchParams.get("projectId");

      if(!projectId){
        return NextResponse.json(
          {error: "projectId is required"},
          {status: 400}
        );
      }

      // find project

      const project = await prisma.project.findUnique({
        where: {
          id: projectId,
        },

      });

      if(!project){
        return NextResponse.json(
          {error: "project not found"},
          {status: 404}
        );
      }

      // authorization: check workspace membership
       const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "you do not have permission to delete this project" },
        { status: 403 }
      );
    }

    // delete everything in a transaction because there are no cascade deletes in schema
    // delete child records first, then parents
    await prisma.$transaction(async (tx) => {
      // delete task-level children first (comments, checklists, attachments, activity logs, assignees, task-tags)
      await tx.comment.deleteMany({ where: { task: { projectId } } });
      await tx.checklistItem.deleteMany({ where: { task: { projectId } } });
      await tx.attachment.deleteMany({ where: { task: { projectId } } });
      await tx.activityLog.deleteMany({ where: { task: { projectId } } });
      await tx.taskAssignee.deleteMany({ where: { task: { projectId } } });
      await tx.taskTag.deleteMany({ where: { task: { projectId } } });

      // delete tasks
      await tx.task.deleteMany({ where: { projectId } });

      // delete tags and columns
      await tx.tag.deleteMany({ where: { projectId } });
      await tx.taskColumn.deleteMany({ where: { projectId } });

      // finally delete the project itself
      await tx.project.delete({ where: { id: projectId } });
    });

    return NextResponse.json({
      message: "project deleted successfully",
    });

  }catch(error){
    console.error("delete project error",error);

    return NextResponse.json(
      {error: "internal server error"},
      {status: 500}
    );
  }
}


