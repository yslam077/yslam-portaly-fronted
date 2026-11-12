<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
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
const scrolled = ref(false)
const isDark = computed(() => themeStore.mode === 'dark')

const locales = ['tm', 'en', 'ru']
const localeIndex = computed(() => Math.max(0, locales.indexOf(locale.value)))
const initial = computed(() => (authStore.user?.name || '?').trim().charAt(0).toUpperCase())

function onScroll() {
  scrolled.value = window.scrollY > 8
}

onMounted(() => {
  if (!categoriesStore.categories || categoriesStore.categories.length === 0) {
    categoriesStore.fetchCategories()
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
  }
}

function setLocale(newLocale) {
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

// api.js reads the language from localStorage on every request,
// so after a language switch we just reload the categories.
watch(locale, () => categoriesStore.fetchCategories())

function getCategoryName(category) {
  if (!category) return ''
  if (category.translations && category.translations[locale.value]) return category.translations[locale.value]
  if (typeof category.name === 'object' && category.name) {
    return category.name[locale.value] || category.name['tm'] || category.name['ru'] || Object.values(category.name)[0]
  }
  return category.name
}
</script>

<template>
  <header
    class="w-full sticky top-0 z-50 fx-glass border-b border-[var(--border-color)] transition-shadow duration-300"
    :class="scrolled ? 'shadow-lg shadow-black/10' : ''"
  >
    <!-- Top Bar -->
    <div
      class="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 transition-all duration-300"
      :class="scrolled ? 'py-2' : 'py-3.5'"
    >
      <!-- Logo -->
      <router-link to="/" class="group flex items-center gap-2.5 shrink-0">
        <span class="fx-spin-y fx-btn-primary grid place-items-center w-9 h-9 rounded-xl font-black text-lg">Y</span>
        <span class="fx-gradient-text text-xl md:text-2xl font-black tracking-tight">{{ t('site_title') }}</span>
      </router-link>

      <!-- Search -->
      <form @submit.prevent="handleSearch" class="flex-1 min-w-0 max-w-xs sm:max-w-md transition-[max-width] duration-500 focus-within:max-w-lg">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('search_placeholder')"
            class="w-full rounded-full border border-[var(--border-color)] bg-[var(--header-search-bg)] pl-4 pr-11 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-color)] focus:shadow-[0_0_0_4px_var(--fx-glow-soft)] transition-all"
          />
          <button
            type="submit"
            v-magnetic="0.4"
            class="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full grid place-items-center text-[var(--text-muted)] hover:text-white hover:bg-[var(--brand-color)] transition-colors"
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      <!-- Right controls -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Language switcher with sliding pill -->
        <div class="relative grid grid-cols-3 rounded-xl border border-[var(--border-color)] bg-[var(--header-search-bg)] p-0.5 text-xs font-bold">
          <span
            class="fx-btn-primary absolute top-0.5 bottom-0.5 left-0.5 rounded-[10px] transition-transform duration-500"
            :style="{
              width: 'calc((100% - 4px) / 3)',
              transform: `translateX(${localeIndex * 100}%)`,
              transitionTimingFunction: 'cubic-bezier(.2,.8,.2,1)'
            }"
          ></span>
          <button
            v-for="l in locales"
            :key="l"
            @click="setLocale(l)"
            class="relative z-10 w-10 py-1.5 transition-colors"
            :class="locale === l ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
          >{{ l.toUpperCase() }}</button>
        </div>

        <!-- Theme toggle -->
        <button
          @click="themeStore.toggleTheme()"
          :title="t('light_dark')"
          :aria-label="t('light_dark')"
          v-magnetic="0.35"
          class="relative w-9 h-9 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--brand-color)] hover:border-[var(--brand-color)] hover:shadow-[0_0_18px_var(--fx-glow-soft)] transition-colors duration-200"
        >
          <svg
            class="absolute inset-0 m-auto transition-all duration-500"
            :class="isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'"
            width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
          <svg
            class="absolute inset-0 m-auto transition-all duration-500"
            :class="isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'"
            width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Login OR user -->
        <template v-if="!authStore.isAuthenticated">
          <router-link
            to="/login"
            v-magnetic="0.25"
            class="fx-btn fx-btn-primary rounded-xl px-4 py-2 text-xs font-bold"
          >
            {{ t('login_register') }}
          </router-link>
        </template>
        <template v-else>
          <router-link
            to="/profile"
            class="flex items-center gap-2 rounded-xl border border-[var(--border-color)] pl-1.5 pr-3 py-1 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-colors"
          >
            <span class="fx-btn-primary grid place-items-center w-6 h-6 rounded-full text-[10px] font-black">{{ initial }}</span>
            <span class="hidden sm:inline max-w-[110px] truncate">{{ authStore.user?.name || t('welcome') }}</span>
          </router-link>
          <button
            @click="authStore.logout()"
            class="rounded-xl px-3 py-2 text-xs font-semibold text-[var(--text-muted)] border border-[var(--border-color)] hover:border-red-400 hover:text-red-500 transition-colors"
          >
            {{ t('logout') }}
          </button>
        </template>
      </div>
    </div>

    <!-- Categories bar -->
    <div class="max-w-7xl mx-auto px-4 pb-2 flex items-center gap-1 overflow-x-auto scrollbar-hide fx-fade-x text-sm font-medium">
      <router-link
        to="/"
        active-class=""
        exact-active-class="!bg-[var(--brand-color)] !text-white font-bold shadow-md"
        class="fx-navlink px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
      >
        {{ t('all_news') }}
      </router-link>

      <template v-if="categoriesStore.loading && !categoriesStore.categories.length">
        <span v-for="i in 6" :key="i" class="fx-shimmer h-7 w-20 rounded-lg bg-[var(--bg-card)] shrink-0"></span>
      </template>

      <router-link
        v-for="cat in categoriesStore.categories"
        :key="cat.id"
        :to="`/category/${cat.slug}`"
        active-class="!bg-[var(--brand-color)] !text-white font-bold shadow-md"
        class="fx-navlink px-3.5 py-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] whitespace-nowrap transition-colors"
      >
        {{ getCategoryName(cat) }}
      </router-link>
    </div>
  </header>
</template>
