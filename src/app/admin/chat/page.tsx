"use client";

import { AnimatedAIChat } from "@/components/ui/animated-ai-chat"
import { ChatErrorBoundary } from "@/components/ui/error-boundary"

export default function AdminChatPage() {
  return (
    <ChatErrorBoundary>
      <AnimatedAIChat backHref="/admin" />
    </ChatErrorBoundary>
  );
}
