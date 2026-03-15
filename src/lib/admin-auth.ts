/**
 * Admin Authentication
 *
 * Simple token-based admin authentication using ADMIN_SECRET env var.
 * Admin users authenticate by providing the secret via:
 *   - Cookie: admin_token=<ADMIN_SECRET>
 *   - Header: x-admin-token: <ADMIN_SECRET>
 *
 * Login flow:
 *   1. Navigate to /admin/login
 *   2. Enter the ADMIN_SECRET
 *   3. Cookie is set, redirected to /admin/dashboard
 *
 * To set your admin secret, add to .env:
 *   ADMIN_SECRET=your-secret-here
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_COOKIE_NAME = 'admin_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Check if the current request is authenticated as admin.
 * Call this in server components or route handlers.
 */
export async function requireAdmin(): Promise<void> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error(
      'ADMIN_SECRET environment variable is not set. Admin access is disabled.'
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token !== secret) {
    redirect('/admin/login');
  }
}

/**
 * Verify admin token from request headers (for API routes).
 * Returns true if authenticated, false otherwise.
 */
export function verifyAdminToken(request: Request): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  // Check header first
  const headerToken = request.headers.get('x-admin-token');
  if (headerToken === secret) return true;

  // Check cookie from header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
  if (match && match[1] === secret) return true;

  return false;
}

/**
 * Set the admin authentication cookie.
 */
export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear the admin authentication cookie.
 */
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
