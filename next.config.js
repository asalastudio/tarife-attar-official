/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
  // Improve build performance
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  
  // =========================================================================
  // SECURITY HEADERS
  // Protect against common vulnerabilities and improve security posture
  // =========================================================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.shopify.com https://js.sentry.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.sanity.io https://*.myshopify.com https://*.shopifycdn.com https://api.sentry.io",
              "frame-src 'self' https://*.myshopify.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ],
      },
    ];
  },
  
  // =========================================================================
  // ATLAS COLLECTION — URL REDIRECTS
  // Final 28 geographic waypoints. All old evocative + legacy slugs → new.
  // =========================================================================
  async redirects() {
    return [
      // =======================================================================
      // OMNISEND / EMAIL CAMPAIGN REDIRECTS
      // =======================================================================
      { source: '/shop', destination: '/cart', permanent: false },
      { source: '/shopify', destination: '/cart', permanent: false },
      { source: '/shopify/shop', destination: '/cart', permanent: false },
      { source: '/collections', destination: '/cart', permanent: false },
      { source: '/collections/all', destination: '/cart', permanent: false },
      { source: '/store', destination: '/cart', permanent: false },
      { source: '/browse', destination: '/cart', permanent: false },

      // =======================================================================
      // OLD EVOCATIVE ATLAS SLUGS → FINAL WAYPOINT SLUGS (March 2026)
      // =======================================================================
      { source: '/product/beloved', destination: '/product/granada', permanent: true },
      { source: '/product/caravan', destination: '/product/saana', permanent: true },
      { source: '/product/close', destination: '/product/tarifa', permanent: true },
      { source: '/product/nizwa', destination: '/product/tarifa', permanent: true },
      { source: '/product/rogue', destination: '/product/aden', permanent: true },
      { source: '/product/dune', destination: '/product/malabar', permanent: true },
      { source: '/product/devotion', destination: '/product/beirut', permanent: true },
      { source: '/product/obsidian', destination: '/product/serengeti', permanent: true },
      { source: '/product/clarity', destination: '/product/manali', permanent: true },
      { source: '/product/dubai', destination: '/product/monaco', permanent: true },
      { source: '/product/fathom', destination: '/product/bahrain', permanent: true },
      { source: '/product/delmar', destination: '/product/big-sur', permanent: true },
      { source: '/product/jasmine', destination: '/product/tobago', permanent: true },
      { source: '/product/cherish', destination: '/product/kandy', permanent: true },
      { source: '/product/tahara', destination: '/product/medina', permanent: true },
      { source: '/product/ritual', destination: '/product/siwa', permanent: true },
      { source: '/product/regalia', destination: '/product/samarkand', permanent: true },

      // =======================================================================
      // INTERMEDIATE GEOGRAPHIC NAMES → FINAL WAYPOINT SLUGS (March 2026)
      // These are the names that existed between the evocative era and now.
      // =======================================================================
      { source: '/product/petra', destination: '/product/saana', permanent: true },
      { source: '/product/zanzibar', destination: '/product/malabar', permanent: true },
      { source: '/product/oman', destination: '/product/tarifa', permanent: true },
      { source: '/product/ethiopia', destination: '/product/beirut', permanent: true },
      { source: '/product/kyoto', destination: '/product/meishan', permanent: true },
      { source: '/product/grasse', destination: '/product/tobago', permanent: true },
      { source: '/product/tulum', destination: '/product/hudson', permanent: true },
      { source: '/product/amer', destination: '/product/carmel', permanent: true },

      // =======================================================================
      // ARCHIVE PRODUCTS → /atlas (until /archive page is built)
      // =======================================================================
      { source: '/product/ancient', destination: '/atlas', permanent: false },
      { source: '/product/cairo', destination: '/atlas', permanent: false },
      { source: '/product/regatta', destination: '/atlas', permanent: false },
      { source: '/product/onyx', destination: '/atlas', permanent: false },
      { source: '/product/kalahari', destination: '/atlas', permanent: false },

      // =======================================================================
      // LEGACY SHOPIFY SLUGS → FINAL WAYPOINT SLUGS (/product/ paths)
      // =======================================================================
      { source: '/product/granada-amber', destination: '/product/granada', permanent: true },
      { source: '/product/honey-oudh', destination: '/product/saana', permanent: true },
      { source: '/product/vanilla-sands', destination: '/product/malabar', permanent: true },
      { source: '/product/teeb-musk', destination: '/product/tarifa', permanent: true },
      { source: '/product/oud-fire', destination: '/product/aden', permanent: true },
      { source: '/product/dubai-musk', destination: '/product/monaco', permanent: true },
      { source: '/product/himalayan-musk', destination: '/product/manali', permanent: true },
      { source: '/product/frankincense-myrrh', destination: '/product/beirut', permanent: true },
      { source: '/product/frankincense-and-myrrh', destination: '/product/beirut', permanent: true },
      { source: '/product/black-musk', destination: '/product/serengeti', permanent: true },
      { source: '/product/cairo-musk', destination: '/atlas', permanent: false },
      { source: '/product/sicilian-oudh', destination: '/product/sicily', permanent: true },
      { source: '/product/oud-tobacco', destination: '/product/havana', permanent: true },
      { source: '/product/oud-and-tobacco', destination: '/product/havana', permanent: true },
      { source: '/product/oud-aura', destination: '/product/samarkand', permanent: true },
      { source: '/product/black-ambergris', destination: '/atlas', permanent: false },
      { source: '/product/arabian-jasmine', destination: '/product/tobago', permanent: true },
      { source: '/product/turkish-rose', destination: '/product/damascus', permanent: true },
      { source: '/product/white-egyptian-musk', destination: '/product/siwa', permanent: true },
      { source: '/product/musk-tahara', destination: '/product/medina', permanent: true },
      { source: '/product/peach-memoir', destination: '/product/kandy', permanent: true },
      { source: '/product/del-mare', destination: '/product/big-sur', permanent: true },
      { source: '/product/blue-oudh', destination: '/product/bahrain', permanent: true },
      { source: '/product/china-rain', destination: '/product/meishan', permanent: true },
      { source: '/product/coconut-jasmine', destination: '/product/bahia', permanent: true },
      { source: '/product/black-oud', destination: '/product/riyadh', permanent: true },
      { source: '/product/spanish-sandalwood', destination: '/product/hudson', permanent: true },
      { source: '/product/white-amber', destination: '/product/carmel', permanent: true },

      // =======================================================================
      // LEGACY PRODUCTS → /cart (Shopify-only, no headless page)
      // =======================================================================
      { source: '/product/tarife-attar-gift-card', destination: '/cart', permanent: false },
      { source: '/products/tarife-attar-gift-card', destination: '/cart', permanent: false },
      { source: '/product/gift-card', destination: '/cart', permanent: false },
      { source: '/products/gift-card', destination: '/cart', permanent: false },

      // =======================================================================
      // SHOPIFY /products/ (PLURAL) → FINAL WAYPOINT SLUGS
      // =======================================================================
      { source: '/products/granada-amber', destination: '/product/granada', permanent: true },
      { source: '/products/honey-oudh', destination: '/product/saana', permanent: true },
      { source: '/products/vanilla-sands', destination: '/product/malabar', permanent: true },
      { source: '/products/dune', destination: '/product/malabar', permanent: true },
      { source: '/products/teeb-musk', destination: '/product/tarifa', permanent: true },
      { source: '/products/oud-fire', destination: '/product/aden', permanent: true },
      { source: '/products/dubai-musk', destination: '/product/monaco', permanent: true },
      { source: '/products/himalayan-musk', destination: '/product/manali', permanent: true },
      { source: '/products/frankincense-myrrh', destination: '/product/beirut', permanent: true },
      { source: '/products/black-musk', destination: '/product/serengeti', permanent: true },
      { source: '/products/cairo-musk', destination: '/atlas', permanent: false },
      { source: '/products/sicilian-oudh', destination: '/product/sicily', permanent: true },
      { source: '/products/marrakesh', destination: '/product/marrakesh', permanent: true },
      { source: '/products/oud-tobacco', destination: '/product/havana', permanent: true },
      { source: '/products/oud-aura', destination: '/product/samarkand', permanent: true },
      { source: '/products/black-ambergris', destination: '/atlas', permanent: false },
      { source: '/products/arabian-jasmine', destination: '/product/tobago', permanent: true },
      { source: '/products/turkish-rose', destination: '/product/damascus', permanent: true },
      { source: '/products/white-egyptian-musk', destination: '/product/siwa', permanent: true },
      { source: '/products/musk-tahara', destination: '/product/medina', permanent: true },
      { source: '/products/peach-memoir', destination: '/product/kandy', permanent: true },
      { source: '/products/del-mare', destination: '/product/big-sur', permanent: true },
      { source: '/products/blue-oudh', destination: '/product/bahrain', permanent: true },
      { source: '/products/china-rain', destination: '/product/meishan', permanent: true },
      { source: '/products/coconut-jasmine', destination: '/product/bahia', permanent: true },
      { source: '/products/regatta', destination: '/atlas', permanent: false },
      { source: '/products/black-oud', destination: '/product/riyadh', permanent: true },
      { source: '/products/spanish-sandalwood', destination: '/product/hudson', permanent: true },
      { source: '/products/white-amber', destination: '/product/carmel', permanent: true },

      // Catch-all: /products/* → /product/* (must be LAST)
      { source: '/products/:slug*', destination: '/product/:slug*', permanent: false },
    ];
  },
};

module.exports = nextConfig;
