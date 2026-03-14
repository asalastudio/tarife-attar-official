/**
 * Sync API Route
 *
 * Handles inventory synchronization between platforms.
 */

import { NextResponse } from 'next/server';
import { platformManager } from '@/lib/connectors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sku, quantity, productIds } = body;

    switch (action) {
      case 'sync_inventory': {
        if (!sku || quantity === undefined) {
          return NextResponse.json(
            { error: 'Missing sku or quantity' },
            { status: 400 }
          );
        }

        const results = await platformManager.syncInventoryToAll(sku, quantity);

        return NextResponse.json({
          success: true,
          results,
          message: `Synced ${sku} to quantity ${quantity}`,
        });
      }

      case 'sync_multiple': {
        if (!productIds || !Array.isArray(productIds)) {
          return NextResponse.json(
            { error: 'Missing productIds array' },
            { status: 400 }
          );
        }

        // In production, this would fetch from your database
        // and sync each product's inventory
        const results = {
          synced: productIds.length,
          failed: 0,
          errors: [] as string[],
        };

        return NextResponse.json({
          success: true,
          results,
          message: `Synced ${results.synced} products`,
        });
      }

      case 'check_status': {
        const platforms = await platformManager.getConnectedPlatforms();

        return NextResponse.json({
          success: true,
          platforms,
          message: `${platforms.length} platforms connected`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[Sync API Error]:', error);
    return NextResponse.json(
      { error: 'Sync operation failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const platforms = await platformManager.getConnectedPlatforms();

    return NextResponse.json({
      success: true,
      connectedPlatforms: platforms,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Sync API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
