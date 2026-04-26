"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"
import { AdminThemeSwitcher } from "@/components/admin-theme-switcher"

export default function AdminChatPage() {
  return (
    <div className="flex w-full min-h-[100dvh] overflow-hidden bg-background">
      <AnimatedAIChat backHref="/admin" />
    </div>
  );
}
