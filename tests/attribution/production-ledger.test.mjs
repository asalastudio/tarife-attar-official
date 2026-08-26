import test from 'node:test';
import assert from 'node:assert/strict';

import {
  mergeAttribution,
  parseInboundTouch,
  serializeCartAttributes,
} from '../../src/lib/attribution/ledger.ts';

test('campaign touch reaches deterministic Shopify order attributes', () => {
  const inbound = parseInboundTouch({
    url: 'https://www.tarifeattar.com/product/marrakesh?utm_source=shopify_email&utm_medium=email&utm_campaign=revenue_bridge_30off&utm_content=buyer_reactivation_cta',
    referrer: '',
    ownHosts: ['www.tarifeattar.com', 'tarifeattar.com'],
    capturedAt: '2026-08-25T12:46:00.000Z',
  });

  const attributes = serializeCartAttributes(
    mergeAttribution(null, inbound),
  );

  assert.equal(
    attributes.find(({ key }) => key === 'ta_first_utm_campaign')?.value,
    'revenue_bridge_30off',
  );
  assert.equal(
    attributes.find(({ key }) => key === 'ta_latest_utm_content')?.value,
    'buyer_reactivation_cta',
  );
});
