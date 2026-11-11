<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import { useCategoriesStore } from '../stores/categories'

const { t, locale } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const banners = ref([])
const activeBannerIndex = ref(0)
let bannerTimer = null

const featuredArticle = ref(null)
const latestArticles = ref([])
const popularArticles = ref([])
const loading = ref(true)

// Normalize image URL — API returns full URL already via asset()
function imgSrc(article) {
  return article?.image || null
}

function getLocalized(field) {
  if (!field) return ''
  if (typeof field === 'object') {
    return field[locale.value] || field['tm'] || field['ru'] || Object.values(field)[0] || ''
  }
  return field
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ru-RU')
}

function viewCount(article) {
  return article?.views || article?.views_count || 0
}

async function loadData() {
  loading.value = true
  try {
    const [bannersRes, featRes, latestRes, popRes] = await Promise.allSettled([
      api.getBanners(),
      api.getFeaturedArticles(),
      api.getArticles({ per_page: 4, limit: 4 }),
      api.getPopularArticles()
    ])

    if (bannersRes.status === 'fulfilled') {
      const bData = bannersRes.value?.data || bannersRes.value || []
      banners.value = Array.isArray(bData) ? bData : []
    }

    if (featRes.status === 'fulfilled') {
      const f = featRes.value?.data || featRes.value
      featuredArticle.value = Array.isArray(f) ? f[0] : f
    }

    if (latestRes.status === 'fulfilled') {
      const l = latestRes.value?.data || latestRes.value || []
      latestArticles.value = Array.isArray(l) ? l.slice(0, 4) : []
    }

    if (popRes.status === 'fulfilled') {
      const p = popRes.value?.data || popRes.value || []
      popularArticles.value = Array.isArray(p) ? p.slice(0, 3) : []
    }
  } catch (err) {
    console.error('Error loading home data:', err)
  } finally {
    loading.value = false
  }
}

function startBannerRotation() {
  bannerTimer = setInterval(() => {
    if (banners.value.length > 1) {
      activeBannerIndex.value = (activeBannerIndex.value + 1) % banners.value.length
    }
  }, 5000)
}

function goToArticle(article) {
  if (article?.slug) router.push(`/article/${article.slug}`)
}

function handleBannerClick(banner) {
  if (banner?.link) {
    if (banner.link.startsWith('http://') || banner.link.startsWith('https://')) {
      window.open(banner.link, '_blank')
    } else {
      router.push(banner.link)
    }
  }
}

onMounted(() => {
  loadData()
  startBannerRotation()
})

