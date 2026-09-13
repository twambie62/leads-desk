"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include at least one capital letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one symbol");

const agentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: passwordRule,
});

export type CreateAgentState = { error?: string; success?: boolean };

export async function createAgentAction(
  _prevState: CreateAgentState,
  formData: FormData
): Promise<CreateAgentState> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") {
    return { error: "Only admins can create sales agent accounts." };
  }

  const parsed = agentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "A user with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const agent = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "SALES_AGENT",
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATED",
      message: `${admin.name} created sales agent account for ${agent.name}`,
      userId: admin.id,
    },
  });

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export type UpdateAgentState = { error?: string; success?: boolean };

const updateAgentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
});

export async function updateAgentAction(
  agentId: string,
  _prevState: UpdateAgentState,
  formData: FormData
): Promise<UpdateAgentState> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") return { error: "Not authorized." };

  const parsed = updateAgentSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.user.findUnique({ where: { id: agentId } });
  if (!existing || existing.role !== "SALES_AGENT") return { error: "Agent not found." };

  const emailTaken = await prisma.user.findFirst({
    where: { email: parsed.data.email, id: { not: agentId } },
  });
  if (emailTaken) return { error: "That email is already in use." };

  await prisma.user.update({ where: { id: agentId }, data: parsed.data });

  await prisma.auditLog.create({
    data: { action: "UPDATED", message: `${admin.name} updated agent "${parsed.data.name}"`, userId: admin.id },
  });

  revalidatePath("/admin/agents");
  return { success: true };
}

export type ResetPasswordState = { error?: string; success?: boolean };

const resetPasswordSchema = z
  .object({
    newPassword: passwordRule,
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function resetAgentPasswordAction(
  agentId: string,
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") return { error: "Not authorized." };

  const parsed = resetPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const agent = await prisma.user.findUnique({ where: { id: agentId } });
  if (!agent || agent.role !== "SALES_AGENT") return { error: "Agent not found." };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: agentId }, data: { passwordHash: newHash } });

  // Force re-login everywhere with the old password
  await prisma.session.deleteMany({ where: { userId: agentId } });

  await prisma.auditLog.create({
    data: { action: "UPDATED", message: `${admin.name} reset the password for ${agent.name}`, userId: admin.id },
  });

  revalidatePath("/admin/agents");
  return { success: true };
}

export async function unlockAgentAction(agentId: string): Promise<{ error?: string; success?: boolean }> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") return { error: "Not authorized." };

  const agent = await prisma.user.findUnique({ where: { id: agentId } });
  if (!agent) return { error: "Agent not found." };

  await prisma.user.update({
    where: { id: agentId },
    data: { failedLoginAttempts: 0, lockedUntil: null },
  });

  await prisma.auditLog.create({
    data: { action: "UPDATED", message: `${admin.name} unlocked account for ${agent.name}`, userId: admin.id },
  });

  revalidatePath("/admin/agents");
  return { success: true };
}

export async function toggleAgentActiveAction(
  agentId: string,
  makeActive: boolean
): Promise<{ error?: string; success?: boolean }> {
  const admin = await getSession();
  if (!admin || admin.role !== "ADMIN") return { error: "Not authorized." };

  const agent = await prisma.user.findUnique({ where: { id: agentId } });
  if (!agent) return { error: "Agent not found." };

  await prisma.user.update({ where: { id: agentId }, data: { isActive: makeActive } });

  if (!makeActive) {
    // A deactivated agent shouldn't stay logged in on any device
    await prisma.session.deleteMany({ where: { userId: agentId } });
  }

  await prisma.auditLog.create({
    data: {
      action: "UPDATED",
      message: `${admin.name} ${makeActive ? "reactivated" : "deactivated"} ${agent.name}`,
      userId: admin.id,
    },
  });

  revalidatePath("/admin/agents");
  return { success: true };
}
