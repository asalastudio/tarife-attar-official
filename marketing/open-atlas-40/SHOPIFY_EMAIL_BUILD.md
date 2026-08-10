# Building The Open Atlas emails in Shopify Messaging (formerly Shopify Email)

You're sending through Shopify's mail app instead of Omnisend. Two things to know first:

1. **Check for a raw-HTML option before rebuilding anything.** As of this writing, Shopify Messaging campaigns are assembled in the section-based editor only — there is no "paste your own HTML" for marketing campaigns (that's an Omnisend/Klaviyo feature). If your version of the app *does* show an HTML/code template option when you create a campaign, simply paste `emails/01-the-atlas-opens.html` and `emails/05-final-hours.html` as-is and skip to §4 (audience). Otherwise this guide rebuilds the same design from Shopify's blocks in ~20 minutes per email.
2. **Your audience is already in Shopify.** Verified live: **8,434 customers, all 8,434 with email marketing consent.** No list migration needed.

The HTML files remain the design source of truth (and work in any raw-HTML platform later). The full copy for every send lives in `EMAIL_SEQUENCE.md` — this guide only maps copy → Shopify blocks.

---

## §1 · One-time setup (10 min)

- **Sender identity:** Settings → Notifications → Sender email → `journey@tarifeattar.com`, display name **Jordan at TARIFE ATTAR**. Complete the domain-authentication prompt (SPF/DKIM records) if Shopify flags the address as unauthenticated — unauthenticated senders go out via Shopify's shared domain and hurt inboxing.
- **Discount:** create the automatic discount + `VOYAGE30` code first (STRATEGY.md §2) — the editor's **Discount block** can then attach the real code, and Shopify appends it to links so it pre-applies at checkout.
- **Brand colors in the editor:** background `#FAF9F6` · text `#1A1A1A` · accent/buttons `#C9A227` · dark bands `#0D0D0D`. Fonts: pick **Georgia** for headings (italic where noted) and **Arial** for labels/body — both are in Shopify's system-font list.
- **Footer:** Shopify Messaging appends its default footer (unsubscribe link + store address) automatically — confirmed rendering below the email body. The HTML files therefore end with a slim brand sign-off band only; they carry no unsubscribe/address of their own.

## §2 · E1 — "The Atlas, Open" as Shopify sections

Build top to bottom; copy text verbatim from `EMAIL_SEQUENCE.md` §2.

| # | Shopify block | Settings | Content |
|---|---|---|---|
| 1 | Logo / Text | centered, Arial, wide letter-spacing off (not supported — uppercase carries it) | `TARIFE ATTÄR` / small line `MODERN APOTHECARY` |
| 2 | Divider | thin, color `#C9A227`, narrow width | — |
| 3 | Text | centered, Arial 12px, color `#C9A227` | `THE ARCHIVE OPENS · AUGUST 11–16` |
| 4 | Heading | centered, Georgia *italic*, ~40px | `The Atlas, Open.` |
| 5 | Text | left, Georgia 16px | The three intro paragraphs ("Traveler —…") |
| 6 | Text | centered, on a white or bordered card if available; otherwise same section with generous spacing | `30%` huge (Georgia italic, ~70px) · `OFF EVERY WAYPOINT` · `EVERY TERRITORY · ALL FORMATS` · `THROUGH SUNDAY, AUGUST 16 · 11:59 PM PT` |
| 7 | **Discount block** | attach `VOYAGE30` | Shopify renders the code + auto-apply link |
| 8 | Button | bg `#C9A227`, text `#1A1A1A`, link `https://www.tarifeattar.com/atlas` | `ENTER THE ATLAS` |
| 9 | Text | four short rows, each territory name bold + essence line italic + `from $X → $Y`; link each name to `…/atlas?territory=ember` etc. | Territory index (copy deck §2) |
| 10 | **Product blocks** | 2-column layout; select GRANADA, BIG SUR, MEDINA, HAVANA; show price + compare-at so the strikethrough renders | The featured quartet (notes lines from copy deck if the block allows custom description text; otherwise the product titles + prices carry it) |
| 11 | Image-with-text or Text | section background `#0D0D0D`, text `#FAF9F6`, accent `#C9A227`; button style outlined gold, link `https://www.tarifeattar.com/gift` | Traveler Set band: `Five waypoints, one satchel.` · `$95 → $66.50` · `CLAIM THE SET` |
| 12 | Text | centered, Georgia italic + gold link to `/quiz` | Quiz line |
| 13 | Text | centered, Arial 10px, 50% opacity | Fine print (deadline · while stocked · Relic at archive pricing) |
| 14 | Footer | auto | unsubscribe + address (automatic) |

**Subject/preheader:** subject A `the atlas opens today`, preheader `Six days. Twenty-eight waypoints. Thirty percent. Through Sunday night.` (variants in the copy deck).
**UTM:** in campaign settings, keep automatic UTM tagging on (campaign name `open-atlas-2026-08-e1`) — Shopify appends these to links, replacing the hand-tagged UTMs the HTML carries.

## §3 · E5 — "Final Hours" dark variant

Same skeleton, inverted and shorter: section backgrounds `#0D0D0D`, body text `#FAF9F6`, accents `#C9A227`.
Blocks: wordmark → gold divider → eyebrow `THE OPEN ATLAS · FINAL HOURS` → heading *The archive seals at midnight.* → two short paragraphs → offer line `30% OFF · EVERY WAYPOINT · UNTIL 11:59 PM PT` → Discount block → gold button `ENTER THE ATLAS` → text row `MOST CLAIMED THIS WEEK: GRANADA · SAANA · MEDINA · THE TRAVELER SET — $66.50` → sign-off *Safe travels either way. — Jordan* → footer.

**E2–E4** reuse the E1 build with the block swaps listed in `EMAIL_SEQUENCE.md` §9. Duplicate the E1 campaign each time rather than rebuilding.

## §4 · Audience segments (Shopify → Customers → Segments)

- **Every send:** the built-in **Email subscribers** segment (currently 8,434).
- **Suppress event purchasers on E2–E5** — create segment `Open Atlas non-purchasers`:
  ```
  email_subscription_status = 'SUBSCRIBED' AND (last_order_date = NULL OR last_order_date < 2026-08-11)
  ```
  Re-save/verify it's refreshing before each send; use it as the audience from E2 onward.
- **E5 (engaged only):** Shopify segments can't filter on campaign opens the way an ESP can. Practical options: send E5 to the same non-purchaser segment (acceptable — it's the shortest email), or use `EMAILED_AND_CLICKED` style filters only if your segment editor offers Shopify Messaging engagement attributes. Don't block the send on this refinement.

