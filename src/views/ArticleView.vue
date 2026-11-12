<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const authStore = useAuthStore()

const article = ref(null)
const comments = ref([])
const similarArticles = ref([])
const newComment = ref('')
const submittingComment = ref(false)
const commentError = ref('')
const loading = ref(true)
const copied = ref(false)

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

function viewCount(a) {
  return a?.views || a?.views_count || 0
}

const readMinutes = computed(() => {
  const text = String(getLocalized(article.value?.content) || '').replace(/<[^>]*>/g, ' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
})

const shareUrl = computed(() => (typeof window !== 'undefined' ? window.location.href : ''))
const shareTitle = computed(() => getLocalized(article.value?.title) || '')
const telegramUrl = computed(() => `https://t.me/share/url?url=${encodeURIComponent(shareUrl.value)}&text=${encodeURIComponent(shareTitle.value)}`)
const whatsappUrl = computed(() => `https://wa.me/?text=${encodeURIComponent(shareTitle.value + ' ' + shareUrl.value)}`)

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch { /* clipboard not available */ }
}

async function loadArticle() {
  loading.value = true
  const slug = route.params.slug
  try {
    const res = await api.getArticle(slug)
    article.value = res.data || res

    try {
      const commRes = await api.getArticleComments(slug)
      comments.value = commRes.data || commRes || []
    } catch { comments.value = [] }

    if (article.value?.category?.slug) {
      try {
        const catRes = await api.getCategoryArticles(article.value.category.slug, 1)
        const arts = catRes.data || []
        similarArticles.value = arts.filter((a) => a.slug !== slug).slice(0, 3)
      } catch { similarArticles.value = [] }
    }
  } catch (err) {
    console.error('Error fetching article:', err)
  } finally {
    loading.value = false
  }
}

async function handleAddComment() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' })
    return
  }
  if (!newComment.value.trim()) return
  submittingComment.value = true
  commentError.value = ''
  try {
    await api.addComment(route.params.slug, { body: newComment.value.trim() })
    comments.value.unshift({
      id: Date.now(),
      user: { name: authStore.user?.name || t('anonymous') },
      body: newComment.value.trim(),
      created_at: new Date().toISOString()
    })
    newComment.value = ''
  } catch (err) {
    commentError.value = err.data?.message || err.message || t('error_generic')
  } finally {
    submittingComment.value = false
  }
}

