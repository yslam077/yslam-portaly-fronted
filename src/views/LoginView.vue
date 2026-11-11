<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1) // 1 = Name input, 2 = OTP input
const name = ref('')
const phone = ref('')
const otpCode = ref('')
const generatedOtp = ref('') // Displayed OTP on screen for testing
const error = ref('')
const successMessage = ref('')

async function handleRequestOtp() {
  error.value = ''
  successMessage.value = ''

  if (!name.value.trim()) {
    error.value = 'Adyňyzy ýazyň'
    return
  }

  try {
    const res = await authStore.sendOtp(name.value.trim(), phone.value.trim())
    generatedOtp.value = res.code || ''
    successMessage.value = 'Tassyklama kody ugradyldy!'
    otpCode.value = res.code || '' // Auto-fill for convenience on test site
    step.value = 2
  } catch (err) {
    error.value = err.data?.message || err.message || 'Ýalňyşlyk ýüze çykdy'
  }
}

async function handleVerifyOtp() {
  error.value = ''

  if (!otpCode.value.trim()) {
    error.value = 'Tassyklama koduny ýazyň'
    return
  }

  try {
    await authStore.verifyOtp(name.value.trim(), otpCode.value.trim(), phone.value.trim())
    router.push('/')
  } catch (err) {
    error.value = err.data?.message || err.message || 'Ýalňyşlyk ýüze çykdy'
  }
}
</script>

<template>
  <div class="max-w-md mx-auto px-4 py-16">
    <div class="rounded-2xl p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm space-y-6">
      
      <!-- Header -->
      <div class="text-center space-y-1">
        <h2 class="text-2xl font-black text-[var(--text-primary)]">
          Ulgama girmek
        </h2>
        <p class="text-xs text-[var(--text-muted)]">
          Parolsyz we emailsiz — diňe adyňyz we SMS/OTP kody arkaly
        </p>
      </div>

      <!-- Errors -->
      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
        {{ error }}
      </div>

      <!-- Success Notice -->
      <div v-if="successMessage" class="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
        {{ successMessage }}
      </div>

      <!-- Test Environment OTP Badge -->
      <div v-if="generatedOtp" class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-center space-y-1">
        <div class="text-[11px] font-bold uppercase tracking-wider">Test Reжimi: Siziň OTP kodyňyz</div>
        <div class="text-3xl font-black tracking-widest text-[var(--brand-color)]">{{ generatedOtp }}</div>
        <div class="text-[10px] text-[var(--text-muted)]">Test sahypasy bolany üçin kod ekranda görkezilýär</div>
      </div>

      <!-- STEP 1: Enter Name -->
      <form v-if="step === 1" @submit.prevent="handleRequestOtp" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
            Adyňyz <span class="text-red-500">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="Mysal: Merdan"
            class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] transition-all"
            autofocus
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
            Telefon belgisi <span class="text-[var(--text-muted)] font-normal">(hökman däl)</span>
          </label>
          <input
            v-model="phone"
            type="text"
            placeholder="+99365000000"
            class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-3 rounded-xl font-bold text-white transition-opacity bg-[var(--brand-color)] hover:opacity-90 text-sm shadow-sm disabled:opacity-50"
        >
          {{ authStore.loading ? 'Garaşyň...' : 'Kody almak (OTP)' }}
        </button>
      </form>

      <!-- STEP 2: Enter OTP -->
      <form v-else @submit.prevent="handleVerifyOtp" class="space-y-4">
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold text-[var(--text-primary)]">
              Tassyklama kody (OTP) <span class="text-red-500">*</span>
            </label>
            <button
              type="button"
              @click="step = 1; generatedOtp = ''"
              class="text-[11px] text-[var(--brand-color)] hover:underline"
            >
              Ady üýtgetmek
            </button>
          </div>
          <input
            v-model="otpCode"
            type="text"
            required
            maxlength="6"
            placeholder="Kod ýazyň"
            class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-center text-xl font-bold tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] transition-all"
            autofocus
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full py-3 rounded-xl font-bold text-white transition-opacity bg-[var(--brand-color)] hover:opacity-90 text-sm shadow-sm disabled:opacity-50"
        >
          {{ authStore.loading ? 'Garaşyň...' : 'Tassyklamak we girmek' }}
        </button>

        <div class="text-center">
          <button
            type="button"
            @click="handleRequestOtp"
            :disabled="authStore.loading"
            class="text-xs text-[var(--text-muted)] hover:text-[var(--brand-color)] transition-colors"
          >
            Kody täzeden ugratmak
          </button>
        </div>
      </form>

    </div>
  </div>
</template>
