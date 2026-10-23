"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ATTRIBUTION_STORAGE_KEY,
  AttributionLedger,
  InboundTouch,
  ShopifyAttributeInput,
  parseInboundTouch,
  parseStoredLedger,
  resolveAttributionForConsent,
  serializeCartAttributes,
} from '@/lib/attribution/ledger';
import { allowedCheckoutHosts } from '@/lib/attribution/checkout-url';
import { usePrivacy } from '@/context/PrivacyContext';

interface AttributionContextValue {
  ledger: AttributionLedger | null;
  cartAttributes: ShopifyAttributeInput[];
  ready: boolean;
}

const AttributionContext = createContext<AttributionContextValue | undefined>(
  undefined,
);

function configuredHosts(): string[] {
  return [
    window.location.hostname,
    'tarifeattar.com',
    'www.tarifeattar.com',
    ...allowedCheckoutHosts(),
  ];
}

export function AttributionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready: privacyReady, marketingAllowed } = usePrivacy();
  const pendingInboundRef = useRef<InboundTouch | null>(null);
  const [captureReady, setCaptureReady] = useState(false);
  const [resolvedConsent, setResolvedConsent] = useState<boolean | null>(null);
  const [ledger, setLedger] = useState<AttributionLedger | null>(null);

  useEffect(() => {
    pendingInboundRef.current = parseInboundTouch({
      url: window.location.href,
      referrer: document.referrer,
      ownHosts: configuredHosts(),
      capturedAt: new Date().toISOString(),
    });
    setCaptureReady(true);
  }, []);

  useEffect(() => {
    if (!privacyReady || !captureReady) return;

    if (!marketingAllowed) {
      try {
        localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      } catch {
        console.warn('Stored attribution could not be cleared.');
      }
      setLedger(null);
      setResolvedConsent(false);
      return;
    }

    let stored: AttributionLedger | null = null;
    try {
      stored = parseStoredLedger(localStorage.getItem(ATTRIBUTION_STORAGE_KEY));
    } catch {
      console.warn('Stored attribution could not be read.');
    }

    const resolved = resolveAttributionForConsent({
      marketingAllowed,
      stored,
      inbound: pendingInboundRef.current,
    });

    setLedger(resolved.ledger);
    setResolvedConsent(true);

    if (resolved.storageAction === 'write' && resolved.ledger) {
      try {
        localStorage.setItem(
          ATTRIBUTION_STORAGE_KEY,
          JSON.stringify(resolved.ledger),
        );
      } catch {
        console.warn('Attribution could not be persisted in this browser.');
      }
    }
  }, [captureReady, marketingAllowed, privacyReady]);

  const value = useMemo<AttributionContextValue>(
    () => ({
      ledger,
      cartAttributes: marketingAllowed ? serializeCartAttributes(ledger) : [],
      ready: privacyReady && captureReady && resolvedConsent === marketingAllowed,
    }),
    [captureReady, ledger, marketingAllowed, privacyReady, resolvedConsent],
  );

  return (
    <AttributionContext.Provider value={value}>
      {children}
    </AttributionContext.Provider>
  );
}

export function useAttribution(): AttributionContextValue {
  const context = useContext(AttributionContext);
  if (!context) {
    throw new Error(
      'useAttribution must be used within an AttributionProvider',
    );
  }
  return context;
}
