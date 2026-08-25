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
    process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN,
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
  ].filter((host): host is string => Boolean(host));
}

export function AttributionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready: privacyReady, marketingAllowed } = usePrivacy();
  const pendingInboundRef = useRef<InboundTouch | null>(null);
  const [captureReady, setCaptureReady] = useState(false);
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
      cartAttributes: serializeCartAttributes(ledger),
      ready: privacyReady && captureReady,
    }),
    [captureReady, ledger, privacyReady],
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
