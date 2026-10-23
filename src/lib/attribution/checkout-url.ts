/**
 * First-party checkout hostname. Shopify starts returning it in Cart.checkoutUrl
 * once it is connected under Settings → Domains and set as the store's primary
 * domain. Until then Shopify keeps returning the myshopify.com host, which stays
 * allowed below, so both work during the switch.
 */
export const BRAND_CHECKOUT_HOST = 'checkout.tarifeattar.com';

/**
 * Hosts a shopper may be sent to for checkout. This only guards against
 * arbitrary redirects; the URL itself is always the one Shopify returns.
 * NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN accepts a comma-separated list.
 */
export function allowedCheckoutHosts(): string[] {
  return [
    BRAND_CHECKOUT_HOST,
    ...(process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN || '').split(','),
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '',
  ]
    .map((host) => host.trim())
    .filter((host) => host.length > 0);
}

function normalizeAllowedHosts(allowedHosts: string[]): Set<string> {
  return new Set(
    allowedHosts
      .map((host) => host.trim().toLowerCase())
      .filter((host) => host.length > 0),
  );
}

export function getSafeCheckoutUrl(
  rawUrl: string,
  allowedHosts: string[],
): string | null {
  if (!rawUrl) return null;

  let checkoutUrl: URL;
  try {
    checkoutUrl = new URL(rawUrl);
  } catch {
    return null;
  }

  if (checkoutUrl.protocol !== 'https:') return null;
  if (checkoutUrl.username || checkoutUrl.password) return null;

  const normalizedHosts = normalizeAllowedHosts(allowedHosts);
  if (!normalizedHosts.has(checkoutUrl.hostname.toLowerCase())) return null;

  checkoutUrl.hash = '';
  return checkoutUrl.toString();
}

const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export function getAttributedCheckoutUrl(
  rawUrl: string,
  allowedHosts: string[],
  campaign: Partial<Record<(typeof CAMPAIGN_KEYS)[number], string>> | null,
  marketingAllowed: boolean,
): string | null {
  const safe = getSafeCheckoutUrl(rawUrl, allowedHosts);
  if (!safe) return null;
  const url = new URL(safe);
  // Retain Shopify's capability and discount parameters; never forward arbitrary landing query data.
  if (!marketingAllowed) {
    for (const key of CAMPAIGN_KEYS) url.searchParams.delete(key);
  } else if (campaign && campaign.utm_source !== '(direct)') {
    for (const key of CAMPAIGN_KEYS) {
      url.searchParams.delete(key);
      const value = campaign[key]?.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 255);
      if (value) url.searchParams.set(key, value);
    }
  }
  return url.toString();
}
