#!/usr/bin/env node
/**
 * Atlas Collection — Migration Script (Final 28 Waypoints)
 *
 * Updates existing Sanity products with new Atlas geographic names,
 * legacy name references, territory assignments, GPS coordinates,
 * and scent profiles. Also handles dropped products and new waypoints.
 *
 * Run with: SANITY_WRITE_TOKEN=your-token node scripts/migrate-atlas-rebrand.mjs
 *
 * Options:
 *   --dry-run    Preview changes without writing to Sanity
 *   --create     Create new products that don't exist yet
 *   --verbose    Show detailed output
 */

import { createClient } from '@sanity/client';
import {
  ALL_ATLAS_PRODUCTS,
  ARCHIVE_PRODUCTS,
  TERRITORIES,
  COLLECTION_SUMMARY,
} from './atlas-rebrand-data.mjs';

const projectId = '8h5l91ut';
const dataset = 'production';
const apiVersion = '2025-12-31';

const token = process.env.SANITY_WRITE_TOKEN;
const isDryRun = process.argv.includes('--dry-run');
const shouldCreate = process.argv.includes('--create');
const isVerbose = process.argv.includes('--verbose');

if (!token && !isDryRun) {
  console.error('ERROR: SANITY_WRITE_TOKEN environment variable is required.');
  console.error(`Get a write token from: https://www.sanity.io/manage/project/${projectId}/api`);
  console.error('Or run with --dry-run to preview changes.');
  process.exit(1);
}

const clientConfig = { projectId, dataset, apiVersion, useCdn: false };
if (token) clientConfig.token = token;

const client = createClient(clientConfig);

function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function log(message, type = 'info') {
  const icons = { info: '[i]', success: '[OK]', warning: '[!]', error: '[X]', update: '[~]', create: '[+]', skip: '[.]', drop: '[-]' };
  console.log(`${icons[type] || '   '} ${message}`);
}

function verbose(message) {
  if (isVerbose) console.log(`     ${message}`);
}

// ============================================================================
// FETCH EXISTING PRODUCTS
// ============================================================================

async function fetchExistingProducts() {
  log('Fetching existing products from Sanity...');
  const products = await client.fetch(`*[_type == "product"] {
    _id, _rev, title, internalName,
    "slugCurrent": slug.current,
    collectionType,
    "atmosphere": atlasData.atmosphere,
    "gpsCoordinates": atlasData.gpsCoordinates,
    "latitude": atlasData.latitude,
    "longitude": atlasData.longitude,
    legacyName, scentProfile
  }`);
  log(`Found ${products.length} existing products`);
  return products;
}

// ============================================================================
// OLD EVOCATIVE / INTERMEDIATE NAMES
// Products in Sanity may have been renamed during a previous rebrand.
// This maps new atlas slug → array of old names/slugs to check.
// ============================================================================

const OLD_NAMES_MAP = {
  'aden': ['rogue', 'oud-fire'],
  'ethiopia': ['devotion', 'frankincense-myrrh', 'frankincense-and-myrrh'],
  'granada': ['beloved', 'granada-amber'],
  'oman': ['close', 'nizwa', 'teeb-musk'],
  'petra': ['caravan', 'honey-oudh'],
  'serengeti': ['obsidian', 'black-musk'],
  'zanzibar': ['dune', 'vanilla-sands'],
  'bahia': ['coconut-jasmine'],
  'bahrain': ['fathom', 'blue-oud', 'blue-oudh'],
  'big-sur': ['delmar', 'del-mare'],
  'kyoto': ['china-rain'],
  'monaco': [],
  'tangiers': ['dubai', 'dubai-musk'],
  'tigris': [],
  'amer': ['white-amber'],
  'damascus': ['turkish-rose'],
  'grasse': ['jasmine', 'arabian-jasmine'],
  'kandy': ['cherish', 'peach-memoir'],
  'manali': ['clarity', 'himalayan-musk'],
  'medina': ['tahara', 'madina', 'musk-tahara'],
  'siwa': ['ritual', 'white-egyptian-musk'],
  'astoria': [],
  'havana': ['oud-tobacco', 'oud-and-tobacco'],
  'marrakesh': ['marrakesh'],
  'riyadh': ['black-oud'],
  'samarkand': ['regalia', 'oud-aura'],
  'sicily': ['sicilian-oudh'],
  'tulum': ['spanish-sandalwood'],
};

// ============================================================================
// MATCH: find existing Sanity product for a rebrand entry
// ============================================================================

