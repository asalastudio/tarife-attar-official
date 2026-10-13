import {
  AnalyticsEventName,
  getClientBrowserParameters,
  getTrackingValues,
  sendShopifyAnalytics,
} from "@shopify/hydrogen-react";
import type { ShopifyAnalyticsProduct, ShopifyPageViewPayload } from "@shopify/hydrogen-react";
import { shopifyFetch } from "@/lib/shopify/client";
import { measurementUrl } from "./shopify-browser";

type Shop = Pick<ShopifyPageViewPayload, "shopId" | "currency" | "acceptedLanguage">;
let shopPromise: Promise<Shop> | undefined;
function getShop(): Promise<Shop> {
  if (!shopPromise) {
    shopPromise = shopifyFetch({
      query: `query AttributionShop {
      shop { id }
      localization { country { currency { isoCode } } language { isoCode } }
    }`,
    })
      .then(({ data, errors }) => {
        if (errors?.length || !data?.shop?.id || !data?.localization?.country?.currency?.isoCode) {
          throw new Error("Shopify analytics metadata unavailable.");
        }
        return {
          shopId: data.shop.id,
          currency: data.localization.country.currency.isoCode,
          acceptedLanguage: data.localization.language.isoCode,
        };
      })
      .catch((error) => {
        shopPromise = undefined;
        throw error;
      });
  }
  return shopPromise;
}

export async function trackShopifyEvent(addition?: {
  cartId: string;
  product: ShopifyAnalyticsProduct;
}): Promise<void> {
  if (typeof window === "undefined") return;
  const privacy = window.Shopify?.customerPrivacy;
  if (!privacy?.analyticsProcessingAllowed()) return;
  const browser = getClientBrowserParameters();
  const url = measurementUrl(browser.url);
  if (!url) return;
  const safeUrl = new URL(url);
  // Capture the event before awaiting metadata; recheck consent before transmission.
  const payload = {
    ...browser,
    url,
    path: safeUrl.pathname,
    search: safeUrl.search,
    referrer: measurementUrl(browser.referrer).split("?")[0],
  };
  try {
    const shop = await getShop();
    // Privacy permission can settle before Shopify's session tokens. Preserve the
    // original landing URL while waiting; otherwise the first email visit is lost.
    let tracking = getTrackingValues();
    for (
      let attempt = 0;
      attempt < 20 && (!tracking.uniqueToken || !tracking.visitToken);
      attempt++
    ) {
      if (!privacy.analyticsProcessingAllowed()) return;
      await new Promise((resolve) => setTimeout(resolve, 250));
      tracking = getTrackingValues();
    }
    if (!privacy.analyticsProcessingAllowed() || !tracking.uniqueToken || !tracking.visitToken)
      return;
    payload.uniqueToken = tracking.uniqueToken;
    payload.visitToken = tracking.visitToken;
    const shared = {
      ...payload,
      ...shop,
      hasUserConsent: true,
      shopifySalesChannel: "headless" as const,
      analyticsAllowed: true,
      marketingAllowed: privacy.marketingAllowed(),
      saleOfDataAllowed: privacy.saleOfDataAllowed(),
    };
    await sendShopifyAnalytics(
      addition
        ? {
            eventName: AnalyticsEventName.ADD_TO_CART,
            payload: {
              ...shared,
              cartId: addition.cartId.split("?")[0],
              products: [addition.product],
              totalValue: Number(addition.product.price) * (addition.product.quantity || 0),
            },
          }
        : { eventName: AnalyticsEventName.PAGE_VIEW, payload: shared }
    );
  } catch {
    // Measurement failures must never fail an otherwise successful cart mutation.
    console.warn("Shopify storefront measurement could not be delivered.");
  }
}
