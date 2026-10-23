import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildOffers,
  productOpenGraphTags,
  shopifyShareImageUrl,
  toShopifyProductGid,
} from '../../src/lib/product-structured-data.ts';

const usd = (amount) => ({ amount, currencyCode: 'USD' });
// Shopify returns sizes in creation order; 3ml was added last.
const carmel = [
  { title: '6ml', sku: 'PETAL-CARMEL-6ML', availableForSale: false, price: usd('30.0') },
  { title: '12ml', sku: 'PETAL-CARMEL-12ML', availableForSale: true, price: usd('50.0') },
  { title: '3ml', sku: 'PETAL-CARMEL-3ML', availableForSale: true, price: usd('23.0') },
];

test('one offer per Shopify size, ordered 3ml to 12ml, with real price and stock', () => {
  const offers = buildOffers(carmel, {
    productName: 'CARMEL Perfume Oil',
    url: 'https://tarifeattar.com/product/carmel',
  });
  assert.deepEqual(
    offers.map((o) => [o.name, o.sku, o.price, o.availability]),
    [
      ['3ml Glass Wand Applicator', 'PETAL-CARMEL-3ML', 23, 'https://schema.org/InStock'],
      ['6ml Glass Wand Applicator', 'PETAL-CARMEL-6ML', 30, 'https://schema.org/OutOfStock'],
      ['12ml Glass Wand Applicator', 'PETAL-CARMEL-12ML', 50, 'https://schema.org/InStock'],
    ],
  );
  assert.ok(offers.every((o) => o.priceCurrency === 'USD' && o.url.endsWith('/product/carmel')));
});

test('a single-variant product is offered under its own name at its own price', () => {
  const [offer] = buildOffers(
    [{ title: 'Default Title', sku: 'TRAVELER-SET-10', availableForSale: true, price: usd('95.0') }],
    { productName: 'The Traveler Set Perfume Oil', url: 'https://tarifeattar.com/product/the-traveler-set' },
  );
  assert.equal(offer.name, 'The Traveler Set Perfume Oil');
  assert.equal(offer.price, 95);
});

test('product tags quote the cheapest size in stock, or the cheapest when sold out', () => {
  assert.deepEqual(productOpenGraphTags(carmel), {
    'og:type': 'product',
    'product:brand': 'Tarife Attar',
    'product:condition': 'new',
    'product:availability': 'in stock',
    'product:price:amount': '23.00',
    'product:price:currency': 'USD',
  });

  const soldOut = carmel.map((v) => ({ ...v, availableForSale: false }));
  const tags = productOpenGraphTags(soldOut);
  assert.equal(tags['product:availability'], 'out of stock');
  assert.equal(tags['product:price:amount'], '23.00');

  assert.deepEqual(productOpenGraphTags([]), { 'og:type': 'product' });
});

test('Shopify share image is padded to 1200 x 630 and keeps existing parameters', () => {
  const url = new URL(
    shopifyShareImageUrl('https://cdn.shopify.com/s/files/1/1989/5889/files/Rose.jpg?v=1758673105'),
  );
  assert.equal(url.searchParams.get('v'), '1758673105');
  assert.equal(url.searchParams.get('width'), '1200');
  assert.equal(url.searchParams.get('height'), '630');
  assert.equal(url.searchParams.get('pad_color'), 'F2F0E9');
});

test('accepts Shopify product ids as gids, numeric strings or numbers only', () => {
  assert.equal(toShopifyProductGid('gid://shopify/Product/10168417419546'), 'gid://shopify/Product/10168417419546');
  assert.equal(toShopifyProductGid('10168417419546'), 'gid://shopify/Product/10168417419546');
  // Sanity Connect stores some ids as numbers (The Traveler Set).
  assert.equal(toShopifyProductGid(10318654701850), 'gid://shopify/Product/10318654701850');
  assert.equal(toShopifyProductGid('carmel'), null);
  assert.equal(toShopifyProductGid(undefined), null);
});

test('product page builds offers from Shopify and keeps a fallback when it is down', async () => {
  const page = await readFile('src/app/(site)/product/[slug]/page.tsx', 'utf8');
  assert.match(page, /getProductOffers/);
  assert.match(page, /buildOffers\(offers\.variants/);
  assert.match(page, /fallbackOffers\(product/);
  assert.match(page, /other: productOpenGraphTags/);
  assert.doesNotMatch(page, /type: 'website'/);
});

test('footer and Organization profile link to Instagram, not the old Etsy shop', async () => {
  const footer = await readFile('src/components/navigation/GlobalFooter.tsx', 'utf8');
  const layout = await readFile('src/app/layout.tsx', 'utf8');
  const social = await readFile('src/lib/social.ts', 'utf8');
  assert.match(social, /https:\/\/www\.instagram\.com\/\$\{INSTAGRAM_HANDLE\}\//);
  assert.match(footer, /href=\{INSTAGRAM_URL\}/);
  assert.match(footer, /rel="noopener noreferrer"/);
  assert.match(layout, /sameAs: \[INSTAGRAM_URL\]/);
  assert.doesNotMatch(layout, /etsy\.com/);
  assert.match(layout, /email: 'support@tarifeattar\.com'/);
});
