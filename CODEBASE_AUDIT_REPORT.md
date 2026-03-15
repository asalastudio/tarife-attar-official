# Tarife Attar Codebase Audit Report

**Date:** March 15, 2026
**Auditor:** Claude Code
**Files Analyzed:** 101 TypeScript/JavaScript files

---

## Executive Summary

| Category | Issues Found | Fixed | Remaining |
|----------|-------------|-------|-----------|
| TypeScript Errors | 5 | 5 | 0 |
| ESLint Warnings | ~45 | 34 | 11 |
| Missing Dependencies | 1 | 1 | 0 |
| npm Vulnerabilities | 30 | 9 | 21 (require breaking changes) |
| Console Statements | 79 | 0 | 79 (to clean before production) |

---

## 1. CRITICAL ISSUES (Fixed)

### 1.1 Missing Dependency
- **File:** `package.json`
- **Issue:** `@anthropic-ai/sdk` was missing, causing build failure
- **Status:** FIXED

### 1.2 TypeScript Errors
| File | Line | Error | Status |
|------|------|-------|--------|
| `inventory/page.tsx` | 150, 166, 356, 416 | Type mismatch with SyncStatus | FIXED |
| `admin/layout.tsx` | 22 | JSX namespace issue | FIXED |

---

## 2. CODE QUALITY (Fixed)

### 2.1 Unused Imports Removed
| File | Removed Imports |
|------|-----------------|
| `atlas/page.tsx` | urlForImage, Image, Link |
| `product/[slug]/page.tsx` | urlForImage, Image, Link, ArrowLeft, Plus, Minus, Gift |
| `ProductDetailClient.tsx` | Info, COLLECTION_LABELS, useRouter |
| `CompassProvider.tsx` | CompassCurator |
| `connectors/index.ts` | sanityConnector (duplicate import) |

### 2.2 `any` Types Replaced
All Sanity image fields now use proper types:
```typescript
// Before
mainImage?: any;

// After
mainImage?: { asset?: { _ref: string } };
```

---

## 3. REMAINING ISSUES (Non-Critical)

### 3.1 Console Statements (79 total)
These should be removed before production deployment:

| File | Count | Priority |
|------|-------|----------|
| ProductDetailClient.tsx | 12 | High |
| ShopifyCartContext.tsx | 8 | High |
| Satchel.tsx | 8 | Medium |
| EssenceDrop.tsx | 8 | Medium |
| etsy.ts (connector) | 9 | Low (dev only) |
| shopify.ts (connector) | 8 | Low (dev only) |

**Recommendation:** Create a logging utility that can be disabled in production:
```typescript
// src/lib/logger.ts
const isDev = process.env.NODE_ENV === 'development';
export const log = isDev ? console.log : () => {};
```

### 3.2 ESLint Warnings (11 remaining)
| File | Warning | Reason |
|------|---------|--------|
| useDeviceTier.ts | `_e` unused | Intentional - error ignored in catch |
| CustomCursor.tsx | `_e`, `_e2` unused | Intentional - errors ignored |
| ShopifyCartContext.tsx | `_err` unused | Intentional - errors ignored |
| ShopifyCartContext.tsx | `any` type | Shopify API response type needed |
| ghostWriter.ts | `any` type | Dynamic content type |
| shopify/client.ts | `any` type | GraphQL response type |

### 3.3 Naming Inconsistencies
| Issue | Current | Recommended |
|-------|---------|-------------|
| Hooks directory | `/src/Hooks/` | `/src/hooks/` (lowercase) |
| Context naming | Mixed (CartContext vs ShopifyCartContext) | Choose consistent pattern |

### 3.4 Code Duplication Opportunities
1. **Touch device detection** - Repeated in CustomCursor, RealisticCompass
   - Extract to `useIsTouchDevice()` hook

2. **Animation spring configs** - Repeated in CompassCurator, RealisticCompass, EssenceDrop
   - Extract to `/src/lib/motion/constants.ts`

3. **Scroll detection logic** - Repeated across navigation components
   - Extract to `useScrollPosition()` hook

### 3.5 Commented Code to Review
| File | Lines | Description |
|------|-------|-------------|
| CompassProvider.tsx | 164-226 | Curator trigger button (commented out) |
| HybridCompass.tsx | 30-40 | TODO for compass asset |

---

## 4. SECURITY VULNERABILITIES

### 4.1 Fixed (9 vulnerabilities)
- tar, undici, and related packages updated via `npm audit fix`

### 4.2 Remaining (21 vulnerabilities - require breaking changes)

| Package | Current | Required | Breaking Change |
|---------|---------|----------|-----------------|
| next | 14.2.35 | 16.x | Major version bump |
| sanity | 3.57.0 | 5.x | Major version bump |
| eslint-config-next | 14.x | 16.x | Follows Next.js |

**Upgrade Path:**
1. Test current fixes thoroughly
2. Create separate branch for Next.js 16 upgrade
3. Update Sanity to v5 (separate effort)
4. Run full regression testing

---

## 5. BUILD STATUS

```
TypeScript:  PASSING
ESLint:      11 warnings (non-critical)
Build:       PASSING (requires network for Google Fonts)
```

---

## 6. RECOMMENDED ACTIONS

### Immediate (Before Production)
- [ ] Remove or wrap console statements (79 instances)
- [ ] Test cart functionality thoroughly
- [ ] Verify Shopify integration works

### Short-term
- [ ] Rename `/src/Hooks/` to `/src/hooks/`
- [ ] Extract shared animation configs
- [ ] Create typed Shopify cart interface

### Medium-term
- [ ] Plan Next.js 16 upgrade
- [ ] Plan Sanity v5 upgrade
- [ ] Extract reusable hooks (touch detection, scroll position)

---

## 7. FILES MODIFIED IN THIS AUDIT

```
package.json
package-lock.json
src/app/(admin)/inventory/page.tsx
src/app/(admin)/layout.tsx
src/app/(site)/HomeClient.tsx
src/app/(site)/atlas/AtlasClient.tsx
src/app/(site)/atlas/page.tsx
src/app/(site)/product/[slug]/ProductDetailClient.tsx
src/app/(site)/product/[slug]/page.tsx
src/app/(site)/relic/RelicClient.tsx
src/app/(site)/relic/page.tsx
src/components/cart/AddToCartButton.tsx
src/components/navigation/CompassProvider.tsx
src/lib/connectors/index.ts
```

---

*Report generated by Claude Code audit on March 15, 2026*
