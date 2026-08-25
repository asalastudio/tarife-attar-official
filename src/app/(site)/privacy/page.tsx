"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import { GlobalFooter } from "@/components/navigation";
import { PrivacyPreferencesButton } from "@/components/privacy/PrivacyPreferencesButton";

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft weight="thin" className="w-4 h-4" />
            Return
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.6em] opacity-40">
            Legal
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-24 py-20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-tighter leading-[0.9] mb-12">
              Privacy Policy
            </h1>

            <div className="prose prose-lg max-w-none font-serif">
              <p className="text-lg opacity-60 italic mb-8">
                Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Data Collection</h2>
                <p className="opacity-70 leading-relaxed">
                  Tarife Attär collects information needed to fulfill orders and provide requested
                  services. This can include contact and shipping information, cart contents,
                  territory preferences you submit, and campaign attribution when you permit
                  marketing measurement.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Use of Information</h2>
                <p className="opacity-70 leading-relaxed">
                  We use this information to process orders, deliver requested guides or reminders,
                  communicate with people who opt into marketing, understand site performance, and
                  operate the archive. Service providers such as Shopify, Omnisend, and analytics
                  platforms process limited information for those purposes under their respective
                  terms and controls.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Cookies</h2>
                <p className="opacity-70 leading-relaxed">
                  Essential browser storage supports cart and checkout functionality. Non-essential
                  analytics and marketing storage is controlled through our privacy preference
                  center and is used only when the corresponding permission is available.
                </p>
                <PrivacyPreferencesButton />
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Your Choices</h2>
                <p className="opacity-70 leading-relaxed">
                  You can review or change non-essential analytics and marketing preferences at any
                  time. Declining those categories does not disable the satchel, cart, or checkout,
                  although campaign measurement and personalized marketing will not run.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-serif italic mb-4">Contact</h2>
                <p className="opacity-70 leading-relaxed">
                  For privacy-related inquiries, contact us at{" "}
                  <a href="mailto:privacy@tarifeattar.com" className="text-theme-gold hover:underline">
                    privacy@tarifeattar.com
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
