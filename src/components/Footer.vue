<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCategoriesStore } from '../stores/categories'

const { t, locale } = useI18n()
const categoriesStore = useCategoriesStore()

// ── Contacts & social networks ──
const PHONE_RAW = '+99361908091'
const PHONE_VIEW = '+993 61 90 80 91'
const TIKTOK = 'yslam.shop.china'
const INSTAGRAM = 'yslam_shop_china'

const tiktokUrl = `https://www.tiktok.com/@${TIKTOK}`
const instagramUrl = `https://www.instagram.com/${INSTAGRAM}/`
const year = new Date().getFullYear()

function catName(cat) {
  if (cat.translations && cat.translations[locale.value]) return cat.translations[locale.value]
  return typeof cat.name === 'object' && cat.name ? (cat.name[locale.value] || cat.name.tm) : cat.name
}

const links = computed(() => (categoriesStore.categories || []).slice(0, 7))
</script>

<template>
  <footer class="relative mt-20 text-[var(--footer-text)]">
    <!-- wave -->
    <svg class="block w-full h-10 md:h-14 -mb-px" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
      <path style="fill: var(--footer-bg)" d="M0,38 C220,0 470,62 720,30 C970,0 1210,52 1440,16 L1440,60 L0,60 Z" />
    </svg>

    <div class="relative overflow-hidden bg-[var(--footer-bg)]">
      <!-- decorative glows -->
      <div class="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30" style="background: var(--brand-color)"></div>
      <div class="pointer-events-none absolute -bottom-32 -right-16 w-80 h-80 rounded-full blur-3xl opacity-20" style="background: var(--brand-color)"></div>

      <div class="relative max-w-7xl mx-auto px-4 pt-8 pb-6">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-10">
          <!-- About -->
          <div class="md:col-span-4" v-reveal>
            <div class="flex items-center gap-2.5 mb-3">
              <span class="fx-spin-y fx-btn-primary grid place-items-center w-10 h-10 rounded-xl font-black text-lg">Y</span>
              <h3 class="text-xl font-black">{{ t('footer_about_title') }}</h3>
            </div>
            <p class="text-sm opacity-80 leading-relaxed max-w-sm">{{ t('footer_about_text') }}</p>
          </div>

          <!-- Quick links -->
          <div class="md:col-span-3" v-reveal="100">
            <h4 class="text-base font-bold mb-3 fx-title">{{ t('quick_links') }}</h4>
            <ul class="space-y-1.5 text-sm">
              <li>
                <router-link to="/" class="inline-block opacity-80 hover:opacity-100 hover:translate-x-1.5 hover:text-[var(--brand-color)] transition-all">
                  › {{ t('all_news') }}
                </router-link>
              </li>
              <li v-for="cat in links" :key="cat.id">
                <router-link :to="`/category/${cat.slug}`" class="inline-block opacity-80 hover:opacity-100 hover:translate-x-1.5 hover:text-[var(--brand-color)] transition-all">
                  › {{ catName(cat) }}
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Contacts -->
          <div class="md:col-span-5" v-reveal="200">
            <h4 class="text-base font-bold mb-3 fx-title">{{ t('contact') }}</h4>

            <!-- 3D social / phone cards -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <a :href="`tel:${PHONE_RAW}`" v-tilt="12" v-spot
                 class="group flex flex-col gap-2 rounded-2xl p-3.5 border border-white/10 bg-white/5 backdrop-blur-sm">
                <span class="fx-btn-primary w-10 h-10 rounded-xl grid place-items-center" style="animation: fx-pulse-ring 2.4s infinite">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span class="text-[11px] uppercase tracking-wider opacity-60">{{ t('call_us') }}</span>
                <span class="text-sm font-bold break-all group-hover:text-[var(--brand-color)] transition-colors">{{ PHONE_VIEW }}</span>
              </a>

              <a :href="tiktokUrl" target="_blank" rel="noopener noreferrer" v-tilt="12" v-spot
                 class="group flex flex-col gap-2 rounded-2xl p-3.5 border border-white/10 bg-white/5 backdrop-blur-sm">
                <span class="w-10 h-10 rounded-xl grid place-items-center text-white" style="background: linear-gradient(135deg, #111 0%, #111 55%, #25f4ee 55%, #fe2c55 100%)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                </span>
                <span class="text-[11px] uppercase tracking-wider opacity-60">TikTok</span>
                <span class="text-sm font-bold break-all group-hover:text-[var(--brand-color)] transition-colors">{{ TIKTOK }}</span>
              </a>

              <a :href="instagramUrl" target="_blank" rel="noopener noreferrer" v-tilt="12" v-spot
                 class="group flex flex-col gap-2 rounded-2xl p-3.5 border border-white/10 bg-white/5 backdrop-blur-sm">
                <span class="w-10 h-10 rounded-xl grid place-items-center text-white" style="background: linear-gradient(45deg, #f9ce34, #ee2a7b 50%, #6228d7)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
                  </svg>
                </span>
                <span class="text-[11px] uppercase tracking-wider opacity-60">Instagram</span>
                <span class="text-sm font-bold break-all group-hover:text-[var(--brand-color)] transition-colors">{{ INSTAGRAM }}</span>
              </a>
            </div>

            <ul class="text-sm space-y-2 opacity-90">
              <li class="flex items-center gap-2.5">
                <svg class="shrink-0 text-[var(--brand-color)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <span><span class="font-medium">{{ t('email') }}:</span> info@yslam.tm</span>
              </li>
              <li class="flex items-center gap-2.5">
                <svg class="shrink-0 text-[var(--brand-color)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span><span class="font-medium">{{ t('address') }}:</span> Aşgabat ş., Türkmenistan</span>
              </li>
              <li>
                  <router-link to="/about" class="fx-gradient-text text-xl md:text-2xl font-black tracking-tight">{{ t('about_title') }}</router-link>
                </li>
            </ul>
          </div>
        </div>

        <!-- bottom line -->
        <div class="mt-10 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-70">
          <span>© {{ year }} {{ t('footer_about_title') }}. {{ t('rights') }}</span>
          <span class="font-semibold">TikTok @{{ TIKTOK }} · Instagram @{{ INSTAGRAM }}</span>
        </div>
      </div>
    </div>
  </footer>
</template>
