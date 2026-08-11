/**
 * Campaign attribution for the headless storefront.
 *
 * UTM parameters land on tarifeattar.com, but orders complete on the
 * Shopify checkout domain — which never sees those parameters unless we
 * carry them across. This module captures campaign parameters on landing,
 * persists them for the attribution window, and re-attaches them to the
 * checkout URL at handoff so Shopify's marketing reports credit the source.
 */

const STORAGE_KEY = 'ta_attribution';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30-day attribution window

export const ATTRIBUTION_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

interface StoredAttribution {
  params: Record<string, string>;
  landedAt: number;
  landingPage: string;
}

/** Persist campaign parameters from the current URL. Last touch wins. */
export function captureAttribution(search: string, pathname: string): void {
  if (typeof window === 'undefined') return;
  try {
    const query = new URLSearchParams(search);
    const params: Record<string, string> = {};
    for (const key of ATTRIBUTION_PARAMS) {
      const value = query.get(key);
      if (value) params[key] = value;
    }
    if (Object.keys(params).length === 0) return;

    const stored: StoredAttribution = {
      params,
      landedAt: Date.now(),
      landingPage: pathname,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable (private mode, blocked cookies) — best-effort only
  }
}

/** Return stored campaign parameters, or {} if none/expired. */
export function getStoredAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const stored = JSON.parse(raw) as StoredAttribution;
    if (!stored?.params || Date.now() - stored.landedAt > MAX_AGE_MS) return {};
    return stored.params;
  } catch {
    return {};
  }
}

/** Append stored attribution to a URL without overwriting params already present. */
export function appendAttributionToUrl(urlString: string): string {
  const params = getStoredAttribution();
  if (Object.keys(params).length === 0) return urlString;
  try {
    const url = new URL(urlString);
    for (const [key, value] of Object.entries(params)) {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  } catch {
    return urlString;
  }
}
