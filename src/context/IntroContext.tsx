"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * Intro state shared between the homepage and the site header.
 *
 * The homepage plays a short cinematic entry the first time a visitor arrives
 * in a session. While it runs, the header holds back so the wordmark appears
 * once, in the intro, and then settles into the masthead with the hero.
 */

export const INTRO_SEEN_KEY = "tarife-intro-seen";

interface IntroContextType {
  introActive: boolean;
  setIntroActive: (active: boolean) => void;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [introActive, setIntroActive] = useState(false);
  return (
    <IntroContext.Provider value={{ introActive, setIntroActive }}>
      {children}
    </IntroContext.Provider>
  );
}

export function useIntro() {
  const ctx = useContext(IntroContext);
  if (ctx === undefined) {
    throw new Error("useIntro must be used within an IntroProvider");
  }
  return ctx;
}

/** True when this browser session has already played the intro. Safe on the server. */
export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    /* storage unavailable, the intro simply replays next time */
  }
}
