/**
 * Admin Layout
 *
 * Protected admin area with navigation sidebar.
 * In production, add authentication check here.
 */

import Link from 'next/link';
import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/admin-auth';

// Admin navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: 'grid' },
  { name: 'Products', href: '/products', icon: 'package' },
  { name: 'Inventory', href: '/inventory', icon: 'layers' },
  { name: 'Orders', href: '/orders', icon: 'shopping-bag' },
  { name: 'Analytics', href: '/analytics', icon: 'bar-chart' },
];

// Simple icon components
function Icon({ name }: { name: string }) {
  const icons: Record<string, React.ReactElement> = {
    grid: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    package: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    layers: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    'shopping-bag': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    'bar-chart': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  };

  return icons[name] || null;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Require admin authentication (redirects to /admin/login if not authenticated)
  await requireAdmin();

  // Get current path for active state
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/admin/dashboard';

  return (
    <div className="min-h-screen bg-theme-alabaster">
      {/* Sidebar - Using Charcoal for contrast */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-theme-charcoal text-theme-alabaster">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-theme-alabaster/10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="font-serif italic text-xl tracking-tight">
              Tarife Attär
            </span>
            <span className="text-xs font-mono text-theme-gold uppercase tracking-widest">
              Operations
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm
                  transition-all duration-300 ease-liquid
                  ${
                    isActive
                      ? 'bg-theme-gold/20 text-theme-gold font-medium'
                      : 'text-theme-alabaster/60 hover:text-theme-alabaster hover:bg-theme-alabaster/5'
                  }
                `}
              >
                <Icon name={item.icon} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Platform Status */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-theme-alabaster/10">
          <div className="text-xs font-mono text-theme-industrial uppercase tracking-widest mb-3">
            Platforms
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-theme-alabaster/60">Shopify</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-theme-industrial text-xs">Connected</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-theme-alabaster/60">Etsy</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-theme-gold" />
                <span className="text-theme-industrial text-xs">Setup Required</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-theme-alabaster/60">Sanity</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-theme-industrial text-xs">Connected</span>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-theme-alabaster border-b border-theme-charcoal/10 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-serif italic text-theme-charcoal">
              Operations Hub
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-mono text-theme-charcoal/50 hover:text-theme-charcoal transition-colors duration-300"
              target="_blank"
            >
              View Store →
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-mono text-theme-charcoal/30 hover:text-red-600 transition-colors duration-300"
              >
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