watch(() => route.params.slug, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loadArticle()
})
watch(locale, loadArticle)
onMounted(loadArticle)
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">

    <!-- Breadcrumb -->
    <div class="text-xs font-semibold flex items-center gap-2 flex-wrap">
      <router-link to="/" class="text-[var(--text-muted)] hover:text-[var(--brand-color)] transition-colors">{{ t('home') }}</router-link>
      <span class="text-[var(--text-muted)]">›</span>
      <router-link
        v-if="article?.category"
        :to="`/category/${article.category.slug}`"
        class="fx-btn-primary rounded-full px-3 py-1 capitalize"
      >{{ catName(article.category) }}</router-link>
      <span v-else class="text-[var(--text-muted)]">...</span>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-4">
      <div class="fx-shimmer h-4 w-32 bg-[var(--bg-card)] rounded"></div>
      <div class="fx-shimmer h-12 bg-[var(--bg-card)] rounded"></div>
      <div class="fx-shimmer aspect-video bg-[var(--bg-card)] rounded-3xl"></div>
    </div>

    <template v-else>
      <!-- Meta -->
      <div class="fx-rise flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-muted)] font-medium">
        <span>{{ formatDate(article?.published_at) }}</span>
        <span>•</span>
        <span>{{ viewCount(article) }} {{ t('views') }}</span>
        <span>•</span>
        <span>{{ readMinutes }} {{ t('min_read') }}</span>
      </div>

      <!-- Title -->
      <h1 class="fx-rise-2 text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight text-[var(--text-primary)]">
        {{ getLocalized(article?.title) || '[HABARYN ADY ULY HARP BILEN]' }}
      </h1>

      <!-- Hero image -->
      <div
        v-tilt="3"
        class="w-full aspect-video rounded-3xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center shadow-2xl shadow-black/15"
      >
        <img v-if="article?.image" :src="article.image" :alt="getLocalized(article.title)" class="w-full h-full object-cover" />
        <span v-else class="text-[var(--text-muted)] text-sm">{{ t('article_image') }}</span>
      </div>

      <!-- Content -->
      <div class="fx-prose max-w-none text-[var(--text-primary)]">
        <div v-if="article?.content" v-html="getLocalized(article.content)"></div>
        <p v-else class="text-[var(--text-muted)] italic">[Habar hakda maglumat teksti. Birnace abzas.]</p>
      </div>

      <!-- Share -->
      <div class="flex items-center flex-wrap gap-2.5 pt-2">
        <span class="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{{ t('share') }}:</span>
        <a :href="telegramUrl" target="_blank" rel="noopener noreferrer" v-magnetic="0.25" class="fx-btn rounded-xl border border-[var(--border-color)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-color)] hover:text-[var(--brand-color)]">Telegram</a>
        <a :href="whatsappUrl" target="_blank" rel="noopener noreferrer" v-magnetic="0.25" class="fx-btn rounded-xl border border-[var(--border-color)] px-4 py-2 text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-color)] hover:text-[var(--brand-color)]">WhatsApp</a>
        <button type="button" @click="copyLink" v-magnetic="0.25" class="fx-btn fx-btn-primary rounded-xl px-4 py-2 text-xs font-bold">
          {{ copied ? t('copied') : t('copy_link') }}
        </button>
      </div>

      <!-- Comments -->
      <section class="pt-8 border-t border-[var(--border-color)] space-y-5">
        <h3 class="fx-title text-xl md:text-2xl text-[var(--text-primary)]">
          {{ t('comments') }}
          <span class="ml-1 align-middle text-xs fx-btn-primary rounded-full px-2.5 py-0.5">{{ comments.length }}</span>
        </h3>

        <div v-spot class="rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
          <label class="block text-xs font-semibold text-[var(--text-muted)]">{{ t('write_comment') }}</label>
          <textarea
            v-model="newComment"
            rows="4"
            class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--brand-color)] focus:shadow-[0_0_0_4px_var(--fx-glow-soft)] transition-all"
          ></textarea>

          <div v-if="commentError" class="text-xs text-red-500 font-medium">{{ commentError }}</div>

          <button
            @click="handleAddComment"
            :disabled="submittingComment || !newComment.trim()"
            class="fx-btn fx-btn-primary rounded-xl px-7 py-2.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submittingComment ? '...' : t('send') }}
          </button>
        </div>

        <transition-group tag="div" name="fx-list" class="space-y-3">
          <div
            v-for="(comm, idx) in comments"
            :key="comm.id || idx"
            class="rounded-2xl p-4 bg-[var(--bg-card)] border border-[var(--border-color)] flex gap-3 hover:border-[var(--brand-color)] transition-colors"
          >
            <span class="fx-btn-primary shrink-0 w-10 h-10 rounded-full grid place-items-center text-sm font-black">
              {{ (comm.user?.name || '?').trim().charAt(0).toUpperCase() }}
            </span>
            <div class="space-y-1 min-w-0">
              <div class="text-xs font-bold text-[var(--text-primary)]">
                {{ comm.user?.name || t('anonymous') }}
                <span class="font-normal text-[var(--text-muted)] ml-2">{{ formatDate(comm.created_at) }}</span>
              </div>
              <div class="text-sm text-[var(--text-primary)] leading-relaxed break-words">
                {{ comm.body || comm.content || '' }}
              </div>
            </div>
          </div>
        </transition-group>

        <div v-if="!comments.length" class="text-sm text-[var(--text-muted)] italic">{{ t('no_comments') }}</div>
      </section>

      <!-- Related -->
      <section class="pt-8 border-t border-[var(--border-color)] space-y-5">
        <h3 class="fx-title text-xl md:text-2xl text-[var(--text-primary)]">{{ t('similar_news') }}</h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          <div v-for="(sim, idx) in (similarArticles.length ? similarArticles : Array(3).fill({}))" :key="sim.id || idx" v-reveal="idx * 100">
            <div
              v-tilt="9"
              v-spot
              @click="sim.slug && router.push(`/article/${sim.slug}`)"
              class="h-full cursor-pointer group flex flex-col rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)]"
            >
              <div class="aspect-[16/9] overflow-hidden flex items-center justify-center bg-[var(--bg-card)]">
                <img
                  v-if="sim.image"
                  :src="sim.image"
                  :alt="getLocalized(sim.title)"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
              </div>
              <div class="p-3.5 space-y-1.5">
                <div class="text-[10px] font-semibold text-[var(--brand-color)] flex gap-1 flex-wrap">
                  <span>{{ catName(article?.category) || 'Sport' }}</span>
                  <span class="text-[var(--text-muted)]">•</span>
                  <span class="text-[var(--text-muted)]">{{ formatDate(sim.published_at) }}</span>
                  <span class="text-[var(--text-muted)]">•</span>
                  <span class="text-[var(--text-muted)]">{{ viewCount(sim) }}</span>
                </div>
                <h4 class="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
                  {{ getLocalized(sim.title) || '[Habar ady]' }}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
