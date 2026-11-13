<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategoriesStore } from '../stores/categories'

const { t } = useI18n()
const categoriesStore = useCategoriesStore()

const PHONE_RAW = '+99361908091'
const PHONE_VIEW = '+993 61 90 80 91'
const TIKTOK = 'yslam.shop.china'
const INSTAGRAM = 'yslam_shop_china'

const catCount = computed(() => categoriesStore.categories.length || 7)

const features = [
  { t: 'about_f1_t', d: 'about_f1_d', icon: 'M3 5h12M9 3v2m1.05 6.1A11.1 11.1 0 016 15m-1-4a11.1 11.1 0 004 4m4 5l4-10 4 10m-1.4-3h-5.2' },
  { t: 'about_f2_t', d: 'about_f2_d', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { t: 'about_f3_t', d: 'about_f3_d', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
]
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8 space-y-14">

    <!-- ═══ HERO ═══ -->
    <section
      v-parallax="20"
      class="relative overflow-hidden rounded-3xl text-white p-8 md:p-14 shadow-2xl shadow-black/25 fx-hero-fallback"
    >
      <div class="fx-parallax-layer pointer-events-none" style="inset: 0">
        <span class="absolute -top-10 -right-6 w-56 h-56 rounded-full bg-white/10 blur-xl"></span>
        <span class="absolute bottom-0 left-1/3 w-40 h-40 rounded-3xl rotate-12 bg-white/10" style="animation: fx-float 7s ease-in-out infinite"></span>
        <span class="absolute top-10 left-10 w-10 h-10 rounded-xl -rotate-12 bg-white/15" style="animation: fx-float 5s ease-in-out infinite reverse"></span>
      </div>
      <div class="relative max-w-2xl space-y-4">
        <span class="fx-spin-y inline-grid place-items-center w-14 h-14 rounded-2xl bg-white text-[var(--brand-color)] text-3xl font-black">Y</span>
        <h1 class="fx-rise text-4xl md:text-6xl font-black tracking-tight">{{ t('about_title') }}</h1>
        <p class="fx-rise-2 text-lg md:text-xl opacity-90">{{ t('about_tagline') }}</p>
        <div class="flex flex-wrap gap-3 pt-3">
          <router-link to="/" v-magnetic="0.25" class="fx-btn rounded-xl bg-white px-6 py-3 text-sm font-bold text-[var(--brand-color)]">{{ t('about_go_news') }}</router-link>
          <a :href="`tel:${PHONE_RAW}`" v-magnetic="0.25" class="fx-btn rounded-xl border border-white/40 bg-white/10 backdrop-blur px-6 py-3 text-sm font-bold">{{ PHONE_VIEW }}</a>
        </div>
      </div>
    </section>

    <!-- ═══ WHO WE ARE + numbers ═══ -->
    <section class="grid md:grid-cols-5 gap-8 items-center">
      <div class="md:col-span-3 space-y-3" v-reveal>
        <h2 class="fx-title text-2xl md:text-3xl text-[var(--text-primary)]">{{ t('about_who_title') }}</h2>
        <p class="text-[var(--text-muted)] leading-relaxed text-base md:text-lg">{{ t('about_who_text') }}</p>
      </div>
      <div class="md:col-span-2 grid grid-cols-3 gap-3" v-reveal="120">
        <div v-tilt="10" class="rounded-2xl p-4 text-center bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div class="fx-gradient-text text-4xl font-black">3</div>
          <div class="text-[11px] font-semibold text-[var(--text-muted)] mt-1">{{ t('about_langs') }}</div>
        </div>
        <div v-tilt="10" class="rounded-2xl p-4 text-center bg-[var(--bg-card)] border border-[var(--border-color)]">
          <div class="fx-gradient-text text-4xl font-black">{{ catCount }}</div>
          <div class="text-[11px] font-semibold text-[var(--text-muted)] mt-1">{{ t('about_cats') }}</div>
        </div>
        <div v-tilt="10" class="rounded-2xl p-4 text-center bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col items-center justify-center">
          <svg class="text-[var(--brand-color)]" width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 3v18" /><path d="M12 3a9 9 0 010 18" fill="currentColor" /></svg>
          <div class="text-[11px] font-semibold text-[var(--text-muted)] mt-1 leading-tight">{{ t('about_theme') }}</div>
        </div>
      </div>
    </section>

    <!-- ═══ FEATURES ═══ -->
    <section class="grid sm:grid-cols-3 gap-5">
      <div v-for="(f, i) in features" :key="f.t" v-reveal="i * 100">
        <div v-tilt="9" v-spot class="h-full rounded-2xl p-6 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
          <span class="fx-btn-primary grid place-items-center w-12 h-12 rounded-xl">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="f.icon" /></svg>
          </span>
          <h3 class="text-lg font-black text-[var(--text-primary)]">{{ t(f.t) }}</h3>
          <p class="text-sm text-[var(--text-muted)] leading-relaxed">{{ t(f.d) }}</p>
        </div>
      </div>
    </section>

    <!-- ═══ PROJECTS (banners) ═══ -->
    <section class="space-y-5">
      <h2 v-reveal class="fx-title text-2xl md:text-3xl text-[var(--text-primary)]">{{ t('about_projects') }}</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div v-reveal>
          <router-link to="/" v-tilt="6" class="block rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-xl shadow-black/15">
            <img src="/images/yslam-portal-banner.png" alt="Yslam Portaly" class="w-full h-auto block" onerror="this.parentElement.style.display='none'" />
          </router-link>
        </div>
        <div v-reveal="120" class="space-y-4">
          <a :href="`https://www.tiktok.com/@${TIKTOK}`" target="_blank" rel="noopener noreferrer" v-tilt="6" class="block rounded-3xl overflow-hidden border border-[var(--border-color)] shadow-xl shadow-black/15">
            <img src="/images/yslam-shop-china-banner.png" alt="Yslam Shop China" class="w-full h-auto block" onerror="this.parentElement.style.display='none'" />
          </a>
          <div class="rounded-2xl p-4 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
            <h3 class="text-base font-black text-[var(--text-primary)]">{{ t('about_shop_title') }}</h3>
            <p class="text-sm text-[var(--text-muted)]">{{ t('about_shop_text') }}</p>
            <div class="flex flex-wrap gap-2">
              <a :href="`https://www.tiktok.com/@${TIKTOK}`" target="_blank" rel="noopener noreferrer" class="fx-chip rounded-full border border-[var(--border-color)] px-4 py-1.5 text-xs font-bold text-[var(--text-primary)]">TikTok</a>
              <a :href="`https://www.instagram.com/${INSTAGRAM}/`" target="_blank" rel="noopener noreferrer" class="fx-chip rounded-full border border-[var(--border-color)] px-4 py-1.5 text-xs font-bold text-[var(--text-primary)]">Instagram</a>
              <a :href="`tel:${PHONE_RAW}`" class="fx-chip rounded-full border border-[var(--border-color)] px-4 py-1.5 text-xs font-bold text-[var(--text-primary)]">{{ PHONE_VIEW }}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
