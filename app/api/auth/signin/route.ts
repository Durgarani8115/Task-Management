import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  createToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  let email = "";
  let password = "";

  // determine content type to parse payload correctly
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email?.toString().trim().toLowerCase() || "";
      password = body.password?.toString() || "";
    } else {
      const formData = await request.formData();
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
  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 }
    );
  }

  // check if user exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  // verify password
  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: "invalid password" }, { status: 401 });
  }

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
        message: "logged in successfully",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 200 }
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

