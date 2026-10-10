import test from 'node:test';
import assert from 'node:assert/strict';
import { selectFeaturedProducts } from '../../src/lib/featured/selectFeaturedProducts.ts';

const BIG_SUR = 'gid://shopify/ProductVariant/big-sur';
const TOBAGO = 'gid://shopify/ProductVariant/tobago';
const SERENGETI = 'gid://shopify/ProductVariant/serengeti';
const RIYADH = 'gid://shopify/ProductVariant/riyadh';
const SAMARKAND = 'gid://shopify/ProductVariant/samarkand';
const HUDSON = 'gid://shopify/ProductVariant/hudson';

function oil(overrides) {
  return {
    inStock: true,
    shopifyVariant6mlId: `gid://shopify/ProductVariant/${overrides.slug}`,
    ...overrides,
    _id: overrides.slug,
    slug: { current: overrides.slug },
  };
}

const catalog = [
  oil({ slug: 'samarkand', title: 'SAMARKAND', _createdAt: '2026-03-18T23:29:25Z', shopifyVariant6mlId: SAMARKAND }),
  oil({ slug: 'riyadh', title: 'RIYADH', _createdAt: '2026-03-18T23:29:24Z', shopifyVariant6mlId: RIYADH }),
  oil({ slug: 'hudson', title: 'HUDSON', _createdAt: '2026-03-18T23:29:21Z', shopifyVariant6mlId: HUDSON }),
  oil({ slug: 'big-sur', title: 'BIG SUR', _createdAt: '2026-03-18T23:29:10Z', shopifyVariant6mlId: BIG_SUR }),
  oil({ slug: 'tobago', title: 'TOBAGO', _createdAt: '2026-03-18T23:28:58Z', shopifyVariant6mlId: TOBAGO }),
  oil({ slug: 'serengeti', title: 'SERENGETI', _createdAt: '2026-03-18T23:28:52Z', shopifyVariant6mlId: SERENGETI }),
];

test('leads with Big Sur, Tobago and Serengeti when each has a size for sale', () => {
  const availability = new Map([
    [BIG_SUR, true],
    [TOBAGO, true],
    [SERENGETI, true],
    [RIYADH, false],
    [SAMARKAND, true],
    [HUDSON, true],
  ]);

  const selected = selectFeaturedProducts(catalog, availability).map((product) => product.slug.current);
  assert.deepEqual(selected, ['big-sur', 'tobago', 'serengeti']);
});

test('skips a sold-out pin and fills with the newest oil Shopify can still sell', () => {
  const availability = new Map([
    [BIG_SUR, true],
    [TOBAGO, false],
    [SERENGETI, true],
    [RIYADH, false],
    [SAMARKAND, true],
    [HUDSON, true],
  ]);

  const selected = selectFeaturedProducts(catalog, availability).map((product) => product.slug.current);
  assert.deepEqual(selected, ['big-sur', 'serengeti', 'samarkand']);
});

test('does not feature a waypoint Sanity still marks in stock when every size is sold out', () => {
  const availability = new Map([
    [BIG_SUR, false],
    [TOBAGO, false],
    [SERENGETI, false],
    [RIYADH, false],
    [SAMARKAND, true],
    [HUDSON, true],
  ]);

  const selected = selectFeaturedProducts(catalog, availability).map((product) => product.title);
  assert.deepEqual(selected, ['SAMARKAND', 'HUDSON']);
  assert.equal(selected.includes('RIYADH'), false);
});

test('without a Shopify answer, keeps the pins Sanity marks in stock and ignores the stale newest order', () => {
  const withStaleFlag = catalog.map((product) =>
    product.slug.current === 'riyadh' ? { ...product, inStock: true } : product,
  );
  const selected = selectFeaturedProducts(withStaleFlag, null).map((product) => product.slug.current);
  assert.deepEqual(selected, ['big-sur', 'tobago', 'serengeti']);
});

test('without a Shopify answer, a pin marked out of stock yields to the next newest in-stock oil', () => {
  const withPinOut = catalog.map((product) =>
    product.slug.current === 'tobago' ? { ...product, inStock: false } : product,
  );
  const selected = selectFeaturedProducts(withPinOut, null).map((product) => product.slug.current);
  assert.deepEqual(selected, ['big-sur', 'serengeti', 'samarkand']);
});
