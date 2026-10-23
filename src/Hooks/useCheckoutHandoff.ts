"use client";

import { useCallback, useMemo } from "react";
import { useAnalytics, useAttribution, usePrivacy, useShopifyCart } from "@/context";
import { allowedCheckoutHosts, getAttributedCheckoutUrl } from "@/lib/attribution/checkout-url";
import { buildShopifyCatalogContentId } from "@/lib/analytics/meta";

const ALLOWED_CHECKOUT_HOSTS = allowedCheckoutHosts();

/**
 * Everything a "Checkout" control needs, shared by the Satchel page and the
 * add-to-satchel confirmation: the attribution-decorated Shopify checkout URL
 * (null when Shopify's URL fails the host allowlist) and the begin_checkout
 * event to fire when the shopper follows it.
 */
export function useCheckoutHandoff() {
  const { ledger } = useAttribution();
  const { marketingAllowed } = usePrivacy();
  const { ready: analyticsReady, trackBeginCheckout } = useAnalytics();
  const { items, checkoutUrl, isReadyForCheckout } = useShopifyCart();

  const commerceItems = useMemo(
    () =>
      items.map((item) => {
        const metaContentId = buildShopifyCatalogContentId(
          item.productId,
          item.variantId,
          process.env.NEXT_PUBLIC_META_CATALOG_COUNTRY || 'US',
        );
        return {
          item_id: item.variantId,
          item_name: item.title,
          ...(metaContentId ? { meta_content_id: metaContentId } : {}),
          ...(item.variantTitle
            ? { item_variant: item.variantTitle }
            : {}),
          price: Number(item.price),
          quantity: item.quantity,
        };
      }),
    [items],
  );
  const commerceCurrency = items[0]?.currencyCode || 'USD';
  const cartFingerprint = useMemo(
    () =>
      commerceItems
        .map(
          (item) =>
            `${encodeURIComponent(item.item_id)}:${item.quantity}:${item.price}`,
        )
        .sort()
        .join('|'),
    [commerceItems],
  );
  const safeCheckoutUrl = getAttributedCheckoutUrl(
    checkoutUrl,
    ALLOWED_CHECKOUT_HOSTS,
    ledger?.latest ?? null,
    marketingAllowed,
  );

  const handleBeginCheckout = useCallback(() => {
    if (!analyticsReady || !cartFingerprint) return;
    trackBeginCheckout(
      commerceItems,
      commerceCurrency,
      cartFingerprint,
    );
  }, [analyticsReady, cartFingerprint, commerceCurrency, commerceItems, trackBeginCheckout]);

  return {
    commerceItems,
    commerceCurrency,
    cartFingerprint,
    safeCheckoutUrl,
    canCheckout: Boolean(safeCheckoutUrl) && isReadyForCheckout && items.length > 0,
    handleBeginCheckout,
  };
}