function findExistingProduct(rebrandProduct, existingProducts) {
  const checks = [
    (p) => p.slugCurrent === rebrandProduct.slug,
    (p) => rebrandProduct.legacyName && (p.title || '').toLowerCase().trim() === rebrandProduct.legacyName.toLowerCase().trim(),
    (p) => rebrandProduct.legacyName && (p.slugCurrent || '') === createSlug(rebrandProduct.legacyName),
    (p) => (p.title || '').toLowerCase().trim() === rebrandProduct.atlasName.toLowerCase().trim(),
  ];
  for (const check of checks) {
    const match = existingProducts.find(check);
    if (match) return match;
  }

  const oldNames = OLD_NAMES_MAP[rebrandProduct.slug] || [];
  for (const oldName of oldNames) {
    const match = existingProducts.find(
      (p) =>
        (p.slugCurrent || '') === oldName ||
        (p.title || '').toLowerCase() === oldName.toLowerCase()
    );
    if (match) return match;
  }

  return null;
}

// ============================================================================
// BUILD PATCH
// ============================================================================

function buildPatch(rebrandProduct, existing) {
  const patches = {};
  const changes = [];

  if (existing.title !== rebrandProduct.atlasName) {
    patches.title = rebrandProduct.atlasName;
    changes.push(`title: "${existing.title}" -> "${rebrandProduct.atlasName}"`);
  }

  if (rebrandProduct.legacyName && existing.legacyName !== rebrandProduct.legacyName) {
    patches.legacyName = rebrandProduct.legacyName;
    patches.showLegacyName = true;
    patches.legacyNameStyle = 'formerly';
    changes.push(`legacyName: "${rebrandProduct.legacyName}"`);
  }

  if (existing.slugCurrent !== rebrandProduct.slug) {
    patches.slug = { _type: 'slug', current: rebrandProduct.slug };
    changes.push(`slug: "${existing.slugCurrent}" -> "${rebrandProduct.slug}"`);
  }

  if (existing.scentProfile !== rebrandProduct.scentNotes) {
    patches.scentProfile = rebrandProduct.scentNotes;
    changes.push(`scentProfile: "${rebrandProduct.scentNotes}"`);
  }

  if (existing.atmosphere !== rebrandProduct.territory) {
    patches['atlasData.atmosphere'] = rebrandProduct.territory;
    changes.push(`territory: "${existing.atmosphere || 'none'}" -> "${rebrandProduct.territory}"`);
  }

  const coordString = `${rebrandProduct.lat}, ${rebrandProduct.long}`;
  if (existing.gpsCoordinates !== coordString) {
    patches['atlasData.gpsCoordinates'] = coordString;
    changes.push(`gps: ${coordString}`);
  }

  patches['atlasData.latitude'] = rebrandProduct.lat;
  patches['atlasData.longitude'] = rebrandProduct.long;
  patches['atlasData.evocationLocation'] = `${rebrandProduct.atlasName}, ${rebrandProduct.mapPin}`;

  if (existing.collectionType !== 'atlas') {
    patches.collectionType = 'atlas';
    changes.push('collectionType: "atlas"');
  }

  return { patches, changes };
}

// ============================================================================
// BUILD NEW PRODUCT DOCUMENT
// ============================================================================

