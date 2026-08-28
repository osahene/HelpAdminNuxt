export function useRealtime(event: string, callback: (payload: any) => void) {
  const config = useRuntimeConfig()

  // Same cookie the axios plugin (app/plugins/axiosInstance.ts) reads/writes
  // the admin's access JWT to/from, so a token refreshed by that plugin's
  // scheduler is picked up here too.
  const accessTokenCookie = useCookie<string | null>('accessToken', { default: () => null })

  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let disposed = false
  let attempt = 0

  // The server closes with this code when the token is missing, invalid,
  // expired, or not an authorised admin token.
  const AUTH_FAIL_CODE = 4401

  const BASE_RETRY_DELAY = 5000        // genuine network drop / server restart
  const BASE_AUTH_RETRY_DELAY = 30000  // auth failure — give a refresh a chance, don't hammer
  const MAX_RETRY_DELAY = 5 * 60 * 1000 // cap: a permanently-rejected admin must never tight-loop

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  const scheduleReconnect = (baseDelay: number) => {
    if (disposed) return
    attempt++
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), MAX_RETRY_DELAY)
    clearReconnectTimer()
    reconnectTimer = setTimeout(connect, delay)
  }

  function connect() {
    if (disposed) return
    clearReconnectTimer()

    // Re-read on every attempt: this picks up a token that axiosInstance.ts's
    // background scheduler may have refreshed since the last try.
    const token = accessTokenCookie.value
    if (!token) {
      // Nothing to authenticate with — back off instead of opening sockets
      // that are guaranteed to be rejected.
      scheduleReconnect(BASE_AUTH_RETRY_DELAY)
      return
    }

    const socket = new WebSocket(`${config.public.wsBase}/admin/?token=${encodeURIComponent(token)}`)
    ws = socket

    socket.onopen = () => {
      attempt = 0 // connection succeeded — reset backoff
    }

    socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
      if (data.event === event) {
        callback(data.payload)
      }
    }

    socket.onclose = (evt) => {
      if (ws === socket) ws = null
      if (disposed) return

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

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disposed = true
    clearReconnectTimer()
    ws?.close()
    ws = null
  })
}
