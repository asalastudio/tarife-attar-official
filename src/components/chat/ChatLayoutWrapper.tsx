"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useChat } from "@/context/ChatContext";
import { ChatPanel } from "./ChatPanel";

export function ChatLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isChatOpen } = useChat();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Main Content Area */}
      <motion.div
        initial={false}
        animate={{
          width: mounted && isChatOpen ? "calc(100% - 400px)" : "100%",
        }}
        transition={{ duration: 0.5, ease: [0.85, 0, 0.15, 1] }}
        className="min-h-screen relative overflow-x-hidden"
      >
        {children}
      </motion.div>

      {/* Embedded Concierge Sidebar */}
      <ChatPanel />
    </div>
  );
}