function buildNewDocument(rebrandProduct) {
  const territory = TERRITORIES[rebrandProduct.territory];
  const doc = {
    _type: 'product',
    _id: `product-${rebrandProduct.slug}`,
    collectionType: 'atlas',
    internalName: rebrandProduct.slug.toUpperCase(),
    title: rebrandProduct.atlasName,
    slug: { _type: 'slug', current: rebrandProduct.slug },
    scentProfile: rebrandProduct.scentNotes,
    price: rebrandProduct.price6ml,
    volume: '6ml',
    productFormat: 'Perfume Oil',
    inStock: true,
    atlasData: {
      atmosphere: rebrandProduct.territory,
      gpsCoordinates: `${rebrandProduct.lat}, ${rebrandProduct.long}`,
      latitude: rebrandProduct.lat,
      longitude: rebrandProduct.long,
      evocationLocation: `${rebrandProduct.atlasName}, ${rebrandProduct.mapPin}`,
    },
  };

  if (rebrandProduct.legacyName) {
    doc.legacyName = rebrandProduct.legacyName;
    doc.showLegacyName = true;
    doc.legacyNameStyle = 'formerly';
  }

  return doc;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('');
  console.log('='.repeat(65));
  console.log('  TARIFE ATTAR — ATLAS COLLECTION MIGRATION (Final 28)');
  console.log('='.repeat(65));
  console.log('');

  if (isDryRun) log('DRY RUN MODE — No changes will be made', 'warning');

  console.log(`Migration Summary:`);
  console.log(`  Atlas products: ${COLLECTION_SUMMARY.atlas.total}`);
  console.log(`    Ember: ${COLLECTION_SUMMARY.atlas.ember} | Tidal: ${COLLECTION_SUMMARY.atlas.tidal}`);
  console.log(`    Petal: ${COLLECTION_SUMMARY.atlas.petal} | Terra: ${COLLECTION_SUMMARY.atlas.terra}`);
  console.log(`  Archive: ${ARCHIVE_PRODUCTS.length} products`);
  console.log('');

  const existingProducts = await fetchExistingProducts();
  console.log('');

  const results = { updated: [], created: [], skipped: [], dropped: [], errors: [] };
  const transaction = client.transaction();

  // --- Process Atlas products ---
  console.log('-'.repeat(65));
  console.log('  PROCESSING ATLAS PRODUCTS');
  console.log('-'.repeat(65));
  console.log('');

  for (const product of ALL_ATLAS_PRODUCTS) {
    const existing = findExistingProduct(product, existingProducts);

    if (existing) {
      const { patches, changes } = buildPatch(product, existing);
      if (changes.length > 0) {
        log(`${product.atlasName} (from "${product.legacyName || 'new'}")`, 'update');
        for (const c of changes) verbose(c);
        if (!isDryRun) transaction.patch(existing._id, (p) => p.set(patches));
        results.updated.push({ atlasName: product.atlasName, legacyName: product.legacyName, id: existing._id, changes });
      } else {
        log(`${product.atlasName} — already up to date`, 'skip');
        results.skipped.push(product.atlasName);
      }
    } else if (shouldCreate) {
      log(`${product.atlasName} — creating new product`, 'create');
      const doc = buildNewDocument(product);
      if (!isDryRun) transaction.createOrReplace(doc);
      results.created.push({ atlasName: product.atlasName, legacyName: product.legacyName, slug: product.slug });
    } else {
      log(`${product.atlasName} (was "${product.legacyName || 'N/A'}") — NOT FOUND (use --create)`, 'warning');
      results.skipped.push({ atlasName: product.atlasName, reason: 'not found' });
    }
  }

  // --- Handle dropped products ---
  console.log('');
  console.log('-'.repeat(65));
  console.log('  HANDLING DROPPED PRODUCTS');
  console.log('-'.repeat(65));
  console.log('');

  for (const archived of ARCHIVE_PRODUCTS) {
    const existing = archived.sanityId
      ? existingProducts.find((p) => p._id === archived.sanityId)
      : existingProducts.find(
          (p) => (p.title || '').toUpperCase() === archived.name
        );
    if (existing) {
      log(`${archived.name} (${archived.legacyName || 'N/A'}) — archiving`, 'drop');
      if (!isDryRun) {
        transaction.patch(existing._id, (p) =>
          p.set({ collectionType: 'archive', inStock: false })
        );
      }
      results.dropped.push({ name: archived.name, id: existing._id });
    } else {
      log(`${archived.name} — not found in Sanity (already removed?)`, 'skip');
    }
  }

  // --- Commit ---
  console.log('');
  console.log('-'.repeat(65));
  console.log('  RESULTS');
  console.log('-'.repeat(65));
  console.log('');

  if (!isDryRun && (results.updated.length > 0 || results.created.length > 0 || results.dropped.length > 0)) {
    try {
      log('Committing changes to Sanity...', 'info');
      await transaction.commit();
      log('All changes committed successfully!', 'success');
    } catch (error) {
      log(`Failed to commit: ${error.message}`, 'error');
      if (error.details) console.error('Details:', JSON.stringify(error.details, null, 2));
      process.exit(1);
    }
  }

  console.log('');
  console.log(`  Updated:  ${results.updated.length}`);
  console.log(`  Created:  ${results.created.length}`);
  console.log(`  Dropped:  ${results.dropped.length}`);
  console.log(`  Skipped:  ${results.skipped.length}`);

  if (results.updated.length > 0) {
    console.log('\n  Updated Products:');
    for (const p of results.updated) console.log(`    ${p.atlasName} (was "${p.legacyName}")`);
  }
  if (results.created.length > 0) {
    console.log('\n  Created Products:');
    for (const p of results.created) console.log(`    ${p.atlasName} -> /product/${p.slug}`);
  }
  if (results.dropped.length > 0) {
    console.log('\n  Archived Products:');
    for (const p of results.dropped) console.log(`    ${p.name} (was /${p.oldSlug})`);
  }

  console.log('');
  if (isDryRun) {
    console.log('='.repeat(65));
    console.log('  DRY RUN complete. Run without --dry-run to apply changes.');
    console.log('='.repeat(65));
  }
}

main().catch((error) => {
  log(`Migration failed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
