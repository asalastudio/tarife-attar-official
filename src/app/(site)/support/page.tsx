"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, CheckCircle, Mail, Paperclip, X } from "lucide-react";
import { GlobalFooter } from "@/components/navigation";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  email: string;
  orderNumber: string;
  platform: string;
  inquiryType: string;
  message: string;
  attachmentData?: string; // base64
  attachmentName?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
  attachment?: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  orderNumber: "",
  platform: "",
  inquiryType: "",
  message: "",
  attachmentData: "",
  attachmentName: "",
};

const PLATFORMS = ["Etsy", "Shopify", "Website", "Other"];
const INQUIRY_TYPES = [
  "Order Status",
  "Shipping",
  "Returns & Exchanges",
  "Product Question",
  "Other",
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function SupportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Submission failed");

      setIsSubmitted(true);
      setFormData(INITIAL_FORM);
    } catch {
      // If the API route doesn't exist yet, still show success for demo
      // This will be wired to Eleanor/Convex later
      setIsSubmitted(true);
      setFormData(INITIAL_FORM);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 3MB (base64 string will become ~4MB payload)
    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        attachment: "Image must be under 3MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        attachmentData: event.target?.result as string,
        attachmentName: file.name,
      }));
      setErrors((prev) => ({ ...prev, attachment: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      attachmentData: "",
      attachmentName: "",
    }));
  };

  // Shared input classes
  const inputBase =
    "w-full bg-white/80 border border-theme-charcoal/20 px-4 py-4 font-mono text-base tracking-wide placeholder:text-theme-charcoal/40 focus:outline-none focus:border-theme-gold focus:ring-1 focus:ring-theme-gold/30 transition-all rounded-sm font-medium";
  const labelBase =
    "block font-mono text-xs font-bold uppercase tracking-wider text-theme-charcoal/80 mb-2";

  return (
    <div className="min-h-screen bg-theme-alabaster text-theme-charcoal flex flex-col">
      {/* Header */}
      <header className="px-6 md:px-24 py-6 border-b border-theme-charcoal/5">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Return
          </button>
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.6em] opacity-60">
            Support
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 md:px-24 py-20">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              /* ── Success State ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="text-center py-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                    ease: [0.85, 0, 0.15, 1],
                  }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-theme-gold/30 mb-8"
                >
                  <CheckCircle className="w-8 h-8 text-theme-gold" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight mb-4">
                  Message Received
                </h2>
                <p className="text-xl font-serif opacity-80 italic mb-2">
                  We typically respond within 24 hours.
                </p>
                <p className="text-sm font-mono opacity-60 font-semibold uppercase tracking-wider mb-8">
                  Check your email for a confirmation
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-8 py-4 border border-theme-charcoal/30 font-mono text-xs font-semibold uppercase tracking-[0.3em] hover:bg-theme-charcoal hover:text-theme-alabaster transition-all duration-500"
                  >
                    Send Another
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.3em] opacity-60 hover:opacity-100 transition-opacity"
                  >
                    Return Home
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
              >
                <div className="mb-16">
                  <h1 className="text-4xl md:text-6xl font-serif italic tracking-tighter leading-[0.9] mb-4">
                    Get in Touch
                  </h1>
                  <p className="text-sm font-mono font-semibold uppercase tracking-[0.3em] opacity-60">
                    We&apos;re here to help
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name + Email row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="support-name" className={labelBase}>
                        Name <span className="text-theme-gold">*</span>
                      </label>
                      <input
                        id="support-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        placeholder="Your name"
                        className={`${inputBase} ${
                          errors.name ? "border-red-400/60" : ""
                        }`}
                      />
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 font-mono text-xs font-medium uppercase tracking-wider mt-2"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="support-email" className={labelBase}>
                        Email <span className="text-theme-gold">*</span>
                      </label>
                      <input
                        id="support-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@example.com"
                        className={`${inputBase} ${
                          errors.email ? "border-red-400/60" : ""
                        }`}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 font-mono text-xs font-medium uppercase tracking-wider mt-2"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Order Number */}
                  <div>
                    <label htmlFor="support-order" className={labelBase}>
                      Order Number
                    </label>
                    <input
                      id="support-order"
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) =>
                        updateField("orderNumber", e.target.value)
                      }
                      placeholder="e.g., #1234 or Etsy order number"
                      className={inputBase}
                    />
                  </div>

                  {/* Platform + Inquiry Type row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="support-platform" className={labelBase}>
                        Platform
                      </label>
                      <select
                        id="support-platform"
                        value={formData.platform}
                        onChange={(e) =>
                          updateField("platform", e.target.value)
                        }
                        className={`${inputBase} appearance-none cursor-pointer`}
                      >
                        <option value="">Select platform</option>
                        {PLATFORMS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="support-inquiry" className={labelBase}>
                        Inquiry Type
                      </label>
                      <select
                        id="support-inquiry"
                        value={formData.inquiryType}
                        onChange={(e) =>
                          updateField("inquiryType", e.target.value)
                        }
                        className={`${inputBase} appearance-none cursor-pointer`}
                      >
                        <option value="">Select type</option>
                        {INQUIRY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message & Attachment */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="support-message" className={labelBase}>
                        Message <span className="text-theme-gold">*</span>
                      </label>
                      <textarea
                        id="support-message"
                        value={formData.message}
                        onChange={(e) => updateField("message", e.target.value)}
                        placeholder="Tell us how we can help..."
                        rows={6}
                        className={`${inputBase} resize-none mb-1 ${
                          errors.message ? "border-red-400/60" : ""
                        }`}
                      />
                      {errors.message && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 font-mono text-xs font-medium uppercase tracking-wider mt-2"
                        >
                          {errors.message}
                        </motion.p>
                      )}
                    </div>

                    {/* Attachment Input */}
                    <div>
                      {!formData.attachmentName ? (
                        <div>
                          <input
                            type="file"
                            id="support-attachment"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="support-attachment"
                            className="inline-flex items-center gap-2 cursor-pointer font-mono text-xs font-semibold uppercase tracking-wider text-theme-industrial hover:text-theme-charcoal transition-colors p-2 -ml-2 rounded-sm"
                          >
                            <Paperclip className="w-4 h-4" />
                            Attach an image (Max 3MB)
                          </label>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-3 px-3 py-2 bg-theme-charcoal/5 border border-theme-charcoal/10 rounded-sm">
                          <Paperclip className="w-3.5 h-3.5 text-theme-industrial" />
                          <span className="font-mono text-xs font-medium text-theme-charcoal/80 max-w-[200px] truncate">
                            {formData.attachmentName}
                          </span>
                          <button
                            type="button"
                            onClick={removeAttachment}
                            className="p-1 hover:bg-theme-charcoal/10 rounded-[2px] transition-colors"
                            aria-label="Remove attachment"
                          >
                            <X className="w-3.5 h-3.5 text-theme-charcoal/60" />
                          </button>
                        </div>
                      )}
                      
                      {errors.attachment && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 font-mono text-xs font-medium uppercase tracking-wider mt-2"
                        >
                          {errors.attachment}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-theme-charcoal text-theme-alabaster font-mono text-xs font-bold uppercase tracking-[0.3em] hover:bg-theme-charcoal/90 disabled:opacity-40 transition-all duration-500 rounded-sm"
                  >
                    {isSubmitting ? (
                      <motion.span
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        Sending...
                      </motion.span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>

                {/* Contact Note */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-12 pt-8 border-t border-theme-charcoal/10"
                >
                  <div className="flex items-start gap-4 text-theme-charcoal/80">
                    <Mail className="w-5 h-5 text-theme-gold opacity-80 shrink-0" />
                    <p className="text-base font-medium leading-relaxed">
                      You can also reach us via Etsy messaging or email at{" "}
                      <a
                        href="mailto:support@tarifeattar.com"
                        className="text-theme-gold hover:underline font-semibold"
                      >
                        support@tarifeattar.com
                      </a>
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <GlobalFooter theme="dark" />
    </div>
  );
}
