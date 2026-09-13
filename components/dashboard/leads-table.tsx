"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination,PaginationEllipsis, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Users } from "lucide-react";
import { getPaginationRange } from "@/lib/utils/pagination";



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
  source: string;
  status: string;
  createdAt: string;
  assignedAgent: { name: string } | null;
};

type PaginatedResponse = { leads: LeadRow[]; totalPages: number; page: number };

export function LeadsTable({ initialData }: { initialData: PaginatedResponse }) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  function goToPage(page: number) {
    startTransition(async () => {
      const res = await fetch(`/api/leads?page=${page}`);
      const json: PaginatedResponse = await res.json();
      setData(json);
    });
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>All Leads</CardTitle>
      </CardHeader>
      <CardContent className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <div className="overflow-hidden rounded-lg border border-border/100">
          <Table>
            <TableHeader className={"px-2 text-left align-middle font-medium whitespace-nowrap border-b border-border/40 ..."}>
              <TableRow
                className="bg-muted/90 hover:bg-muted/50 border-b border-border/99 transition-colors">
                <TableHead>Lead Name</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.leads.map((lead) => (
                <TableRow  key={lead.id} className="hover:bg-[rgba(57,134,249,0.09)] data-[state=selected]:bg-muted border-b border-border/99 transition-colors">
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
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {data.leads.length === 0 && (
                <TableRow className="hover:bg-muted/80 data-[state=selected]:bg-muted border-b border-border/99 transition-colors">
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Users className="h-8 w-8" />
                      <p className="text-sm">No leads yet.</p>
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
              <PaginationPrevious onClick={() => goToPage(Math.max(1, data.page - 1))} className="cursor-pointer" />
            </PaginationItem>
            {getPaginationRange(data.page, data.totalPages).map((p, i) =>
              p === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink isActive={p === data.page} onClick={() => goToPage(p)} className="cursor-pointer">
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext onClick={() => goToPage(Math.min(data.totalPages, data.page + 1))} className="cursor-pointer" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}