"use client";

import { useState } from 'react';
import { usePrivacy } from '@/context/PrivacyContext';

export function PrivacyPreferencesButton() {
  const { ready, showPreferences } = usePrivacy();
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    try {
      await showPreferences();
    } catch {
      setError(
        'Privacy preferences could not be opened. Please refresh and try again.',
      );
    }
  };

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => {
          void handleClick();
        }}
        disabled={!ready}
        className="border border-theme-charcoal/20 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors hover:border-theme-gold hover:text-theme-gold disabled:cursor-not-allowed disabled:opacity-40"
      >
        {ready ? 'Review Privacy Preferences' : 'Loading Privacy Controls...'}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
