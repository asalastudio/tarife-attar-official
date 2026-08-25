export interface ShopifyUserError {
  field?: string[] | null;
  message: string;
  code?: string | null;
}

export interface ShopifyWarning {
  code: string;
  message: string;
  target: string;
}

export interface ShopifyCartMutationPayload {
  userErrors?: ShopifyUserError[] | null;
  warnings?: ShopifyWarning[] | null;
}

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;

function sanitizeErrorPart(value: string, maxLength: number): string {
  return value.replace(CONTROL_CHARACTERS, '').trim().slice(0, maxLength);
}

export function assertCartMutationSuccess(
  payload: ShopifyCartMutationPayload,
  operation: string,
): void {
  const firstError = payload.userErrors?.[0];
  if (!firstError) return;

  const safeOperation = sanitizeErrorPart(operation, 80) || 'update cart';
  const safeMessage =
    sanitizeErrorPart(firstError.message, 300) || 'Shopify rejected the request';

  throw new Error(`Shopify could not ${safeOperation}: ${safeMessage}`);
}
