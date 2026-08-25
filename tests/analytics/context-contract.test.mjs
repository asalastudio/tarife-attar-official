import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const context = await readFile('src/context/AnalyticsContext.tsx', 'utf8');
const providers = await readFile('src/components/Providers.tsx', 'utf8');

test('GA4 loading and emission are gated by Shopify analytics consent', () => {
  assert.match(context, /usePrivacy\(\)/);
  assert.match(context, /analyticsAllowed/);
  assert.match(context, /googletagmanager\.com\/gtag\/js/);
  assert.match(context, /analytics_storage:\s*'granted'/);
  assert.match(context, /analytics_storage:\s*'denied'/);
});

test('configures the required cross-domain linker domains', () => {
  for (const domain of [
    'www.tarifeattar.com',
    'checkout.tarifeattar.com',
    'vasana-perfumes.myshopify.com',
  ]) {
    assert.match(context, new RegExp(domain.replaceAll('.', '\\.')));
  }
});

test('exposes the complete storefront funnel and never deduplicates add_to_cart', () => {
  for (const method of [
    'trackViewItem',
    'trackAddToCart',
    'trackViewCart',
    'trackBeginCheckout',
  ]) {
    assert.match(context, new RegExp(method));
  }
  assert.match(context, /trackAddToCart[\s\S]*emitEvent\(buildAddToCart\(item, currency\)\)/);
});

test('places analytics after attribution and before the Shopify cart provider', () => {
  const attributionIndex = providers.indexOf('<AttributionProvider>');
  const analyticsIndex = providers.indexOf('<AnalyticsProvider>');
  const cartIndex = providers.indexOf('<ShopifyCartProvider>');

  assert.ok(attributionIndex >= 0);
  assert.ok(analyticsIndex > attributionIndex);
  assert.ok(cartIndex > analyticsIndex);
});
