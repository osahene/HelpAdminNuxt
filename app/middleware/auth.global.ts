import { useAuthStore } from '~/stores/auth'

// Routes that do NOT require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/verifyEmail',
  '/auth/authPin',
  '/auth/forgot-password',
  '/auth/reset-password',
]

// Role-based access map: route prefix → allowed roles
const ROLE_RESTRICTIONS: Record<string, string[]> = {
  '/dashboard':  ['super_admin', 'admin'],
  '/users':  ['super_admin', 'admin'],
  '/contacts':  ['super_admin', 'admin'],
  '/alerts':  ['super_admin', 'admin'],
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