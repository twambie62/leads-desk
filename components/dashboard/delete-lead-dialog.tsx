"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { softDeleteLeadAction } from "@/lib/actions/leads";

export function DeleteLeadDialog({
                                   open, onOpenChange, leadId, leadName, onDeleted,
                                 }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await softDeleteLeadAction(leadId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`"${leadName}" was deleted.`);
        onOpenChange(false);
        onDeleted?.();
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{leadName}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the lead from all lists and dashboards immediately. This action can&apos;t be undone from the interface.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}