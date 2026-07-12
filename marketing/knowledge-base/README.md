# Knowledge Base Sources

Source documents for the Eleanor chat concierge knowledge base. `scripts/kb-seed.mjs` reads these (searching this directory first), synthesizes KB articles in brand voice via Gemini, and publishes them to Eleanor via Convex.

## Expected files — not yet in the repo

These are referenced by `kb-seed.mjs` but haven't been added yet. Drop them in here and the script will pick them up:

| File | Content |
|---|---|
| `Etsy-FAQ-Formatted.md` | Shipping, tracking, application, territories FAQ |
| `Return-Policy-Formatted.md` | Return/exchange policy |
| `THE_CARTOGRAPHER_NARRATIVE.md` | The brand story |

## Also sourced (already in the repo)

- `marketing/brand/BRAND_BRAIN.md`
- `marketing/brand/BRAND_AGENT_SYSTEM_PROMPT.md`
- `marketing/catalog/ATLAS_MASTER_28.md`
- `scripts/evocation-copy.mjs`, `scripts/onskin-copy.mjs`, `scripts/atlas-rebrand-data.mjs`

## Usage

```bash
node scripts/kb-seed.mjs --dry-run          # preview article plan, no API calls
node scripts/kb-seed.mjs                    # generate + preview articles
node scripts/kb-seed.mjs --publish          # generate + publish to Eleanor
node scripts/kb-seed.mjs --category policies # one category only
```

Requires `GOOGLE_GENERATIVE_AI_API_KEY` (except `--dry-run`).
