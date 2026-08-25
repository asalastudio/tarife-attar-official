export type SubscribeSource = 'quiz' | 'satchel' | 'newsletter';
export type Territory = 'ember' | 'petal' | 'tidal' | 'terra';

export interface SubscribeCartItem {
  title: string;
  price: string;
}

export interface SubscribeInput {
  email: string;
  firstName?: string;
  source: SubscribeSource;
  territory?: Territory;
  cartItems?: SubscribeCartItem[];
  marketingConsent: boolean;
}

export interface OmnisendPayload {
  identifiers: Array<{
    type: 'email';
    id: string;
    channels: {
      email: {
        status: 'subscribed' | 'nonSubscribed';
        statusChangedAt: string;
      };
    };
    consent?: {
      source: string;
      createdAt: string;
    };
  }>;
  tags: string[];
  customProperties: Record<string, string | number>;
  firstName?: string;
}

interface SubmitSubscriptionOptions {
  input: unknown;
  apiKey: string;
  fetchImpl: typeof fetch;
  now: () => string;
}

export interface SubscriptionResult {
  status: number;
  body: {
    success: boolean;
    error?: string;
  };
}

const OMNISEND_CONTACTS_URL = 'https://api.omnisend.com/api/contacts';
const OMNISEND_VERSION = '2026-03-15';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;
const SOURCES = new Set<SubscribeSource>(['quiz', 'satchel', 'newsletter']);
const TERRITORIES = new Set<Territory>(['ember', 'petal', 'tidal', 'terra']);

function cleanString(value: string, maxLength: number): string {
  return value.replace(CONTROL_CHARACTERS, '').trim().slice(0, maxLength);
}

function parseSubscribeInput(input: unknown): SubscribeInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid subscription input.');
  }

  const record = input as Record<string, unknown>;
  if (typeof record.email !== 'string') {
    throw new Error('A valid email is required.');
  }
  const email = cleanString(record.email, 320).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('A valid email is required.');
  }

  if (
    typeof record.source !== 'string' ||
    !SOURCES.has(record.source as SubscribeSource)
  ) {
    throw new Error('A valid subscription source is required.');
  }
  const source = record.source as SubscribeSource;

  if (typeof record.marketingConsent !== 'boolean') {
    throw new Error('Marketing consent must be explicitly provided.');
  }

  let territory: Territory | undefined;
  if (record.territory !== undefined) {
    if (
      typeof record.territory !== 'string' ||
      !TERRITORIES.has(record.territory as Territory)
    ) {
      throw new Error('Invalid territory.');
    }
    territory = record.territory as Territory;
  }

  let firstName: string | undefined;
  if (record.firstName !== undefined) {
    if (typeof record.firstName !== 'string') {
      throw new Error('Invalid first name.');
    }
    firstName = cleanString(record.firstName, 100) || undefined;
  }

  let cartItems: SubscribeCartItem[] | undefined;
  if (record.cartItems !== undefined) {
    if (!Array.isArray(record.cartItems) || record.cartItems.length > 100) {
      throw new Error('Invalid cart items.');
    }

    cartItems = record.cartItems.map((item) => {
      if (!item || typeof item !== 'object') {
        throw new Error('Invalid cart item.');
      }
      const cartItem = item as Record<string, unknown>;
      if (
        typeof cartItem.title !== 'string' ||
        typeof cartItem.price !== 'string'
      ) {
        throw new Error('Invalid cart item.');
      }

      const title = cleanString(cartItem.title, 200);
      const price = cleanString(cartItem.price, 40);
      if (!title || !price) throw new Error('Invalid cart item.');
      return { title, price };
    });
  }

  return {
    email,
    source,
    marketingConsent: record.marketingConsent,
    ...(firstName ? { firstName } : {}),
    ...(territory ? { territory } : {}),
    ...(cartItems ? { cartItems } : {}),
  };
}

export function buildOmnisendPayload(
  rawInput: unknown,
  createdAt: string,
): OmnisendPayload {
  const input = parseSubscribeInput(rawInput);
  if (!createdAt || Number.isNaN(Date.parse(createdAt))) {
    throw new Error('Invalid subscription timestamp.');
  }

  const tags = [`source:${input.source}`, 'tarife-attar'];
  if (input.source === 'quiz') tags.push('quiz-completed');
  if (input.source === 'satchel') tags.push('satchel-abandonment');
  if (input.source === 'newsletter') tags.push('newsletter-signup');
  if (input.territory) tags.push(`territory:${input.territory}`);

  const customProperties: Record<string, string | number> = {
    signupSource: input.source,
    signupDate: createdAt,
  };

  if (input.territory) {
    customProperties.territory = input.territory;
    customProperties.territoryName =
      input.territory.charAt(0).toUpperCase() + input.territory.slice(1);
  }

  if (input.cartItems?.length) {
    customProperties.cartItemCount = input.cartItems.length;
    customProperties.cartContents = input.cartItems
      .map(({ title }) => title)
      .join(', ')
      .slice(0, 2000);
    customProperties.cartTotal = input.cartItems
      .reduce((total, { price }) => {
        const amount = Number.parseFloat(price.replace(/[^0-9.-]/g, ''));
        return total + (Number.isFinite(amount) && amount > 0 ? amount : 0);
      }, 0)
      .toFixed(2);
  }

  const emailIdentifier: OmnisendPayload['identifiers'][number] = {
    type: 'email',
    id: input.email,
    channels: {
      email: {
        status: input.marketingConsent ? 'subscribed' : 'nonSubscribed',
        statusChangedAt: createdAt,
      },
    },
  };

  if (input.marketingConsent) {
    emailIdentifier.consent = {
      source: `tarife-${input.source}-form`,
      createdAt,
    };
  }

  return {
    identifiers: [emailIdentifier],
    tags,
    customProperties,
    ...(input.firstName ? { firstName: input.firstName } : {}),
  };
}

export async function submitSubscription({
  input,
  apiKey,
  fetchImpl,
  now,
}: SubmitSubscriptionOptions): Promise<SubscriptionResult> {
  let payload: OmnisendPayload;
  try {
    payload = buildOmnisendPayload(input, now());
  } catch {
    return {
      status: 400,
      body: { success: false, error: 'Invalid subscription details.' },
    };
  }

  if (!apiKey.trim()) {
    return {
      status: 503,
      body: {
        success: false,
        error: 'Email service is unavailable. Please try again later.',
      },
    };
  }

  try {
    const response = await fetchImpl(OMNISEND_CONTACTS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Omnisend-API-Key ${apiKey}`,
        'Omnisend-Version': OMNISEND_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        status: 502,
        body: {
          success: false,
          error: 'Email service rejected the request. Please try again.',
        },
      };
    }

    return { status: 200, body: { success: true } };
  } catch {
    return {
      status: 500,
      body: {
        success: false,
        error: 'Email service could not be reached. Please try again.',
      },
    };
  }
}
