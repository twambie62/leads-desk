"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditLeadDialog } from "./edit-lead-dialog";
import { DeleteLeadDialog } from "./delete-lead-dialog";

type Lead = {
  id: string; leadName: string; businessName: string | null; phoneNumber: string;
  whatsappNumber: string | null; email: string | null; location: string | null;
  businessType: string | null; productInterested: string | null; source: string;
  assignedAgentId: string | null;
};

export function LeadDetailsActions({
                                     lead, agents, canDelete = true, lockedAgentId, backHref = "/admin/dashboard",
                                   }: {
  lead: Lead;
  agents: { id: string; name: string }[];
  canDelete?: boolean;
  lockedAgentId?: string;
  backHref?: string;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="flex items-center gap-1">
        <Pencil className="h-4 w-4" /> Edit
      </Button>
      {canDelete && (
        <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="flex items-center gap-1">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      )}

      <EditLeadDialog open={editOpen} onOpenChange={setEditOpen} lead={lead} agents={agents} lockedAgentId={lockedAgentId} />
      {canDelete && (
        <DeleteLeadDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          leadId={lead.id}
          leadName={lead.leadName}
          onDeleted={() => router.push(backHref)}
        />
      )}
    </div>
  );
}