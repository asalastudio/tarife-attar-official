import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildAttributionAttributePatch,
  getAttributionAttributeFingerprint,
} from '../../src/lib/shopify/cart-attributes.ts';

test('fingerprints only non-empty ta_ attributes in deterministic order', () => {
  assert.equal(
    getAttributionAttributeFingerprint([
      { key: 'note', value: 'gift' },
      { key: 'ta_latest_utm_source', value: 'google' },
      { key: 'ta_first_utm_source', value: 'omnisend' },
      { key: 'ta_empty', value: '' },
    ]),
    'ta_first_utm_source=omnisend&ta_latest_utm_source=google',
  );
});

test('returns no patch when current attribution already matches desired values', () => {
  const current = [
    { key: 'note', value: 'gift' },
    { key: 'ta_first_utm_source', value: 'omnisend' },
  ];
  const desired = [{ key: 'ta_first_utm_source', value: 'omnisend' }];

  assert.deepEqual(buildAttributionAttributePatch(current, desired), []);
});

test('replaces stale attribution keys while preserving unrelated cart attributes', () => {
  const patch = buildAttributionAttributePatch(
    [
      { key: 'note', value: 'gift' },
      { key: 'ta_first_utm_source', value: 'omnisend' },
      { key: 'ta_latest_fbclid', value: 'old-click' },
    ],
    [
      { key: 'ta_first_utm_source', value: 'omnisend' },
      { key: 'ta_latest_utm_source', value: 'google' },
    ],
  );

  assert.deepEqual(patch, [
    { key: 'note', value: 'gift' },
    { key: 'ta_first_utm_source', value: 'omnisend' },
    { key: 'ta_latest_utm_source', value: 'google' },
  ]);
});

test('consent rejection removes every attribution key and preserves other attributes', () => {
  assert.deepEqual(
    buildAttributionAttributePatch(
      [
        { key: 'note', value: 'gift' },
        { key: 'ta_first_utm_source', value: 'omnisend' },
        { key: 'ta_latest_utm_source', value: 'google' },
      ],
      [],
    ),
    [{ key: 'note', value: 'gift' }],
  );
});
