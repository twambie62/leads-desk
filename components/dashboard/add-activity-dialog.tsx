"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addActivityAction, type AddActivityState } from "@/lib/actions/activities";

const initialState: AddActivityState = {};
const ACTIVITY_TYPES = ["PHONE_CALL", "WHATSAPP", "GOOGLE_MEET", "PHYSICAL_MEETING", "DEMO", "FOLLOW_UP"];

export function AddActivityDialog({ leadId, basePath }: { leadId: string; basePath: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = addActivityAction.bind(null, leadId, basePath);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [activityType, setActivityType] = useState("PHONE_CALL");

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  const defaultDate = new Date().toISOString().slice(0, 16);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="activityType" value={activityType} />
          <div>
            <Label>Activity Type</Label>
            <Select value={activityType} onValueChange={setActivityType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.replaceAll("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="activityDate">Date &amp; Time</Label>
            <Input id="activityDate" name="activityDate" type="datetime-local" defaultValue={defaultDate} required />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="What happened during this interaction?" />
          </div>
          <div>
            <Label htmlFor="nextFollowUpDate">Next Follow-up Date (optional)</Label>
            <Input id="nextFollowUpDate" name="nextFollowUpDate" type="date" />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}