"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

/**
 * Whether a full-screen overlay (the mobile menu drawer) is open.
 *
 * Floating controls (corner compass, satchel bubble, concierge tab) read this
 * and step aside while the menu is open, so nothing sits on top of its links.
 */

interface OverlayContextType {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <OverlayContext.Provider value={{ menuOpen, setMenuOpen }}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (ctx === undefined) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return ctx;
}
