# Tarife Attar: Site Audit and 72-Hour Black Friday Plan

Prepared Tue 24 Nov 2026. Black Friday is Fri 27 Nov, Small Business Saturday 28 Nov, Cyber Monday 30 Nov, Giving Tuesday 1 Dec. Thanksgiving is Thu 26 Nov.

This is read-only work. Nothing in the repo, Shopify, Omnisend or Klaviyo was changed.

## How much to trust each part

| Source | Date | Status |
|---|---|---|
| Code audit of `origin/main` (commit b8a3ffd, 28 Oct) | read 12 Nov | Verified against the code, not the live site |
| Live scrape of one product page (SAANA) and the site URL map | 12 Nov | Verified, now 12 days old |
| Omnisend and Klaviyo account state | 24 Nov | Verified today |
| Shopify sales, stock, discounts | not available | Shopify connector needs sign-in again. Last numbers I have are to July 2026 |
| Live stock for all products, live page copy, banner text | pending | Two sweep agents were blocked on a Firecrawl permission prompt. Section 3 is marked where it depends on them |

I have no sales data for August to November 2026. Last year's BFCM is the only benchmark: Nov 2025 did $11,645 on 132 orders (AOV $59.73) and Dec 2025 did $8,920 on 112 orders. Mid-2026 ran about $1,000 to $2,000 a month.

## 1. The three decisions only you can make today

1. **The offer.** Section 4 recommends one. It needs your real margin per size, which I do not have.
2. **Where the email list lives.** The evidence conflicts (section 2). Pick the one platform you will send from, and send only to people who consented.
3. **Who has Shopify admin today.** Discounts, stock and the purchase-tracking check all happen there, and my connector is signed out.

## 2. Email: the biggest quick win is also the biggest unknown

Verified today:

- **Omnisend** still receives every on-site signup (footer, quiz, cart save). All four automations are switched off. Welcome and Abandoned Checkout were disabled on 14 Aug 2026. Abandoned Cart was off in January. The four-part Atlas welcome series never ran. Five rebrand warm-up campaigns from March are still drafts and now describe a rebrand that is eight months old, so do not send them as written.
- **Klaviyo** has an account created in July with lists "Tier 1 - Send", "Tier 2 - Nurture", "Email List" and "Preview List". It has zero campaigns and one unconfigured draft flow.
- The repo docs say campaigns are sent through **Shopify Messaging** to Tier 1 after a consent check. I could not see Shopify, so I cannot confirm that.

What this means: new subscribers land in Omnisend, but nothing there sends to them. Nobody gets a welcome email or an abandoned-cart email right now. If Black Friday goes out from Shopify or Klaviyo, the Omnisend signups from the site never receive it unless someone moves them.

Do first, in this order:

1. Turn on **abandoned checkout and abandoned cart** in whichever platform will hold the list. During Black Friday these are the highest-return emails you can send, and they are currently off everywhere I can see.
2. Export Omnisend signups since the Klaviyo import (22 Jan) and confirm each has `marketingConsent` recorded before adding them to the send list. Do not mail contacts without consent.
3. Send the four emails in section 6.

## 3. Site audit, ranked

"Main" means the code on `origin/main`. Anything marked LIVE was seen on the live site. Items marked PENDING need the stock sweep.

### P0: fix or work around before Friday

