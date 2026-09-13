"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const activitySchema = z.object({
  activityType: z.enum(["PHONE_CALL", "WHATSAPP", "GOOGLE_MEET", "PHYSICAL_MEETING", "DEMO", "FOLLOW_UP"]),
  activityDate: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
});

export type AddActivityState = { error?: string; success?: boolean };

export async function addActivityAction(
  leadId: string,
  basePath: string,
  _prevState: AddActivityState,
  formData: FormData
): Promise<AddActivityState> {
  const user = await getSession();
  if (!user) return { error: "Not authenticated." };

  const lead = await prisma.lead.findFirst({ where: { id: leadId, deletedAt: null } });
  if (!lead) return { error: "Lead not found." };
  if (user.role === "SALES_AGENT" && lead.assignedAgentId !== user.id) {
    return { error: "You don't have permission to log activity for this lead." };
  }

  const parsed = activitySchema.safeParse({
    activityType: formData.get("activityType"),
    activityDate: formData.get("activityDate"),
    notes: formData.get("notes") || undefined,
    nextFollowUpDate: formData.get("nextFollowUpDate") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.leadActivity.create({
    data: {
      leadId,
      agentId: user.id,
      activityType: parsed.data.activityType,
      activityDate: new Date(parsed.data.activityDate),
      notes: parsed.data.notes,
      nextFollowUpDate: parsed.data.nextFollowUpDate ? new Date(parsed.data.nextFollowUpDate) : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATED",
      message: `${user.name} logged a ${parsed.data.activityType.replaceAll("_", " ")} activity`,
      userId: user.id,
      leadId,
    },
  });

  revalidatePath(`${basePath}/leads/${leadId}`);
  return { success: true };
}