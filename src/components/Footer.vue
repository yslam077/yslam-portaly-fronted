<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="w-full bg-[var(--footer-bg)] text-[var(--footer-text)] py-8 mt-12 transition-colors">
    <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <!-- Left: About Portal -->
      <div>
        <h3 class="text-lg font-bold mb-2">{{ t('footer_about_title') }}</h3>
        <p class="text-sm opacity-80 leading-relaxed max-w-md">
          {{ t('footer_about_text') }}
        </p>
      </div>

      <!-- Right: Contacts -->
      <div class="md:text-left">
        <h4 class="text-base font-bold mb-2">{{ t('contact') }}</h4>
        <ul class="text-sm space-y-1 opacity-90">
          <li><span class="font-medium">{{ t('phone') }}:</span> +993 (12) 00-00-00</li>
          <li><span class="font-medium">{{ t('email') }}:</span> info@yslam.tm</li>
          <li><span class="font-medium">{{ t('address') }}:</span> Aşgabat ş., Türkmenistan</li>
        </ul>
      </div>
    </div>
  </footer>
</template>
