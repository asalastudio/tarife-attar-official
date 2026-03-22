#!/usr/bin/env node

/**
 * Generate atlas-data-complete.json from atlas-rebrand-data.mjs
 *
 * Usage: node scripts/generate-atlas-json.mjs
 * Output: atlas-data-complete.json in project root
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  ALL_ATLAS_PRODUCTS,
  RELIC_PRODUCTS,
  ARCHIVE_PRODUCTS,
  TERRITORIES,
  COLLECTION_SUMMARY,
} from './atlas-rebrand-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '..', 'atlas-data-complete.json');

const data = {
  _generated: new Date().toISOString(),
  _description: 'Tarife Attar Atlas Collection — 28 Waypoints. Auto-generated from atlas-rebrand-data.mjs.',
  brandTagline: COLLECTION_SUMMARY.brandTagline,
  summary: COLLECTION_SUMMARY,
  territories: Object.entries(TERRITORIES).map(([id, meta]) => ({
    id,
    ...meta,
    products: ALL_ATLAS_PRODUCTS
      .filter((p) => p.territory === id)
      .map((p, idx) => ({
        number: ALL_ATLAS_PRODUCTS
          .filter((x) => x.territory === id)
          .indexOf(p) + 1 +
          (id === 'ember' ? 0 : id === 'tidal' ? 7 : id === 'petal' ? 14 : 21),
        atlasName: p.atlasName,
        legacyName: p.legacyName,
        slug: p.slug,
        scentNotes: p.scentNotes,
        mapPin: p.mapPin,
        latitude: p.lat,
        longitude: p.long,
        price6ml: p.price6ml,
        price12ml: p.price12ml,
        evocationCopy: p.evocationCopy,
        notes: p.notes,
      })),
  })),
  allWaypoints: ALL_ATLAS_PRODUCTS.map((p, idx) => ({
    number: idx + 1,
    atlasName: p.atlasName,
    legacyName: p.legacyName,
    slug: p.slug,
    territory: p.territory,
    scentNotes: p.scentNotes,
    mapPin: p.mapPin,
    latitude: p.lat,
    longitude: p.long,
    price6ml: p.price6ml,
    price12ml: p.price12ml,
  })),
  relic: RELIC_PRODUCTS.map((p) => ({
    name: p.atlasName,
    slug: p.slug,
    scentNotes: p.scentNotes,
    type: p.type,
  })),
  archive: ARCHIVE_PRODUCTS.map((p) => ({
    name: p.name,
    legacyName: p.legacyName,
    reason: p.reason,
  })),
};

writeFileSync(outputPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
console.log(`Wrote ${outputPath}`);
console.log(`  ${data.allWaypoints.length} waypoints across ${data.territories.length} territories`);
