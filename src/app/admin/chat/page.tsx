"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"
import { AdminThemeSwitcher } from "@/components/admin-theme-switcher"

export default function AdminChatPage() {
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-background">
      <div className="absolute top-6 right-6 z-50">
        <AdminThemeSwitcher />
      </div>
      <AnimatedAIChat backHref="/admin" />
    </div>
  );
}
