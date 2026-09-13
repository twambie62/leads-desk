"use client";

import { useState, useTransition, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationEllipsis, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Users, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { getPaginationRange } from "@/lib/utils/pagination";
import { LeadRowActions } from "./lead-row-actions";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { LeadsFiltersBar, type LeadFiltersState } from "./leads-filters-bar";

const STATUS_VARIANT: Record<string, string> = {
  NEW_LEAD: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  MEETING_SCHEDULED: "bg-purple-100 text-purple-700",
  DISQUALIFIED: "bg-red-100 text-red-700",
  LOST: "bg-red-100 text-red-700",
  NO_RESPONSE: "bg-gray-100 text-gray-700",
};

type LeadRow = {
  id: string;
  leadName: string;
  businessName: string | null;
  phoneNumber: string;
  whatsappNumber: string | null;
  email: string | null;
  location: string | null;
  businessType: string | null;
  productInterested: string | null;
  source: string;
  status: string;
  createdAt: string;
  assignedAgentId: string | null;
  assignedAgent: { name: string } | null;
};

type PaginatedResponse = { leads: LeadRow[]; totalPages: number; page: number; totalCount: number; pageSize: number };

const EMPTY_FILTERS: LeadFiltersState = { search: "", status: "", source: "", assignedAgentId: "", dateFrom: "", dateTo: "" };

export function LeadsTable({
                             initialData, agents, canDelete = true, lockedAgentId, basePath = "/admin",
                             pageSize = 10, showAgentFilter = true, title,  showOutOfLeads=true
                           }: {
  initialData: PaginatedResponse;
  agents: { id: string; name: string }[];
  canDelete?: boolean;
  lockedAgentId?: string;
  basePath?: string;
  pageSize?: number;
  showAgentFilter?: boolean;
  title?: string;
  showOutOfLeads?: boolean;
}) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [filters, setFilters] = useState<LeadFiltersState>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<"createdAt" | "leadName">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function fetchLeads(page: number, overrideFilters?: LeadFiltersState, overrideSort?: { sortBy: string; sortDir: string }) {
    const f = overrideFilters ?? filters;
    const s = overrideSort ?? { sortBy, sortDir };
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    params.set("sortBy", s.sortBy);
    params.set("sortDir", s.sortDir);
    if (f.search) params.set("search", f.search);
    if (f.status) params.set("status", f.status);
    if (f.source) params.set("source", f.source);
    if (f.assignedAgentId) params.set("assignedAgentId", f.assignedAgentId);
    if (f.dateFrom) params.set("dateFrom", f.dateFrom);
    if (f.dateTo) params.set("dateTo", f.dateTo);

    startTransition(async () => {
      const res = await fetch(`/api/leads?${params.toString()}`);
      const json: PaginatedResponse = await res.json();
      setData(json);
      setSelectedIds([]);
    });
  }

  function handleFilterChange(patch: Partial<LeadFiltersState>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Only debounce free-text search; selects/dates apply immediately since they're deliberate clicks
    debounceRef.current = setTimeout(() => fetchLeads(1, next), patch.search !== undefined ? 350 : 0);
  }

  function handleSort(column: "createdAt" | "leadName") {
    const nextDir = sortBy === column && sortDir === "desc" ? "asc" : "desc";
    setSortBy(column);
    setSortDir(nextDir);
    fetchLeads(data.page, filters, { sortBy: column, sortDir: nextDir });
  }

  function refetchCurrentPage() {
    fetchLeads(data.page);
  }

  const allSelected = data.leads.length > 0 && selectedIds.length === data.leads.length;
  function toggleAll() { setSelectedIds(allSelected ? [] : data.leads.map((l) => l.id)); }
  function toggleOne(id: string) { setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])); }

  function SortIcon({ column }: { column: "createdAt" | "leadName" }) {
    if (sortBy !== column) return <ArrowUpDown className="ml-1 h-3 w-3 text-muted-foreground/50" />;
    return sortDir === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  }

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title ?? (canDelete ? "All Leads" : "My Leads")}</CardTitle>
        {canDelete && selectedIds.length > 0 && (
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)} className="flex items-center gap-1">
            <Trash2 className="h-4 w-4" /> Delete {selectedIds.length} selected
          </Button>
        )}
      </CardHeader>
      <CardContent className={isPending ? "opacity-60 transition-opacity min-w-0" : "transition-opacity min-w-0"}>
        <LeadsFiltersBar filters={filters} onChange={handleFilterChange} agents={agents} showAgentFilter={showAgentFilter} />

        <p className="mb-2 text-sm text-muted-foreground">
          {showOutOfLeads && (
            <span>
            Showing {data.leads.length} of {data.totalCount} leads
            </span>
          )}
        </p>

        <div className="overflow-x-auto rounded-lg border border-border/100">
          <Table className="min-w-[950px]">
            <TableHeader className={"px-2 text-left align-middle font-medium whitespace-nowrap border-b border-border/40 ..."}>
              <TableRow className="bg-muted/90 hover:bg-muted/50 border-b border-border/99 transition-colors">
                {canDelete && (
                  <TableHead className="w-10">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                  </TableHead>
                )}
                <TableHead className="cursor-pointer select-none" onClick={() => handleSort("leadName")}>
                  <span className="flex items-center">Lead Name <SortIcon column="leadName" /></span>
                </TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
                  <span className="flex items-center justify-end">Created <SortIcon column="createdAt" /></span>
                </TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.leads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-[rgba(57,134,249,0.09)] data-[state=selected]:bg-muted border-b border-border/99 transition-colors">
                  {canDelete && (
                    <TableCell>
                      <Checkbox checked={selectedIds.includes(lead.id)} onCheckedChange={() => toggleOne(lead.id)} aria-label={`Select ${lead.leadName}`} />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{lead.leadName}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.businessName ?? "—"}</TableCell>
                  <TableCell>{lead.phoneNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{lead.source}</TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_VARIANT[lead.status] ?? ""} border-0 font-medium`} variant="secondary">
                      {lead.status.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{lead.assignedAgent?.name ?? "Unassigned"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <LeadRowActions lead={lead} agents={agents} onChanged={refetchCurrentPage} canDelete={canDelete} lockedAgentId={lockedAgentId} basePath={basePath} />
                  </TableCell>
                </TableRow>
              ))}
              {data.leads.length === 0 && (
                <TableRow className="hover:bg-muted/80 data-[state=selected]:bg-muted border-b border-border/99 transition-colors">
                  <TableCell colSpan={canDelete ? 9 : 8} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p className="text-sm">No leads match these filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem><PaginationPrevious onClick={() => fetchLeads(Math.max(1, data.page - 1))} className="cursor-pointer" /></PaginationItem>
            {getPaginationRange(data.page, data.totalPages).map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}><PaginationEllipsis /></PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === data.page} onClick={() => fetchLeads(p)} className="cursor-pointer">{p}</PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem><PaginationNext onClick={() => fetchLeads(Math.min(data.totalPages, data.page + 1))} className="cursor-pointer" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>

      {canDelete && (
        <BulkDeleteDialog
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          leadIds={selectedIds}
          onDeleted={() => { setSelectedIds([]); refetchCurrentPage(); }}
        />
      )}
    </Card>
  );
}