onUnmounted(() => {
  if (bannerTimer) clearInterval(bannerTimer)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6 space-y-10">

    <!-- ═══════════════════════════════════════
         1. BANNER CAROUSEL
    ═══════════════════════════════════════ -->
    <div
      @click="handleBannerClick(banners[activeBannerIndex])"
      class="relative w-full rounded-2xl min-h-[200px] md:h-[260px] overflow-hidden flex flex-col justify-between p-6 md:p-10 text-white transition-all duration-700 select-none"
      :class="banners[activeBannerIndex]?.link ? 'cursor-pointer' : ''"
      :style="banners[activeBannerIndex]?.image
        ? `background-image: linear-gradient(to right, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.3)), url('${banners[activeBannerIndex].image}'); background-size: cover; background-position: center;`
        : 'background-color: var(--brand-color)'"
    >
      <div class="text-xs md:text-sm font-medium opacity-80">
        {{ t('banner_timer', { current: activeBannerIndex + 1, total: Math.max(banners.length, 1) }) }}
      </div>

      <div>
        <h2 class="text-xl md:text-3xl font-extrabold uppercase tracking-wide drop-shadow">
          {{ banners.length
              ? getLocalized(banners[activeBannerIndex]?.title) || t('banner_text')
              : t('banner_text') }}
        </h2>
        <p v-if="banners[activeBannerIndex]?.description" class="mt-2 text-sm opacity-85 max-w-lg line-clamp-2">
          {{ getLocalized(banners[activeBannerIndex]?.description) }}
        </p>
      </div>

      <!-- Dot indicators -->
      <div class="flex items-center space-x-2" @click.stop>
        <button
          v-for="(_, idx) in Math.max(banners.length, 3)"
          :key="idx"
          @click="activeBannerIndex = idx"
          :class="idx === activeBannerIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'"
          class="h-2 rounded-full transition-all duration-300"
        ></button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════
         2. ESASY HABAR — Featured Article
    ═══════════════════════════════════════ -->
    <section>
      <h3 class="text-xl font-bold mb-4 text-[var(--text-primary)]">{{ t('main_news') }}</h3>

      <div
        v-if="featuredArticle"
        @click="goToArticle(featuredArticle)"
        class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 cursor-pointer group"
      >
        <!-- Left: big image -->
        <div class="aspect-video rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
          <img
            v-if="imgSrc(featuredArticle)"
            :src="imgSrc(featuredArticle)"
            :alt="getLocalized(featuredArticle.title)"
            class="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
          <span v-else class="text-[var(--text-muted)] text-sm">{{ t('main_image') }}</span>
        </div>

        <!-- Right: meta + title + excerpt -->
        <div class="flex flex-col justify-center space-y-3">
          <div class="flex items-center flex-wrap gap-2 text-xs font-semibold text-[var(--brand-color)]">
            <span>{{ getLocalized(featuredArticle.category?.name) || 'Syyasat' }}</span>
            <span class="text-[var(--text-muted)]">•</span>
            <span class="text-[var(--text-muted)]">{{ formatDate(featuredArticle.published_at) }}</span>
            <span class="text-[var(--text-muted)]">•</span>
            <span class="text-[var(--text-muted)]">{{ viewCount(featuredArticle) }} {{ t('views') }}</span>
          </div>

          <h1 class="text-2xl md:text-3xl font-black uppercase leading-tight text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors">
            {{ getLocalized(featuredArticle.title) || '[ESASY HABARYN ADY]' }}
          </h1>

          <p class="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">
            {{ getLocalized(featuredArticle.excerpt) || getLocalized(featuredArticle.content) || '[Habaryn gysga teksti, 2-3 sada]' }}
          </p>
        </div>
      </div>

      <!-- Placeholder when no article -->
      <div v-else-if="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <div class="aspect-video rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
          <span class="text-[var(--text-muted)] text-sm">{{ t('main_image') }}</span>
        </div>
        <div class="flex flex-col justify-center space-y-3">
          <div class="text-xs font-semibold text-[var(--brand-color)]">Syyasat • 08.11.2026 • 5 410 {{ t('views') }}</div>
          <h1 class="text-2xl font-black uppercase text-[var(--text-primary)]">[ESASY HABARYN ADY ULY HARP BILEN]</h1>
          <p class="text-sm text-[var(--text-muted)]">[Habaryn gysga teksti, 2-3 sada]</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         3. SONKY HABARLAR — Latest 4 cards
    ═══════════════════════════════════════ -->
    <section>
      <h3 class="text-xl font-bold mb-4 text-[var(--text-primary)]">{{ t('latest_news') }}</h3>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(art, idx) in (latestArticles.length ? latestArticles : Array(4).fill({}))"
          :key="art.id || idx"
          @click="goToArticle(art)"
          class="cursor-pointer group flex flex-col rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--brand-color)] transition-all"
        >
          <!-- Image -->
          <div class="aspect-[16/10] overflow-hidden relative flex items-center justify-center bg-[var(--bg-card)]">
            <img
              v-if="art.image"
              :src="art.image"
              :alt="getLocalized(art.title)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
          </div>
          <!-- Meta + title -->
          <div class="p-3 flex flex-col gap-1 flex-1">
            <div class="text-[10px] font-semibold text-[var(--brand-color)] flex gap-1 flex-wrap">
              <span>{{ getLocalized(art.category?.name) || 'Sport' }}</span>
              <span class="text-[var(--text-muted)]">•</span>
              <span class="text-[var(--text-muted)]">{{ formatDate(art.published_at) }}</span>
              <span class="text-[var(--text-muted)]">•</span>
              <span class="text-[var(--text-muted)]">{{ viewCount(art) }}</span>
            </div>
            <h4 class="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
              {{ getLocalized(art.title) || '[Habar ady]' }}
            </h4>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         4. KOP GORULEN — Popular 3 cards
    ═══════════════════════════════════════ -->
    <section>
      <h3 class="text-xl font-bold mb-4 text-[var(--text-primary)]">{{ t('popular_news') }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="(art, idx) in (popularArticles.length ? popularArticles : Array(3).fill({}))"
          :key="art.id || idx"
          @click="goToArticle(art)"
          class="cursor-pointer group flex flex-col rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--brand-color)] transition-all"
        >
          <div class="aspect-[16/9] overflow-hidden flex items-center justify-center bg-[var(--bg-card)]">
            <img
              v-if="art.image"
              :src="art.image"
              :alt="getLocalized(art.title)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
          </div>
          <div class="p-3 flex flex-col gap-1">
            <div class="text-[10px] font-semibold text-[var(--brand-color)] flex gap-1 flex-wrap">
              <span>{{ getLocalized(art.category?.name) || 'Biznes' }}</span>
              <span class="text-[var(--text-muted)]">•</span>
              <span class="text-[var(--text-muted)]">{{ formatDate(art.published_at) }}</span>
              <span class="text-[var(--text-muted)]">•</span>
              <span class="text-[var(--text-muted)]">{{ viewCount(art) }}</span>
            </div>
            <h4 class="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
              {{ getLocalized(art.title) || '[Habar ady]' }}
            </h4>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════
         5. KATEGORIYALAR — Category pills
    ═══════════════════════════════════════ -->
    <section class="pt-4 border-t border-[var(--border-color)]">
      <h3 class="text-xl font-bold mb-4 text-[var(--text-primary)]">{{ t('categories') }}</h3>
      <div class="flex flex-wrap gap-2.5">
        <router-link
          v-for="cat in categoriesStore.categories"
          :key="cat.id"
          :to="`/category/${cat.slug}`"
          class="rounded-full border border-[var(--border-color)] px-5 py-2 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--brand-color)] hover:text-[var(--brand-color)] transition-colors"
        >
          {{ typeof cat.name === 'object' ? (cat.name[$i18n?.locale] || cat.name['tm'] || Object.values(cat.name)[0]) : cat.name }}
        </router-link>
      </div>
    </section>
  </div>
</template>