## §5 · Warm-up send (today) in Shopify Messaging

The WARM-UP drafts live in Omnisend and won't transfer. Recreate as a simple text email (5 min — no design needed, personal-note style converts better anyway):
- **Today (Mon):** WARM-UP 4 — subject `your favorite scent has a new name` — rebrand reveal + the tease paragraph from `EMAIL_SEQUENCE.md` §1. Plain text blocks only, from Jordan.
- **Optional Wed:** WARM-UP 2 — subject `which one are you?` — territory quiz invitation, link to `/quiz`.

## §6 · Cost + test checklist

- Shopify Messaging bills per message beyond the monthly free tier. This event ≈ 7 sends × ~8.4k ≈ **~59k emails** — check the app's pricing screen for the exact overage before launch (historically ~$1 per 1,000 past the free 10k; i.e., on the order of $50 — trivial against projected revenue, just don't be surprised by the line item).
- Before each send: test email to yourself → check Gmail + iPhone rendering, discount block applies at checkout, every link resolves (especially `/atlas?territory=…` deep links), prices still match the live store, low-stock claims still true.

## §7 · What this changes in STRATEGY.md

Nothing strategic. Timeline, offer, copy, guardrails, and projections all hold. Only the assembly swaps: Omnisend campaigns → Shopify Messaging campaigns; Omnisend segments (§4 there) → Shopify customer segments (§4 here); Omnisend popup/abandonment → keep in Omnisend if it stays connected to the store, or use Shopify's built-in abandoned-checkout automation (Marketing → Automations) with the §8 copy from the copy deck. With 8,434 subscribers at the 30% offer, the §6 projection model lands at roughly **$500 / $1,750 / $4,300** (conservative/base/stretch) email-attributed, plus the on-site automatic discount catching everything else.
