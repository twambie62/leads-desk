import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

type LoginResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

export async function verifyCredentials(email: string, password: string): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message on purpose — don't reveal whether the email exists
  const genericError = "Invalid email or password.";

  if (!user || !user.isActive) {
    return { ok: false, error: genericError };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { ok: false, error: "Account is locked due to repeated failed attempts. Try again later." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const locking = attempts >= MAX_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: locking ? 0 : attempts,
        lockedUntil: locking ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: locking ? "LOCKED" : "LOGIN_FAILED",
        message: locking
          ? `Account locked for 24h after ${MAX_ATTEMPTS} failed login attempts`
          : `Failed login attempt (${attempts}/${MAX_ATTEMPTS})`,
        userId: user.id,
      },
    });

    return {
      ok: false,
      error: locking
        ? "Too many failed attempts. Account locked for 24 hours."
        : genericError,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await prisma.auditLog.create({
    data: { action: "LOGIN", message: `${user.name} logged in`, userId: user.id },
  });

  return { ok: true, userId: user.id };
}