<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoriesStore } from '../stores/categories'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { locale, t } = useI18n()
const themeStore = useThemeStore()
const categoriesStore = useCategoriesStore()
const authStore = useAuthStore()

const searchQuery = ref('')
const isDark = computed(() => themeStore.mode === 'dark')

onMounted(() => {
  if (!categoriesStore.categories || categoriesStore.categories.length === 0) {
    categoriesStore.fetchCategories()
  }
})

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
  }
}

function setLocale(newLocale) {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
  window.location.reload()
}

function getCategoryName(category) {
  if (!category) return ''
  if (typeof category.name === 'object') {
    return category.name[locale.value] || category.name['tm'] || category.name['ru'] || Object.values(category.name)[0]
  }
  return category.name
}
</script>

<template>
  <header class="w-full bg-[var(--bg-primary)] border-b border-[var(--border-color)] sticky top-0 z-50 shadow-sm transition-colors duration-300">
    <!-- Top Bar -->
    <div class="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <!-- Logo -->
      <router-link to="/" class="text-xl md:text-2xl font-bold tracking-tight text-[var(--brand-color)] shrink-0">
        {{ t('site_title') }}
      </router-link>

      <!-- Search Input -->
      <form @submit.prevent="handleSearch" class="flex-1 min-w-0 max-w-xs sm:max-w-md">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('search_placeholder')"
            class="w-full rounded-full border border-[var(--border-color)] bg-[var(--header-search-bg)] pl-4 pr-10 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] transition-colors"
          />
          <!-- Search icon inside -->
          <button type="submit" class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--brand-color)]">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>
        </div>
      </form>

      <!-- Right Controls -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Language Switcher -->
        <div class="flex items-center rounded-lg border border-[var(--border-color)] overflow-hidden text-xs font-semibold">
          <button
            @click="setLocale('tm')"
            :class="locale === 'tm'
              ? 'bg-[var(--brand-color)] text-white'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
            class="px-2.5 py-1.5 transition-colors"
          >TM</button>
          <button
            @click="setLocale('en')"
            :class="locale === 'en'
              ? 'bg-[var(--brand-color)] text-white'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
            class="px-2.5 py-1.5 border-l border-[var(--border-color)] transition-colors"
          >EN</button>
          <button
            @click="setLocale('ru')"
            :class="locale === 'ru'
              ? 'bg-[var(--brand-color)] text-white'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
            class="px-2.5 py-1.5 border-l border-[var(--border-color)] transition-colors"
          >RU</button>
        </div>

        <!-- 🌙 / ☀️ Sun / Moon Theme Toggle -->
        <button
          @click="themeStore.toggleTheme()"
          :title="isDark ? 'Ak reжim' : 'Garaňky reжim'"
          class="w-9 h-9 rounded-full border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--brand-color)] hover:border-[var(--brand-color)] transition-all duration-200"
        >
          <!-- Sun (shown in dark mode) -->
          <svg v-if="isDark" width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/>
          </svg>
          <!-- Moon (shown in light mode) -->
          <svg v-else width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>

        <!-- Login / Register OR User Info -->
        <template v-if="!authStore.isAuthenticated">
          <router-link
            to="/login"
            class="rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors bg-[#1c1917] hover:bg-black dark:bg-[var(--brand-color)] dark:text-black"
          >
            {{ t('login_register') }}
          </router-link>
        </template>
        <template v-else>
          <router-link
            to="/profile"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-colors"
          >
            {{ authStore.user?.name || t('welcome') }}
          </router-link>
          <button
            @click="authStore.logout()"
            class="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border-color)] hover:border-red-400 hover:text-red-500 transition-colors"
          >
            {{ t('logout') }}
          </button>
        </template>
      </div>
    </div>

    <!-- Categories Nav Bar -->
    <div class="max-w-7xl mx-auto px-4 pb-2 flex items-center gap-1 overflow-x-auto scrollbar-hide text-sm font-medium">
      <router-link
        to="/"
        active-class="!bg-[var(--brand-color)] !text-white font-bold"
        exact
        class="px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        {{ t('all_news') }}
      </router-link>

      <router-link
        v-for="cat in categoriesStore.categories"
        :key="cat.id"
        :to="`/category/${cat.slug}`"
        active-class="!bg-[var(--brand-color)] !text-white font-bold"
        class="px-3 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors"
      >
        {{ getCategoryName(cat) }}
      </router-link>
    </div>
  </header>
</template>
