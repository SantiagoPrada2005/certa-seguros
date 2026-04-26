"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"
import { ChatErrorBoundary } from "@/components/ui/error-boundary"

export default function AdminChatPage() {
  return (
    <ChatErrorBoundary>
      <div className="flex w-full min-h-[100dvh] overflow-hidden bg-background">
        <AnimatedAIChat backHref="/admin" />
      </div>
    </ChatErrorBoundary>
  );
}
