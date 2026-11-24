import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  FALLBACK_TERRITORY_PRICING,
  defaultSizeIndex,
  formatPriceRange,
  formatUsd,
  gridOffer,
  resolveProductOffer,
  sanityFallbackSizes,
  shopifySizes,
  withLiveOffers,
} from '../../src/lib/product-offers.ts';

process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN = 'test-store.myshopify.com';
process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN = 'test-token';
const { getProductsOffers, PRODUCT_OFFERS_QUERY, PRODUCTS_OFFERS_QUERY } = await import(
  '../../src/lib/shopify/client.ts'
);

const usd = (amount) => ({ amount, currencyCode: 'USD' });
const variant = (id, title, amount, availableForSale, extra = {}) => ({
  id: `gid://shopify/ProductVariant/${id}`,
  title,
  sku: null,
  availableForSale,
  price: usd(amount),
  compareAtPrice: null,
  ...extra,
});

// Live Shopify answers (vasana-perfumes, 24 Nov 2026), in Shopify's own order.
const damascusShopify = [
  variant(51619134177562, '6ml', '30.0', false),
  variant(51619134210330, '12ml', '50.0', true),
  variant(52932616454426, '3ml', '23.0', true),
];
const hojariShopify = [variant(51098075005210, '10ml', '65.0', false)];
const travelerShopify = [variant(52505808994586, 'Default Title', '95.0', true)];

// What Sanity held when the sizes had drifted: Sacred Hojari as 60ml at $50.
const hojariSanity = {
  slug: { current: 'sacred-hojari' },
  collectionType: 'relic',
  shopifyProductId: 'gid://shopify/Product/10002041045274',
  price: 50,
  volume: '60ml',
  inStock: true,
  shopifyVariantId: 'gid://shopify/ProductVariant/51098075005210',
};
const damascusSanity = {
  slug: { current: 'damascus' },
  collectionType: 'atlas',
  shopifyProductId: 'gid://shopify/Product/10104464343322',
  price: 30,
  inStock: true,
  atlasData: { atmosphere: 'petal' },
  shopifyVariantId: 'gid://shopify/ProductVariant/51619134177562',
  shopifyVariant3mlId: 'gid://shopify/ProductVariant/52932616454426',
  shopifyVariant6mlId: 'gid://shopify/ProductVariant/51619134177562',
  shopifyVariant12mlId: 'gid://shopify/ProductVariant/51619134210330',
};
const travelerSanity = {
  slug: { current: 'the-traveler-set' },
  collectionType: 'gift',
  shopifyProductId: 10318654701850,
  price: null,
  compareAtPrice: 95,
  volume: '10 x 3ml',
  inStock: true,
  shopifyVariantId: 'gid://shopify/ProductVariant/52505808994586',
};

function recorder() {
  const messages = [];
  const log = (message) => messages.push(message);
  return { messages, log };
}

test('sizes come from Shopify in 3ml, 6ml, 12ml order with their variant, price and stock', () => {
  const { messages, log } = recorder();
  const offer = resolveProductOffer(damascusSanity, damascusShopify, log);
  assert.equal(offer.source, 'shopify');
  assert.deepEqual(
    offer.sizes.map((s) => [s.label, s.price, s.availableForSale, s.variantId]),
    [
      ['3ml', 23, true, 'gid://shopify/ProductVariant/52932616454426'],
      ['6ml', 30, false, 'gid://shopify/ProductVariant/51619134177562'],
      ['12ml', 50, true, 'gid://shopify/ProductVariant/51619134210330'],
    ],
  );
  assert.deepEqual(messages, [], 'no fallback, so nothing is logged');
});

test('sizes Shopify sells beyond 3/6/12ml follow them in Shopify order', () => {
  const sizes = shopifySizes([
    variant(1, '30ml', '90.0', true),
    variant(2, '12ml', '50.0', true),
    variant(3, '10ml', '65.0', true),
    variant(4, '3ml', '23.0', true),
  ]);
  assert.deepEqual(sizes.map((s) => s.label), ['3ml', '12ml', '30ml', '10ml']);
});

