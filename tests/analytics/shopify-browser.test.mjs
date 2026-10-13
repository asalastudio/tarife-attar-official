import test from "node:test";
import assert from "node:assert/strict";
import { measurementUrl, shopifyTrackingHeaders } from "../../src/lib/analytics/shopify-browser.ts";
test("measurement retains campaign but removes private checkout and customer data", () => {
  assert.equal(
    measurementUrl(
      "https://www.tarifeattar.com/cart?utm_source=shopify_email&utm_campaign=123&checkout_url=https%3A%2F%2Fprivate.example&key=secret&email=test%40example.com#secret"
    ),
    "https://www.tarifeattar.com/cart?utm_source=shopify_email&utm_campaign=123"
  );
});
test("no tracking headers on the server or when analytics is denied", () => {
  assert.deepEqual(shopifyTrackingHeaders(), {});
  globalThis.window = { Shopify: { customerPrivacy: { analyticsProcessingAllowed: () => false } } };
  try {
    assert.deepEqual(shopifyTrackingHeaders(), {});
  } finally {
    delete globalThis.window;
  }
});
test("cart uses the same Shopify tokens as storefront measurement", () => {
  globalThis.window = {
    Shopify: {
      customerPrivacy: {
        analyticsProcessingAllowed: () => true,
        __internal: { uniqueToken: () => "synthetic-user", visitToken: () => "synthetic-visit" },
      },
    },
  };
  try {
    assert.deepEqual(shopifyTrackingHeaders(), {
      "X-Shopify-UniqueToken": "synthetic-user",
      "Shopify-Storefront-Y": "synthetic-user",
      "X-Shopify-VisitToken": "synthetic-visit",
      "Shopify-Storefront-S": "synthetic-visit",
    });
  } finally {
    delete globalThis.window;
  }
});
