export function useRealtime(event: string, callback: (payload: any) => void) {
  const config = useRuntimeConfig()
  let ws: WebSocket | null = null

  const connect = () => {
    ws = new WebSocket(`${config.public.wsBase}/admin`)
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data)
      if (data.event === event) {
        callback(data.payload)
      }
    }
    ws.onclose = () => {
      // Reconnect after 5 seconds
      setTimeout(connect, 5000)
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    ws?.close()
  })
}