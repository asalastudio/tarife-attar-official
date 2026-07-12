# Tarife Attär

A curated archive of rare and vintage fragrances. Headless e-commerce site: **Next.js 14** (App Router) + **Sanity CMS** (content source of truth) + **Shopify** (checkout/inventory), deployed on **Vercel** at [tarifeattar.com](https://tarifeattar.com).

## Repo Map

| Path | What lives there |
|---|---|
| [`src/`](src/) | Next.js app: pages, components, Sanity client/queries, chat concierge (Eleanor) |
| [`marketing/`](marketing/README.md) | **Marketing hub** — brand voice, product catalog source of truth, Etsy/email copy, planning. Start at `marketing/README.md`. |
| [`docs/`](docs/README.md) | Technical docs: setup, guides, reports |
| [`scripts/`](scripts/) | Operational scripts: Sanity ingest/cleanup, Shopify sync, CSV generation, KB seeding |
| [`public/`](public/) | Static assets |
| [`HANDOFF.md`](HANDOFF.md) | Latest session handoff: what was done, what's next |

## Development

```bash
npm install
cp .env.example .env.local   # fill in values — see docs/setup/ENV_SETUP.md
npm run dev                  # http://localhost:3000
```

Checks: `npm run typecheck` · `npm run lint` · `npm run format:check`

## Key References

- **Product source of truth:** [`marketing/catalog/ATLAS_MASTER_28.md`](marketing/catalog/ATLAS_MASTER_28.md) — 28 waypoints, 4 territories, pricing
- **Brand voice rules:** [`marketing/brand/BRAND_AGENT_SYSTEM_PROMPT.md`](marketing/brand/BRAND_AGENT_SYSTEM_PROMPT.md)
- **Task tracker:** [`marketing/planning/TARIFE_ATTAR_MASTER_CHECKLIST.md`](marketing/planning/TARIFE_ATTAR_MASTER_CHECKLIST.md)
- **Sanity architecture:** [`docs/guides/SANITY_ARCHITECTURE.md`](docs/guides/SANITY_ARCHITECTURE.md)
