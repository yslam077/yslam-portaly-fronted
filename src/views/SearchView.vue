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

function formatDate(dateStr) {
  if (!dateStr) return '08.11.2026'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU')
}

async function performSearch() {
  if (!query.value.trim()) return
  loading.value = true
  try {
    const res = await api.getArticles({ search: query.value.trim() })
    results.value = res.data || res || []
  } catch (err) {
    console.error('Search failed:', err)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (newQ) => {
  query.value = newQ || ''
  performSearch()
})

onMounted(() => {
  if (query.value) performSearch()
})
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">
    <h1 class="text-2xl font-bold text-[var(--text-primary)]">
      {{ t('search_placeholder') }}: <span class="text-[var(--brand-color)]">"{{ query }}"</span>
    </h1>

    <div v-if="loading" class="text-sm text-[var(--text-muted)]">
      Ýüklenýär...
    </div>

    <div v-else-if="results.length === 0" class="text-sm text-[var(--text-muted)]">
      {{ t('empty_news') }}
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="art in results"
        :key="art.id"
        @click="router.push(`/article/${art.slug}`)"
        class="rounded-2xl p-4 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row gap-5 cursor-pointer hover:border-[var(--brand-color)] transition-all"
      >
        <div class="w-full sm:w-48 h-32 rounded-xl bg-black/10 dark:bg-black/30 flex items-center justify-center shrink-0 overflow-hidden">
          <img
            v-if="art.image_url || art.image"
            :src="art.image_url || art.image"
            :alt="getLocalized(art.title)"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
        </div>

        <div class="flex flex-col justify-center space-y-1.5">
          <div class="text-[11px] font-semibold text-[var(--brand-color)]">
            {{ getLocalized(art.category?.name) || 'Habar' }} • {{ formatDate(art.created_at) }} • {{ art.views_count || 0 }} {{ t('views') }}
          </div>
          <h2 class="text-base font-black uppercase text-[var(--text-primary)] hover:text-[var(--brand-color)]">
            {{ getLocalized(art.title) }}
          </h2>
          <p class="text-xs text-[var(--text-muted)] line-clamp-2">
            {{ getLocalized(art.summary) || getLocalized(art.content) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
