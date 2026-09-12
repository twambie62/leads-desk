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