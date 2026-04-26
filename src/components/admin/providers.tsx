"use client";

import { ReactNode } from "react";
import { AIProvider } from "@/components/providers/ai-provider";

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <AIProvider>
      {children}
    </AIProvider>
  );
}