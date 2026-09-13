import "server-only";
import { prisma } from "@/lib/prisma";

export async function getAgentsList() {
  const agents = await prisma.user.findMany({
    where: { role: "SALES_AGENT" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      lockedUntil: true,
      failedLoginAttempts: true,
      createdAt: true,
      _count: { select: { leadsAssigned: true } },
    },
  });

  return agents.map((a) => ({
    ...a,
    isLocked: a.lockedUntil ? a.lockedUntil > new Date() : false,
  }));
}