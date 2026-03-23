"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/context/ChatContext";
import { Sparkle, X, ChatCircle, ArrowRight, CircleNotch, Compass, Drop, Palette, Package, ArrowsClockwise } from "@phosphor-icons/react";

const QUICK_CHIPS = [
  {
    label: "Help me find a scent",
    message: "I'm looking for a fragrance but I'm not sure where to start. Can you help me find something based on what I like?",
    icon: Compass,
  },
  {
    label: "What are the territories?",
    message: "Can you explain the four territories and what kind of scents are in each one?",
    icon: Palette,
  },
  {
    label: "How do I apply perfume oil?",
    message: "How should I apply your perfume oils for the best experience?",
    icon: Drop,
  },
  {
    label: "Shipping & returns",
    message: "What are your shipping options and return policy?",
    icon: Package,
  },
  {
    label: "Names changed — find mine",
    message: "I used to buy from you but the names have changed. Can you help me find my old favorite fragrance under its new name?",
    icon: ArrowsClockwise,
  },
];

const WELCOME_MESSAGE = `Welcome. I am your guide through the Tarife Attar archive — a living collection of rare and artisan perfume oils organized by territory and memory.

I can help you discover a fragrance, navigate the new Atlas names, answer questions about your order, or explain how our oils are crafted.

Where shall we begin?`;

export function ChatPanel() {
  const { isChatOpen, toggleChat, closeChat } = useChat();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [localMessages, setLocalMessages] = useState<{role: "user" | "assistant", content: string}[]>([
    { role: "assistant", content: WELCOME_MESSAGE }
  ]);

  const [isSending, setIsSending] = useState(false);
  const [chipsUsed, setChipsUsed] = useState(false);

  const showChips = !chipsUsed && localMessages.length === 1;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
  }, [isChatOpen]);

  const handleSend = async (content?: string) => {
    const text = (content || message).trim();
    if (!text) return;

    setLocalMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessage("");
    setChipsUsed(true);
    setIsSending(true);
    scrollToBottom();

    try {
      const currentMessages = [...localMessages, { role: "user" as const, content: text }];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No reader available');

      setLocalMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      scrollToBottom();

      let assistantMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        assistantMessage += chunk;

        setLocalMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = assistantMessage;
          return updated;
        });
        scrollToBottom();
      }

    } catch (e) {
      console.error("Chat error:", e);
      setLocalMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm momentarily unavailable. Please try again in a moment." }
      ]);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ x: isChatOpen ? 0 : "100%" }}
      transition={{ duration: 0.5, ease: [0.85, 0, 0.15, 1] }}
      className="fixed top-0 right-0 bottom-0 w-[400px] bg-theme-alabaster border-l border-theme-charcoal/10 shadow-2xl z-50 flex flex-col"
    >
      {/* ─── Protruding Tab ─── */}
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
            <Sparkle weight="thin" className="w-4 h-4 text-theme-gold" />
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
          <X weight="thin" className="w-5 h-5 opacity-60 hover:opacity-100" />
        </button>
      </div>

      {/* ─── Chat Stream ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
        {localMessages.map((msg: any, i: number) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i === 0 ? 0.2 : 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {msg.role === "assistant" ? (
              <div className="w-7 h-7 rounded-full bg-theme-charcoal text-theme-gold flex items-center justify-center shrink-0 mt-1">
                <Sparkle weight="thin" className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-theme-charcoal/10 text-theme-charcoal flex items-center justify-center shrink-0 font-serif text-[10px] mt-1">
                You
              </div>
            )}
            <div
              className={`text-[13px] font-serif leading-relaxed text-theme-charcoal/90 px-4 py-3 max-w-[85%] ${
                msg.role === "assistant"
                  ? "bg-white border border-theme-charcoal/8 rounded-2xl rounded-tl-sm shadow-sm"
                  : "bg-theme-charcoal/[0.04] border border-theme-charcoal/8 rounded-2xl rounded-tr-sm"
              }`}
            >
              {msg.content ? msg.content.split('\n').map((line: string, j: number) => (
                <React.Fragment key={j}>
                  {line}
                  {j < msg.content.split('\n').length - 1 && <br/>}
                </React.Fragment>
              )) : (
                <span className="flex items-center gap-2 text-theme-charcoal/40 italic text-xs">
                  <CircleNotch weight="thin" className="w-3 h-3 animate-spin" />
                  Composing...
                </span>
              )}
            </div>
          </motion.div>
        ))}

        {/* ─── Quick-Action Chips ─── */}
        <AnimatePresence>
          {showChips && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-2 flex flex-col gap-2"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-theme-charcoal/35 mb-1">
                Common starting points
              </p>
              {QUICK_CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.label}
                    onClick={() => handleSend(chip.message)}
                    disabled={isSending}
                    className="group flex items-center gap-3 text-left px-4 py-3 bg-white border border-theme-charcoal/8 rounded-xl hover:border-theme-gold/40 hover:shadow-sm transition-all duration-300 disabled:opacity-50"
                  >
                    <span className="w-6 h-6 rounded-full bg-theme-charcoal/[0.04] flex items-center justify-center shrink-0 group-hover:bg-theme-gold/10 transition-colors">
                      <Icon weight="thin" className="w-3.5 h-3.5 text-theme-charcoal/50 group-hover:text-theme-gold transition-colors" />
                    </span>
                    <span className="font-serif text-[12px] text-theme-charcoal/70 group-hover:text-theme-charcoal transition-colors">
                      {chip.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing indicator when waiting for first chunk */}
        {isSending && localMessages[localMessages.length - 1]?.role === "user" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-7 h-7 rounded-full bg-theme-charcoal text-theme-gold flex items-center justify-center shrink-0">
              <Sparkle weight="thin" className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-theme-charcoal/8 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-theme-charcoal/30 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-theme-charcoal/30 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-theme-charcoal/30 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── Input Area ─── */}
      <div className="p-4 border-t border-theme-charcoal/10 bg-white/60 shrink-0">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about scents, orders, or anything..."
            className="w-full bg-white border border-theme-charcoal/20 px-4 py-3.5 pr-12 font-serif text-sm placeholder:text-theme-charcoal/40 focus:outline-none focus:border-theme-gold focus:ring-1 focus:ring-theme-gold/30 rounded-full shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim() && !isSending) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isSending || !message.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-theme-charcoal text-theme-gold rounded-full flex items-center justify-center hover:bg-theme-charcoal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <CircleNotch weight="thin" className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight weight="thin" className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-widest text-theme-charcoal/40">
          <ChatCircle weight="thin" className="w-3 h-3" />
          Powered by Eleanor
        </div>
      </div>
    </motion.div>
  );
}
