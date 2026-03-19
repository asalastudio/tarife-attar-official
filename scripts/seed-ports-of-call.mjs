/**
 * Seed "Ports of Call" from Shopify Orders
 *
 * Pulls all orders from Shopify, extracts unique shipping cities,
 * geocodes them via OpenStreetMap Nominatim, and creates portOfCall
 * documents in Sanity.
 *
 * Usage:
 *   node scripts/seed-ports-of-call.mjs --dry-run    # Preview cities
 *   node scripts/seed-ports-of-call.mjs              # Execute
 */

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env
function loadEnv(filepath) {
  try {
    const content = readFileSync(filepath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch { /* skip */ }
}

loadEnv(resolve(process.cwd(), '.env.local'));
loadEnv(resolve(process.cwd(), '.env'));

const sanity = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const shopifyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const isDryRun = process.argv.includes('--dry-run');

// Rate-limited fetch for Nominatim (1 request per second)
async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geocodeCity(city, country) {
  const query = encodeURIComponent(`${city}, ${country}`);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { 'User-Agent': 'TarifeAttar-PortsOfCall/1.0 (jordan@tarifeattar.com)' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
  } catch (err) {
    console.warn(`    [!] Geocode failed for ${city}, ${country}: ${err.message}`);
  }
  return null;
}

async function fetchAllOrders() {
  const allOrders = [];
  let page = 0;
  // Shopify REST cursor pagination: first request uses query params,
  // subsequent requests use the full URL from the Link header
  let nextUrl = `https://${shopifyDomain}/admin/api/2024-01/orders.json?limit=250&status=any&fields=id,shipping_address`;

  console.log('  Fetching orders from Shopify...');

  while (nextUrl) {
    page++;
    const res = await fetch(nextUrl, {
      headers: { 'X-Shopify-Access-Token': shopifyToken },
    });

    if (!res.ok) {
      console.error(`  HTTP ${res.status}: ${await res.text()}`);
      break;
    }

    const data = await res.json();
    const orders = data.orders || [];
    allOrders.push(...orders);
    console.log(`    Page ${page}: ${orders.length} orders (total: ${allOrders.length})`);

    if (orders.length === 0) break;

    // Parse Link header for next page URL
    nextUrl = null;
    const linkHeader = res.headers.get('link');
    if (linkHeader) {
      const parts = linkHeader.split(',');
      for (const part of parts) {
        if (part.includes('rel="next"')) {
          const match = part.match(/<([^>]+)>/);
          if (match) {
            nextUrl = match[1];
          }
        }
      }
    }
  }

  return allOrders;
}

async function main() {
  console.log('\n  PORTS OF CALL — Seed from Shopify Orders\n');
  console.log(isDryRun ? '  MODE: DRY RUN\n' : '  MODE: LIVE\n');

  // 1. Fetch all orders
  const orders = await fetchAllOrders();
  console.log(`\n  Total orders fetched: ${orders.length}\n`);

  // 2. Extract unique cities
  const cityMap = new Map(); // key: "city|country" → { city, country, count }

  for (const order of orders) {
    const addr = order.shipping_address;
    if (!addr || !addr.city) continue;

    const city = addr.city.trim();
    const country = (addr.country || addr.country_code || '').trim();
    const province = (addr.province || addr.province_code || '').trim();

    if (!city || !country) continue;

    // Normalize key: lowercase city + country for dedup
    const key = `${city.toLowerCase()}|${country.toLowerCase()}`;

    if (cityMap.has(key)) {
      cityMap.get(key).count++;
    } else {
      cityMap.set(key, {
        city: city.replace(/\b\w/g, (c) => c.toUpperCase()), // Title case
        country,
        province,
        count: 1,
      });
    }
  }

  // Sort by order count descending
  const cities = Array.from(cityMap.values()).sort((a, b) => b.count - a.count);

  console.log(`  Unique cities: ${cities.length}\n`);
  console.log('  Top 30 cities by order volume:');
  cities.slice(0, 30).forEach((c, i) => {
    console.log(`    ${String(i + 1).padStart(3)}. ${c.city}, ${c.country} (${c.count} orders)`);
  });

  if (isDryRun) {
    console.log(`\n  DRY RUN COMPLETE. ${cities.length} unique cities found.`);
    console.log('  Run without --dry-run to geocode and push to Sanity.\n');
    return;
  }

  // 3. Check existing ports in Sanity (avoid duplicates)
  const existingPorts = await sanity.fetch(`*[_type == "portOfCall"]{ city, country }`);
  const existingKeys = new Set(
    existingPorts.map((p) => `${p.city.toLowerCase()}|${p.country.toLowerCase()}`)
  );
  console.log(`\n  Existing ports in Sanity: ${existingPorts.length}`);

  const newCities = cities.filter(
    (c) => !existingKeys.has(`${c.city.toLowerCase()}|${c.country.toLowerCase()}`)
  );
  console.log(`  New cities to add: ${newCities.length}\n`);

  // 4. Geocode and push to Sanity
  let created = 0;
  let failed = 0;
  let skippedGeocode = 0;

  for (let i = 0; i < newCities.length; i++) {
    const c = newCities[i];
    const pct = Math.round(((i + 1) / newCities.length) * 100);

    // Geocode (rate limited: 1 req/sec for Nominatim)
    const coords = await geocodeCity(c.city, c.country);
    if (!coords) {
      console.log(`    [SKIP] ${c.city}, ${c.country} — geocode failed`);
      skippedGeocode++;
      await sleep(1100);
      continue;
    }

    try {
      const slug = `${c.city}-${c.country}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      await sanity.create({
        _type: 'portOfCall',
        _id: `port-${slug}`,
        city: c.city,
        country: c.country,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      console.log(`    [${pct}%] ${c.city}, ${c.country} (${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}) — ${c.count} orders`);
      created++;
    } catch (err) {
      console.log(`    [X] ${c.city}, ${c.country} — ${err.message}`);
      failed++;
    }

    // Respect Nominatim rate limit
    await sleep(1100);
  }

  console.log(`\n  DONE: ${created} ports created, ${failed} failed, ${skippedGeocode} skipped (geocode)`);
  console.log(`  Total ports in Sanity: ${existingPorts.length + created}\n`);
}

main().catch(console.error);
