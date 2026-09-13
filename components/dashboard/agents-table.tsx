"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, KeyRound, LockOpen, UserX, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditAgentDialog } from "./edit-agent-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { unlockAgentAction, toggleAgentActiveAction } from "@/lib/actions/agents";

type Agent = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  createdAt: string;
  _count: { leadsAssigned: number };
};

export function AgentsTable({ agents }: { agents: Agent[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Sales Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border/100">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="bg-muted/90 hover:bg-muted/50 border-b border-border/99 transition-colors">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Leads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <AgentRow key={agent.id} agent={agent} />
              ))}
              {agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No sales agents yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentRow({ agent }: { agent: Agent }) {
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleUnlock() {
    startTransition(async () => {
      const result = await unlockAgentAction(agent.id);
      if (result.error) toast.error(result.error);
      else toast.success(`${agent.name}'s account has been unlocked.`);
    });
  }

  function handleToggleActive(makeActive: boolean) {
    startTransition(async () => {
      const result = await toggleAgentActiveAction(agent.id, makeActive);
      if (result.error) toast.error(result.error);
      else {
        toast.success(makeActive ? `${agent.name} reactivated.` : `${agent.name} deactivated.`);
        setDeactivateOpen(false);
      }
    });
  }

  return (
    <>
      <TableRow className="hover:bg-[rgba(57,134,249,0.09)] border-b border-border/99 transition-colors">
        <TableCell className="font-medium">{agent.name}</TableCell>
        <TableCell className="text-muted-foreground">{agent.email}</TableCell>
        <TableCell>{agent._count.leadsAssigned}</TableCell>
        <TableCell>
          <div className="flex gap-1.5">
            <Badge
              variant="secondary"
              className={`border-0 font-medium ${agent.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}
            >
              {agent.isActive ? "Active" : "Deactivated"}
            </Badge>
            {agent.isLocked && (
              <Badge variant="secondary" className="border-0 bg-red-100 font-medium text-red-700">
                Locked
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">{new Date(agent.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => { e.preventDefault(); setTimeout(() => setEditOpen(true), 0); }}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" /> Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.preventDefault(); setTimeout(() => setResetOpen(true), 0); }}
                className="flex items-center gap-2"
              >
                <KeyRound className="h-4 w-4" /> Reset Password
              </DropdownMenuItem>
              {agent.isLocked && (
                <DropdownMenuItem onSelect={handleUnlock} className="flex items-center gap-2">
                  <LockOpen className="h-4 w-4" /> Unlock Account
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {agent.isActive ? (
                <DropdownMenuItem
                  onClick={(e) => { e.preventDefault(); setTimeout(() => setDeactivateOpen(true), 0); }}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <UserX className="h-4 w-4" /> Deactivate
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => handleToggleActive(true)} className="flex items-center gap-2 text-emerald-600 focus:text-emerald-600">
                  <UserCheck className="h-4 w-4" /> Reactivate
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <EditAgentDialog open={editOpen} onOpenChange={setEditOpen} agent={agent} />
      <ResetPasswordDialog open={resetOpen} onOpenChange={setResetOpen} agentId={agent.id} agentName={agent.name} />

      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {agent.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They&apos;ll be immediately signed out and won&apos;t be able to log back in until reactivated. Their assigned leads remain unchanged — reassign them separately if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleToggleActive(false)} disabled={isPending} className="bg-red-600 hover:bg-red-700">
              {isPending ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}