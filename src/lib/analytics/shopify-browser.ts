import { getTrackingValues } from "@shopify/hydrogen-react";

// Use Shopify's token readers, not deprecated cookie names or invented IDs.
export function shopifyTrackingHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    if (!window.Shopify?.customerPrivacy?.analyticsProcessingAllowed()) return {};
    const { uniqueToken, visitToken } = getTrackingValues();
    return {
      ...(uniqueToken
        ? { "X-Shopify-UniqueToken": uniqueToken, "Shopify-Storefront-Y": uniqueToken }
        : {}),
      ...(visitToken
        ? { "X-Shopify-VisitToken": visitToken, "Shopify-Storefront-S": visitToken }
        : {}),
    };
  } catch {
    return {};
  }
}

// Never transmit cart/checkout capabilities, customer input, or arbitrary query data.
export function measurementUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (!["https:", "http:"].includes(url.protocol)) return "";
    const query = new URLSearchParams();
    for (const key of [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_id",
    ]) {
      const value = url.searchParams.get(key);
      if (value) query.set(key, value.replace(/[\u0000-\u001F\u007F]/g, "").slice(0, 255));
    }
    url.search = query.toString();
    url.hash = "";
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return "";
  }
}
