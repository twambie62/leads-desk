"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const leadSchema = z.object({
  leadName: z.string().min(1, "Lead name is required"),
  businessName: z.string().optional(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  whatsappNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  location: z.string().optional(),
  businessType: z.string().optional(),
  productInterested: z.string().optional(),
  source: z.enum(["FACEBOOK", "WHATSAPP", "REFERRAL", "WEBSITE", "PHYSICAL", "OTHER"]),
  assignedAgentId: z.string().optional(),
});

export type CreateLeadState = { error?: string; success?: boolean };

export async function createLeadAction(
  _prevState: CreateLeadState,
  formData: FormData
): Promise<CreateLeadState> {
  const user = await getSession();
  if (!user) return { error: "Not authenticated." };

  const parsed = leadSchema.safeParse({
    leadName: formData.get("leadName"),
    businessName: formData.get("businessName") || undefined,
    phoneNumber: formData.get("phoneNumber"),
    whatsappNumber: formData.get("whatsappNumber") || undefined,
    email: formData.get("email") || "",
    location: formData.get("location") || undefined,
    businessType: formData.get("businessType") || undefined,
    productInterested: formData.get("productInterested") || undefined,
    source: formData.get("source"),
    assignedAgentId: formData.get("assignedAgentId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const lead = await prisma.lead.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || undefined,
      createdById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATED",
      message: `${user.name} created lead "${lead.leadName}"`,
      userId: user.id,
      leadId: lead.id,
    },
  });

  revalidatePath("/admin/dashboard");
  return { success: true };
}

// add below your existing createLeadAction

export async function updateLeadAction(
  leadId: string,
  _prevState: CreateLeadState,
  formData: FormData
): Promise<CreateLeadState> {
  const user = await getSession();
  if (!user) return { error: "Not authenticated." };

  const parsed = leadSchema.safeParse({
    leadName: formData.get("leadName"),
    businessName: formData.get("businessName") || undefined,
    phoneNumber: formData.get("phoneNumber"),
    whatsappNumber: formData.get("whatsappNumber") || undefined,
    email: formData.get("email") || "",
    location: formData.get("location") || undefined,
    businessType: formData.get("businessType") || undefined,
    productInterested: formData.get("productInterested") || undefined,
    source: formData.get("source"),
    assignedAgentId: formData.get("assignedAgentId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.lead.findFirst({ where: { id: leadId, deletedAt: null } });
  if (!existing) return { error: "Lead not found." };

  await prisma.lead.update({
    where: { id: leadId },
    data: { ...parsed.data, email: parsed.data.email || undefined },
  });

  const reassigned = existing.assignedAgentId !== (parsed.data.assignedAgentId || null);
  await prisma.auditLog.create({
    data: {
      action: reassigned ? "ASSIGNED" : "UPDATED",
      message: reassigned
        ? `${user.name} reassigned lead "${parsed.data.leadName}"`
        : `${user.name} updated lead "${parsed.data.leadName}"`,
      userId: user.id,
      leadId,
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/leads/${leadId}`);
  return { success: true };
}

const PIPELINE_ORDER = ["NEW_LEAD", "CONTACTED", "QUALIFIED", "MEETING_SCHEDULED"] as const;
const REASON_REQUIRED = ["DISQUALIFIED", "LOST"];

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string,
  reason?: string
): Promise<{ error?: string; success?: boolean }> {
  const user = await getSession();
  if (!user) return { error: "Not authenticated." };

  const lead = await prisma.lead.findFirst({ where: { id: leadId, deletedAt: null } });
  if (!lead) return { error: "Lead not found." };

  if (REASON_REQUIRED.includes(newStatus) && !reason?.trim()) {
    return { error: "A reason is required for this outcome." };
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: newStatus as never,
      disqualifiedReason: REASON_REQUIRED.includes(newStatus) ? reason : lead.disqualifiedReason,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "STATUS_CHANGED",
      message: `${user.name} changed status from ${lead.status} to ${newStatus}${reason ? ` — ${reason}` : ""}`,
      userId: user.id,
      leadId,
      metadata: { from: lead.status, to: newStatus },
    },
  });

  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/leads/${leadId}`);
  return { success: true };
}

export async function softDeleteLeadAction(leadId: string): Promise<{ error?: string; success?: boolean }> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") return { error: "Not authorized." };

  await prisma.lead.update({ where: { id: leadId }, data: { deletedAt: new Date() } });

  await prisma.auditLog.create({
    data: { action: "DELETED", message: `${user.name} deleted a lead`, userId: user.id, leadId },
  });

  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function bulkSoftDeleteLeadsAction(leadIds: string[]): Promise<{ error?: string; success?: boolean }> {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") return { error: "Not authorized." };
  if (leadIds.length === 0) return { error: "No leads selected." };

  await prisma.lead.updateMany({ where: { id: { in: leadIds } }, data: { deletedAt: new Date() } });

  await prisma.auditLog.createMany({
    data: leadIds.map((id) => ({
      action: "DELETED" as const,
      message: `${user.name} bulk-deleted a lead`,
      userId: user.id,
      leadId: id,
    })),
  });

  revalidatePath("/admin/dashboard");
  return { success: true };
}