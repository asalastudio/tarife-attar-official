"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePrivacy } from '@/context/PrivacyContext';
import {
  buildAddToCart,
  buildBeginCheckout,
  buildViewCart,
  buildViewItem,
  CommerceItem,
  EcommerceEvent,
} from '@/lib/analytics/ecommerce';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

interface AnalyticsContextValue {
  ready: boolean;
  trackViewItem: (
    item: CommerceItem,
    currency: string,
    dedupeKey: string,
  ) => void;
  trackAddToCart: (item: CommerceItem, currency: string) => void;
  trackViewCart: (
    items: CommerceItem[],
    currency: string,
    dedupeKey: string,
  ) => void;
  trackBeginCheckout: (
    items: CommerceItem[],
    currency: string,
    dedupeKey: string,
  ) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(
  undefined,
);

const GA4_SCRIPT_ID = 'tarife-ga4';
const LINKER_DOMAINS = [
  'www.tarifeattar.com',
  'checkout.tarifeattar.com',
  'vasana-perfumes.myshopify.com',
];

function configuredMeasurementId(): string {
  const value = (process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '')
    .trim()
    .toUpperCase();
  return /^G-[A-Z0-9]+$/.test(value) ? value : '';
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const {
    ready: privacyReady,
    analyticsAllowed,
  } = usePrivacy();
  const measurementId = configuredMeasurementId();
  const initializedRef = useRef(false);
  const dedupeKeysRef = useRef(new Set<string>());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!privacyReady) {
      setReady(false);
      return;
    }

    if (!analyticsAllowed || !measurementId) {
      setReady(false);
      if (initializedRef.current) {
        window.gtag?.('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      ((...args: unknown[]) => {
        window.dataLayer?.push(args);
      });

    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });

    if (!initializedRef.current) {
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        linker: { domains: LINKER_DOMAINS },
      });

      if (!document.getElementById(GA4_SCRIPT_ID)) {
        const script = document.createElement('script');
        script.id = GA4_SCRIPT_ID;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        document.head.appendChild(script);
      }

      initializedRef.current = true;
    }

    setReady(true);
  }, [analyticsAllowed, measurementId, privacyReady]);

  const emitEvent = useCallback(
    (event: EcommerceEvent, dedupeKey?: string) => {
      if (!ready || !analyticsAllowed || !measurementId || !window.gtag) {
        return;
      }

      const scopedKey = dedupeKey ? `${event.event}:${dedupeKey}` : null;
      if (scopedKey && dedupeKeysRef.current.has(scopedKey)) return;

      window.gtag('event', event.event, event.params);
      if (scopedKey) dedupeKeysRef.current.add(scopedKey);
    },
    [analyticsAllowed, measurementId, ready],
  );

  const trackViewItem = useCallback(
    (item: CommerceItem, currency: string, dedupeKey: string) => {
      try {
        emitEvent(buildViewItem(item, currency), dedupeKey);
      } catch {
        console.warn('The view_item event contained invalid commerce data.');
      }
    },
    [emitEvent],
  );

  const trackAddToCart = useCallback(
    (item: CommerceItem, currency: string) => {
      try {
        emitEvent(buildAddToCart(item, currency));
      } catch {
        console.warn('The add_to_cart event contained invalid commerce data.');
      }
    },
    [emitEvent],
  );

  const trackViewCart = useCallback(
    (items: CommerceItem[], currency: string, dedupeKey: string) => {
      try {
        emitEvent(buildViewCart(items, currency), dedupeKey);
      } catch {
        console.warn('The view_cart event contained invalid commerce data.');
      }
    },
    [emitEvent],
  );

  const trackBeginCheckout = useCallback(
    (items: CommerceItem[], currency: string, dedupeKey: string) => {
      try {
        emitEvent(buildBeginCheckout(items, currency), dedupeKey);
      } catch {
        console.warn(
          'The begin_checkout event contained invalid commerce data.',
        );
      }
    },
    [emitEvent],
  );

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      ready,
      trackViewItem,
      trackAddToCart,
      trackViewCart,
      trackBeginCheckout,
    }),
    [
      ready,
      trackAddToCart,
      trackBeginCheckout,
      trackViewCart,
      trackViewItem,
    ],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
