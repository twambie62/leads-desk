"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { bulkSoftDeleteLeadsAction } from "@/lib/actions/leads";

export function BulkDeleteDialog({
                                   open, onOpenChange, leadIds, onDeleted,
                                 }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadIds: string[];
  onDeleted?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await bulkSoftDeleteLeadsAction(leadIds);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${leadIds.length} lead${leadIds.length > 1 ? "s" : ""} deleted.`);
        onOpenChange(false);
        onDeleted?.();
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {leadIds.length} selected leads?</AlertDialogTitle>
          <AlertDialogDescription>
            These leads will be removed from all lists and dashboards immediately. This action can&apos;t be undone from the interface.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
            {isPending ? "Deleting..." : `Delete ${leadIds.length}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}