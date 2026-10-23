import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

// iOS Safari zooms the page when a focused field's text is under 16px. Every
// typed control on the storefront must be at least text-base on phones; a
// smaller size is only allowed behind a breakpoint prefix (md:text-sm).
const SKIP = ['src/components/atlas/map-reference', 'src/sanity', 'src/app/studio'];
const TYPED_INPUT = /type=["'](checkbox|radio|range|file|hidden)["']/;
const SMALL_BASE_SIZE = /(?:^|[\s"'`])(text-(?:xs|sm)|text-\[(?:[0-9]|1[0-5])(?:\.\d+)?px\])(?=[\s"'`]|$)/;

async function sourceFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (SKIP.some((skip) => full.startsWith(skip))) continue;
    if (entry.isDirectory()) out.push(...(await sourceFiles(full)));
    else if (full.endsWith('.tsx')) out.push(full);
  }
  return out;
}

test('form controls are at least 16px on mobile', async () => {
  const offenders = [];
  for (const file of await sourceFiles('src')) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/<(input|select|textarea)\b(?:=>|[^>])*?\/?>/g)) {
      const tag = match[0];
      if (match[1] === 'input' && TYPED_INPUT.test(tag)) continue;
      // Pull in shared class strings referenced by name, e.g. className={inputBase}
      const classSources = [tag];
      for (const [, name] of tag.matchAll(/\$?\{\s*([A-Za-z_]\w*)\s*\}/g)) {
        const shared = source.match(new RegExp(`const ${name}\\s*=\\s*(["'\`])([\\s\\S]*?)\\1`));
        if (shared) classSources.push(shared[2]);
      }
      const small = classSources.map((s) => s.match(SMALL_BASE_SIZE)).find(Boolean);
      if (small) {
        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${file}:${line} uses ${small[1]}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `Form controls below 16px on mobile:\n${offenders.join('\n')}`);
});
