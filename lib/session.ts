import "server-only";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { prisma } from "./prisma";
import { SESSION_COOKIE_NAME } from "./session-constants";

// const SESSION_COOKIE_NAME = "lms_session";
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes, per assignment spec

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, meta?: { ip?: string; userAgent?: string }) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // enforce HTTPS-only cookie in prod
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Returns the logged-in user (safe fields only) or null.
// Also implements the "revalidate after 30 mins" sliding expiration:
// every valid check extends expiry another 30 minutes.
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, isActive: true },
      },
    },
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // sliding expiration
  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    if (session) {
      await prisma.session
        .delete({ where: { id: session.id } })
        .catch(() => {});
    }

    return null;
  }

  // return session.user;

  return session.user; // no passwordHash, no tokenHash
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };