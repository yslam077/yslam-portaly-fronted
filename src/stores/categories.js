import { defineStore } from "pinia";
import api from "../services/api";

export const useCategoriesStore = defineStore("categories", {
  state: () => ({
    categories: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      try {
        const res = await api.getCategories();
        const list = res?.data ?? res;
        this.categories = Array.isArray(list) ? list : [];
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        this.error = err.message;
        // не затираем уже загруженные категории при ошибке
      } finally {
        this.loading = false;
      }
    },
  },
});
