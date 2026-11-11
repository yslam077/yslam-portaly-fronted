<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  await authStore.fetchUser()
})

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-12">
    <div class="rounded-2xl p-6 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-4">
      <h2 class="text-xl font-bold text-[var(--text-primary)]">Şahsy otag (Profil)</h2>

      <div class="text-sm space-y-2 text-[var(--text-primary)]">
        <div><span class="font-semibold text-[var(--text-muted)]">Ady:</span> {{ authStore.user?.name }}</div>
        <div><span class="font-semibold text-[var(--text-muted)]">Telefon:</span> {{ authStore.user?.phone }}</div>
        <div><span class="font-semibold text-[var(--text-muted)]">Rol:</span> {{ authStore.user?.role }}</div>
      </div>

      <button
        @click="logout"
        class="w-full py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700"
      >
        Çykmak (Logout)
      </button>
    </div>
  </div>
</template>