test('the page opens on 6ml when it is in stock, else the first size that is', () => {
  const sizes = (stock) => shopifySizes([
    variant(3, '3ml', '23.0', stock[0]),
    variant(6, '6ml', '30.0', stock[1]),
    variant(12, '12ml', '50.0', stock[2]),
  ]);
  assert.equal(defaultSizeIndex(sizes([true, true, true])), 1);
  assert.equal(defaultSizeIndex(sizes([true, false, true])), 0, '6ml sold out: 3ml');
  assert.equal(defaultSizeIndex(sizes([false, false, true])), 2, 'then 12ml');
  assert.equal(defaultSizeIndex(sizes([false, false, false])), 1, 'all sold out: back to 6ml');
  assert.equal(resolveProductOffer(damascusSanity, damascusShopify, () => {}).defaultIndex, 0);
});

test('a Relic shows Shopify size and price even when Sanity disagrees', () => {
  const offer = resolveProductOffer(hojariSanity, hojariShopify, () => {});
  assert.deepEqual(offer.sizes, [{
    variantId: 'gid://shopify/ProductVariant/51098075005210',
    label: '10ml',
    price: 65,
    compareAtPrice: null,
    availableForSale: false,
  }]);
});

test('a product with no size option has no size label and its Shopify price', () => {
  const offer = resolveProductOffer(travelerSanity, travelerShopify, () => {});
  assert.equal(offer.sizes.length, 1);
  assert.equal(offer.sizes[0].label, null);
  assert.equal(offer.sizes[0].price, 95);
  assert.equal(offer.sizes[0].compareAtPrice, null, "Sanity's compare-at price is not used");
});

test('a compare-at price is kept only when it is higher than the price', () => {
  const [sale, notSale] = shopifySizes([
    variant(1, '6ml', '28.0', true, { compareAtPrice: usd('35.0') }),
    variant(2, '12ml', '48.0', true, { compareAtPrice: usd('48.0') }),
  ]);
  assert.equal(sale.compareAtPrice, 35);
  assert.equal(notSale.compareAtPrice, null);
});

test('Shopify down: Atlas falls back to the territory table and Sanity variant ids, and logs it', () => {
  const { messages, log } = recorder();
  const offer = resolveProductOffer(damascusSanity, null, log);
  assert.equal(offer.source, 'sanity');
  assert.deepEqual(
    offer.sizes.map((s) => [s.label, s.price, s.variantId]),
    [
      ['3ml', FALLBACK_TERRITORY_PRICING.petal['3ml'], damascusSanity.shopifyVariant3mlId],
      ['6ml', FALLBACK_TERRITORY_PRICING.petal['6ml'], damascusSanity.shopifyVariant6mlId],
      ['12ml', FALLBACK_TERRITORY_PRICING.petal['12ml'], damascusSanity.shopifyVariant12mlId],
    ],
  );
  assert.equal(offer.defaultIndex, 1);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /damascus/);
  assert.match(messages[0], /Shopify did not answer/);
  assert.match(messages[0], /Sanity fallback/);
});

test('fallback offers 3ml only when Sanity holds its variant id', () => {
  const sizes = sanityFallbackSizes({ ...damascusSanity, shopifyVariant3mlId: null });
  assert.deepEqual(sizes.map((s) => s.label), ['6ml', '12ml']);
});

test('fallback for a Relic or gift uses the Sanity price, volume, variant id and stock', () => {
  const { messages, log } = recorder();
  const offer = resolveProductOffer({ ...hojariSanity, inStock: false }, [], log);
  assert.deepEqual(offer.sizes, [{
    variantId: hojariSanity.shopifyVariantId,
    label: '60ml',
    price: 50,
    compareAtPrice: null,
    availableForSale: false,
  }]);
  assert.match(messages[0], /sacred-hojari: Shopify returned no variants/);
});

test('fallback says when Sanity has no Shopify product id at all', () => {
  const { messages, log } = recorder();
  resolveProductOffer({ ...hojariSanity, shopifyProductId: null }, null, log);
  assert.match(messages[0], /no Shopify product id in Sanity/);
});

