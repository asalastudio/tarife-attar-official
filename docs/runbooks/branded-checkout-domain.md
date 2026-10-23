# Branded checkout domain (checkout.tarifeattar.com)

Status: code is ready; the Shopify and DNS steps below are pending Jordan's approval. Nothing here has been applied.

## Why checkout opens on vasana-perfumes.myshopify.com

The storefront never builds a checkout link itself. `src/lib/shopify/client.ts` asks the Storefront API for `Cart.checkoutUrl`, and `src/app/(site)/cart/page.tsx` sends the shopper to exactly that URL after an allowlist check (`src/lib/attribution/checkout-url.ts`). Shopify builds `checkoutUrl` from the store's **primary domain**. The primary domain is still `vasana-perfumes.myshopify.com`, so that is the host shoppers see.

`www.tarifeattar.com` and the apex cannot be the Shopify primary domain, because they point at Vercel. The documented headless setup is a subdomain that points at Shopify and is set as primary, with the storefront itself staying on Vercel. Shopify: "For custom storefronts not hosted on Oxygen, only the subdomain must point to Shopify." ([Shopify docs](https://shopify.dev/docs/storefronts/headless/legacy/hydrogen/migrate/redirect-traffic))

We use `checkout.tarifeattar.com` because the CSP (`connect-src`) and the GA4 cross-domain linker already list it.

## Code (done on this branch)

- `allowedCheckoutHosts()` now always allows `checkout.tarifeattar.com`, plus `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN` (comma-separated) and the store domain. Before this change, the new host would have been rejected and checkout would have shown "Secure checkout is unavailable" the moment Shopify switched.
- No URL rewriting. Whatever host Shopify returns is used as is.
- No Vercel environment change is required. `NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN` can stay `vasana-perfumes.myshopify.com`. Carts created before the switch keep working, because Shopify redirects the old host to the new primary.

Deploy this code **before** step 3 below.

## Steps for Jordan (each one changes live settings)

DNS for tarifeattar.com is hosted at GoDaddy (nameservers `pdns05/pdns06.domaincontrol.com`). The apex `A 76.76.21.21` and `www CNAME cname.vercel-dns.com` records serve the Vercel site. **Do not change them.**

### 1. GoDaddy DNS: add one record

| Type  | Name       | Value                 | TTL    |
|-------|------------|-----------------------|--------|
| CNAME | `checkout` | `shops.myshopify.com` | 1 hour |

No A record is needed for the subdomain. ([Shopify: connect a subdomain](https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains/connect-subdomain))

### 2. Shopify Admin: connect the subdomain

1. **Settings → Domains → Connect existing domain**, enter `checkout.tarifeattar.com`, click **Next**, then **Verify connection**.
2. If Shopify asks for extra verification, add the TXT record it shows (name `shopify_verification_checkout`, value from Shopify) in GoDaddy and click **I updated DNS records**.
3. Wait until the domain shows **Connected** and its SSL certificate shows **Active**. This is usually minutes, and can take up to 48 hours.

### 3. Shopify Admin: make it primary (this is the switch)

1. **Settings → Domains → Change primary domain** → `checkout.tarifeattar.com` → **Save**.
2. Confirm the domain's target is **Online Store**.
3. Leave **Redirect all traffic to this domain** on, so old `vasana-perfumes.myshopify.com` checkout links forward to the new host.

From this moment, `Cart.checkoutUrl` returns `https://checkout.tarifeattar.com/...`.

### 4. Keep the redirect theme

The published Online Store theme is already the Hydrogen redirect theme. It sends every non-checkout path to `tarifeattar.com`. Under **Online Store → Themes → Customize → Theme settings**, confirm its storefront hostname is `www.tarifeattar.com`. Then anyone landing on `checkout.tarifeattar.com/` or `/products/...` ends up on the real site.

### 5. GA4

Under **Admin → Data streams → Web → Configure tag settings → Configure your domains**, add `checkout.tarifeattar.com`. Keep `vasana-perfumes.myshopify.com` until old links stop appearing (see `headless-attribution-release.md` §3).

## Verify after the switch

1. On `www.tarifeattar.com`, add an item, open the Satchel, tap **Checkout**. The address bar must show `checkout.tarifeattar.com` with a valid padlock.
2. On the checkout page, tap the logo and "Return to cart". Both must land on `www.tarifeattar.com`, not a Shopify theme page.
3. Open `https://checkout.tarifeattar.com/` directly. It must redirect to `www.tarifeattar.com`.
4. Place no order. If a full purchase test is needed, follow the approved low-value test in `headless-attribution-release.md`.

## What else changes when the primary domain changes

- Order status pages, customer account links and links in Shopify notification emails use `checkout.tarifeattar.com`. Product links there pass through the redirect theme to `www`.
- Shopify Messaging and marketing links built from the Online Store use the new host and are redirected the same way.

## Rollback

**Settings → Domains → Change primary domain** back to `vasana-perfumes.myshopify.com`. The storefront code needs no change in either direction.
