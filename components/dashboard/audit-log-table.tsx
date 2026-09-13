"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, X, FileClock } from "lucide-react";
import { getPaginationRange } from "@/lib/utils/pagination";

const ACTIONS = ["CREATED", "UPDATED", "STATUS_CHANGED", "ASSIGNED", "DELETED", "LOGIN", "LOGIN_FAILED", "LOCKED"];

const ACTION_VARIANT: Record<string, string> = {
  CREATED: "bg-blue-100 text-blue-700",
  UPDATED: "bg-amber-100 text-amber-700",
  STATUS_CHANGED: "bg-purple-100 text-purple-700",
  ASSIGNED: "bg-indigo-100 text-indigo-700",
  DELETED: "bg-red-100 text-red-700",
  LOGIN: "bg-emerald-100 text-emerald-700",
  LOGIN_FAILED: "bg-orange-100 text-orange-700",
  LOCKED: "bg-red-100 text-red-700",
};

type AuditLogRow = {
  id: string;
  action: string;
  message: string;
  createdAt: string;
  user: { name: string; role: string } | null;
  lead: { id: string; leadName: string } | null;
};

type PaginatedResponse = { logs: AuditLogRow[]; totalPages: number; page: number; totalCount: number };

type FiltersState = { action: string; userId: string; search: string; dateFrom: string; dateTo: string };
const EMPTY_FILTERS: FiltersState = { action: "", userId: "", search: "", dateFrom: "", dateTo: "" };

export function AuditLogTable({
                                initialData, users,
                              }: {
  initialData: PaginatedResponse;
  users: { id: string; name: string }[];
}) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<FiltersState>(EMPTY_FILTERS);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fetchLogs(page: number, overrideFilters?: FiltersState) {
    const f = overrideFilters ?? filters;
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (f.action) params.set("action", f.action);
    if (f.userId) params.set("userId", f.userId);
    if (f.search) params.set("search", f.search);
    if (f.dateFrom) params.set("dateFrom", f.dateFrom);
    if (f.dateTo) params.set("dateTo", f.dateTo);

    startTransition(async () => {
      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const json: PaginatedResponse = await res.json();
      setData(json);
    });
  }

  function handleFilterChange(patch: Partial<FiltersState>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchLogs(1, next), patch.search !== undefined ? 350 : 0);
  }

  const hasActiveFilters = filters.action || filters.userId || filters.search || filters.dateFrom || filters.dateTo;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>System Activity Log</CardTitle>
      </CardHeader>
      <CardContent className={isPending ? "opacity-60 transition-opacity min-w-0" : "transition-opacity min-w-0"}>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="pl-8 max-w-[420px]"
            />
          </div>

          <Select value={filters.action || "all"} onValueChange={(v) => handleFilterChange({ action: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a.replaceAll("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.userId || "all"} onValueChange={(v) => handleFilterChange({ userId: v === "all" ? "" : v })}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="User" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1">
            <Input type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange({ dateFrom: e.target.value })} className="w-[150px]" />
            <span className="text-sm text-muted-foreground">to</span>
            <Input type="date" value={filters.dateTo} onChange={(e) => handleFilterChange({ dateTo: e.target.value })} className="w-[150px]" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => handleFilterChange({ action: "", userId: "", search: "", dateFrom: "", dateTo: "" })}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" /> Clear
            </button>
          )}
        </div>

        <p className="mb-2 text-sm text-muted-foreground">
          Showing {data.logs.length} of {data.totalCount} entries
        </p>

        <div className="overflow-x-auto rounded-lg border border-border/100">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-muted/90 hover:bg-muted/50 border-b border-border/99 transition-colors">
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Related Lead</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.map((log) => (
                <TableRow key={log.id} className="border-b border-border/99 transition-colors hover:bg-muted/30">
                  <TableCell>
                    <Badge className={`${ACTION_VARIANT[log.action] ?? ""} border-0 font-medium`} variant="secondary">
                      {log.action.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[320px] truncate text-sm">{log.message}</TableCell>
                  <TableCell className="text-muted-foreground">{log.user?.name ?? "System"}</TableCell>
                  <TableCell>
                    {log.lead ? (
                      <Link href={`/admin/leads/${log.lead.id}`} className="text-primary hover:underline">
                        {log.lead.leadName}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {data.logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <FileClock className="h-8 w-8" />
                      <p className="text-sm">No activity matches these filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => fetchLogs(Math.max(1, data.page - 1))} className="cursor-pointer" />
            </PaginationItem>
            {getPaginationRange(data.page, data.totalPages).map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === data.page} onClick={() => fetchLogs(p)} className="cursor-pointer">{p}</PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext onClick={() => fetchLogs(Math.min(data.totalPages, data.page + 1))} className="cursor-pointer" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}