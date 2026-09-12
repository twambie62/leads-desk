"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportButton() {
  return (
    <Button variant="outline" asChild>
      <a
        href="/api/leads/export"
        download
        className="flex items-center gap-2 px-1"
      >
        <Download className="h-4 w-4" />
        Export
      </a>
    </Button>
  );
}