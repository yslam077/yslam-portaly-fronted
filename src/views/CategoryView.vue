<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import { useCategoriesStore } from '../stores/categories'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const categoriesStore = useCategoriesStore()

const currentCategory = ref(null)
const articles = ref([])
const popularArticles = ref([])
const pagination = ref({ current_page: 1, last_page: 1 })
const loading = ref(true)

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

function viewCount(a) { return a?.views || a?.views_count || 0 }

async function loadCategoryData(page = 1) {
  loading.value = true
  const slug = route.params.slug
  try {
    currentCategory.value = categoriesStore.categories.find(c => c.slug === slug) || { slug, name: slug }

    const [articlesRes, popRes] = await Promise.allSettled([
      api.getCategoryArticles(slug, page),
      api.getCategoryPopular(slug)
    ])

    if (articlesRes.status === 'fulfilled') {
      const data = articlesRes.value
      articles.value = data.data || []
      pagination.value = {
        current_page: data.current_page || 1,
        last_page: data.last_page || 1
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
onMounted(() => loadCategoryData(1))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Page Title -->
    <div class="mb-6">
      <h1 class="text-3xl md:text-4xl font-extrabold capitalize text-[var(--text-primary)]">
        {{ getLocalized(currentCategory?.name) || route.params.slug }}
      </h1>
      <p class="text-sm text-[var(--text-muted)] mt-1">
        {{ getLocalized(currentCategory?.name) || route.params.slug }} {{ t('category_news') }}
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <!-- Article List -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Loading skeleton -->
        <template v-if="loading">
          <div v-for="i in 3" :key="i" class="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] h-36 animate-pulse"></div>
        </template>

        <template v-else>
          <div
            v-for="(art, idx) in (articles.length ? articles : Array(3).fill({}))"
            :key="art.id || idx"
            @click="art.slug && router.push(`/article/${art.slug}`)"
            class="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row gap-0 cursor-pointer hover:border-[var(--brand-color)] transition-all group"
          >
            <!-- Thumbnail -->
            <div class="sm:w-48 h-36 shrink-0 flex items-center justify-center overflow-hidden bg-black/5 dark:bg-black/20">
              <img
                v-if="art.image"
                :src="art.image"
                :alt="getLocalized(art.title)"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
            </div>

            <!-- Info -->
            <div class="p-4 flex flex-col justify-center space-y-1.5">
              <div class="text-[11px] font-semibold text-[var(--brand-color)] flex items-center flex-wrap gap-1">
                <span>{{ getLocalized(currentCategory?.name) || route.params.slug }}</span>
                <span class="text-[var(--text-muted)]">•</span>
                <span class="text-[var(--text-muted)]">{{ formatDate(art.published_at) }}</span>
                <span class="text-[var(--text-muted)]">•</span>
                <span class="text-[var(--text-muted)]">{{ viewCount(art) }} {{ t('views') }}</span>
              </div>
              <h2 class="text-sm md:text-base font-black uppercase text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
                {{ getLocalized(art.title) || '[HABARYN ADY ULY HARP BILEN]' }}
              </h2>
              <p class="text-xs text-[var(--text-muted)] line-clamp-2">
                {{ getLocalized(art.excerpt) || getLocalized(art.content) || '[Kicirak tekst: habar nama hakda]' }}
              </p>
            </div>
          </div>
        </template>

        <!-- Pagination -->
        <div class="flex items-center gap-2 pt-4" v-if="pagination.last_page > 1">
          <button
            v-for="p in pagination.last_page"
            :key="p"
            @click="loadCategoryData(p)"
            :class="p === pagination.current_page
              ? 'bg-[var(--brand-color)] text-white font-bold shadow'
              : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--brand-color)] hover:text-[var(--brand-color)]'"
            class="w-9 h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors"
          >{{ p }}</button>
        </div>
      </div>

      <!-- Sidebar: Most Viewed in Category -->
      <div class="rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3 sticky top-24">
        <h3 class="text-sm font-bold text-[var(--text-primary)]">
          {{ getLocalized(currentCategory?.name) || route.params.slug }}: {{ t('category_popular') }}
        </h3>
        <div class="space-y-3">
          <div
            v-for="(item, idx) in (popularArticles.length ? popularArticles : Array(4).fill({}))"
            :key="item.id || idx"
            @click="item.slug && router.push(`/article/${item.slug}`)"
            class="flex items-start gap-2.5 cursor-pointer group"
          >
            <span class="text-[var(--brand-color)] font-black text-sm shrink-0 w-5">{{ idx + 1 }}.</span>
            <span class="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
              {{ getLocalized(item.title) || '[Habar ady]' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