| # | Finding | Evidence | What to do |
|---|---|---|---|
| 1 | **A sale will not show on Atlas product pages, the Atlas grid or the cart.** Prices are typed into the code (3 ml $23, 6 ml $28 to $33, 12 ml $48 to $55). The strikethrough reads a manual Sanity field, not Shopify's compare-at price, and only on gift products. The cart shows the same number as Subtotal and Total with no discount line. | `ProductDetailClient.tsx:430-434`, `1148-1156`; `cart/page.tsx:296-313`; `lib/shopify/client.ts:66-117` | Run the offer as a Shopify automatic discount or gift-with-purchase and state it in the banner and emails. Discount appears at checkout. Do not promise "prices shown reduced". A code change to show discounts is a post-BFCM job. |
| 2 | **No purchase event from the site.** GA4 and Meta fire view_item, add_to_cart, view_cart and begin_checkout, gated on consent. Purchase must come from Shopify's side (Google & YouTube channel or a Web Pixel for GA4, Facebook & Instagram channel with Conversions API for Meta). I could not verify those are live. | `docs/runbooks/headless-attribution-release.md` sections 4 and 5A; `AnalyticsContext.tsx` | Check both in Shopify admin (15 minutes). If purchase is not reporting, do not optimise ads for purchases. Optimise for add to cart or checkout starts and read results in Shopify. |
| 3 | **Customers are told to look for Etsy.** FAQ order tracking and "contact via Etsy messaging", plus the support form (platform dropdown, placeholder, footer line). Etsy is suspended. | `faq/page.tsx:72-75,113`; `support/page.tsx:40,313,469` | Small copy fix. Needs your go-ahead to change code. Until then expect support tickets from confused buyers. |
| 4 | **Campaign links to `/shop`, `/store`, `/collections` land on an empty cart.** | `next.config.js` redirect block | Use only these destinations in emails and posts: `/atlas`, `/gift`, `/product/<slug>`, `/quiz`. Section 7 has the link kit. |
| 5 | **Best sellers sold out.** On 12 Nov the live SAANA page (the old Honey Oud, your top seller all-time) showed Out of Stock in every size. MEISHAN (China Rain), CARMEL, BAHIA were at zero on the last Shopify read in July. | Live scrape 12 Nov; Shopify read July | PENDING full sweep. Do not feature any product in an email or ad until stock is confirmed that morning. |
| 6 | **No free-shipping or returns message on product pages or cart.** "Free on orders $35+" exists only on the FAQ. | `faq/page.tsx:35`; `cart/page.tsx:305-306` | Put it in the banner and every email until the site shows it. |
| 7 | **No tracking for TikTok.** There is no TikTok pixel. | code audit | Run TikTok as organic only this week. |

### P1: this week if time allows

| # | Finding | Evidence |
|---|---|---|
| 8 | Header bar says "Find your territory in five questions." There is no sale message. The text is a constant in code, so changing it needs a deploy. | `SiteHeader.tsx:28-31` |
| 9 | "Make it a gift" button does nothing. It sits next to Add to Satchel on every product page, in a gift week. | `ProductDetailClient.tsx:1425-1432` |
| 10 | No back-in-stock or notify-me. Every sold-out visitor leaves with nothing captured. | code audit |
| 11 | No popup or welcome offer anywhere. The Omnisend welcome email promised 10% off but is switched off. | `GlobalFooter.tsx:185-222` |
| 12 | `/relic` is in the main nav and showed "0 Specimens. No specimens in this category yet." on 12 Nov. `/stockists` is also in the desktop nav and says "Coming Soon" with "Retail partnerships opening Q2 2025". `/archive` says "Coming Soon". | live URL map 12 Nov; `SiteHeader.tsx:49`; `stockists/page.tsx:12-15,87` |
| 13 | Journal pages carry raw titles such as "blog_article - SIWA | Tarife Attar Journal". | live URL map 12 Nov |
| 14 | A Shopify password page is publicly reachable at `/products/attar-mitti` on the bare domain. | live URL map 12 Nov |
| 15 | No reviews, stars or testimonials anywhere. Product JSON-LD has no rating. Your 11,800 Etsy reviews are not visible on the site. | code audit |
| 16 | Most client pages inherit the homepage canonical (`/faq`, `/cart`, `/support`, `/quiz`, `/journal`). No favicon or share image on the root, home, atlas, relic or gift. | `layout.tsx:48-50` |

### P2: January

Hard-coded prices everywhere, public `/api/debug` endpoint, `/products/regatta` and `/product/regatta` going to `/atlas` though TANGIERS is the live waypoint, 26 MB of unused images in `public/assets/coordinates`, the custom cursor hiding the system cursor on desktop, About/founder page missing (the origin story is your best unused asset), no wholesale or affiliate page.

### What is already good

Consent-aware GA4 and Meta, first-touch and last-touch UTM attribution written to the Shopify cart, no open redirect, subscribe endpoint no longer reports false success, product pages server-rendered with proper Product JSON-LD and 1200x630 share images, 3 ml size now offered across the Atlas, a working quiz, and the concierge no longer hard-codes expired promo copy.

## 4. The offer (recommendation, needs your margin)

Brand rules say no hard sell and no manufactured urgency. A Black Friday offer can still fit if it is plain, generous and has a real end date. Because sale prices will not show on product pages (finding 1), use mechanics that Shopify applies at checkout.

**Recommended: "The Passport" gift-with-purchase ladder, Thu 26 Nov 6 pm PT to Mon 30 Nov 11:59 pm PT.**

| Spend | You get |
|---|---|
| $60 | A free 3 ml of the shopper's choice from a short list in stock |
| $100 | Free 3 ml plus a second free 3 ml |
| Any order | Free shipping at $35 (existing policy) |

