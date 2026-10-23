# Mobile fixes: before and after (2026-10-22)

Branch `claude/tarife-attar-mobile-c28827` compared with `391ad39` (main at the time). Both are local production builds (`next build && next start`) on the same machine, live Sanity and Shopify data. Nothing was deployed.

Screenshots are 390 x 844 (rendered at 2x, shown at 1x): `1-home.png`, `2-menu-open.png`, `3-product.png`, `4-product-purchase-bar.png`, `5-add-to-satchel.png`, `6-satchel.png`.

## Lighthouse mobile, homepage (3 runs each)

| | Before | After |
|---|---|---|
| Performance, default simulated throttling (what PageSpeed Insights uses) | 71 / 93 / 90 | 83 / 85 / 86 |
| LCP, simulated | 16.8 s / 2.5 s* / 3.0 s* | 4.6 s / 4.1 s / 4.1 s |
| Performance, DevTools throttling (real slow 4G, 4x CPU) | 65 / 65 / 65 | 94 / 95 / 95 |
| LCP, DevTools throttling | 14.1 s / 14.1 s / 14.1 s | 2.0 s / 1.9 s / 1.9 s |
| CLS | 0 | 0 |
| Accessibility / Best practices / SEO | 91 / 96 / 100 | 96 / 96 / 100 |
| Page weight | 2,856 KiB | 636 KiB |

\* In those two runs Chrome did not measure the hero at all. The page was held at opacity 0 behind the intro, so LCP fell on an earlier text paint. In every other run, and in all "after" runs, the LCP element is the hero image.

Chrome's own LCP entries (PerformanceObserver, slow 4G, 4x CPU, first visit with the intro playing): hero painted at 14.06 to 14.07 s before, 1.74 to 1.88 s after.

The remaining gap in the simulated number: Lighthouse's simulator shares the slow-4G bandwidth evenly between the 40 KB hero and about 390 KB of JavaScript requested at the same time, while real Chrome downloads the high-priority hero first. About 57 KB of that JavaScript is next-sanity's live-preview client, pulled in because server code imports `createClient` and `groq` from `next-sanity`. That import change also affects product pages, so it is left as a follow-up.

## Product page (no regression intended or measured)

Interleaved runs: simulated LCP 4.5 to 4.8 s before, 4.6 to 4.9 s after. DevTools LCP 1.7 s before, 1.8 to 2.1 s after. CLS 0.010 to 0. Accessibility 91 to 96.

## Mobile audit (Playwright, 390 x 844, whole page scrolled)

| Page | Tap targets under 44 px | Text under 12 px | Form controls under 16 px |
|---|---|---|---|
| Home | 15 of 22 to 0 of 20 | 42 to 0 | 2 to 0 |
| Menu open | 25 of 38 to 0 of 36 | 56 to 0 | 2 to 0 |
| Product | 25 of 35 to 0 of 33 | 28 to 0 | 2 to 0 |
| Satchel | 19 of 24 to 0 of 22 | 30 to 0 | 2 to 0 |

No serif body text under 16 px on the home or product page. Product purchase bar: 149 px to 127 px, with the compass now above it instead of inside it. Add to Satchel: the button reads Adding, then Added once Shopify confirms; a polite live region announces "{product}, {size} added to your Satchel"; failures are announced through an alert region.
