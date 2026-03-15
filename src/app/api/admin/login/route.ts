import { NextResponse } from 'next/server';
import { setAdminCookie } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { secret } = await request.json();
    const expectedSecret = process.env.ADMIN_SECRET;

    if (!expectedSecret) {
      return NextResponse.json(
        { error: 'Admin access is not configured' },
        { status: 503 }
      );
    }

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await setAdminCookie(secret);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
