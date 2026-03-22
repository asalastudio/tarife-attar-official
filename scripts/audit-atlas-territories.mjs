#!/usr/bin/env node
/**
 * Audit Atlas Collection Territories — Final 28 Waypoints
 *
 * Validates that each territory has the correct 7 products:
 *   Ember (7): aden, ethiopia, granada, oman, petra, serengeti, zanzibar
 *   Tidal (7): bahia, bahrain, big-sur, kyoto, monaco, tangiers, tigris
 *   Petal (7): amer, damascus, grasse, kandy, manali, medina, siwa
 *   Terra (7): astoria, havana, marrakesh, riyadh, samarkand, sicily, tulum
 *
 * Total: 28 products
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  } catch {
    // File doesn't exist
  }
}

loadEnvFile(join(projectRoot, '.env.local'));
loadEnvFile(join(projectRoot, '.env'));

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
});

const EXPECTED_PRODUCTS = {
  ember: ['aden', 'ethiopia', 'granada', 'oman', 'petra', 'serengeti', 'zanzibar'],
  tidal: ['bahia', 'bahrain', 'big-sur', 'kyoto', 'monaco', 'tangiers', 'tigris'],
  petal: ['amer', 'damascus', 'grasse', 'kandy', 'manali', 'medina', 'siwa'],
  terra: ['astoria', 'havana', 'marrakesh', 'riyadh', 'samarkand', 'sicily', 'tulum'],
};

const EXPECTED_TOTAL = Object.values(EXPECTED_PRODUCTS).flat().length;

function normalizeSlug(title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function auditAtlasTerritories() {
  console.log('\n  AUDITING ATLAS COLLECTION — 28 WAYPOINTS\n');
  console.log('='.repeat(70));

  const products = await client.fetch(`
    *[_type == "product" && collectionType == "atlas" && !(_id in path("drafts.**"))] {
      _id, title, "slug": slug.current,
      "atmosphere": atlasData.atmosphere,
      "latitude": atlasData.latitude,
      "longitude": atlasData.longitude,
      "gpsCoordinates": atlasData.gpsCoordinates,
      shopifyProductId, shopifyHandle, _createdAt
    } | order(title asc)
  `);

  console.log(`\n  Found ${products.length} Atlas products (expected ${EXPECTED_TOTAL})\n`);

  const byTerritory = { ember: [], tidal: [], petal: [], terra: [], unknown: [] };
  products.forEach((p) => {
    const t = (p.atmosphere || '').toLowerCase();
    (byTerritory[t] || byTerritory.unknown).push(p);
  });

  const issues = [];

  for (const [territory, expectedSlugs] of Object.entries(EXPECTED_PRODUCTS)) {
    const actual = byTerritory[territory] || [];
    const actualSlugs = actual.map((p) => p.slug || normalizeSlug(p.title));

    console.log(`${'─'.repeat(70)}`);
    console.log(`  ${territory.toUpperCase()} Territory (Expected: ${expectedSlugs.length}, Actual: ${actual.length})`);

    const missing = expectedSlugs.filter((s) => !actualSlugs.includes(s));
    const extra = actual.filter((p) => !expectedSlugs.includes(p.slug || normalizeSlug(p.title)));

    if (actual.length > 0) {
      console.log('  Current products:');
      actual.forEach((p) => {
        const slug = p.slug || normalizeSlug(p.title);
        const isExpected = expectedSlugs.includes(slug);
        const gps = p.latitude && p.longitude ? `(${p.latitude}, ${p.longitude})` : '(no GPS)';
        console.log(`    ${isExpected ? 'OK' : 'XX'} ${p.title} [${slug}] ${gps}`);
      });
    }

    if (missing.length > 0) {
      console.log(`  MISSING: ${missing.join(', ')}`);
      issues.push({ territory, type: 'missing', items: missing });
    }
    if (extra.length > 0) {
      console.log('  EXTRA:');
      extra.forEach((p) => console.log(`    - ${p.title} (${p._id})`));
      issues.push({ territory, type: 'extra', items: extra.map((p) => p.title) });
    }
    console.log('');
  }

  if (byTerritory.unknown.length > 0) {
    console.log(`${'─'.repeat(70)}`);
    console.log(`  UNKNOWN TERRITORY (${byTerritory.unknown.length} products):`);
    byTerritory.unknown.forEach((p) => {
      console.log(`    - ${p.title} [${p.slug}] atmosphere="${p.atmosphere || 'not set'}"`);
    });
    console.log('');
  }

  console.log('='.repeat(70));
  console.log(`\n  SUMMARY:`);
  console.log(`    Total Atlas products: ${products.length} / ${EXPECTED_TOTAL} expected`);
  console.log(`    Issues found: ${issues.length}`);
  console.log(`    Ember: ${byTerritory.ember.length}/7 | Tidal: ${byTerritory.tidal.length}/7`);
  console.log(`    Petal: ${byTerritory.petal.length}/7 | Terra: ${byTerritory.terra.length}/7`);
  if (byTerritory.unknown.length) console.log(`    Unknown: ${byTerritory.unknown.length}`);
  console.log('');

  return { products, byTerritory, issues };
}

auditAtlasTerritories().catch(console.error);
