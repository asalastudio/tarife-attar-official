"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin } from "@phosphor-icons/react";
import { GlobalFooter } from "@/components/navigation";

export default function StockistsPage() {
  const router = useRouter();


  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 min-h-11 font-serif text-[13px] opacity-70 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft weight="thin" className="w-4 h-4" />
            Return
          </button>
          <span className="font-serif text-[13px] text-theme-gold-ink">
            Stockists
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-24 py-20">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mb-16"
          >
            <MapPin weight="thin" className="w-12 h-12 text-theme-gold mb-8" />
            <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-8">
              Stockists
            </h1>
            <p className="font-serif text-lg md:text-xl opacity-60 leading-relaxed">
              Tarifé Attär is sold online for now. For wholesale and stockist enquiries, write to{" "}
              <a href="mailto:support@tarifeattar.com" className="underline underline-offset-4">support@tarifeattar.com</a>.
            </p>
          </motion.div>

        </div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
