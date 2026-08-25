export function secondsBetween(fromIso: string, toIso: string): number {
  return Math.max(0, (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 1000)
}

// Picks the coarsest unit that keeps the number readable — seconds under a
// minute, minutes under an hour, hours under a day, days beyond that.
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  const minutes = seconds / 60
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = minutes / 60
  if (hours < 24) return `${Math.round(hours * 10) / 10}h`
  const days = hours / 24
  return `${Math.round(days * 10) / 10}d`
}

export function averageDurationSeconds(rows: Array<{ from: string; to: string | null | undefined }>): number | null {
  const durations = rows.filter(r => r.to).map(r => secondsBetween(r.from, r.to as string))
  if (!durations.length) return null
  return durations.reduce((a, b) => a + b, 0) / durations.length
}
