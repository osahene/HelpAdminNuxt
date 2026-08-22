/**
 * middleware/auth.ts
 *
 * Global route guard for the SafeLink admin portal.
 *
 * Rules:
 * 1. Public pages (login, register, verify-email, auth-pin) are always accessible
 *    when the user is NOT authenticated.
 * 2. If an authenticated user visits a public/auth page, redirect them to /dashboard.
 * 3. Every other route requires authentication — redirect unauthenticated users to /login
 *    and preserve the original destination in `?redirect=` for post-login bounce-back.
 * 4. Role-based access: certain routes are restricted to specific roles.
 *    Unauthorised users are redirected to /dashboard with a 403 toast.
 */

import { useAuthStore } from '~/stores/auth'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/verify-email',
  '/auth/auth-pin',
  '/auth/forgot-password',
  '/auth/reset-password',
]

// Role-based access map: route prefix → allowed roles
const ROLE_RESTRICTIONS: Record<string, string[]> = {
  '/settings':  ['super_admin', 'admin'],
  '/marketing': ['super_admin', 'admin'],
  '/reports':   ['super_admin', 'admin', 'analyst'],
  '/analytics': ['super_admin', 'admin', 'analyst'],
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // ── 1. Hydrate auth state on first load (SSR-safe) ──────────────────────────
  // If the store hasn't loaded the user yet (e.g. page refresh), attempt to
  // restore the session from the HTTP-only cookie / local token.
  if (!authStore.isHydrated) {
    try {
      await authStore.fetchUser()
    } catch {
      // Token invalid / expired — store.fetchUser should clear the token
    }
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role as string | undefined

  // ── 2. Determine if the target route is public ───────────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.some(
    path => to.path === path || to.path.startsWith(path + '/')
  )

  // ── 3. Authenticated user trying to access auth pages ───────────────────────
  if (isAuthenticated && isPublicRoute) {
    return navigateTo('/dashboard', { replace: true })
  }

  // ── 4. Unauthenticated user trying to access a protected route ───────────────
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo(
      { path: '/auth/login', query: { redirect: to.fullPath } },
      { replace: true }
    )
  }

  // ── 5. Role-based access control ────────────────────────────────────────────
  if (isAuthenticated && userRole) {
    for (const [prefix, allowedRoles] of Object.entries(ROLE_RESTRICTIONS)) {
      if (to.path.startsWith(prefix) && !allowedRoles.includes(userRole)) {
        // Use a Nuxt error or redirect to dashboard with query flag for toast
        return navigateTo(
          { path: '/dashboard', query: { error: '403' } },
          { replace: true }
        )
      }
    }
  }

  // ── 6. All checks passed — allow navigation ──────────────────────────────────
})