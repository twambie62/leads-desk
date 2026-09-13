"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { updateLeadStatusAction } from "@/lib/actions/leads";

const PIPELINE_ORDER = ["NEW_LEAD", "CONTACTED", "QUALIFIED", "MEETING_SCHEDULED"];
const ALTERNATIVES = ["DISQUALIFIED", "LOST", "NO_RESPONSE"];
const REASON_REQUIRED = ["DISQUALIFIED", "LOST"];

const STATUS_VARIANT: Record<string, string> = {
  NEW_LEAD: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-amber-100 text-amber-700",
  QUALIFIED: "bg-emerald-100 text-emerald-700",
  MEETING_SCHEDULED: "bg-purple-100 text-purple-700",
  DISQUALIFIED: "bg-red-100 text-red-700",
  LOST: "bg-red-100 text-red-700",
  NO_RESPONSE: "bg-gray-100 text-gray-700",
};

export function LeadStatusControl({ leadId, status }: { leadId: string; status: string }) {
  const [isPending, startTransition] = useTransition();
  const [reasonDialog, setReasonDialog] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const pipelineIndex = PIPELINE_ORDER.indexOf(status);
  const nextStatus = pipelineIndex >= 0 && pipelineIndex < PIPELINE_ORDER.length - 1
    ? PIPELINE_ORDER[pipelineIndex + 1]
    : null;

  function applyStatus(newStatus: string, reasonText?: string) {
    startTransition(async () => {
      const result = await updateLeadStatusAction(leadId, newStatus, reasonText);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Status updated to ${newStatus.replaceAll("_", " ")}`);
        setReasonDialog(null);
        setReason("");
      }
    });
  }

  function handleAlternativeSelect(alt: string) {
    if (REASON_REQUIRED.includes(alt)) {
      setReasonDialog(alt);
    } else {
      applyStatus(alt);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={`${STATUS_VARIANT[status] ?? ""} border-0 font-medium`} variant="secondary">
        {status.replaceAll("_", " ")}
      </Badge>

      {nextStatus && (
        <Button size="sm" onClick={() => applyStatus(nextStatus)} disabled={isPending}>
          Advance to {nextStatus.replaceAll("_", " ")} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" disabled={isPending}>Mark as...</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {ALTERNATIVES.map((alt) => (
            <DropdownMenuItem key={alt} onSelect={() => handleAlternativeSelect(alt)}>
              {alt.replaceAll("_", " ")}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!reasonDialog} onOpenChange={(open) => !open && setReasonDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as {reasonDialog?.replaceAll("_", " ")}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason (required)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button
              onClick={() => reasonDialog && applyStatus(reasonDialog, reason)}
              disabled={isPending || !reason.trim()}
            >
              {isPending ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}