"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { InstagramLogo } from '@phosphor-icons/react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/social';

interface Props {
  theme?: 'light' | 'dark';
  hideQuiz?: boolean;
}

export const GlobalFooter: React.FC<Props> = ({ theme = 'dark', hideQuiz = false }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setSubscriptionError(null);
    
    try {
      // Send to Omnisend via API
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'newsletter',
          marketingConsent: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Newsletter signup failed.');
      }

      setIsSubscribed(true);
    } catch {
      setSubscriptionError(
        'We could not add you right now. Please check your connection and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-theme-obsidian' : 'bg-theme-alabaster';
  const textClass = isDark ? 'text-theme-alabaster' : 'text-theme-charcoal';
  const borderClass = isDark ? 'border-white/5' : 'border-theme-charcoal/5';
  const hoverClass = isDark ? 'hover:opacity-100' : 'hover:opacity-100';

  const navigationLinks = [
    { label: 'Threshold', href: '/' },
    { label: 'Atlas Collection', href: '/atlas' },
    { label: 'Relic Vault', href: '/relic' },
    { label: 'Gift Sets', href: '/gift' },
    ...(!hideQuiz ? [{ label: 'Territory Quiz', href: '/quiz' }] : []),
  ];

  const utilityLinks = [
    { label: 'Journal', href: '/journal' },
    { label: 'Archive', href: '/archive' },
    { label: 'Stockists', href: '/stockists' },
    { label: 'Privacy', href: '/privacy' },
  ];

  return (
    <footer className={`w-full ${bgClass} ${textClass} pt-16 md:pt-24 pb-12 px-6 md:px-24 overflow-hidden border-t ${borderClass}`}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 md:gap-24 items-start">
          
          {/* Brand Identity Section */}
          <div className="lg:col-span-5 space-y-8 md:space-y-10 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col"
            >
              <h2
                className="text-2xl sm:text-3xl md:text-4xl tracking-[0.3em] md:tracking-[0.4em] uppercase font-semibold leading-none mb-2"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                TARIFÉ ATTÄR
              </h2>
              <span className="text-[9px] md:text-[10px] font-mono tracking-[0.4em] md:tracking-[0.6em] uppercase opacity-70">
                Modern Apothecary
              </span>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-base sm:text-lg md:text-xl opacity-70 leading-relaxed max-w-sm"
            >
              Clean, skin-safe perfume oils for those who travel by scent.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap gap-x-6 md:gap-x-8 font-serif text-[13px] opacity-70"
            >
              {utilityLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`${hoverClass} inline-flex items-center min-h-11 transition-opacity duration-300`}
                >
                  {link.label}
                </Link>
              ))}
            </motion.div>
          </div>

          {/* Navigation Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 space-y-6 md:space-y-8 w-full"
          >
            <h3 className="font-serif text-[13px] md:text-[14px] opacity-70">
              Navigation
            </h3>
            <ul className="space-y-1 md:space-y-2 font-serif text-base sm:text-lg opacity-80">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className={`${hoverClass} hover:tracking-tighter transition-all duration-300 inline-flex items-center min-h-11`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-4 space-y-6 md:space-y-8 w-full"
          >
            <h3 className="font-serif text-[13px] md:text-[14px] opacity-70">
              Stay Connected
            </h3>
            <div className="space-y-6">
              <p className="font-serif text-base opacity-70">
                New perfume oils and journal entries, by email.
              </p>
              
              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-4 font-serif text-[13px] text-theme-gold"
                >
                  Thank you. You're subscribed.
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="w-full space-y-4">
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className={`w-full bg-transparent border-b ${isDark ? 'border-white/20 focus:border-white' : 'border-theme-charcoal/20 focus:border-theme-charcoal'} py-4 font-serif text-base md:[@media(pointer:fine)]:text-[13px] outline-none transition-colors placeholder:opacity-60 placeholder:normal-case`}
                  />
                  {subscriptionError && (
                    <p role="alert" className="font-serif text-sm text-red-400">
                      {subscriptionError}
                    </p>
                  )}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full min-h-12 py-3 font-serif text-[13px] transition-all ${isDark ? 'bg-theme-gold/90 text-theme-obsidian hover:bg-theme-gold' : 'bg-theme-charcoal text-theme-alabaster hover:bg-theme-charcoal/90'} disabled:opacity-50`}
                  >
                    {isSubmitting ? 'Subscribing…' : 'Subscribe'}
                  </button>
                </form>
              )}

              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 min-h-11 font-serif text-[13px] opacity-80 ${hoverClass} transition-opacity duration-300`}
              >
                <InstagramLogo weight="light" className="w-5 h-5" aria-hidden="true" />
                <span>
                  Instagram <span className="normal-case tracking-normal">@{INSTAGRAM_HANDLE}</span>
                </span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Technical Metadata Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`mt-16 md:mt-32 pt-12 border-t ${borderClass} flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10`}
        >
          <p className="font-serif text-sm opacity-80 text-center md:text-left">
            Questions about an order or a perfume oil:{' '}
            <a href="mailto:support@tarifeattar.com" className={`${hoverClass} underline underline-offset-4`}>
              support@tarifeattar.com
            </a>
          </p>
          <p className="font-serif text-sm opacity-80 text-center">
            © {new Date().getFullYear()} Tarifé Attär
          </p>
        </motion.div>

        {/* Decorative Element */}
        <div className="mt-12 flex justify-center">
          <svg 
            viewBox="0 0 100 20" 
            className="w-24 h-5 opacity-10"
            fill="currentColor"
          >
            <path d="M0 10 L40 10 M60 10 L100 10" stroke="currentColor" strokeWidth="0.5" fill="none" />
            <circle cx="50" cy="10" r="3" />
          </svg>
        </div>
      </div>
    </footer>
  );
};
