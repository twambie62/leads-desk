"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateLeadAction, type CreateLeadState } from "@/lib/actions/leads";

const initialState: CreateLeadState = {};

type EditableLead = {
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

export function EditLeadDialog({
                                 open, onOpenChange, lead, agents, lockedAgentId
                               }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: EditableLead;
  agents: { id: string; name: string }[];
  lockedAgentId: string;
}) {
  const boundAction = updateLeadAction.bind(null, lead.id);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [source, setSource] = useState(lead.source);
  const [assignedAgentId, setAssignedAgentId] = useState(lead.assignedAgentId ?? "");

  useEffect(() => {
    if (state.success) onOpenChange(false);
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="grid grid-cols-2 gap-3">
          <input type="hidden" name="source" value={source} />
          <input type="hidden" name="assignedAgentId" value={assignedAgentId} />

          <div className="col-span-2">
            <Label htmlFor="leadName">Lead Name *</Label>
            <Input id="leadName" name="leadName" defaultValue={lead.leadName} required />
          </div>
          <div>
            <Label htmlFor="businessName">Business Name</Label>
            <Input id="businessName" name="businessName" defaultValue={lead.businessName ?? ""} />
          </div>
          <div>
            <Label htmlFor="businessType">Business Type</Label>
            <Input id="businessType" name="businessType" defaultValue={lead.businessType ?? ""} />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input id="phoneNumber" name="phoneNumber" defaultValue={lead.phoneNumber} required />
          </div>
          <div>
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input id="whatsappNumber" name="whatsappNumber" defaultValue={lead.whatsappNumber ?? ""} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={lead.email ?? ""} />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={lead.location ?? ""} />
          </div>
          <div className="col-span-2">
            <Label htmlFor="productInterested">Product Interested In</Label>
            <Input id="productInterested" name="productInterested" defaultValue={lead.productInterested ?? ""} />
          </div>
          <div>
            <Label>Lead Source *</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["FACEBOOK", "WHATSAPP", "REFERRAL", "WEBSITE", "PHYSICAL", "OTHER"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            {lockedAgentId ? (
              <input type="hidden" name="assignedAgentId" value={lockedAgentId} />
            ) : (
              <div>
                <Label>Assign To</Label>
                <input type="hidden" name="assignedAgentId" value={assignedAgentId} />
                <Select value={assignedAgentId} onValueChange={setAssignedAgentId}>
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    {agents.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {state.error && <p className="col-span-2 text-sm text-red-600">{state.error}</p>}

          <DialogFooter className="col-span-2 mt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}