import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The sitemap's skip list must match every '/product/<slug>' redirect in next.config.js.
test('redirected product slugs match next.config.js redirects', () => {
  const config = readFileSync(new URL('../next.config.js', import.meta.url), 'utf8');
  const list = readFileSync(new URL('../src/lib/redirectedProductSlugs.ts', import.meta.url), 'utf8');
  const fromConfig = new Set([...config.matchAll(/source: '\/product\/([a-z0-9-]+)'/g)].map((m) => m[1]));
  const fromList = new Set([...list.matchAll(/^  '([a-z0-9-]+)',$/gm)].map((m) => m[1]));
  assert.deepEqual([...fromList].sort(), [...fromConfig].sort());
});
