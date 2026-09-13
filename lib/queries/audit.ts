import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma, AuditAction } from "@/src/generated/prisma";

const PAGE_SIZE = 20;

export type AuditLogFilters = {
  page: number;
  action?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getAuditLogs(filters: AuditLogFilters) {
  const { page, action, userId, search, dateFrom, dateTo } = filters;
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.AuditLogWhereInput = {};

  if (action) where.action = action as AuditAction;
  if (userId) where.userId = userId;
  if (search) where.message = { contains: search, mode: "insensitive" };

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(new Date(dateTo).setHours(23, 59, 59, 999)) } : {}),
    };
  }

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, role: true } },
        lead: { select: { id: true, leadName: true } },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    page,
  };
}

export async function getAuditLogUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}