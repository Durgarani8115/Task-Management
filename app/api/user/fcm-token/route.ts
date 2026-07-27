import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

// handle post request to register user fcm device token
export async function POST(request: Request) {
  try {
    // authenticate user from request session or token
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // parse fcm token from request body
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "fcm token is required" }, { status: 400 });
    }

    // extract user agent string for device context
    const userAgent = request.headers.get("user-agent") || undefined;

    // upsert fcm token in database to prevent duplicates
    await prisma.userFcmToken.upsert({
      where: { token },
      update: {
        userId: user.id,
        userAgent,
      },
      create: {
        userId: user.id,
        token,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // log error if saving token fails
    console.error("error saving fcm token:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
