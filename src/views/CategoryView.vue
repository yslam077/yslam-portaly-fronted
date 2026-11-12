<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import { useCategoriesStore } from '../stores/categories'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const categoriesStore = useCategoriesStore()

const articles = ref([])
const popularArticles = ref([])
const pagination = ref({ current_page: 1, last_page: 1 })
const loading = ref(true)

// reactive: updates by itself when the categories store reloads after a language switch
const currentCategory = computed(
  () => categoriesStore.categories.find((c) => c.slug === route.params.slug) || { slug: route.params.slug, name: route.params.slug }
)

const categoryTitle = computed(() => {
  const c = currentCategory.value
  if (c.translations && c.translations[locale.value]) return c.translations[locale.value]
  return getLocalized(c.name) || route.params.slug
})

function getLocalized(field) {
  if (!field) return ''
  if (typeof field === 'object') {
    return field[locale.value] || field['tm'] || field['ru'] || Object.values(field)[0] || ''
  }
  return field
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

function viewCount(a) {
  return a?.views || a?.views_count || 0
}

async function loadCategoryData(page = 1) {
  loading.value = true
  const slug = route.params.slug
  try {
    const [articlesRes, popRes] = await Promise.allSettled([
      api.getCategoryArticles(slug, page),
      api.getCategoryPopular(slug)
    ])

    if (articlesRes.status === 'fulfilled') {
      const data = articlesRes.value
      articles.value = data.data || []
      pagination.value = {
        current_page: data.current_page || data.meta?.current_page || 1,
        last_page: data.last_page || data.meta?.last_page || 1
      }
    }

    if (popRes.status === 'fulfilled') {
      const p = popRes.value?.data || popRes.value || []
      popularArticles.value = Array.isArray(p) ? p.slice(0, 5) : []
    }
  } catch (err) {
    console.error('Failed to load category data:', err)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.slug, () => loadCategoryData(1))
watch(locale, () => loadCategoryData(pagination.value.current_page))
onMounted(() => loadCategoryData(1))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Title -->
    <div class="mb-8 relative">
      <div class="pointer-events-none absolute -top-10 -left-6 w-40 h-40 rounded-full blur-3xl opacity-20" style="background: var(--brand-color)"></div>
      <h1 :key="categoryTitle" class="fx-rise relative text-3xl md:text-5xl font-black capitalize fx-gradient-text inline-block">
        {{ categoryTitle }}
      </h1>
      <p class="relative text-sm text-[var(--text-muted)] mt-2">
        {{ categoryTitle }} {{ t('category_news') }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- List -->
      <div class="lg:col-span-2 space-y-5">
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="fx-shimmer rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] h-36"></div>
        </template>

        <template v-else>
          <div v-for="(art, idx) in (articles.length ? articles : Array(3).fill({}))" :key="art.id || idx" v-reveal="idx * 80">
            <div
              v-tilt="4"
              v-spot
              @click="art.slug && router.push(`/article/${art.slug}`)"
              class="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row cursor-pointer group"
            >
              <div class="sm:w-56 h-40 sm:h-auto sm:min-h-[9rem] shrink-0 flex items-center justify-center overflow-hidden bg-black/5 dark:bg-black/20 relative">
                <img
                  v-if="art.image"
                  :src="art.image"
                  :alt="getLocalized(art.title)"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
              </div>

              <div class="p-5 flex flex-col justify-center space-y-2">
                <div class="text-[11px] font-semibold text-[var(--brand-color)] flex items-center flex-wrap gap-1.5">
                  <span>{{ categoryTitle }}</span>
                  <span class="text-[var(--text-muted)]">•</span>
                  <span class="text-[var(--text-muted)]">{{ formatDate(art.published_at) }}</span>
                  <span class="text-[var(--text-muted)]">•</span>
                  <span class="text-[var(--text-muted)]">{{ viewCount(art) }} {{ t('views') }}</span>
                </div>
                <h2 class="text-sm md:text-lg font-black uppercase text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
                  {{ getLocalized(art.title) || '[HABARYN ADY ULY HARP BILEN]' }}
                </h2>
                <p class="text-xs md:text-sm text-[var(--text-muted)] line-clamp-2">
                  {{ getLocalized(art.excerpt) || getLocalized(art.content) || '[Kicirak tekst: habar nama hakda]' }}
                </p>
                <span v-if="art.slug" class="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-color)]">
                  {{ t('read_more') }}
                  <svg class="group-hover:translate-x-1.5 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Pagination -->
        <div class="flex flex-wrap items-center gap-2 pt-4" v-if="pagination.last_page > 1">
          <button
            v-for="p in pagination.last_page"
            :key="p"
            @click="loadCategoryData(p)"
            :class="p === pagination.current_page
              ? 'fx-btn-primary font-bold'
              : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] hover:-translate-y-0.5'"
            class="fx-btn w-10 h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all"
          >{{ p }}</button>
        </div>
      </div>

      <!-- Sidebar -->
      <div v-spot class="rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4 sticky top-28">
        <h3 class="fx-title text-sm md:text-base text-[var(--text-primary)]">
          {{ categoryTitle }}: {{ t('category_popular') }}
        </h3>
        <div class="space-y-3.5">
          <div
            v-for="(item, idx) in (popularArticles.length ? popularArticles : Array(4).fill({}))"
            :key="item.id || idx"
            @click="item.slug && router.push(`/article/${item.slug}`)"
            class="flex items-start gap-3 cursor-pointer group"
          >
            <span class="fx-btn-primary shrink-0 w-7 h-7 rounded-lg grid place-items-center text-xs font-black group-hover:scale-110 group-hover:rotate-6 transition-transform">{{ idx + 1 }}</span>
            <span class="text-xs md:text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-color)] group-hover:translate-x-1 transition-all line-clamp-2">
              {{ getLocalized(item.title) || '[Habar ady]' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
