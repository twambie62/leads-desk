"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const STATUSES = ["NEW_LEAD", "CONTACTED", "QUALIFIED", "MEETING_SCHEDULED", "DISQUALIFIED", "LOST", "NO_RESPONSE"];
const SOURCES = ["FACEBOOK", "WHATSAPP", "REFERRAL", "WEBSITE", "PHYSICAL", "OTHER"];

export type LeadFiltersState = {
  search: string;
  status: string;
  source: string;
  assignedAgentId: string;
  dateFrom: string;
  dateTo: string;
};

export function LeadsFiltersBar({
                                  filters, onChange, agents, showAgentFilter,
                                }: {
  filters: LeadFiltersState;
  onChange: (patch: Partial<LeadFiltersState>) => void;
  agents: { id: string; name: string }[];
  showAgentFilter: boolean;
}) {
  const hasActiveFilters =
    filters.search || filters.status || filters.source || filters.assignedAgentId || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-wrap items-end gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, business or phone..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          className="pl-8"
        />
      </div>

      <Select value={filters.status || "all"} onValueChange={(v) => onChange({ status: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replaceAll("_", " ")}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.source || "all"} onValueChange={(v) => onChange({ source: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[140px]"><SelectValue placeholder="Source" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      {showAgentFilter && (
        <Select value={filters.assignedAgentId || "all"} onValueChange={(v) => onChange({ assignedAgentId: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Agent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}

      <div className="flex items-center gap-1">
        <Input type="date" value={filters.dateFrom} onChange={(e) => onChange({ dateFrom: e.target.value })} className="w-[150px]" />
        <span className="text-sm text-muted-foreground">to</span>
        <Input type="date" value={filters.dateTo} onChange={(e) => onChange({ dateTo: e.target.value })} className="w-[150px]" />
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ search: "", status: "", source: "", assignedAgentId: "", dateFrom: "", dateTo: "" })}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" /> Clear
        </Button>
      )}
    </div>
  );
}