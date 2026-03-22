"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/context/ChatContext";
import { Sparkles, X, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";

export function ChatPanel() {
  const { isChatOpen, toggleChat, closeChat } = useChat();
  const [message, setMessage] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);

  // 1) Define typical strings for Eleanor (You can rename these in your Convex code)
  const createTicket = useMutation("tickets:createTicket" as any);
  const addMessage = useMutation("tickets:addMessage" as any);
  const serverMessages = useQuery("tickets:getMessages" as any, ticketId ? { ticketId } : "skip");

  // Local fallback state until server resolves
  const [localMessages, setLocalMessages] = useState<{role: "user" | "assistant", content: string}[]>([
    {
      role: "assistant",
      content: "Welcome to the Atlas. I am your guide—here to answer questions about specific formulations, assist with orders, or navigate the new territories.\n\nHow may I direct your journey today?"
    }
  ]);

  const [isSending, setIsSending] = useState(false);

  // Merge the server states and local state in real usage
  const displayMessages = serverMessages && Array.isArray(serverMessages) && serverMessages.length > 0 
    ? serverMessages // map to local representation if structural diff exists
    : localMessages;

  const handleSend = async () => {
    if (!message.trim()) return;
    const content = message.trim();
    
    // Optimistic UI update
    setLocalMessages((prev) => [...prev, { role: "user", content }]);
    setMessage("");
    setIsSending(true);

    try {
      let activeTicketId = ticketId;
      
      // If we don't have a ticket yet, create one
      if (!activeTicketId) {
        const result = await createTicket({
          brandId: "tarifeattar",
          channel: "chat",
          subject: "Website Widget Customer"
        });
        activeTicketId = typeof result === "object" ? result._id : result;
        setTicketId(activeTicketId);
      }

      // Add the message
      await addMessage({
        brandId: "tarifeattar",
        ticketId: activeTicketId,
        senderType: "customer",
        senderName: "Website Visitor",
        content,
        channel: "chat"
      });

    } catch (e) {
      console.error("Failed to push to Eleanor:", e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ x: isChatOpen ? 0 : "100%" }}
      transition={{ duration: 0.5, ease: [0.85, 0, 0.15, 1] }}
      className="fixed top-0 right-0 bottom-0 w-[400px] bg-theme-alabaster border-l border-theme-charcoal/10 shadow-2xl z-50 flex flex-col"
    >
      {/* ─── The Protruding Tab (Visible when closed) ─── */}
      <motion.button
        animate={{ opacity: isChatOpen ? 0 : 1, x: isChatOpen ? 20 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={toggleChat}
        className={`absolute top-1/2 -translate-y-1/2 -left-12 flex flex-col items-center justify-center w-12 py-6 bg-theme-charcoal text-theme-alabaster rounded-l-md hover:w-14 hover:-left-14 transition-all shadow-xl group border border-r-0 border-theme-charcoal/20 ${
          isChatOpen ? "pointer-events-none" : "cursor-pointer"
        }`}
      >
        <span className="[writing-mode:vertical-lr] rotate-180 font-mono text-[10px] uppercase tracking-[0.4em] font-bold group-hover:tracking-[0.6em] transition-all">
          Concierge
        </span>
      </motion.button>

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between p-6 border-b border-theme-charcoal/5 bg-white/40 backdrop-blur-md shrink-0">
        <div>
          <h2 className="text-2xl font-serif italic tracking-wide text-theme-charcoal flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-theme-gold" />
            The Guide
          </h2>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-theme-charcoal/50 mt-1">
            Tarife Attar Concierge
          </p>
        </div>
        <button
          onClick={closeChat}
          className="p-2 hover:bg-theme-charcoal/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5 opacity-60 hover:opacity-100" />
        </button>
      </div>

      {/* ─── Chat Stream ─── */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {displayMessages.map((msg: any, i: number) => (
          <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" ? (
              <div className="w-8 h-8 rounded-full bg-theme-charcoal text-theme-gold flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-theme-charcoal/10 text-theme-charcoal flex items-center justify-center shrink-0 font-serif text-xs">
                U
              </div>
            )}
            <div
              className={`border border-theme-charcoal/10 shadow-sm text-sm font-serif leading-relaxed text-theme-charcoal/90 p-4 ${
                msg.role === "assistant"
                  ? "bg-white rounded-2xl rounded-tl-sm"
                  : "bg-theme-alabaster rounded-2xl rounded-tr-sm"
              }`}
            >
              {msg.content.split('\n').map((line: string, j: number) => (
                <React.Fragment key={j}>
                  {line}
                  {j < msg.content.split('\n').length - 1 && <br/>}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Input Area ─── */}
      <div className="p-4 border-t border-theme-charcoal/10 bg-white/60 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask The Guide..."
            className="w-full bg-white border border-theme-charcoal/20 px-4 py-3.5 pr-12 font-serif text-sm placeholder:text-theme-charcoal/40 focus:outline-none focus:border-theme-gold focus:ring-1 focus:ring-theme-gold/30 rounded-full shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim() && !isSending) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-theme-charcoal text-theme-gold rounded-full flex items-center justify-center hover:bg-theme-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest text-theme-charcoal/40">
          <MessageSquare className="w-3 h-3" />
          Powered by Eleanor
        </div>
      </div>
    </motion.div>
  );
}
