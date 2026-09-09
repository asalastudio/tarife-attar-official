import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import nextConfig from '../../next.config.js';

const entries = await nextConfig.headers();
const csp = entries[0].headers.find(
  ({ key }) => key === 'Content-Security-Policy',
).value;

test('CSP permits Shopify consent, GA4, and the consent-gated Meta Pixel', () => {
  assert.match(csp, /https:\/\/www\.googletagmanager\.com/);
  assert.match(csp, /https:\/\/\*\.google-analytics\.com/);
  assert.match(csp, /https:\/\/checkout\.tarifeattar\.com/);
  assert.match(csp, /https:\/\/connect\.facebook\.net/);
  assert.match(csp, /https:\/\/www\.facebook\.com/);
});

test('CSP retains strict object, base, and framing directives', () => {
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /base-uri 'self'/);
  assert.match(csp, /frame-ancestors 'self'/);
});

test('environment example documents public measurement settings and server-only email key', async () => {
  const environment = await readFile('.env.example', 'utf8');
  assert.match(
    environment,
    /^NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN=vasana-perfumes\.myshopify\.com$/m,
  );
  assert.match(environment, /^NEXT_PUBLIC_GA4_MEASUREMENT_ID=$/m);
  assert.match(environment, /^OMNISEND_API_KEY=$/m);
  assert.match(environment, /public\/browser-safe/i);
  assert.match(environment, /server-only/i);
});

test('privacy page exposes consent preferences without disabling cart or checkout', async () => {
  const button = await readFile(
    'src/components/privacy/PrivacyPreferencesButton.tsx',
    'utf8',
  );
  const page = await readFile('src/app/(site)/privacy/page.tsx', 'utf8');

  assert.match(button, /showPreferences/);
  assert.match(button, /disabled=\{!ready \|\| !controlsAvailable\}/);
  assert.match(page, /PrivacyPreferencesButton/);
  assert.match(page, /declining[\s\S]*cart[\s\S]*checkout/i);
});
