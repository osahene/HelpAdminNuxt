import { useAuthStore } from '~/stores/auth'
import { sectionForPath } from '~/utils/portalSections'

// Routes that do NOT require authentication. There is no sign-up page: the
// super admin adds staff on the Team page and they set their password from
// the emailed invitation (/auth/setPassword).
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/setPassword',
  '/auth/forgotPassword',
  '/auth/resetPassword',
]

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

  // ── 2. Determine if the target route is public ───────────────────────────────
  const isPublicRoute = PUBLIC_ROUTES.some(
    path => to.path === path || to.path.startsWith(path + '/')
  )

  // ── 3. Authenticated user trying to access auth pages ───────────────────────
  if (isAuthenticated && isPublicRoute) {
    return navigateTo(authStore.homePath, { replace: true })
  }

  // ── 4. Unauthenticated user trying to access a protected route ───────────────
  if (!isAuthenticated && !isPublicRoute) {
    return navigateTo(
      { path: '/auth/login', query: { redirect: to.fullPath } },
      { replace: true }
    )
  }

  // ── 5. Role-based access: only the sections this role was given ─────────────
  // (the backend enforces the same list on every API call — this just keeps
  // people on pages that will actually work for them).
  if (isAuthenticated && authStore.user && !isPublicRoute) {
    if (to.path === '/') return navigateTo(authStore.homePath, { replace: true })
    const section = sectionForPath(to.path)
    if (section && !authStore.can(section)) {
      return navigateTo(authStore.homePath, { replace: true })
    }
  }

  // ── 6. All checks passed — allow navigation ──────────────────────────────────
})
