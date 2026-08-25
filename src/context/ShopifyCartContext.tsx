"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ADD_LINES_MUTATION,
  CART_ATTRIBUTES_UPDATE_MUTATION,
  CREATE_CART_MUTATION,
  GET_CART_QUERY,
  REMOVE_LINES_MUTATION,
  UPDATE_LINES_MUTATION,
  formatVariantId,
  shopifyFetch,
} from '@/lib/shopify';
import { useAttribution } from '@/context/AttributionContext';
import { useAnalytics } from '@/context/AnalyticsContext';
import {
  buildAttributionAttributePatch,
  getAttributionAttributeFingerprint,
  ShopifyCartAttribute,
} from '@/lib/shopify/cart-attributes';
import { assertCartMutationSuccess } from '@/lib/shopify/cart-errors';

const TRACKING_SYNC_ERROR =
  'Campaign tracking could not be attached. Please try again before checkout.';

interface CartItem {
  id: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  handle: string;
  quantity: number;
  price: string;
  currencyCode: string;
  image?: string;
}

interface ShopifyCartLineNode {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title?: string;
    price?: { amount: string; currencyCode: string };
    image?: {
      url: string;
      altText?: string;
      width?: number;
      height?: number;
    };
    product: {
      title: string;
      handle: string;
      featuredImage?: {
        url: string;
        altText?: string;
        width?: number;
        height?: number;
      };
    };
  };
}

interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  attributes?: ShopifyCartAttribute[];
  lines: { edges: Array<{ node: ShopifyCartLineNode }> };
  cost: {
    totalAmount: { amount: string; currencyCode: string };
  };
}

