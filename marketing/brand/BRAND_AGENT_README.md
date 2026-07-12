# Tarife Attar Brand Agent

## Overview

The Tarife Attar Brand Agent is an autonomous AI system trained to generate brand-aligned content for all marketing, product, and customer communication needs.

---

## Files

| File | Purpose |
|------|---------|
| `BRAND_AGENT_SYSTEM_PROMPT.md` | Complete agent training document (1,012 lines) |
| `BRAND_BRAIN.md` | Brand intelligence reference guide |
| `src/app/(admin)/api/content/route.ts` | API endpoint for programmatic content generation |

---

## How to Use the Brand Agent

### Option 1: Claude.ai (Recommended for Content Creation)

**Best for:** Writing product descriptions, email campaigns, social content, customer responses.

1. Go to [claude.ai](https://claude.ai)
2. Start a new conversation
3. Paste the entire contents of `BRAND_AGENT_SYSTEM_PROMPT.md`
4. Then request content using the activation command:

```
TARIFE ATTAR BRAND AGENT ACTIVATED

Task Classification: Product Copy
Road Assignment: Atlas
Territory: Ember
Voice Ratio: 70% Peterman / 30% Ogilvy
Sensory Lexicon: ENFORCED

Generate an evocation for:
- Product: Honey Oudh
- Territory: Ember
- Notes: Top (Bergamot, Pink Pepper), Heart (Honey, Oud), Base (Vanilla, Amber)
```

### Option 2: Claude Projects (For Repeated Use)

**Best for:** Teams who generate content regularly without re-pasting the prompt.

1. Go to claude.ai → Projects
2. Create a new project: "Tarife Attar Brand Agent"
3. In Project Instructions, paste the entire `BRAND_AGENT_SYSTEM_PROMPT.md`
4. Every conversation in that project will follow brand rules automatically

### Option 3: API Integration (Programmatic)

**Best for:** Automated content generation in your admin dashboard.

The admin dashboard already has this integrated at:
```
POST /admin/api/content
```

**Request body:**
```json
{
  "action": "generate_evocation",
  "productData": {
    "title": "Honey Oudh",
    "territory": "Ember",
    "notes": {
      "top": ["Bergamot", "Pink Pepper"],
      "heart": ["Honey", "Oud"],
      "base": ["Vanilla", "Amber"]
    }
  }
}
```

**Available actions:**
- `generate_evocation` — 3-paragraph product journey
- `generate_onskin` — 2-paragraph wearing experience
- `generate_etsy_listing` — SEO title, description, tags

**Required environment variable:**
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Option 4: Cursor / VS Code AI

**Best for:** Developers working on the codebase.

1. Open the project in Cursor
2. Reference `@BRAND_AGENT_SYSTEM_PROMPT.md` when asking for content
3. Example: "Using @BRAND_AGENT_SYSTEM_PROMPT.md, write an evocation for Turkish Rose"

---

## Content Types the Agent Can Generate

### Atlas Products (The Voyage)
- **Evocation** — 3-paragraph geographic/atmospheric narrative
- **On Skin** — 2-paragraph intimate wearing experience
- **Etsy Listing** — SEO-optimized title, description, 13 tags
- **Email Campaigns** — Territory features, seasonal content
- **Social Captions** — Instagram, Pinterest

### Relic Products (The Vault)
- **Museum Description** — Curatorial, provenance-focused
- **Material Specs** — Distillation year, origin, viscosity
- **Collector Notes** — Heritage and rarity context

### Customer Communications
- **Service Responses** — Warm, knowledgeable, solution-oriented
- **Welcome Sequences** — Brand story, Two Roads explanation
- **Follow-ups** — Territory recommendations, discovery guidance

---

## The Activation Command

When starting any task with the Brand Agent, use this format:

```
TARIFE ATTAR BRAND AGENT ACTIVATED

Task Classification: [Product Copy | Email | Visual | Social | Customer Service]
Road Assignment: [Atlas | Relic | Both]
Territory: [Ember | Petal | Tidal | Terra | N/A]
Voice Ratio: [X% Peterman / Y% Ogilvy]
Sensory Lexicon: ENFORCED

[Your specific request here]
```

---

## Quick Reference

### Forbidden Terms (Never Use)
| Forbidden | Use Instead |
|-----------|-------------|
| smell | olfactory profile, sillage |
| nice | evocative, compelling |
| strong | tenacious, potent |
| synthetics | aromachemicals |
| buy/purchase | acquire, discover |

### Voice Ratios
- **Atlas products:** 70% Peterman (narrative) / 30% Ogilvy (factual)
- **Relic products:** 80% Ogilvy (factual) / 20% Hopkins (scientific)

### Territory Keywords
| Territory | Essence | Keywords |
|-----------|---------|----------|
| Ember | Spice, Warmth | Incense, amber, resin, caravans |
| Petal | Bloom, Herb | Floral, green, gardens, dew |
| Tidal | Salt, Mist | Aquatic, marine, petrichor |
| Terra | Wood, Oud | Leather, earth, forests |

---

## Examples

### Example: Product Evocation Request

```
TARIFE ATTAR BRAND AGENT ACTIVATED

Task Classification: Product Copy
Road Assignment: Atlas
Territory: Tidal
Voice Ratio: 70% Peterman / 30% Ogilvy
Sensory Lexicon: ENFORCED

Generate an evocation for:
- Product: Blue Oudh
- Territory: Tidal
- Legacy Name: Ocean Mist
- Coordinates: 35.6762° N, 139.6503° E (Tokyo Bay)
- Notes: Top (Sea Salt, Bergamot), Heart (Blue Lotus, Aquatic Accord), Base (Driftwood, White Musk)
```

### Example: Email Campaign Request

```
TARIFE ATTAR BRAND AGENT ACTIVATED

Task Classification: Email
Road Assignment: Atlas
Territory: Ember
Voice Ratio: 60% Peterman / 40% Collier
Sensory Lexicon: ENFORCED

Write a territory feature email for Ember collection launch.
Products to highlight: Honey Oudh, Granada Amber, Vanilla Sands
Tone: Warm, inviting, seasonal (winter)
CTA: Soft invitation to explore
```

### Example: Etsy Listing Request

```
TARIFE ATTAR BRAND AGENT ACTIVATED

Task Classification: Product Copy
Road Assignment: Atlas
Territory: Petal
Voice Ratio: 50% Peterman / 50% Ogilvy
Sensory Lexicon: ENFORCED

Generate Etsy listing for:
- Product: Turkish Rose
- Format: Perfume Oil
- Size: 6ml
- Price: $32
- Notes: Damascus Rose, Green Stem, White Musk

Output: SEO title (max 140 chars), description (max 300 words), 13 tags
```

---

## Maintenance

### Updating the Brand Agent

If brand guidelines change:
1. Edit `BRAND_AGENT_SYSTEM_PROMPT.md`
2. Update the abbreviated version in `src/app/(admin)/api/content/route.ts`
3. If using Claude Projects, update the project instructions

### Adding New Content Types

To add a new generation type to the API:
1. Edit `src/app/(admin)/api/content/route.ts`
2. Add a new `case` in the switch statement
3. Follow the existing pattern for prompt construction

---

## Support

For questions about the Brand Agent:
- Review `BRAND_BRAIN.md` for brand context
- Check `BRAND_AGENT_SYSTEM_PROMPT.md` for detailed rules
- Reference examples in Section 12 of the system prompt

---

*"Perfume was never meant for a shelf."*
