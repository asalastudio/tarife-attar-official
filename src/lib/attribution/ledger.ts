export const ATTRIBUTION_STORAGE_KEY = 'ta_attribution_v1';
export const ATTRIBUTION_VERSION = 1 as const;

export const ATTRIBUTION_QUERY_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
] as const;

type AttributionQueryKey = (typeof ATTRIBUTION_QUERY_KEYS)[number];

export interface AttributionTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page: string;
  referrer?: string;
  gclid?: string;
  fbclid?: string;
  captured_at: string;
}

export interface AttributionLedger {
  version: typeof ATTRIBUTION_VERSION;
  first: AttributionTouch;
  latest: AttributionTouch;
}

export interface InboundTouch {
  touch: AttributionTouch;
  qualified: boolean;
}

export interface ParseInboundTouchInput {
  url: string;
  referrer: string;
  ownHosts: string[];
  capturedAt: string;
}

export interface ShopifyAttributeInput {
  key: string;
  value: string;
}

export interface ResolveAttributionForConsentInput {
  marketingAllowed: boolean;
  stored: AttributionLedger | null;
  inbound: InboundTouch | null;
}

export interface ResolvedAttributionState {
  ledger: AttributionLedger | null;
  storageAction: 'clear' | 'write' | 'none';
}

const TOUCH_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'landing_page',
  'referrer',
  'gclid',
  'fbclid',
  'captured_at',
] as const;

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;

function sanitizeString(value: string, maxLength: number): string {
  return value.replace(CONTROL_CHARACTERS, '').trim().slice(0, maxLength);
}

function getMaxLength(field: keyof AttributionTouch): number {
  if (field === 'landing_page' || field === 'referrer') return 1024;
  if (field === 'gclid' || field === 'fbclid') return 512;
  if (field === 'captured_at') return 64;
  return 255;
}

function isHttpUrl(url: URL): boolean {
  return url.protocol === 'https:' || url.protocol === 'http:';
}

function parseExternalReferrer(
  rawReferrer: string,
  ownHosts: Set<string>,
): { url?: string; host?: string; internal: boolean } {
  if (!rawReferrer) return { internal: false };

  try {
    const referrer = new URL(rawReferrer);
    if (!isHttpUrl(referrer)) return { internal: false };

    const host = referrer.hostname.toLowerCase();
    if (ownHosts.has(host)) return { internal: true };

    referrer.search = '';
    referrer.hash = '';

    return {
      url: sanitizeString(referrer.toString(), 1024),
      host,
      internal: false,
    };
  } catch {
    return { internal: false };
  }
}

function normalizeCapturedAt(capturedAt: string): string | null {
  const sanitized = sanitizeString(capturedAt, 64);
  return sanitized && !Number.isNaN(Date.parse(sanitized)) ? sanitized : null;
}

export function parseInboundTouch(
  input: ParseInboundTouchInput,
): InboundTouch | null {
  let landingUrl: URL;
  try {
    landingUrl = new URL(input.url);
  } catch {
    return null;
  }

  if (!isHttpUrl(landingUrl)) return null;

  const capturedAt = normalizeCapturedAt(input.capturedAt);
  if (!capturedAt) return null;

  const ownHosts = new Set(input.ownHosts.map((host) => host.toLowerCase()));
  const referrer = parseExternalReferrer(input.referrer, ownHosts);

  if (referrer.internal) return null;

  const attributionValues: Partial<Record<AttributionQueryKey, string>> = {};
  const landingAttribution = new URLSearchParams();

  for (const key of ATTRIBUTION_QUERY_KEYS) {
    const rawValue = landingUrl.searchParams.get(key);
    if (!rawValue) continue;

    const maxLength = key === 'gclid' || key === 'fbclid' ? 512 : 255;
    const value = sanitizeString(rawValue, maxLength);
    if (!value) continue;

    attributionValues[key] = value;
    landingAttribution.append(key, value);
  }

  landingUrl.search = landingAttribution.toString();
  landingUrl.hash = '';

  const hasCampaignIdentifier = Object.keys(attributionValues).length > 0;
  const hasExternalReferrer = Boolean(referrer.url && referrer.host);
  const qualified = hasCampaignIdentifier || hasExternalReferrer;

  const touch: AttributionTouch = {
    ...attributionValues,
    landing_page: sanitizeString(landingUrl.toString(), 1024),
    captured_at: capturedAt,
  };

  if (referrer.url) touch.referrer = referrer.url;

  if (!qualified) {
    touch.utm_source = '(direct)';
    touch.utm_medium = '(none)';
  } else if (!hasCampaignIdentifier && referrer.host) {
    touch.utm_source = sanitizeString(referrer.host, 255);
    touch.utm_medium = 'referral';
  }

  return { touch, qualified };
}

