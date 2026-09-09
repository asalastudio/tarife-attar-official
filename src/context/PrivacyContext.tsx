"use client";

import Script from 'next/script';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  DENIED_PERMISSIONS,
  MeasurementPermissions,
  SETTLED_DENIED_PERMISSIONS,
  ShopifyCustomerPrivacyApi,
  settlePermissions,
} from '@/lib/privacy/permissions';

interface PrivacyBannerConfig {
  storefrontAccessToken: string;
  checkoutRootDomain: string;
  storefrontRootDomain: string;
}

interface ShopifyPrivacyBanner {
  loadBanner(config: PrivacyBannerConfig): Promise<void>;
  showPreferences(config: PrivacyBannerConfig): Promise<void>;
}

interface ShopifyRuntime {
  customerPrivacy?: ShopifyCustomerPrivacyApi;
  loadFeatures?: (
    features: Array<{ name: string; version: string }>,
    callback: (error?: Error | false) => void,
  ) => void;
}

declare global {
  interface Window {
    Shopify?: ShopifyRuntime;
    privacyBanner?: ShopifyPrivacyBanner;
  }
}

interface PrivacyContextValue extends MeasurementPermissions {
  controlsAvailable: boolean;
  showPreferences: () => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextValue | undefined>(
  undefined,
);

const PRIVACY_BANNER_URL =
  'https://cdn.shopify.com/shopifycloud/privacy-banner/storefront-banner.js';

function getBannerConfig(): PrivacyBannerConfig | null {
  const storefrontAccessToken =
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
  const checkoutRootDomain =
    process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN || '';

  if (!storefrontAccessToken || !checkoutRootDomain) return null;

  return {
    storefrontAccessToken,
    checkoutRootDomain,
    storefrontRootDomain: 'tarifeattar.com',
  };
}

async function loadConsentTrackingFeature(): Promise<void> {
  const loadFeatures = window.Shopify?.loadFeatures;
  if (!loadFeatures) return;

  await new Promise<void>((resolve, reject) => {
    loadFeatures(
      [{ name: 'consent-tracking-api', version: '0.1' }],
      (error) => {
        if (error) reject(error);
        else resolve();
      },
    );
  });
}

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<MeasurementPermissions>(
    DENIED_PERMISSIONS,
  );
  const [controlsAvailable, setControlsAvailable] = useState(false);
  const bootstrapPromiseRef = useRef<Promise<void> | null>(null);
  const warnedRef = useRef(false);

  const refreshPermissions = useCallback(() => {
    setPermissions(settlePermissions(window.Shopify?.customerPrivacy));
  }, []);

  const bootstrapPrivacy = useCallback(async () => {
    if (bootstrapPromiseRef.current) return bootstrapPromiseRef.current;

    bootstrapPromiseRef.current = (async () => {
      const config = getBannerConfig();
      if (!config || !window.privacyBanner) {
        if (!warnedRef.current) {
          console.warn('Shopify privacy configuration is incomplete.');
          warnedRef.current = true;
        }
        setPermissions(SETTLED_DENIED_PERMISSIONS);
        return;
      }

      try {
        await window.privacyBanner.loadBanner(config);
        await loadConsentTrackingFeature();
        setControlsAvailable(true);
        refreshPermissions();
      } catch {
        setControlsAvailable(false);
        setPermissions(SETTLED_DENIED_PERMISSIONS);
        console.warn('Shopify privacy controls could not be initialized.');
      }
    })();

    return bootstrapPromiseRef.current;
  }, [refreshPermissions]);

  useEffect(() => {
    const handleConsent = () => refreshPermissions();
    document.addEventListener('visitorConsentCollected', handleConsent);

    return () => {
      document.removeEventListener('visitorConsentCollected', handleConsent);
    };
  }, [refreshPermissions]);

  const showPreferences = useCallback(async () => {
    const config = getBannerConfig();
    if (!config || !window.privacyBanner) return;

    await window.privacyBanner.showPreferences(config);
  }, []);

  const value = useMemo<PrivacyContextValue>(
    () => ({ ...permissions, controlsAvailable, showPreferences }),
    [controlsAvailable, permissions, showPreferences],
  );

  return (
    <PrivacyContext.Provider value={value}>
      <Script
        id="shopify-privacy-banner"
        src={PRIVACY_BANNER_URL}
        strategy="afterInteractive"
        onReady={() => {
          void bootstrapPrivacy();
        }}
      />
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy(): PrivacyContextValue {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