Why this and not a percentage off:

- A 3 ml gift should cost you far less than the $23 it is listed at, while 20% off a $30 oil costs $6 straight from profit. Confirm your actual cost per filled vial, because I do not have it.
- It lifts AOV above the $60 and $100 lines. Your AOV has run $40 to $66.
- It moves 3 ml stock, which the Revenue Bridge spec named as the main inventory problem.
- It never touches list price, which protects the "never mass-market" positioning.
- It is a Shopify automatic discount (buy X, get Y), so it works without code changes.

**Fallback if a percentage is wanted:** 15% off orders of $75 or more, automatic, no code. Leave The Traveler Set out of any percentage offer. Earlier checks counted only 11 to 14 units.

**Validate before launch:** cost of a 3 ml filled vial, shipping cost per order, and whether you can honour the gift in every size you list. Cap the gift list to products with more than 15 units of 3 ml stock. PENDING stock sweep.

## 5. Channel plan for the 72 hours

| Channel | Action | Effort | Notes |
|---|---|---|---|
| Email | Four sends (section 6). Abandoned checkout and cart on. | 3 hours | Consented contacts only. Add UTM links from section 7. |
| Instagram | Daily story and one post per day, Wed to Tue. Use hooks from the dossier Appendix B. Link in bio to `/gift` or `/atlas`. | 1 hour a day | About 1,900 followers in July. Expect a few orders, not a surge. |
| TikTok | Organic only. Post three Waypoint Files and one founder clip. Spark-boost any post that gets traction later. | 1 hour a day | No pixel, so no paid. A TikTok Shop listing exists (Honey Oudh at $37.99 earlier in the year). Check price and stock match the site. |
| Meta ads | Optional. $25 to $40 a day on retargeting only (site visitors, cart adders, video viewers, list lookalike off). | 1 hour | Pixel is live but consent-gated, so the audience is smaller than traffic. Skip prospecting this week. Only run if purchase tracking checks out (finding 2). |
| Google | Make sure branded search ads or Shopping are not paused. | 15 minutes | You earned $6.5K in a year from search with no effort. |
| Creators | Message the 6 creators who already posted about the brand (@thefragrancefreak, @notjeangrey, @shoppingaddictdee and others found in the July research) with a code. Do not start new seeding now. | 1 hour | Gifted kits will not arrive before Friday. Use them for December. |
| Reddit | Do not post promotions. If the founder is already active in the subreddits, answer questions only. | 0 | Sub rules vary and astroturfing backfires. |
| Etsy | Nothing. | 0 | Still suspended on the last check. Tell me if the appeal outcome changed. |

## 6. Email copy (ready to paste, no em dashes per `docs/COPY-STYLE.md`)

Sender: Jordan at TARIFE ATTAR. Check each product is in stock that morning and swap names as needed. Placeholders are in {{braces}}.

### Email 1: Thu 26 Nov, 9 am PT, "Early access"

**Subject:** Open now for you, before the sale
**Preview:** A thank you, and a small gift with every order of $60 or more.

