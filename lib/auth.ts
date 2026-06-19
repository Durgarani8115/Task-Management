// "use client"
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import prisma from "@/lib/db";

import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;
const HASH_KEY_LENGTH = 64;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;
export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required in .env");
}

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required in .env");
  }

  return JWT_SECRET;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, HASH_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, hash: string) {
  const [salt, storedHash] = hash.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, HASH_KEY_LENGTH);
  const storedHashBuffer = Buffer.from(storedHash, "hex");

  if (storedHashBuffer.length !== derivedHash.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, storedHashBuffer);
}

export function createToken(payload: { userId: string }) {
  const encodedPayload = Buffer.from(
    JSON.stringify({
      userId: payload.userId,
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString("base64url");

  const signature = createHmac("sha256", getJwtSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid token");
  }

  const expectedSignature = createHmac("sha256", getJwtSecret())
    .update(encodedPayload)
    .digest("base64url");

  if (
    Buffer.byteLength(signature) !== Buffer.byteLength(expectedSignature) ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  ) as {
    exp?: number;
    userId?: string;
  };

  if (typeof payload.userId !== "string" || typeof payload.exp !== "number") {
    throw new Error("Invalid token payload");
  }

  if (payload.exp <= Date.now()) {
    throw new Error("Token expired");
  }

  return { userId: payload.userId };
}

export async function getUserFromRequest(request: Request) {
  // check for authorization header first (e.g. bearer <token>)
  const authHeader = request.headers.get("authorization") || "";
  let token: string | null = null;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    // fallback to cookie if needed
    const cookieHeader = request.headers.get("cookie") || "";
    const authCookie = cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));

    if (authCookie) {
      token = authCookie.split("=")[1];
    }
  }

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    return await prisma.user.findUnique({ where: { id: payload.userId } });
  } catch {
    return null;
  }
}


// Use this in Server Components (page.tsx, layout.tsx)
export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const payload = verifyToken(token);
    return await prisma.user.findUnique(
      {
        where: { id: payload.userId }
      });
  } catch {
    return null;
  }
}

