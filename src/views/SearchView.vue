<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../services/api'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

const query = ref(route.query.q || '')
const results = ref([])
const loading = ref(false)

function getLocalized(field) {
  if (!field) return ''
  if (typeof field === 'object') {
    return field[locale.value] || field['tm'] || field['ru'] || Object.values(field)[0] || ''
  }
  return field
}

function catName(cat) {
  if (!cat) return ''
  if (cat.translations && cat.translations[locale.value]) return cat.translations[locale.value]
  return getLocalized(cat.name)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

async function performSearch() {
  if (!query.value.trim()) return
  loading.value = true
  try {
    const res = await api.getArticles({ search: query.value.trim() })
    const list = res.data || res || []
    results.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Search failed:', err)
    results.value = []
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (newQ) => {
  query.value = newQ || ''
  performSearch()
})
watch(locale, performSearch)

onMounted(() => {
  if (query.value) performSearch()
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-7">
    <div class="relative">
      <div class="pointer-events-none absolute -top-10 -left-6 w-40 h-40 rounded-full blur-3xl opacity-20" style="background: var(--brand-color)"></div>
      <p class="relative text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">{{ t('search_results') }}</p>
      <h1 class="relative text-3xl md:text-4xl font-black text-[var(--text-primary)] mt-1">
        <span class="fx-gradient-text">"{{ query }}"</span>
        <span v-if="!loading && results.length" class="ml-3 align-middle text-xs fx-btn-primary rounded-full px-3 py-1">{{ t('results_count', { n: results.length }) }}</span>
      </h1>
    </div>

    <!-- loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="fx-shimmer h-36 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]"></div>
    </div>

    <!-- empty -->
    <div v-else-if="results.length === 0" class="rounded-3xl border border-dashed border-[var(--border-color)] bg-[var(--bg-card)] py-16 text-center space-y-3">
      <svg class="mx-auto text-[var(--brand-color)]" style="animation: fx-float 3.5s ease-in-out infinite" width="54" height="54" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-sm text-[var(--text-muted)]">{{ t('empty_news') }}</p>
    </div>

    <!-- results -->
    <div v-else class="space-y-5">
      <div v-for="(art, idx) in results" :key="art.id || idx" v-reveal="Math.min(idx, 5) * 70">
        <div
          v-tilt="4"
          v-spot
          @click="router.push(`/article/${art.slug}`)"
          class="group rounded-2xl p-4 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row gap-5 cursor-pointer"
        >
          <div class="w-full sm:w-56 h-40 sm:h-32 rounded-xl bg-black/10 dark:bg-black/30 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              v-if="art.image_url || art.image"
              :src="art.image_url || art.image"
              :alt="getLocalized(art.title)"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
          </div>

          <div class="flex flex-col justify-center space-y-2 min-w-0">
            <div class="text-[11px] font-semibold text-[var(--brand-color)]">
              {{ catName(art.category) || '—' }} • {{ formatDate(art.published_at || art.created_at) }} • {{ art.views_count || art.views || 0 }} {{ t('views') }}
            </div>
            <h2 class="text-base md:text-lg font-black uppercase text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors">
              {{ getLocalized(art.title) }}
            </h2>
            <p class="text-xs md:text-sm text-[var(--text-muted)] line-clamp-2">
              {{ getLocalized(art.summary) || getLocalized(art.excerpt) || getLocalized(art.content) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