> Happy Thanksgiving.
>
> This year has been a quiet one for us, and the people who stayed with the brand are the reason it kept going. Thank you.
>
> Tonight at 6 pm Pacific, the Passport opens to everyone. You get it now.
>
> Place an order of $60 or more and add a free 3 ml of your choice. Order $100 or more and we add a second. Shipping is free from $35.
>
> If you do not know where to start, take the five-question quiz and we will point you to your territory.
>
> {{Button: Open the Atlas → https://tarifeattar.com/atlas?utm_source=email&utm_medium=email&utm_campaign=bfcm2026&utm_content=early}}
>
> Jordan
> Founder, Tarife Attar

### Email 2: Fri 27 Nov, 8 am PT, "Launch"

**Subject:** Three small bottles, one passport
**Preview:** Free 3 ml with $60. A second with $100. Ends Monday night.

> The Passport is open until Monday, 30 November, 11:59 pm Pacific.
>
> Spend $60 and take a free 3 ml. Spend $100 and take two.
>
> New to us? Start with the pieces people come back for:
> {{3 in-stock best sellers, each with legacy name, e.g. "MEDINA, formerly Musk Tahara"}}
>
> Rather give than keep? The Traveler Set holds ten 3 ml oils in one case. We have only a few left.
>
> Nothing here is on a countdown clock. The offer ends Monday, and some bottles run out sooner.
>
> {{Button: Shop the Atlas → https://tarifeattar.com/atlas?utm_source=email&utm_medium=email&utm_campaign=bfcm2026&utm_content=launch}}

### Email 3: Sat 28 Nov, 9 am PT, "Small Business Saturday" (founder story)

**Subject:** I used to skate for a living
**Preview:** How a pro skateboarder ended up blending perfume oils in Union City.

> I was a professional skateboarder before I was a perfumer. I learned the second trade slowly, over twenty-five years, starting at flea markets and street corners in the Bay Area.
>
> The name comes from Tarifa, the town at the tip of Spain where Santiago's journey begins in The Alchemist. Every scent in the Atlas is named for a place that taught us something.
>
> We make small batches, we pack them ourselves, and we answer every message.
>
> If you shop small this Saturday, the Passport is still open through Monday.
>
> {{Button: Find your territory → https://tarifeattar.com/quiz?utm_source=email&utm_medium=email&utm_campaign=bfcm2026&utm_content=sbs}}

(Confirm the details with Jordan before sending. They come from public interviews.)

### Email 4: Mon 30 Nov, 10 am PT, "Last day"

**Subject:** The Passport closes tonight
**Preview:** Last chance for your free 3 ml. Ends 11:59 pm Pacific.

> A short note. The Passport ends tonight at 11:59 pm Pacific.
>
> $60 gets a free 3 ml. $100 gets two.
>
> If you have a bottle in your satchel, it is easy to finish. If you are still deciding, the quiz takes two minutes.
>
> {{Button: Open my satchel → https://tarifeattar.com/cart?utm_source=email&utm_medium=email&utm_campaign=bfcm2026&utm_content=lastcall}}

### Abandoned cart (turn on, edit the copy)

Two emails, the first after 1 hour and the second after 24 hours: "You left something in your satchel." Mention the Passport gift line, link to the cart, no fake scarcity.

## 7. Link kit (use exactly these)

| Where | URL |
|---|---|
| Bio, stories | `https://tarifeattar.com/atlas?utm_source=instagram&utm_medium=social&utm_campaign=bfcm2026` |
| Gift focus | `https://tarifeattar.com/gift?utm_source=<channel>&utm_medium=<medium>&utm_campaign=bfcm2026` |
| Quiz | `https://tarifeattar.com/quiz?utm_source=<channel>&utm_medium=<medium>&utm_campaign=bfcm2026` |
| Product | `https://tarifeattar.com/product/<slug>?utm_source=<channel>&utm_medium=<medium>&utm_campaign=bfcm2026` |

Never link `/shop`, `/store`, `/collections` or `/browse`. UTMs are captured to the Shopify cart only after marketing consent, so some orders will still read as direct.

## 8. Run of show

| When | Task | Owner |
|---|---|---|
| Tue 24 Nov | Decide offer and email platform. Check Shopify purchase tracking. Confirm stock. | Jordan |
| Tue 24 Nov | Turn on abandoned checkout and cart. Build the Passport automatic discount. | Jordan or me, once Shopify is signed in |
| Wed 25 Nov | Load emails 1 to 4 as scheduled. QA every link on a phone. Post a teaser to stories. | Jordan |
| Thu 26 Nov | 9 am send email 1. 6 pm Passport live. | scheduled |
| Fri 27 Nov | 8 am send email 2. Post, story, reply to comments. | Jordan |
| Sat 28 Nov | 9 am send email 3. | scheduled |
| Mon 30 Nov | 10 am send email 4. Passport ends 11:59 pm PT. | scheduled |
| Tue 1 Dec | Giving Tuesday: optional, only if there is a cause you actually support. Start December gift sends. | Jordan |
| Wed 2 Dec | Read the numbers (section 9). Plan December. | Jordan and me |

## 9. How to know it worked

Read in Shopify (not GA4) until purchase tracking is confirmed: orders, gross sales, AOV, share of orders with a gift, new vs returning customers, orders by UTM campaign. Targets are guesses, not data: beat Nov 2025's $11.6K over the whole month is realistic only if the list is mailed and hero stock is available. A plain win for this weekend is 40 to 80 orders and AOV over $60.

## 10. After Black Friday (December)

1. Gift guide emails and a "ship by" date once carrier cutoffs are confirmed.
2. Reorder best sellers early. Stockouts of the top five were the largest self-inflicted loss this year.
3. Get the post-purchase "Field Note" review ask live and show reviews on product pages.
4. Fix P1 items 8 to 16.
5. Resume the dossier roadmap: TikTok Shop, Etsy appeal follow-up, Fragrantica pages, creator seeding for Q1.
