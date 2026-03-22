"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronDown, Search, Sparkles, BookOpen } from "lucide-react";
import { GlobalFooter } from "@/components/navigation";
import { useQuery } from "convex/react";
import React from "react";

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.08 * index }}
      className="border-b border-theme-charcoal/5"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 md:py-8 text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <span
            className={`transition-colors duration-300 ${
              isOpen ? "text-theme-gold" : "text-theme-industrial"
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </span>
          <h2
            className={`text-xl md:text-2xl font-serif italic tracking-tight transition-colors duration-300 ${
              isOpen ? "text-theme-charcoal" : "text-theme-charcoal/70"
            }`}
          >
            {question}
          </h2>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.4, ease: [0.85, 0, 0.15, 1] }}
          className={`transition-colors duration-300 ${
            isOpen ? "text-theme-gold" : "text-theme-industrial"
          }`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.85, 0, 0.15, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-8 md:pl-10 pb-8 pr-4 font-serif text-theme-charcoal/90 leading-relaxed text-lg whitespace-pre-wrap">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HelpDeskPage() {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // -> LIVE QUERY (Uncomment this once you build the 'knowledgeBase:list' function in Eleanor!)
  // const articles = useQuery("knowledgeBase:list" as any, { brandId: "tarifeattar" });

  // -> MOCK DATA (Temporary, so you can see the gorgeous UI instead of an error boundary!)
  const articles = [
    {
      _id: "m1",
      question: "Are your perfume oils cruelty-free?",
      answer: "Yes. All Tarife Attar fragrances are 100% cruelty-free and strictly sourced. We never test on animals, nor do we work with suppliers who do."
    },
    {
      _id: "m2",
      question: "How long does a 6ml bottle last?",
      answer: "Because our formulations are highly concentrated pure oils (meaning no alcohol fillers evaporate away), a 6ml bottle typically lasts 3–6 months with daily application. You only need a tiny drop per use."
    }
  ];

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Safe cast since we don't have schema types natively exported to this branch
  const dynamicArticles: any[] = Array.isArray(articles) ? articles : [];

  const filteredArticles = dynamicArticles.filter(
    (a) =>
      a.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Return
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] opacity-40 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-theme-gold" /> Protocol: Elennor
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-24 py-20 pb-32">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-4">
              Knowledge Base
            </h1>
            <p className="text-sm font-mono uppercase tracking-[0.3em] opacity-60 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-theme-gold" />
              Living Archive · Powered by Eleanor
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative mb-12"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              placeholder="Search specific formulations, ingredients, or policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-theme-charcoal/10 pl-12 pr-4 py-4 font-serif text-lg placeholder:text-theme-charcoal/40 focus:outline-none focus:border-theme-gold focus:ring-1 focus:ring-theme-gold/30 rounded-sm shadow-sm transition-all"
            />
          </motion.div>

          {/* Live Dynamic Accordion List */}
          <div className="border-t border-theme-charcoal/5 min-h-[300px]">
            {articles === undefined ? (
              // Loading State while fetching from Convex
              <div className="py-20 text-center flex flex-col items-center justify-center opacity-50 animate-pulse">
                <Sparkles className="w-6 h-6 mb-4 text-theme-gold" />
                <p className="font-mono text-xs uppercase tracking-widest text-theme-charcoal">Consulting Elennor...</p>
              </div>
            ) : dynamicArticles.length === 0 ? (
              // Empty State before any articles are generated
              <div className="py-20 text-center flex flex-col items-center justify-center opacity-60">
                <BookOpen className="w-10 h-10 mb-4 opacity-20" />
                <p className="font-serif text-xl italic mb-2">The archive is currently awaiting new inquiries.</p>
                <p className="text-sm font-mono opacity-60 uppercase tracking-widest max-w-sm leading-relaxed mx-auto">
                  As our concierge answers novel questions, this repository will autonomously populate. Use the sidecar to ask Eleanor a question.
                </p>
              </div>
            ) : filteredArticles.length > 0 ? (
              // Successful Result
              filteredArticles.map((article, index) => (
                <AccordionItem
                  key={article._id || index}
                  question={article.question}
                  answer={article.answer}
                  isOpen={openSections.has(article._id || String(index))}
                  onToggle={() => toggleSection(article._id || String(index))}
                  index={index}
                />
              ))
            ) : (
              // Nothing found through filter search
              <div className="py-20 text-center flex flex-col items-center justify-center opacity-60">
                <p className="font-serif text-2xl italic mb-2">No records found contextually.</p>
                <p className="text-sm font-mono opacity-60 uppercase tracking-widest">Adjust your search parameters.</p>
              </div>
            )}
          </div>
          
          {/* Fallback to static FAQ guidance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-20 text-center pt-10 border-t border-theme-charcoal/5"
          >
            <p className="font-serif text-2xl italic opacity-80 mb-6">
              Seeking standard protocols?
            </p>
            <button
              onClick={() => router.push("/faq")}
              className="inline-flex items-center gap-3 px-8 py-4 border border-theme-charcoal/30 font-mono text-xs font-semibold uppercase tracking-[0.3em] hover:bg-theme-charcoal hover:text-theme-alabaster transition-all duration-500"
            >
              View Foundational FAQ
            </button>
          </motion.div>

        </div>
      </main>

      <GlobalFooter theme="light" />
    </div>
  );
}
