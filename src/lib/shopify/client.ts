import { shopifyTrackingHeaders } from '../analytics/shopify-browser.ts';
import type { OfferVariant } from '../product-structured-data.ts';

/**
 * Shopify Storefront API Client
 */

export const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || '';
const domain = SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !accessToken) {
  console.warn('Shopify configuration missing. Cart functionality will be disabled.');
}

interface ShopifyFetchVariables {
  [key: string]: unknown;
}

async function shopifyFetch({
  query,
  variables = {},
  cache,
  revalidate,
}: {
  query: string;
  variables?: ShopifyFetchVariables;
  cache?: RequestCache;
  /** Seconds to keep a server-side response in Next's data cache. */
  revalidate?: number;
}) {
  if (!domain || !accessToken) {
    throw new Error('Shopify configuration missing. Please set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN');
  }

  const endpoint = `https://${domain}/api/2026-01/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      ...(cache ? { cache } : {}),
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': accessToken!,
        ...shopifyTrackingHeaders(),
      },
      body: JSON.stringify({ query, variables }),
    });

    return await response.json();
  } catch (error) {
    console.error('Shopify Fetch Error:', error);
    throw error;
  }
}

/**
 * Cart Queries & Mutations
 */

const CART_FIELDS = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    attributes {
      key
      value
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
                width
                height
              }
              product {
                id
                title
                handle
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
  }
`;

const CART_MUTATION_FEEDBACK = `
  userErrors {
    field
    message
    code
  }
  warnings {
    code
    message
    target
  }
`;

export const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart { ...CartFields }
      ${CART_MUTATION_FEEDBACK}
    }
  }
  ${CART_FIELDS}
`;

export const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) { ...CartFields }
  }
  ${CART_FIELDS}
`;

export const ADD_LINES_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      ${CART_MUTATION_FEEDBACK}
    }
  }
  ${CART_FIELDS}
`;

export const UPDATE_LINES_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { ...CartFields }
      ${CART_MUTATION_FEEDBACK}
    }
  }
  ${CART_FIELDS}
`;

export const REMOVE_LINES_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { ...CartFields }
      ${CART_MUTATION_FEEDBACK}
    }
  }
  ${CART_FIELDS}
`;

export const CART_ATTRIBUTES_UPDATE_MUTATION = `
  mutation cartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart { ...CartFields }
      ${CART_MUTATION_FEEDBACK}
    }
  }
  ${CART_FIELDS}
`;

/**
 * Check real-time product availability via Storefront API
 * Returns availableForSale status for the product and its variants
 */
export const CHECK_PRODUCT_AVAILABILITY_QUERY = `
  query getProductAvailability($id: ID!) {
    node(id: $id) {
      ... on ProductVariant {
        id
        availableForSale
        quantityAvailable
      }
    }
  }
`;

export async function checkVariantAvailability(variantGid: string): Promise<boolean> {
  try {
    const { data } = await shopifyFetch({
      query: CHECK_PRODUCT_AVAILABILITY_QUERY,
      variables: { id: variantGid },
    });
    return data?.node?.availableForSale ?? false;
  } catch {
    // If Shopify check fails, don't block — fall back to Sanity value
    return true;
  }
}

export { shopifyFetch };

/** Fetch current product availability in one request; never rely on CMS stock flags. */
export async function getFeaturedAvailability(handles: string[]) {
  const fields = handles.map((handle, i) =>
    `p${i}: product(handle: ${JSON.stringify(handle)}) { handle availableForSale variants(first: 100) { nodes { availableForSale price { amount } } } }`
  ).join('\n');
  const { data, errors } = await shopifyFetch({ query: `query FeaturedAvailability { ${fields} }`, cache: 'no-store' });
  if (errors?.length || !data) throw new Error('Featured availability unavailable');
  return Object.values(data).flatMap((value) => {
    const product = value as { handle: string; availableForSale: boolean; variants: { nodes: Array<{ availableForSale: boolean; price: { amount: string } }> } } | null;
    if (!product) return [];
    const prices = product.variants.nodes.filter(v => v.availableForSale).map(v => Number(v.price.amount));
    return [{ handle: product.handle, availableForSale: product.availableForSale, price: Math.min(...prices) }];
  });
}

export const PRODUCT_OFFERS_QUERY = `
  query ProductOffers($id: ID!) {
    product(id: $id) {
      featuredImage { url }
      variants(first: 10) {
        nodes { title sku availableForSale price { amount currencyCode } }
      }
    }
  }
`;

/**
 * Live sizes, prices and stock for a product's structured data and share tags.
 * Cached for a minute; returns null when Shopify cannot be reached, so the
 * page still renders.
 */
export async function getProductOffers(
  productGid: string,
): Promise<{ variants: OfferVariant[]; featuredImageUrl: string | null } | null> {
  try {
    const { data, errors } = await shopifyFetch({
      query: PRODUCT_OFFERS_QUERY,
      variables: { id: productGid },
      revalidate: 60,
    });
    const product = data?.product;
    if (errors?.length || !product) return null;
    return {
      variants: product.variants?.nodes ?? [],
      featuredImageUrl: product.featuredImage?.url ?? null,
    };
  } catch {
    return null;
  }
}
