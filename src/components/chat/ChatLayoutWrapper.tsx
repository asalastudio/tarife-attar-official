"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useChat } from "@/context/ChatContext";
import { ChatPanel } from "./ChatPanel";

export function ChatLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isChatOpen } = useChat();
  const [mounted, setMounted] = useState(false);
  // The concierge docks beside the page on desktop; on phones it covers the
  // page full-width, so the page keeps its width underneath.
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMounted(true);
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="relative w-full min-h-screen">
      {/* Main Content Area */}
      <motion.div
        initial={false}
        animate={{
          width: mounted && isChatOpen && isDesktop ? "calc(100% - 400px)" : "100%",
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
