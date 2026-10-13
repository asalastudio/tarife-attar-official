import test from 'node:test';
import assert from 'node:assert/strict';
import { getSafeCheckoutUrl, getAttributedCheckoutUrl } from '../../src/lib/attribution/checkout-url.ts';

const hosts = [
  'checkout.tarifeattar.com',
  'vasana-perfumes.myshopify.com',
];

test('accepts an exact HTTPS checkout host', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://checkout.tarifeattar.com/checkouts/cn/abc?key=secret',
      hosts,
    ),
    'https://checkout.tarifeattar.com/checkouts/cn/abc?key=secret',
  );
});

test('accepts the migration Shopify host', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://vasana-perfumes.myshopify.com/checkouts/cn/abc',
      hosts,
    ),
    'https://vasana-perfumes.myshopify.com/checkouts/cn/abc',
  );
});

test('rejects non-HTTPS checkout URLs', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'http://checkout.tarifeattar.com/checkouts/cn/abc',
      hosts,
    ),
    null,
  );
});

test('rejects lookalike and arbitrary checkout hosts', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://checkout.tarifeattar.com.evil.example/checkouts/cn/abc',
      hosts,
    ),
    null,
  );
  assert.equal(
    getSafeCheckoutUrl('https://evil.example/checkouts/cn/abc', hosts),
    null,
  );
});

test('rejects credentialed and non-web URLs', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://user:pass@checkout.tarifeattar.com/checkouts/cn/abc',
      hosts,
    ),
    null,
  );
  assert.equal(getSafeCheckoutUrl('javascript:alert(1)', hosts), null);
});

test('removes fragments without changing the checkout query', () => {
  assert.equal(
    getSafeCheckoutUrl(
      'https://checkout.tarifeattar.com/checkouts/cn/abc?key=secret#fragment',
      hosts,
    ),
    'https://checkout.tarifeattar.com/checkouts/cn/abc?key=secret',
  );
});

const campaign = {utm_source:'shopify_email', utm_medium:'email', utm_campaign:'Marrakesh + activity-123'};
test('email campaign survives checkout while capability and discount remain intact', () => {
  const url = new URL(getAttributedCheckoutUrl('https://vasana-perfumes.myshopify.com/checkouts/cn/test?key=secret&discount=WELCOME10', hosts, campaign, true));
  for (const [key,value] of Object.entries(campaign)) assert.equal(url.searchParams.get(key),value);
  assert.equal(url.searchParams.get('key'),'secret');
  assert.equal(url.searchParams.get('discount'),'WELCOME10');
  assert.equal(url.hostname,'vasana-perfumes.myshopify.com');
});
test('rejected marketing never decorates checkout with persisted campaign data', () => {
  const url = new URL(getAttributedCheckoutUrl('https://vasana-perfumes.myshopify.com/checkouts/cn/test?key=secret&utm_source=old', hosts, campaign, false));
  assert.deepEqual([...url.searchParams.keys()], ['key']);
});
test('latest campaign replaces stale values without retaining old content fields', () => {
  const url = new URL(getAttributedCheckoutUrl('https://vasana-perfumes.myshopify.com/checkouts/cn/test?utm_content=old', hosts, campaign, true));
  assert.equal(url.searchParams.has('utm_content'),false);
  assert.equal(url.searchParams.get('utm_campaign'),campaign.utm_campaign);
});
test('unsafe checkout URL stays blocked even with a valid campaign', () => {
  assert.equal(getAttributedCheckoutUrl('https://evil.example', hosts, campaign, true), null);
});
