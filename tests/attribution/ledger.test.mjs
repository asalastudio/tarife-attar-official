import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeAttribution,
  parseInboundTouch,
  parseStoredLedger,
  resolveAttributionForConsent,
  serializeCartAttributes,
} from '../../src/lib/attribution/ledger.ts';

const ownHosts = [
  'www.tarifeattar.com',
  'tarifeattar.com',
  'checkout.tarifeattar.com',
];

const first = parseInboundTouch({
  url: 'https://www.tarifeattar.com/product/granada?utm_source=omnisend&utm_medium=email&utm_campaign=revenue_bridge&utm_content=hero&gclid=G-123&ignored=secret',
  referrer: 'https://mail.google.com/mail/u/0/?account=private',
  ownHosts,
  capturedAt: '2026-08-25T16:00:00.000Z',
});

test('retains only attribution parameters on the landing page', () => {
  assert.equal(first?.qualified, true);
  assert.equal(first?.touch.utm_source, 'omnisend');
  assert.equal(
    first?.touch.landing_page,
    'https://www.tarifeattar.com/product/granada?utm_source=omnisend&utm_medium=email&utm_campaign=revenue_bridge&utm_content=hero&gclid=G-123',
  );
});

test('strips query data from the external referrer', () => {
  assert.equal(first?.touch.referrer, 'https://mail.google.com/mail/u/0/');
});

test('never overwrites first touch during internal navigation', () => {
  const initial = mergeAttribution(null, first);
  const internal = parseInboundTouch({
    url: 'https://www.tarifeattar.com/cart',
    referrer: 'https://www.tarifeattar.com/product/granada',
    ownHosts,
    capturedAt: '2026-08-25T16:05:00.000Z',
  });

  assert.deepEqual(mergeAttribution(initial, internal), initial);
});

test('updates only latest touch for a qualified second campaign', () => {
  const initial = mergeAttribution(null, first);
  const second = parseInboundTouch({
    url: 'https://www.tarifeattar.com/atlas?utm_source=google&utm_medium=organic&utm_campaign=attar_guide',
    referrer: 'https://www.google.com/search?q=attar',
    ownHosts,
    capturedAt: '2026-08-26T16:00:00.000Z',
  });
  const merged = mergeAttribution(initial, second);

  assert.equal(merged?.first.utm_source, 'omnisend');
  assert.equal(merged?.latest.utm_source, 'google');
});

test('records a direct visit only when initializing a ledger', () => {
  const direct = parseInboundTouch({
    url: 'https://www.tarifeattar.com/atlas',
    referrer: '',
    ownHosts,
    capturedAt: '2026-08-27T16:00:00.000Z',
  });
  const directLedger = mergeAttribution(null, direct);

  assert.equal(direct?.qualified, false);
  assert.equal(directLedger?.first.utm_source, '(direct)');
  assert.equal(directLedger?.first.utm_medium, '(none)');
  assert.deepEqual(mergeAttribution(mergeAttribution(null, first), direct), mergeAttribution(null, first));
});

test('rejects invalid stored versions', () => {
  assert.equal(parseStoredLedger('{"version":99}'), null);
  assert.equal(parseStoredLedger('not-json'), null);
});

test('emits deterministic namespaced Shopify attributes', () => {
  const attrs = serializeCartAttributes(mergeAttribution(null, first));

  assert.equal(attrs[0].key, 'ta_attribution_version');
  assert.equal(attrs[0].value, '1');
  assert.equal(
    attrs.find(({ key }) => key === 'ta_first_utm_source')?.value,
    'omnisend',
  );
  assert.ok(
    attrs.every(
      ({ key, value }) => key.startsWith('ta_') && !/[\u0000-\u001F]/.test(value),
    ),
  );
});

test('clears attribution when marketing processing is denied', () => {
  const stored = mergeAttribution(null, first);

  assert.deepEqual(
    resolveAttributionForConsent({
      marketingAllowed: false,
      stored,
      inbound: first,
    }),
    { ledger: null, storageAction: 'clear' },
  );
});

test('merges pending inbound attribution after marketing consent', () => {
  const stored = mergeAttribution(null, first);
  const second = parseInboundTouch({
    url: 'https://www.tarifeattar.com/atlas?utm_source=google&utm_medium=organic&utm_campaign=attar_guide',
    referrer: 'https://www.google.com/search?q=attar',
    ownHosts,
    capturedAt: '2026-08-26T16:00:00.000Z',
  });
  const result = resolveAttributionForConsent({
    marketingAllowed: true,
    stored,
    inbound: second,
  });

  assert.equal(result.ledger?.first.utm_source, 'omnisend');
  assert.equal(result.ledger?.latest.utm_source, 'google');
  assert.equal(result.storageAction, 'write');
});

test('labels untagged search engine visits organic and keeps other referrers as referrals', () => {
  const visit = (referrer) =>
    parseInboundTouch({
      url: 'https://www.tarifeattar.com/atlas',
      referrer,
      ownHosts,
      capturedAt: '2026-10-23T16:00:00.000Z',
    })?.touch;

  for (const [referrer, source] of [
    ['https://www.google.com/', 'google'],
    ['https://www.google.co.uk/search?q=attar', 'google'],
    ['https://www.bing.com/search?q=attar', 'bing'],
    ['https://duckduckgo.com/', 'duckduckgo'],
    ['https://www.ecosia.org/search?q=attar', 'ecosia'],
    ['https://search.yahoo.com/search?p=attar', 'yahoo'],
    ['https://search.yahoo.co.jp/search?p=attar', 'yahoo'],
    ['https://yandex.kz/search/?text=attar', 'yandex'],
  ]) {
    const touch = visit(referrer);
    assert.equal(touch?.utm_source, source, referrer);
    assert.equal(touch?.utm_medium, 'organic', referrer);
  }

  for (const [referrer, host] of [
    ['https://mail.google.com/mail/u/0/', 'mail.google.com'],
    ['https://google.example.com/', 'google.example.com'],
    ['https://mail.yahoo.co.jp/', 'mail.yahoo.co.jp'],
    ['https://yandex.example.kz/', 'yandex.example.kz'],
    ['https://www.promocodes.com/tarife', 'www.promocodes.com'],
  ]) {
    const touch = visit(referrer);
    assert.equal(touch?.utm_source, host, referrer);
    assert.equal(touch?.utm_medium, 'referral', referrer);
  }
});

test('a campaign tag still wins over the search engine referrer', () => {
  const touch = parseInboundTouch({
    url: 'https://www.tarifeattar.com/atlas?utm_source=instagram&utm_medium=social',
    referrer: 'https://www.google.com/',
    ownHosts,
    capturedAt: '2026-10-23T16:00:00.000Z',
  })?.touch;
  assert.equal(touch?.utm_source, 'instagram');
  assert.equal(touch?.utm_medium, 'social');
});
