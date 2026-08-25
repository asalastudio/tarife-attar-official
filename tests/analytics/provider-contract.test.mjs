import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile('src/context/AnalyticsContext.tsx', 'utf8');

test('Meta Pixel is marketing-consent gated and revokes consent when denied', () => {
  assert.match(source, /marketingAllowed/);
  assert.match(source, /NEXT_PUBLIC_META_PIXEL_ID/);
  assert.match(source, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(source, /fbq\?\.\(['"]consent['"], ['"]revoke['"]\)/);
  assert.match(source, /fbq\(['"]consent['"], ['"]grant['"]\)/);
});

test('headless Meta measurement emits only the required pre-checkout events', () => {
  assert.match(source, /buildMetaViewContent/);
  assert.match(source, /buildMetaAddToCart/);
  assert.match(source, /buildMetaInitiateCheckout/);
  assert.doesNotMatch(source, /['"]Purchase['"]/);
});

test('storefront commerce payloads use Shopify catalog-compatible identifiers', async () => {
  const product = await readFile(
    'src/app/(site)/product/[slug]/ProductDetailClient.tsx',
    'utf8',
  );
  const cart = await readFile('src/app/(site)/cart/page.tsx', 'utf8');
  const shopify = await readFile('src/lib/shopify/client.ts', 'utf8');

  assert.match(product, /buildShopifyCatalogContentId/);
  assert.match(cart, /buildShopifyCatalogContentId/);
  assert.match(shopify, /product\s*\{\s*id/);
});
