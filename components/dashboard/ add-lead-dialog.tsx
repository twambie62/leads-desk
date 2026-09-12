"use client";

import { useActionState, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createLeadAction, type CreateLeadState } from "@/lib/actions/leads";

const initialState: CreateLeadState = {};

export function AddLeadDialog({ agents }: { agents: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createLeadAction, initialState);

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label htmlFor="leadName">Lead Name *</Label>
            <Input id="leadName" name="leadName" required />
          </div>
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" name="businessName" />
          </div>
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input id="businessType" name="businessType" />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input id="phoneNumber" name="phoneNumber" required />
          </div>
          <div>
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input id="whatsappNumber" name="whatsappNumber" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" />
          </div>
          <div className="col-span-2">
            <Label htmlFor="productInterested">Product Interested In</Label>
            <Input id="productInterested" name="productInterested" />
          </div>
          <div>
            <Label>Lead Source *</Label>
            <Select name="source" required>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                {["FACEBOOK", "WHATSAPP", "REFERRAL", "WEBSITE", "PHYSICAL", "OTHER"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Assign To</Label>
            <Select name="assignedAgentId">
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {state.error && (
            <p className="col-span-2 text-sm text-red-600">{state.error}</p>
          )}

          <DialogFooter className="col-span-2 mt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}