test('a grid card shows the lowest price that can be bought, and whether any size can', () => {
  const sizes = shopifySizes(damascusShopify);
  assert.deepEqual(gridOffer(sizes, 'shopify'), {
    price: 23,
    compareAtPrice: null,
    priceRange: { min: 23, max: 50 },
    inStock: true,
    offerSource: 'shopify',
  });
  const soldOut = gridOffer(shopifySizes(hojariShopify), 'shopify');
  assert.equal(soldOut.price, 65, 'sold out: still shows its price');
  assert.equal(soldOut.inStock, false);
  const threeGone = gridOffer(shopifySizes([
    variant(3, '3ml', '23.0', false),
    variant(6, '6ml', '30.0', true),
  ]), 'shopify');
  assert.equal(threeGone.price, 30, '3ml sold out: starts at 6ml');
});

test('grids write Shopify price and stock over Sanity and log the cards that fell back', () => {
  const { messages, log } = recorder();
  const live = new Map([
    ['gid://shopify/Product/10104464343322', damascusShopify],
    ['gid://shopify/Product/10002041045274', hojariShopify],
  ]);
  const missing = { slug: { current: 'majmua' }, collectionType: 'relic', shopifyProductId: '10002043928858', price: 40, inStock: false };
  const cards = withLiveOffers([damascusSanity, hojariSanity, missing], live, { page: '/test', log });
  assert.deepEqual(
    cards.map((c) => [c.slug.current, c.price, c.inStock, c.offerSource]),
    [
      ['damascus', 23, true, 'shopify'],
      ['sacred-hojari', 65, false, 'shopify'],
      ['majmua', 40, false, 'sanity'],
    ],
  );
  assert.equal(messages.length, 1, 'one line per page');
  assert.match(messages[0], /\/test: no Shopify variants for 1 of 3 products \(majmua\)/);
});

test('grids fall back for every card, with one log line, when Shopify is down', () => {
  const { messages, log } = recorder();
  const cards = withLiveOffers(
    [{ ...damascusSanity, atlasData: undefined, atmosphere: 'ember', shopifyVariant3mlId: undefined }],
    null,
    { page: '/atlas', log },
  );
  assert.equal(cards[0].price, FALLBACK_TERRITORY_PRICING.ember['6ml'], 'grid queries carry no 3ml id');
  assert.equal(cards[0].offerSource, 'sanity');
  assert.match(messages[0], /\/atlas: Shopify did not answer for 1 of 1 products/);
});

test('prices read as whole dollars, with cents only when needed', () => {
  assert.equal(formatUsd(65), '$65');
  assert.equal(formatUsd(22.5), '$22.50');
  assert.equal(formatPriceRange([{ priceRange: { min: 23, max: 30 } }, { priceRange: { min: 28, max: 50 } }]), '$23 – $50');
  assert.equal(formatPriceRange([{ priceRange: { min: 95, max: 95 } }]), '$95');
  assert.equal(formatPriceRange([{ priceRange: null }]), '');
});

test('both Shopify queries fetch the variant id and compare-at price the site needs', () => {
  for (const query of [PRODUCT_OFFERS_QUERY, PRODUCTS_OFFERS_QUERY]) {
    assert.match(query, /\bid\b/);
    assert.match(query, /availableForSale/);
    assert.match(query, /price \{ amount currencyCode \}/);
    assert.match(query, /compareAtPrice \{ amount currencyCode \}/);
  }
  assert.match(PRODUCTS_OFFERS_QUERY, /nodes\(ids: \$ids\)/);
});

test('one batched Storefront request per grid, keyed by product gid', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body), init });
    return new Response(JSON.stringify({
      data: {
        nodes: [
          { id: 'gid://shopify/Product/1', variants: { nodes: hojariShopify } },
          null,
        ],
      },
    }));
  });
  const offers = await getProductsOffers(['gid://shopify/Product/1', 'gid://shopify/Product/2', 'gid://shopify/Product/1']);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://test-store.myshopify.com/api/2026-01/graphql.json');
  assert.deepEqual(calls[0].body.variables.ids, ['gid://shopify/Product/1', 'gid://shopify/Product/2']);
  assert.equal(calls[0].init.next.revalidate, 60, 'cached for a minute');
  assert.deepEqual(offers.get('gid://shopify/Product/1'), hojariShopify);
  assert.equal(offers.has('gid://shopify/Product/2'), false, 'products Shopify does not return are left out');
});