interface ShopifyCartContextType {
  items: CartItem[];
  itemCount: number;
  cartTotal: string;
  checkoutUrl: string;
  isReadyForCheckout: boolean;
  isLoading: boolean;
  error: string | null;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateItemQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const ShopifyCartContext = createContext<ShopifyCartContextType | undefined>(
  undefined,
);

function mutationPayload<T>(response: unknown, operationName: string): T {
  const record = response as {
    data?: Record<string, T | undefined>;
    errors?: Array<{ message?: string }>;
  };
  const payload = record.data?.[operationName];
  if (payload) return payload;

  const message = record.errors?.[0]?.message;
  throw new Error(message || 'Shopify returned an invalid cart response.');
}

export function ShopifyCartProvider({ children }: { children: React.ReactNode }) {
  const { cartAttributes, ready: attributionReady } = useAttribution();
  const { trackAddToCart } = useAnalytics();
  const [cart, setCart] = useState<ShopifyCart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializationStartedRef = useRef(false);
  const syncAttemptRef = useRef<string | null>(null);

  const createNewCart = useCallback(
    async (attributes: ShopifyCartAttribute[]): Promise<ShopifyCart> => {
      const response = await shopifyFetch({
        query: CREATE_CART_MUTATION,
        variables: { input: { attributes } },
      });
      const payload = mutationPayload<{
        cart?: ShopifyCart | null;
        userErrors?: Array<{ message: string }>;
        warnings?: Array<{ code: string; message: string; target: string }>;
      }>(response, 'cartCreate');

      assertCartMutationSuccess(payload, 'create the cart');
      if (!payload.cart) throw new Error('Shopify did not return a cart.');

      setCart(payload.cart);
      localStorage.setItem('shopify_cart_id', payload.cart.id);
      return payload.cart;
    },
    [],
  );

  useEffect(() => {
    if (!attributionReady || initializationStartedRef.current) return;
    initializationStartedRef.current = true;

    const initCart = async () => {
      setIsLoading(true);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCartId = urlParams.get('cart_id') || urlParams.get('cart');
        const storedCartId = localStorage.getItem('shopify_cart_id');
        const cartId = urlCartId || storedCartId;

        if (cartId) {
          const response = await shopifyFetch({
            query: GET_CART_QUERY,
            variables: { cartId },
          });

          if (response.data?.cart) {
            setCart(response.data.cart);
            localStorage.setItem('shopify_cart_id', cartId);
            return;
          }

          if (!urlCartId) localStorage.removeItem('shopify_cart_id');
        }

        await createNewCart(cartAttributes);
      } catch {
        setError('Failed to initialize cart. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void initCart();
  }, [attributionReady, cartAttributes, createNewCart]);

  useEffect(() => {
    if (!attributionReady || !cart) return;

    const currentAttributes = cart.attributes ?? [];
    const patch = buildAttributionAttributePatch(
      currentAttributes,
      cartAttributes,
    );

    if (patch.length === 0) {
      syncAttemptRef.current = null;
      setError((current) =>
        current === TRACKING_SYNC_ERROR ? null : current,
      );
      return;
    }

    const attemptFingerprint = [
      cart.id,
      getAttributionAttributeFingerprint(currentAttributes),
      getAttributionAttributeFingerprint(cartAttributes),
    ].join('|');
    if (syncAttemptRef.current === attemptFingerprint) return;
    syncAttemptRef.current = attemptFingerprint;

    let cancelled = false;
    const syncAttributes = async () => {
      try {
        const response = await shopifyFetch({
          query: CART_ATTRIBUTES_UPDATE_MUTATION,
          variables: { cartId: cart.id, attributes: patch },
        });
        const payload = mutationPayload<{
          cart?: ShopifyCart | null;
          userErrors?: Array<{ message: string }>;
          warnings?: Array<{ code: string; message: string; target: string }>;
        }>(response, 'cartAttributesUpdate');

        assertCartMutationSuccess(payload, 'attach campaign tracking');
        if (!payload.cart) {
          throw new Error('Shopify did not return the updated cart.');
        }

        if (!cancelled) setCart(payload.cart);
      } catch {
        if (!cancelled) setError(TRACKING_SYNC_ERROR);
      }
    };

    void syncAttributes();
    return () => {
      cancelled = true;
    };
  }, [attributionReady, cart, cartAttributes]);

  const addItem = async (variantId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentCart = cart ?? (await createNewCart(cartAttributes));
      const formattedVariantId = formatVariantId(variantId);
      const response = await shopifyFetch({
        query: ADD_LINES_MUTATION,
        variables: {
          cartId: currentCart.id,
          lines: [
            { merchandiseId: formattedVariantId, quantity },
          ],
        },
      });
      const payload = mutationPayload<{
        cart?: ShopifyCart | null;
        userErrors?: Array<{ message: string }>;
        warnings?: Array<{ code: string; message: string; target: string }>;
      }>(response, 'cartLinesAdd');

      assertCartMutationSuccess(payload, 'add the item to the cart');
      if (!payload.cart) throw new Error('Shopify did not return the cart.');
      setCart(payload.cart);

      const addedLine = payload.cart.lines.edges.find(
        ({ node }) => node.merchandise.id === formattedVariantId,
      )?.node;
      const addedPrice = Number(addedLine?.merchandise.price?.amount);
      if (addedLine && Number.isFinite(addedPrice) && addedPrice >= 0) {
        trackAddToCart(
          {
            item_id: addedLine.merchandise.id,
            item_name: addedLine.merchandise.product.title,
            ...(addedLine.merchandise.title
              ? { item_variant: addedLine.merchandise.title }
              : {}),
            price: addedPrice,
            quantity,
          },
          addedLine.merchandise.price?.currencyCode || 'USD',
        );
      }
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to add item to cart.';
      setError(message);
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemQuantity = async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(lineId);
      return;
    }

    if (!cart) {
      setError('No cart available.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await shopifyFetch({
        query: UPDATE_LINES_MUTATION,
        variables: {
          cartId: cart.id,
          lines: [{ id: lineId, quantity }],
        },
      });
      const payload = mutationPayload<{
        cart?: ShopifyCart | null;
        userErrors?: Array<{ message: string }>;
        warnings?: Array<{ code: string; message: string; target: string }>;
      }>(response, 'cartLinesUpdate');

      assertCartMutationSuccess(payload, 'update the item quantity');
      if (!payload.cart) throw new Error('Shopify did not return the cart.');
      setCart(payload.cart);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to update quantity.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (lineId: string) => {
    if (!cart) {
      setError('No cart available.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await shopifyFetch({
        query: REMOVE_LINES_MUTATION,
        variables: { cartId: cart.id, lineIds: [lineId] },
      });
      const payload = mutationPayload<{
        cart?: ShopifyCart | null;
        userErrors?: Array<{ message: string }>;
        warnings?: Array<{ code: string; message: string; target: string }>;
      }>(response, 'cartLinesRemove');

      assertCartMutationSuccess(payload, 'remove the item from the cart');
      if (!payload.cart) throw new Error('Shopify did not return the cart.');
      setCart(payload.cart);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to remove item.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.removeItem('shopify_cart_id');
      await createNewCart(cartAttributes);
    } catch {
      setError('Failed to clear the cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const items: CartItem[] =
    cart?.lines?.edges?.map(({ node }: { node: ShopifyCartLineNode }) => ({
      id: node.id,
      variantId: node.merchandise.id,
      title: node.merchandise.product.title,
      variantTitle: node.merchandise.title,
      handle: node.merchandise.product.handle,
      quantity: node.quantity,
      price: String(node.merchandise.price?.amount || '0.00'),
      currencyCode: node.merchandise.price?.currencyCode || 'USD',
      image:
        node.merchandise.image?.url ||
        node.merchandise.product.featuredImage?.url,
    })) || [];

  const itemCount = cart?.totalQuantity || 0;
  const cartTotal = String(cart?.cost?.totalAmount?.amount || '0.00');
  const checkoutUrl = cart?.checkoutUrl || '';
  const isAttributionSynchronized = Boolean(
    attributionReady &&
      cart &&
      buildAttributionAttributePatch(
        cart.attributes ?? [],
        cartAttributes,
      ).length === 0,
  );
  const isReadyForCheckout = isAttributionSynchronized && !isLoading;

  return (
    <ShopifyCartContext.Provider
      value={{
        items,
        itemCount,
        cartTotal,
        checkoutUrl,
        isReadyForCheckout,
        isLoading,
        error,
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </ShopifyCartContext.Provider>
  );
}

export function useShopifyCart() {
  const context = useContext(ShopifyCartContext);
  if (context === undefined) {
    throw new Error('useShopifyCart must be used within a ShopifyCartProvider');
  }
  return context;
}
