'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { captureAttribution } from '@/lib/attribution';

/**
 * Invisible listener that persists campaign parameters (utm_*, click ids)
 * whenever a visitor lands with them, so the satchel can re-attach them to
 * the Shopify checkout URL. Must be mounted inside <Suspense>.
 */
export default function AttributionCapture() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution(searchParams.toString(), pathname);
  }, [searchParams, pathname]);

  return null;
}
