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
import {
  buildMetaAddToCart,
  buildMetaInitiateCheckout,
  buildMetaViewContent,
  MetaEvent,
} from '@/lib/analytics/meta';

interface MetaPixelFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
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
const META_SCRIPT_ID = 'tarife-meta-pixel';
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

function configuredPixelId(): string {
  const value = (process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim();
  return /^\d{5,30}$/.test(value) ? value : '';
}

function ensureMetaPixel(): MetaPixelFunction {
  if (window.fbq) return window.fbq;

  const fbq: MetaPixelFunction = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
}

function metaEventId(eventName: string, dedupeKey?: string): string {
  const random = globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `ta-${eventName}-${dedupeKey || random}`.slice(0, 100);
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const {
    ready: privacyReady,
    analyticsAllowed,
    marketingAllowed,
  } = usePrivacy();
  const measurementId = configuredMeasurementId();
  const pixelId = configuredPixelId();
  const gaInitializedRef = useRef(false);
  const metaInitializedRef = useRef(false);
  const dedupeKeysRef = useRef(new Set<string>());
  const [gaReady, setGaReady] = useState(false);
  const [metaReady, setMetaReady] = useState(false);

  useEffect(() => {
    if (!privacyReady) {
      setGaReady(false);
      return;
    }

    if (!analyticsAllowed || !measurementId) {
      setGaReady(false);
      if (gaInitializedRef.current) {
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

    if (!gaInitializedRef.current) {
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

      gaInitializedRef.current = true;
    }

    setGaReady(true);
  }, [analyticsAllowed, measurementId, privacyReady]);

  useEffect(() => {
    if (!privacyReady) {
      setMetaReady(false);
      return;
    }

    if (!marketingAllowed || !pixelId) {
      setMetaReady(false);
      if (metaInitializedRef.current) window.fbq?.('consent', 'revoke');
      return;
    }

    const fbq = ensureMetaPixel();
    fbq('consent', 'grant');

    if (!metaInitializedRef.current) {
      fbq('init', pixelId);
      if (!document.getElementById(META_SCRIPT_ID)) {
        const script = document.createElement('script');
        script.id = META_SCRIPT_ID;
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        document.head.appendChild(script);
      }
      metaInitializedRef.current = true;
    }

    setMetaReady(true);
  }, [marketingAllowed, pixelId, privacyReady]);

  const emitEvent = useCallback(
    (event: EcommerceEvent, dedupeKey?: string) => {
      if (!gaReady || !analyticsAllowed || !measurementId || !window.gtag) {
        return;
      }

      const scopedKey = dedupeKey ? `${event.event}:${dedupeKey}` : null;
      if (scopedKey && dedupeKeysRef.current.has(scopedKey)) return;

      window.gtag('event', event.event, event.params);
      if (scopedKey) dedupeKeysRef.current.add(scopedKey);
    },
    [analyticsAllowed, gaReady, measurementId],
  );

  const emitMetaEvent = useCallback(
    (event: MetaEvent, dedupeKey?: string) => {
      if (!metaReady || !marketingAllowed || !pixelId || !window.fbq) return;

      const scopedKey = dedupeKey ? `meta:${event.event}:${dedupeKey}` : null;
      if (scopedKey && dedupeKeysRef.current.has(scopedKey)) return;

      window.fbq(
        'track',
        event.event,
        event.params,
        { eventID: metaEventId(event.event, dedupeKey) },
      );
      if (scopedKey) dedupeKeysRef.current.add(scopedKey);
    },
    [marketingAllowed, metaReady, pixelId],
  );

  const trackViewItem = useCallback(
    (item: CommerceItem, currency: string, dedupeKey: string) => {
      try {
        emitEvent(buildViewItem(item, currency), dedupeKey);
      } catch {
        console.warn('The view_item event contained invalid commerce data.');
      }
      try {
        emitMetaEvent(buildMetaViewContent(item, currency), dedupeKey);
      } catch {
        console.warn('The ViewContent event contained invalid commerce data.');
      }
    },
    [emitEvent, emitMetaEvent],
  );

  const trackAddToCart = useCallback(
    (item: CommerceItem, currency: string) => {
      try {
        emitEvent(buildAddToCart(item, currency));
      } catch {
        console.warn('The add_to_cart event contained invalid commerce data.');
      }
      try {
        emitMetaEvent(buildMetaAddToCart(item, currency));
      } catch {
        console.warn('The AddToCart event contained invalid commerce data.');
      }
    },
    [emitEvent, emitMetaEvent],
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
      try {
        emitMetaEvent(buildMetaInitiateCheckout(items, currency), dedupeKey);
      } catch {
        console.warn(
          'The InitiateCheckout event contained invalid commerce data.',
        );
      }
    },
    [emitEvent, emitMetaEvent],
  );

  const ready = gaReady || metaReady;

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
