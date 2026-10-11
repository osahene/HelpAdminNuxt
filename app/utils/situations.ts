// A contact's `situations` are stored as whatever string the frontend that
// added them used — helpnext/helpflutter display labels ("Fire Outbreak") or
// short codes ("fire"). Normalized here the same way the backend does it
// (account.models.Emergency._ALERT_TYPE_ALIASES) so both spellings render as
// one consistent, colored badge — the same colors as the alerts pages.
const ALIASES: Record<string, string> = {
  'robbery': 'robbery', 'robbery attack': 'robbery',
  'health': 'health', 'health crisis': 'health',
  'fire': 'fire', 'fire outbreak': 'fire',
  'flood': 'flood', 'flood alert': 'flood',
  'violence': 'violence', 'violence alert': 'violence',
  'accident': 'other', 'accident alert': 'other',
  'call': 'other', 'call emergency': 'other',
  'other': 'other',
}

const SITUATIONS: Record<string, { label: string; pill: string }> = {
  robbery:  { label: 'Robbery Attack', pill: 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-500/10' },
  health:   { label: 'Health Crisis',  pill: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-500/10' },
  fire:     { label: 'Fire Outbreak',  pill: 'text-orange-700 bg-orange-50 dark:text-orange-300 dark:bg-orange-500/10' },
  flood:    { label: 'Flood Alert',    pill: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/10' },
  violence: { label: 'Violence Alert', pill: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-500/10' },
  other:    { label: 'Call Emergency', pill: 'text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-700' },
}

export interface SituationBadge {
  key: string
  label: string
  class: string
}

export function situationBadges(raw: unknown): SituationBadge[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const badges: SituationBadge[] = []
  for (const value of raw) {
    const text = String(value ?? '').trim()
    if (!text) continue
    const code = ALIASES[text.toLowerCase()]
    const key = code ?? text
    if (seen.has(key)) continue
    seen.add(key)
    const known = code ? SITUATIONS[code] : undefined
    badges.push({
      key,
      label: known?.label ?? text,
      class: `inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${known?.pill ?? 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-700'}`,
    })
  }
  return badges
}
