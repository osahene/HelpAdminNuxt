// The portal's pages, grouped as in the sidebar. Which ones a signed-in
// staff member gets is decided by the backend (EmergencySystem/main_admin/
// roles.py) and arrives as `user.sections` from /trap_admin/me/ — the
// sidebar (layouts/admin.vue) and the page guard (middleware/auth.global.ts)
// both read this list, so a page is never shown in the menu but blocked, or
// reachable but missing from the menu.

import type * as HeroIcons from '@heroicons/vue/24/outline'

export type Section =
  | 'dashboard' | 'alerts' | 'users' | 'contacts' | 'messages'
  | 'analytics' | 'reports' | 'tutorials' | 'system_errors' | 'settings' | 'team'

export interface PortalPage {
  section: Section
  to: string
  label: string
  icon: keyof typeof HeroIcons
  group: 'Main Menu' | 'Insights' | 'System'
}

export const PORTAL_PAGES: PortalPage[] = [
  { section: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: 'HomeIcon', group: 'Main Menu' },
  { section: 'alerts', to: '/alerts', label: 'Alerts', icon: 'BellAlertIcon', group: 'Main Menu' },
  { section: 'users', to: '/users', label: 'Users', icon: 'UsersIcon', group: 'Main Menu' },
  { section: 'contacts', to: '/contacts', label: 'Contacts', icon: 'PhoneIcon', group: 'Main Menu' },
  { section: 'messages', to: '/marketing', label: 'Messages', icon: 'ChatBubbleLeftRightIcon', group: 'Main Menu' },
  { section: 'analytics', to: '/analytics', label: 'Analytics', icon: 'ChartBarIcon', group: 'Insights' },
  { section: 'reports', to: '/reports', label: 'Reports', icon: 'DocumentTextIcon', group: 'Insights' },
  { section: 'tutorials', to: '/tutorials', label: 'Video Tutorials', icon: 'PlayCircleIcon', group: 'Insights' },
  { section: 'team', to: '/team', label: 'Team', icon: 'UserGroupIcon', group: 'System' },
  { section: 'settings', to: '/settings', label: 'Settings', icon: 'CogIcon', group: 'System' },
  { section: 'system_errors', to: '/system-errors', label: 'System Errors', icon: 'ExclamationTriangleIcon', group: 'System' },
]

/** The section a route belongs to, or null for pages every signed-in staff member can open. */
export function sectionForPath(path: string): Section | null {
  const page = PORTAL_PAGES.find(p => path === p.to || path.startsWith(p.to + '/'))
  return page?.section ?? null
}
