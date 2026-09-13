"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditLeadDialog } from "./edit-lead-dialog";
import { DeleteLeadDialog } from "./delete-lead-dialog";

type Lead = {
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
  assignedAgentId: string | null;
};

export function LeadRowActions({
                                 lead, agents, onChanged,
                               }: {
  lead: Lead;
  agents: { id: string; name: string }[];
  onChanged?: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/leads/${lead.id}`} className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={()=>{
              setEditOpen(true);
            }}
            onSelect={(e) => {

              e.preventDefault();
              setTimeout(() => {
                document.body.style.pointerEvents = "";

                setEditOpen(true);
              }, 0);


            }}
            className="flex items-center gap-2"
          >
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={()=>{
              setDeleteOpen(true);
            }}
            onSelect={(e) => {
              e.preventDefault();
              setTimeout(() => setDeleteOpen(true), 0);
            }}
            className="flex items-center gap-2 text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditLeadDialog open={editOpen} onOpenChange={setEditOpen} lead={lead} agents={agents} />
      <DeleteLeadDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        leadId={lead.id}
        leadName={lead.leadName}
        onDeleted={onChanged}
      />
    </>
  );
}