export interface ShopifyCustomerPrivacyApi {
  analyticsProcessingAllowed(): boolean;
  marketingAllowed(): boolean;
  preferencesProcessingAllowed(): boolean;
  saleOfDataAllowed(): boolean;
}

export interface MeasurementPermissions {
  ready: boolean;
  analyticsAllowed: boolean;
  marketingAllowed: boolean;
  preferencesAllowed: boolean;
  saleOfDataAllowed: boolean;
}

export const DENIED_PERMISSIONS: MeasurementPermissions = {
  ready: false,
  analyticsAllowed: false,
  marketingAllowed: false,
  preferencesAllowed: false,
  saleOfDataAllowed: false,
};

// A terminal fail-closed state. Measurement stays disabled, but essential
// commerce no longer waits forever when Shopify's privacy runtime is missing.
export const SETTLED_DENIED_PERMISSIONS: MeasurementPermissions = {
  ...DENIED_PERMISSIONS,
  ready: true,
};

export function normalizePermissions(
  api: ShopifyCustomerPrivacyApi | null | undefined,
): MeasurementPermissions {
  if (!api) return DENIED_PERMISSIONS;

  try {
    return {
      ready: true,
      analyticsAllowed: api.analyticsProcessingAllowed() === true,
      marketingAllowed: api.marketingAllowed() === true,
      preferencesAllowed: api.preferencesProcessingAllowed() === true,
      saleOfDataAllowed: api.saleOfDataAllowed() === true,
    };
  } catch {
    return DENIED_PERMISSIONS;
  }
}

export function settlePermissions(
  api: ShopifyCustomerPrivacyApi | null | undefined,
): MeasurementPermissions {
  const permissions = normalizePermissions(api);
  return permissions.ready ? permissions : SETTLED_DENIED_PERMISSIONS;
}
