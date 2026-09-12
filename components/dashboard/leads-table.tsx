import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginatedLeads } from "@/lib/queries/dashboard";
import {Users} from "lucide-react";

const STATUS_VARIANT: Record<string, string> = {
  NEW_LEAD: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  MEETING_SCHEDULED: "bg-purple-100 text-purple-700",
  DISQUALIFIED: "bg-red-100 text-red-700",
  LOST: "bg-red-100 text-red-700",
  NO_RESPONSE: "bg-gray-100 text-gray-700",
};

export async function LeadsTable({ page }: { page: number }) {
  const { leads, totalPages } = await getPaginatedLeads(page);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
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
            {leads.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-muted/30">
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
                  {lead.createdAt.toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8" />
                    <p className="text-sm">No leads yet — click (Add Lead) to create your first one.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={`/admin/dashboard?page=${Math.max(1, page - 1)}`} />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink href={`/admin/dashboard?page=${p}`} isActive={p === page}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={`/admin/dashboard?page=${Math.min(totalPages, page + 1)}`} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  );
}