<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div v-parallax="26" class="relative max-w-xl mx-auto px-4 py-24 text-center space-y-6 overflow-hidden">
    <!-- floating shapes (react to the mouse) -->
    <div class="fx-parallax-layer pointer-events-none" style="inset: 0">
      <span class="absolute top-6 left-10 w-16 h-16 rounded-2xl rotate-12 opacity-30" style="background: var(--brand-color); animation: fx-float 6s ease-in-out infinite"></span>
      <span class="absolute bottom-10 right-12 w-12 h-12 rounded-full opacity-30" style="background: var(--brand-color); animation: fx-float 5s ease-in-out infinite reverse"></span>
      <span class="absolute top-1/2 right-4 w-8 h-8 rounded-lg -rotate-12 opacity-25" style="background: var(--brand-color); animation: fx-float 7s ease-in-out infinite"></span>
    </div>

    <h1 class="relative fx-gradient-text text-8xl md:text-9xl font-black tracking-tighter" style="animation: fx-shift 6s linear infinite, fx-float 5s ease-in-out infinite">404</h1>
    <p class="relative text-base text-[var(--text-muted)]">{{ t('not_found') }}</p>
    <router-link to="/" v-magnetic="0.25" class="relative fx-btn fx-btn-primary inline-block px-6 py-3 rounded-xl text-sm font-bold">
      {{ t('back_home') }}
    </router-link>
  </div>
</template>
