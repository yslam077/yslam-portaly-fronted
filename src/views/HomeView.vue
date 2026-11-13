<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import { useCategoriesStore } from '../stores/categories'

const { t, locale } = useI18n()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const banners = ref([])
const activeBannerIndex = ref(0)

const featuredArticle = ref(null)
const latestArticles = ref([])
const popularArticles = ref([])
const loading = ref(true)

const counter = computed(() => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(activeBannerIndex.value + 1)} / ${pad(Math.max(banners.value.length, 1))}`
})

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

function catName(cat) {
  if (!cat) return ''
  if (cat.translations && cat.translations[locale.value]) return cat.translations[locale.value]
  return getLocalized(cat.name)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU')
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
      if (activeBannerIndex.value >= banners.value.length) activeBannerIndex.value = 0
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

// The progress bar animation drives the rotation (it pauses on hover).
function nextBanner() {
  if (banners.value.length > 1) {
    activeBannerIndex.value = (activeBannerIndex.value + 1) % banners.value.length
  }
}
function prevBanner() {
  if (banners.value.length > 1) {
    activeBannerIndex.value = (activeBannerIndex.value - 1 + banners.value.length) % banners.value.length
  }
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

// language is sent with every request (X-Locale) -> reload content when it changes
watch(locale, loadData)
onMounted(loadData)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-6 space-y-12">

    <!-- ═══ 1. BANNER ═══ -->
    <div
      v-parallax="18"
      v-tilt="2.5"
      @click="handleBannerClick(banners[activeBannerIndex])"
      class="fx-banner group relative w-full rounded-3xl min-h-[230px] md:h-[320px] overflow-hidden text-white select-none shadow-2xl shadow-black/25 flex flex-col justify-between p-6 md:p-10"
      :class="banners[activeBannerIndex]?.link ? 'cursor-pointer' : ''"
    >
      <!-- layers -->
      <div class="absolute inset-0 fx-hero-fallback"></div>
      <div
        v-for="(b, i) in banners"
        :key="b.id || i"
        class="fx-banner-slide"
        :class="{ 'is-active': i === activeBannerIndex }"
      >
        <div class="fx-parallax-layer">
          <div class="fx-banner-img" :style="b.image ? { backgroundImage: `url('${b.image}')` } : {}"></div>
        </div>
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent transition-opacity duration-700" :class="banners.length && !getLocalized(banners[activeBannerIndex]?.title) ? 'opacity-0' : 'opacity-100'"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      <!-- top: counter -->
      <div class="relative z-10 flex items-center justify-between">
        <span class="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 text-[11px] font-bold tracking-widest">
          {{ counter }}
        </span>
      </div>

      <!-- text -->
      <div :key="activeBannerIndex" class="relative z-10">
        <h2
          v-if="!banners.length || getLocalized(banners[activeBannerIndex]?.title)"
          class="fx-rise text-2xl md:text-4xl font-black uppercase tracking-wide drop-shadow-lg max-w-2xl leading-tight"
        >
          {{ banners.length ? getLocalized(banners[activeBannerIndex]?.title) : t('banner_text') }}
        </h2>
        <p v-if="banners[activeBannerIndex]?.description" class="fx-rise-2 mt-2 text-sm md:text-base opacity-90 max-w-lg line-clamp-2">
          {{ getLocalized(banners[activeBannerIndex]?.description) }}
        </p>
      </div>

      <!-- dots -->
      <div v-if="banners.length > 1" class="relative z-10 flex items-center gap-2" @click.stop>
        <button
          v-for="(_, idx) in banners"
          :key="idx"
          @click="activeBannerIndex = idx"
          :class="idx === activeBannerIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'"
          class="h-2 rounded-full transition-all duration-300"
        ></button>
      </div>

      <!-- arrows -->
      <template v-if="banners.length > 1">
        <button
          @click.stop="prevBanner"
          v-magnetic="0.3"
          class="absolute z-20 left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 grid place-items-center opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-opacity"
          aria-label="prev"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <button
          @click.stop="nextBanner"
          v-magnetic="0.3"
          class="absolute z-20 right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/25 grid place-items-center opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-opacity"
          aria-label="next"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </button>

        <!-- 5s timer bar: its animationend switches the slide -->
        <div class="absolute z-20 bottom-0 left-0 right-0 h-1 bg-white/15">
          <span :key="activeBannerIndex" class="fx-timer bg-white/90" @animationend="nextBanner"></span>
        </div>
      </template>
    </div>

    <!-- ═══ 2. MAIN NEWS ═══ -->
    <section>
      <h3 v-reveal class="fx-title text-xl md:text-2xl mb-5 text-[var(--text-primary)]">{{ t('main_news') }}</h3>

      <div v-if="featuredArticle" v-reveal class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 cursor-pointer group" @click="goToArticle(featuredArticle)">
        <div
          v-tilt="6"
          class="aspect-video rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shadow-xl shadow-black/10"
        >
          <img
            v-if="imgSrc(featuredArticle)"
            :src="imgSrc(featuredArticle)"
            :alt="getLocalized(featuredArticle.title)"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <span v-else class="text-[var(--text-muted)] text-sm">{{ t('main_image') }}</span>
        </div>

        <div class="flex flex-col justify-center space-y-4">
          <div class="flex items-center flex-wrap gap-2 text-xs font-semibold">
            <span class="fx-btn-primary rounded-full px-3 py-1">{{ catName(featuredArticle.category) || 'Syyasat' }}</span>
            <span class="text-[var(--text-muted)]">{{ formatDate(featuredArticle.published_at) }}</span>
            <span class="text-[var(--text-muted)]">•</span>
            <span class="text-[var(--text-muted)]">{{ viewCount(featuredArticle) }} {{ t('views') }}</span>
          </div>

          <h1 class="text-2xl md:text-4xl font-black uppercase leading-tight text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors">
            {{ getLocalized(featuredArticle.title) || '[ESASY HABARYN ADY]' }}
          </h1>

          <p class="text-sm md:text-base text-[var(--text-muted)] leading-relaxed line-clamp-3">
            {{ getLocalized(featuredArticle.excerpt) || getLocalized(featuredArticle.content) || '[Habaryn gysga teksti, 2-3 sada]' }}
          </p>

          <span class="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--brand-color)]">
            {{ t('read_more') }}
            <svg class="group-hover:translate-x-2 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </span>
        </div>
      </div>

      <div v-else-if="!loading" class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <div class="aspect-video rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
          <span class="text-[var(--text-muted)] text-sm">{{ t('main_image') }}</span>
        </div>
        <div class="flex flex-col justify-center space-y-3">
          <div class="text-xs font-semibold text-[var(--brand-color)]">Syyasat • 08.11.2026 • 5 410 {{ t('views') }}</div>
          <h1 class="text-2xl font-black uppercase text-[var(--text-primary)]">[ESASY HABARYN ADY ULY HARP BILEN]</h1>
          <p class="text-sm text-[var(--text-muted)]">[Habaryn gysga teksti, 2-3 sada]</p>
        </div>
      </div>

      <div v-else class="aspect-video md:aspect-[21/7] rounded-3xl bg-[var(--bg-card)] fx-shimmer"></div>
    </section>

    <!-- ═══ 3. LATEST ═══ -->
    <section>
      <h3 v-reveal class="fx-title text-xl md:text-2xl mb-5 text-[var(--text-primary)]">{{ t('latest_news') }}</h3>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div
          v-for="(art, idx) in (latestArticles.length ? latestArticles : Array(4).fill({}))"
          :key="art.id || idx"
          v-reveal="idx * 90"
        >
          <div
            v-tilt="9"
            v-spot
            @click="goToArticle(art)"
            class="h-full cursor-pointer group flex flex-col rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)]"
          >
            <div class="aspect-[16/10] overflow-hidden relative flex items-center justify-center bg-[var(--bg-card)]" :class="loading && !art.image ? 'fx-shimmer' : ''">
              <img
                v-if="art.image"
                :src="art.image"
                :alt="getLocalized(art.title)"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
              <span v-if="art.image" class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </div>
            <div class="p-3.5 flex flex-col gap-1.5 flex-1">
              <div class="text-[10px] font-semibold text-[var(--brand-color)] flex gap-1 flex-wrap">
                <span>{{ catName(art.category) || 'Sport' }}</span>
                <span class="text-[var(--text-muted)]">•</span>
                <span class="text-[var(--text-muted)]">{{ formatDate(art.published_at) }}</span>
                <span class="text-[var(--text-muted)]">•</span>
                <span class="text-[var(--text-muted)]">{{ viewCount(art) }}</span>
              </div>
              <h4 class="text-xs md:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
                {{ getLocalized(art.title) || '[Habar ady]' }}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 4. POPULAR ═══ -->
    <section>
      <h3 v-reveal class="fx-title text-xl md:text-2xl mb-5 text-[var(--text-primary)]">{{ t('popular_news') }}</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        <div
          v-for="(art, idx) in (popularArticles.length ? popularArticles : Array(3).fill({}))"
          :key="art.id || idx"
          v-reveal="idx * 110"
        >
          <div
            v-tilt="9"
            v-spot
            @click="goToArticle(art)"
            class="h-full cursor-pointer group flex flex-col rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)]"
          >
            <div class="aspect-[16/9] overflow-hidden relative flex items-center justify-center bg-[var(--bg-card)]" :class="loading && !art.image ? 'fx-shimmer' : ''">
              <img
                v-if="art.image"
                :src="art.image"
                :alt="getLocalized(art.title)"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
              <span class="absolute top-2.5 left-2.5 fx-btn-primary w-8 h-8 rounded-lg grid place-items-center text-sm font-black">{{ idx + 1 }}</span>
            </div>
            <div class="p-3.5 flex flex-col gap-1.5">
              <div class="text-[10px] font-semibold text-[var(--brand-color)] flex gap-1 flex-wrap">
                <span>{{ catName(art.category) || 'Biznes' }}</span>
                <span class="text-[var(--text-muted)]">•</span>
                <span class="text-[var(--text-muted)]">{{ formatDate(art.published_at) }}</span>
                <span class="text-[var(--text-muted)]">•</span>
                <span class="text-[var(--text-muted)]">{{ viewCount(art) }}</span>
              </div>
              <h4 class="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
                {{ getLocalized(art.title) || '[Habar ady]' }}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 5. CATEGORIES ═══ -->
    <section class="pt-6 border-t border-[var(--border-color)]">
      <h3 v-reveal class="fx-title text-xl md:text-2xl mb-5 text-[var(--text-primary)]">{{ t('categories') }}</h3>
      <div class="flex flex-wrap gap-3">
        <div v-for="(cat, idx) in categoriesStore.categories" :key="cat.id" v-reveal="idx * 60">
          <router-link
            :to="`/category/${cat.slug}`"
            class="fx-chip inline-block rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--brand-color)]"
          >
            {{ catName(cat) }}
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>
