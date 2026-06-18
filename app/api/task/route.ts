import { getUserFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";


export async function POST(request: Request) {
  try {


    //authenticate the user first

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" },
        {
          status: 401
        });
    }
// functio to check yser  IP adress
    //read parameters from requst body
    const body = await request.json();
    const {title, description, projectId,columnId} = body;

    //validate require fields

    if(!title || !projectId || !columnId){
      return NextResponse.json(
        {error : "mising required fields"},
      {status : 400});
    }

    // calculating the next postion within the column

    const existingTaskSCount = await prisma.task.count({
      where : {
        columnId,
      },

    });

    //create the task in the database
    const newTask = await prisma.task.create({
      data : {
        title,
        description,
        projectId,
        columnId,
        position: existingTaskSCount + 1,
        createdById : user.id
      },
    });
    return NextResponse.json(newTask, {status:201});

  }
  catch(error){
    console.error("error creating task", error);
    return NextResponse.json(
      {error: "internal server error"},
      {status:500}
    );

  }
}

// get the task from db
export async function GET(request: Request){
  // check auth token

  // object to store data so we can store it temporary

  
  
  // call prisma to get data from neon

// check condition: if task>=1: contunue if not response me bhej ki koi bhi task nhi h
  // store this data into above object

  // give the data into response
}

