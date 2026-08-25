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
