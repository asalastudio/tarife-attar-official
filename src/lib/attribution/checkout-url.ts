function normalizeAllowedHosts(allowedHosts: string[]): Set<string> {
  return new Set(
    allowedHosts
      .map((host) => host.trim().toLowerCase())
      .filter((host) => host.length > 0),
  );
}

export function getSafeCheckoutUrl(
  rawUrl: string,
  allowedHosts: string[],
): string | null {
  if (!rawUrl) return null;

  let checkoutUrl: URL;
  try {
    checkoutUrl = new URL(rawUrl);
  } catch {
    return null;
  }

  if (checkoutUrl.protocol !== 'https:') return null;
  if (checkoutUrl.username || checkoutUrl.password) return null;

  const normalizedHosts = normalizeAllowedHosts(allowedHosts);
  if (!normalizedHosts.has(checkoutUrl.hostname.toLowerCase())) return null;

  checkoutUrl.hash = '';
  return checkoutUrl.toString();
}
