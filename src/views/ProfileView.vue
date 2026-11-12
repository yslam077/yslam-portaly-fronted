<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const initial = computed(() => (authStore.user?.name || '?').trim().charAt(0).toUpperCase())

onMounted(async () => {
  await authStore.fetchUser()
})

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-14">
    <div v-tilt="5" v-spot class="rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl shadow-black/15 fx-rise">
      <!-- cover -->
      <div class="fx-hero-fallback h-28"></div>

      <div class="px-6 pb-6 -mt-12 space-y-5">
        <span class="fx-btn-primary grid place-items-center w-24 h-24 rounded-3xl text-4xl font-black border-4 border-[var(--bg-card)] shadow-xl" style="animation: fx-float 5s ease-in-out infinite">
          {{ initial }}
        </span>

        <div>
          <h2 class="text-2xl font-black text-[var(--text-primary)]">{{ authStore.user?.name || t('profile_title') }}</h2>
          <span v-if="authStore.user?.role" class="inline-block mt-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider fx-btn-primary">
            {{ authStore.user.role }}
          </span>
        </div>

        <div class="text-sm space-y-2.5 text-[var(--text-primary)]">
          <div class="flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-2.5">
            <span class="font-semibold text-[var(--text-muted)]">{{ t('name_field') }}</span>
            <span class="font-bold">{{ authStore.user?.name }}</span>
          </div>
          <div class="flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-2.5">
            <span class="font-semibold text-[var(--text-muted)]">{{ t('phone') }}</span>
            <span class="font-bold">{{ authStore.user?.phone || '—' }}</span>
          </div>
          <div class="flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-2.5">
            <span class="font-semibold text-[var(--text-muted)]">{{ t('role_field') }}</span>
            <span class="font-bold">{{ authStore.user?.role }}</span>
          </div>
        </div>

        <button
          @click="logout"
          class="fx-btn w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-600/30"
        >
          {{ t('logout') }}
        </button>
      </div>
    </div>
  </div>
</template>
