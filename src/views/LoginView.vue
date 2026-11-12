<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const step = ref(1) // 1 = Name input, 2 = OTP input
const name = ref('')
const phone = ref('')
const otpCode = ref('')
const generatedOtp = ref('') // OTP shown on screen for testing
const error = ref('')
const successMessage = ref('')

async function handleRequestOtp() {
  error.value = ''
  successMessage.value = ''

  if (!name.value.trim()) {
    error.value = t('enter_name')
    return
  }

  try {
    const res = await authStore.sendOtp(name.value.trim(), phone.value.trim())
    generatedOtp.value = res.code || ''
    successMessage.value = t('code_sent')
    otpCode.value = res.code || '' // auto-fill on test site
    step.value = 2
  } catch (err) {
    error.value = err.data?.message || err.message || t('error_generic')
  }
}

async function handleVerifyOtp() {
  error.value = ''

  if (!otpCode.value.trim()) {
    error.value = t('enter_code')
    return
  }

  try {
    await authStore.verifyOtp(name.value.trim(), otpCode.value.trim(), phone.value.trim())
    router.push('/')
  } catch (err) {
    error.value = err.data?.message || err.message || t('error_generic')
  }
}

function backToName() {
  step.value = 1
  generatedOtp.value = ''
  successMessage.value = ''
}
</script>

<template>
  <div class="relative max-w-md mx-auto px-4 py-16">
    <!-- floating decor -->
    <div class="pointer-events-none absolute -top-4 -left-10 w-32 h-32 rounded-3xl rotate-12 opacity-25 blur-[2px]" style="background: linear-gradient(135deg, var(--brand-color), transparent); animation: fx-float 6s ease-in-out infinite"></div>
    <div class="pointer-events-none absolute bottom-6 -right-8 w-24 h-24 rounded-full opacity-25 blur-[2px]" style="background: linear-gradient(135deg, var(--brand-color), transparent); animation: fx-float 7s ease-in-out infinite reverse"></div>

    <div v-tilt="4" v-spot class="relative rounded-3xl p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl shadow-black/15 space-y-6 fx-rise">

      <!-- header -->
      <div class="text-center space-y-2">
        <span class="fx-spin-y fx-btn-primary mx-auto grid place-items-center w-14 h-14 rounded-2xl text-2xl font-black">Y</span>
        <h2 class="text-2xl font-black text-[var(--text-primary)]">{{ t('login_title') }}</h2>
        <p class="text-xs text-[var(--text-muted)]">{{ t('login_hint') }}</p>
        <!-- steps -->
        <div class="flex items-center justify-center gap-2 pt-1">
          <span class="h-1.5 rounded-full transition-all duration-500" :class="step === 1 ? 'w-10 bg-[var(--brand-color)]' : 'w-4 bg-[var(--brand-color)]/40'"></span>
          <span class="h-1.5 rounded-full transition-all duration-500" :class="step === 2 ? 'w-10 bg-[var(--brand-color)]' : 'w-4 bg-[var(--border-color)]'"></span>
        </div>
      </div>

      <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">{{ error }}</div>
      <div v-if="successMessage" class="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">{{ successMessage }}</div>

      <div v-if="generatedOtp" class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-center space-y-1">
        <div class="text-[11px] font-bold uppercase tracking-wider">{{ t('test_mode') }}</div>
        <div class="text-3xl font-black tracking-widest text-[var(--brand-color)]">{{ generatedOtp }}</div>
        <div class="text-[10px] text-[var(--text-muted)]">{{ t('test_hint') }}</div>
      </div>

      <transition name="fx-swap" mode="out-in">
        <!-- STEP 1 -->
        <form v-if="step === 1" key="s1" @submit.prevent="handleRequestOtp" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
              {{ t('your_name') }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model="name"
              type="text"
              required
              :placeholder="t('name_example')"
              class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-color)] focus:shadow-[0_0_0_4px_var(--fx-glow-soft)] transition-all"
              autofocus
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
              {{ t('phone_number') }} <span class="text-[var(--text-muted)] font-normal">({{ t('optional') }})</span>
            </label>
            <input
              v-model="phone"
              type="text"
              placeholder="+99365000000"
              class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-color)] focus:shadow-[0_0_0_4px_var(--fx-glow-soft)] transition-all"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            v-magnetic="0.15"
            class="fx-btn fx-btn-primary w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
          >
            {{ authStore.loading ? t('please_wait') : t('get_code') }}
          </button>
        </form>

        <!-- STEP 2 -->
        <form v-else key="s2" @submit.prevent="handleVerifyOtp" class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="block text-xs font-bold text-[var(--text-primary)]">
                {{ t('otp_label') }} <span class="text-red-500">*</span>
              </label>
              <button type="button" @click="backToName" class="text-[11px] text-[var(--brand-color)] hover:underline">
                {{ t('change_name') }}
              </button>
            </div>
            <input
              v-model="otpCode"
              type="text"
              required
              maxlength="6"
              :placeholder="t('otp_placeholder')"
              class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3.5 text-center text-2xl font-black tracking-[0.5em] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-color)] focus:shadow-[0_0_0_4px_var(--fx-glow-soft)] transition-all"
              autofocus
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            v-magnetic="0.15"
            class="fx-btn fx-btn-primary w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
          >
            {{ authStore.loading ? t('please_wait') : t('verify_login') }}
          </button>

          <div class="text-center">
            <button
              type="button"
              @click="handleRequestOtp"
              :disabled="authStore.loading"
              class="text-xs text-[var(--text-muted)] hover:text-[var(--brand-color)] transition-colors"
            >
              {{ t('resend_code') }}
            </button>
          </div>
        </form>
      </transition>
    </div>
  </div>
</template>