export function mergeAttribution(
  existing: AttributionLedger | null,
  inbound: InboundTouch | null,
): AttributionLedger | null {
  if (!inbound) return existing;

  if (!existing) {
    return {
      version: ATTRIBUTION_VERSION,
      first: inbound.touch,
      latest: inbound.touch,
    };
  }

  if (!inbound.qualified) return existing;

  return {
    ...existing,
    latest: inbound.touch,
  };
}

export function resolveAttributionForConsent({
  marketingAllowed,
  stored,
  inbound,
}: ResolveAttributionForConsentInput): ResolvedAttributionState {
  if (!marketingAllowed) {
    return { ledger: null, storageAction: 'clear' };
  }

  const ledger = mergeAttribution(stored, inbound);
  return {
    ledger,
    storageAction: ledger ? 'write' : 'none',
  };
}

function parseStoredTouch(value: unknown): AttributionTouch | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as Record<string, unknown>;
  if (
    typeof record.landing_page !== 'string' ||
    typeof record.captured_at !== 'string'
  ) {
    return null;
  }

  let landingPage: URL;
  try {
    landingPage = new URL(record.landing_page);
  } catch {
    return null;
  }

  if (!isHttpUrl(landingPage)) return null;

  const capturedAt = normalizeCapturedAt(record.captured_at);
  if (!capturedAt) return null;

  const touch: AttributionTouch = {
    landing_page: sanitizeString(landingPage.toString(), 1024),
    captured_at: capturedAt,
  };

  for (const field of TOUCH_FIELDS) {
    if (field === 'landing_page' || field === 'captured_at') continue;

    const fieldValue = record[field];
    if (fieldValue === undefined) continue;
    if (typeof fieldValue !== 'string') return null;

    const sanitized = sanitizeString(fieldValue, getMaxLength(field));
    if (sanitized) touch[field] = sanitized;
  }

  return touch;
}

export function parseStoredLedger(raw: string | null): AttributionLedger | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || parsed.version !== ATTRIBUTION_VERSION) return null;

    const first = parseStoredTouch(parsed.first);
    const latest = parseStoredTouch(parsed.latest);
    if (!first || !latest) return null;

    return { version: ATTRIBUTION_VERSION, first, latest };
  } catch {
    return null;
  }
}

function attributeKey(
  prefix: 'first' | 'latest',
  field: (typeof TOUCH_FIELDS)[number],
): string {
  return `ta_${prefix}_${field}`;
}

export function serializeCartAttributes(
  ledger: AttributionLedger | null,
): ShopifyAttributeInput[] {
  if (!ledger) return [];

  const attributes: ShopifyAttributeInput[] = [
    { key: 'ta_attribution_version', value: String(ATTRIBUTION_VERSION) },
  ];

  for (const prefix of ['first', 'latest'] as const) {
    const touch = ledger[prefix];
    for (const field of TOUCH_FIELDS) {
      const value = touch[field];
      if (!value) continue;

      attributes.push({
        key: attributeKey(prefix, field),
        value: sanitizeString(value, getMaxLength(field)),
      });
    }
  }

  return attributes;
}
