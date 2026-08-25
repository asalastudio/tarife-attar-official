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

test('blanks stale attribution keys while applying new desired values', () => {
  const patch = buildAttributionAttributePatch(
    [
      { key: 'ta_first_utm_source', value: 'omnisend' },
      { key: 'ta_latest_fbclid', value: 'old-click' },
    ],
    [
      { key: 'ta_first_utm_source', value: 'omnisend' },
      { key: 'ta_latest_utm_source', value: 'google' },
    ],
  );

  assert.deepEqual(patch, [
    { key: 'ta_first_utm_source', value: 'omnisend' },
    { key: 'ta_latest_fbclid', value: '' },
    { key: 'ta_latest_utm_source', value: 'google' },
  ]);
});

test('consent rejection blanks every existing attribution value', () => {
  assert.deepEqual(
    buildAttributionAttributePatch(
      [
        { key: 'note', value: 'gift' },
        { key: 'ta_first_utm_source', value: 'omnisend' },
        { key: 'ta_latest_utm_source', value: 'google' },
      ],
      [],
    ),
    [
      { key: 'ta_first_utm_source', value: '' },
      { key: 'ta_latest_utm_source', value: '' },
    ],
  );
});
