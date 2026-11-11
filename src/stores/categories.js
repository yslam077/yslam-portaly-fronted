import { defineStore } from 'pinia'
import api from '../services/api'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const response = await api.getCategories()
        this.categories = response.data || response || []
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  }
})
