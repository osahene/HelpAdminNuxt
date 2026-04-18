// composables/useDarkMode.ts


export const useDarkMode = () => {
  const isDark = ref(false)

  const init = () => {
    if (process.client) {
      const stored = localStorage.getItem('darkMode')
      if (stored !== null) {
        isDark.value = stored === 'true'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      apply()
    }
  }

  const apply = () => {
    if (process.client) {
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('darkMode', String(isDark.value))
    }
  }

  const toggle = () => {
    isDark.value = !isDark.value
    apply()
  }

  onMounted(init)

  return { isDark, toggle }
}