test('the batched request answers null when Shopify errors or cannot be reached', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ errors: [{ message: 'Throttled' }] })));
  assert.equal(await getProductsOffers(['gid://shopify/Product/1']), null);
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('fetch failed'); });
  const quiet = t.mock.method(console, 'error', () => {});
  assert.equal(await getProductsOffers(['gid://shopify/Product/1']), null);
  assert.ok(quiet.mock.callCount() >= 1);
});

test('no products, no request', async (t) => {
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('{}'));
  assert.equal((await getProductsOffers([])).size, 0);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('product page renders price, sizes, variant and stock from the resolved offer', async () => {
  const page = await readFile('src/app/(site)/product/[slug]/page.tsx', 'utf8');
  const client = await readFile('src/app/(site)/product/[slug]/ProductDetailClient.tsx', 'utf8');
  assert.match(page, /resolveProductOffer\(product, offers \? offers\.variants : null\)/);
  assert.match(page, /offer=\{offer\}/);
  assert.match(page, /withLiveOffers\(related, relatedOffers/);
  assert.doesNotMatch(page, /territoryPricing/);

  // Sanity's commerce fields are declared for the fallback, never rendered.
  for (const field of [
    /product\.price\b/,
    /product\.compareAtPrice\b/,
    /product\.volume\b/,
    /product\.inStock\b/,
    /product\.shopifyVariantId\b/,
    /product\.shopifyVariant(3|6|12)mlId\b/,
    /TERRITORY_PRICING/,
  ]) {
    assert.doesNotMatch(client, field);
  }
  assert.match(client, /const selectedShopifyVariantId = selectedSize\?\.variantId/);
  assert.match(client, /const variantIdToAdd = selectedShopifyVariantId;/);
  assert.match(client, /sizes\.map\(\(size, index\) =>/);
});

test('the phone purchase bar is still one full-width button with the line total', async () => {
  const client = await readFile('src/app/(site)/product/[slug]/ProductDetailClient.tsx', 'utf8');
  const dock = client.slice(client.indexOf('ref={dockRef}'));
  assert.equal((dock.match(/<button/g) ?? []).length, 1, 'one button in the bar');
  assert.match(dock, /className=\{`w-full h-14/);
  assert.match(dock, /onClick=\{\(\) => handleAddToSatchel\('mobile'\)\}/);
  assert.match(dock, /\{selectedVariantLabel \? `\$\{selectedVariantLabel\} \\u00b7 ` : ''\}/);
  assert.match(dock, /\{lineTotalLabel\}/);
  assert.match(client, /const lineTotalLabel = formatUsd\(lineTotal\);/);
});

test('Atlas, Relic and gift grids price and stock their cards from Shopify', async () => {
  const queries = await readFile('src/sanity/lib/queries.ts', 'utf8');
  for (const name of ['atlasProductsByTerritoryQuery', 'relicProductsQuery', 'giftProductsQuery']) {
    const start = queries.indexOf(`export const ${name}`);
    const block = queries.slice(start, queries.indexOf('`;', start));
    assert.match(block, /"shopifyProductId": coalesce\(shopifyProductId, store\.id\)/, name);
  }
  for (const [route, page] of [['atlas', '/atlas'], ['relic', '/relic'], ['gift', '/gift']]) {
    const source = await readFile(`src/app/(site)/${route}/page.tsx`, 'utf8');
    assert.match(source, /getProductsOffers\(/, route);
    assert.match(source, new RegExp(`withLiveOffers\\(sanityProducts, live, \\{ page: "${page}" \\}\\)`), route);
  }
  const atlas = await readFile('src/app/(site)/atlas/AtlasClient.tsx', 'utf8');
  assert.doesNotMatch(atlas, /TERRITORY_PRICING/);
  assert.match(atlas, /formatPriceRange\(territory\.products\)/);
});
