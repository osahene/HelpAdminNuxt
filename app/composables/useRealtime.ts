// One shared WebSocket for the whole admin session, not one per caller.
// Previously every useRealtime(event, cb) call opened its own private socket
// — dashboard.vue called it twice (alert:new, alert:updated), which meant two
// live connections to AdminAlertConsumer from one page. Module-level state
// below is shared across every call, so there's exactly one connection no
// matter how many events/components subscribe, and its live state
// (isConnected) can finally be exposed to something like the sidebar's
// "System Online" indicator instead of that being decorative markup.

type Listener = (payload: any) => void

// The server closes with this code when the token is missing, invalid,
// expired, or not an authorised admin token.
const AUTH_FAIL_CODE = 4401

const BASE_RETRY_DELAY = 5000        // genuine network drop / server restart
const BASE_AUTH_RETRY_DELAY = 30000  // auth failure — give a refresh a chance, don't hammer
const MAX_RETRY_DELAY = 5 * 60 * 1000 // cap: a permanently-rejected admin must never tight-loop

const listeners = new Map<string, Set<Listener>>()
const isConnected = ref(false)

let ws: WebSocket | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let attempt = 0
let started = false
let wsBase = ''
// Same cookie the axios plugin (app/plugins/axiosInstance.ts) reads/writes
// the admin's access JWT to/from, so a token refreshed by that plugin's
// scheduler is picked up here too. Captured once, as the Ref itself (not
// its value), so later reconnect attempts still see a refreshed token.
let accessTokenCookie: ReturnType<typeof useCookie<string | null>> | null = null

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

const scheduleReconnect = (baseDelay: number) => {
  attempt++
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), MAX_RETRY_DELAY)
  clearReconnectTimer()
  reconnectTimer = setTimeout(connect, delay)
}

function connect() {
  clearReconnectTimer()

  // Re-read on every attempt: this picks up a token that axiosInstance.ts's
  // background scheduler may have refreshed since the last try.
  const token = accessTokenCookie?.value
  if (!token) {
    // Nothing to authenticate with — back off instead of opening sockets
    // that are guaranteed to be rejected.
    scheduleReconnect(BASE_AUTH_RETRY_DELAY)
    return
  }

  const socket = new WebSocket(`${wsBase}/admin/?token=${encodeURIComponent(token)}`)
  ws = socket

  socket.onopen = () => {
    attempt = 0 // connection succeeded — reset backoff
    isConnected.value = true
  }

  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data)
    listeners.get(data.event)?.forEach(cb => cb(data.payload))
  }

  socket.onclose = (evt) => {
    if (ws === socket) ws = null
    isConnected.value = false

    if (evt.code === AUTH_FAIL_CODE) {
      // Auth rejected: the token might just have been stale and gets
      // refreshed before the next attempt (we re-read it above), but if
      // the admin account is genuinely deactivated/revoked this backs off
      // exponentially up to MAX_RETRY_DELAY rather than spinning.
      scheduleReconnect(BASE_AUTH_RETRY_DELAY)
      return
    }

    // Genuine network drop / server restart — retry, still capped.
    scheduleReconnect(BASE_RETRY_DELAY)
  }

  socket.onerror = () => {
    // onclose fires right after and drives reconnection; nothing else to do.
  }
}

function ensureStarted() {
  if (started) return
  started = true
  const config = useRuntimeConfig()
  wsBase = config.public.wsBase as string
  accessTokenCookie = useCookie<string | null>('accessToken', { default: () => null })
  connect()
}

export function useRealtime(event: string, callback: Listener) {
  ensureStarted()

  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(callback)

  onUnmounted(() => {
    listeners.get(event)?.delete(callback)
  })
}

// Read-only live connection state for anything that just needs to show
// "are we actually getting realtime alerts right now" — e.g. the admin
// layout's status indicator.
export function useRealtimeStatus() {
  ensureStarted()
  return { isConnected: readonly(isConnected) }
}
