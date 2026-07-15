import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  createToken,
  hashPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  let name = "";
  let email = "";
  let password = "";

  // determine content type to parse payload correctly
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      name = body.name?.toString().trim() || "";
      email = body.email?.toString().trim().toLowerCase() || "";
      password = body.password?.toString() || "";
    } else {
      const formData = await request.formData();
      name = formData.get("name")?.toString().trim() || "";
      email = formData.get("email")?.toString().trim().toLowerCase() || "";
      password = formData.get("password")?.toString() || "";
    }
  } catch (error) {
    return NextResponse.json(
      { error: "invalid request body" },
      { status: 400 }
    );
  }

  // validation
  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "name, email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "password must be at least 8 characters long" },
      { status: 400 }
    );
  }

  // check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "email is already registered" },
      { status: 409 }
    );
  }

  // create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashPassword(password),
    },
  });

  const token = createToken({ userId: user.id });

  // check if client expects json response (non-navigation browser request)
  const isNavigate = request.headers.get("sec-fetch-mode") === "navigate";

  let response: NextResponse;
  if (isNavigate) {
    response = NextResponse.redirect(new URL("/dashboard", request.url), {
      status: 303,
    });
  } else {
    response = NextResponse.json(
      { 
        message: "user created successfully",
        user: { id: user.id, name: user.name, email: user.email }
      },
      { status: 201 }
    );
  }

  // set secure authentication cookie
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });

  return response;
}

