import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('auth_token') || '',
    loading: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    async fetchUser() {
      if (!this.token) return
      try {
        const res = await api.getMe()
        this.user = res.data || res
      } catch (err) {
        this.logout()
      }
    },
    async sendOtp(name, phone = '') {
      this.loading = true
      try {
        return await api.sendOtp({ name, phone })
      } finally {
        this.loading = false
      }
    },
    async verifyOtp(name, code, phone = '') {
      this.loading = true
      try {
        const res = await api.verifyOtp({ name, code, phone })
        const token = res.token || res.data?.token || ''
        this.token = token
        localStorage.setItem('auth_token', token)
        this.user = res.user || res.data?.user || null
        return res
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        if (this.token) {
          await api.logout().catch(() => {})
        }
      } finally {
        this.token = ''
        this.user = null
        localStorage.removeItem('auth_token')
      }
    }
  }
})
