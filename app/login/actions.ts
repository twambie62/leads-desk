"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { verifyCredentials } from "@/lib/auth";
import { createSession } from "@/lib/session";
import {prisma} from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginState = { error?: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const result = await verifyCredentials(parsed.data.email, parsed.data.password);

  if (!result.ok) {
    return { error: result.error };
  }

  const hdrs = await headers();
  await createSession(result.userId, {
    ip: hdrs.get("x-forwarded-for") ?? undefined,
    userAgent: hdrs.get("user-agent") ?? undefined,
  });

  const user = await prisma.user.findUnique({
    where: { id: result.userId },
    select: { role: true },
  });

  redirect(user?.role === "ADMIN" ? "/admin/dashboard" : "/agent/dashboard");
}