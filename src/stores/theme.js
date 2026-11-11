import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 'dark' or 'light'
    mode: localStorage.getItem('theme_mode') || 'dark'
  }),
  actions: {
    toggleTheme() {
      this.mode = this.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme_mode', this.mode)
      this.applyTheme()
    },
    setTheme(mode) {
      this.mode = mode
      localStorage.setItem('theme_mode', this.mode)
      this.applyTheme()
    },
    applyTheme() {
      const root = document.documentElement
      if (this.mode === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.remove('dark')
        root.classList.add('light')
      }
    }
  }
})
