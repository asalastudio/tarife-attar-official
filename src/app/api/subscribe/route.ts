import { NextRequest, NextResponse } from 'next/server';
import { submitSubscription } from '@/lib/omnisend/subscribe';

export async function POST(request: NextRequest) {
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const result = await submitSubscription({
    input,
    apiKey: process.env.OMNISEND_API_KEY || '',
    fetchImpl: fetch,
    now: () => new Date().toISOString(),
  });

  return NextResponse.json(result.body, { status: result.status });
}
