<script setup>
import { ref, onMounted, watch } from 'vue'
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

function getLocalized(field) {
  if (!field) return ''
  if (typeof field === 'object') {
    return field[locale.value] || field['tm'] || field['ru'] || Object.values(field)[0] || ''
  }
  return field
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

function viewCount(a) { return a?.views || a?.views_count || 0 }

async function loadArticle() {
  loading.value = true
  const slug = route.params.slug
  try {
    const res = await api.getArticle(slug)
    article.value = res.data || res

    // Comments
    try {
      const commRes = await api.getArticleComments(slug)
      comments.value = commRes.data || commRes || []
    } catch { comments.value = [] }

    // Related articles
    if (article.value?.category?.slug) {
      try {
        const catRes = await api.getCategoryArticles(article.value.category.slug, 1)
        const arts = catRes.data || []
        similarArticles.value = arts.filter(a => a.slug !== slug).slice(0, 3)
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
      user: { name: authStore.user?.name || 'Ulanyjy' },
      body: newComment.value.trim(),
      created_at: new Date().toISOString()
    })
    newComment.value = ''
  } catch (err) {
    commentError.value = err.data?.message || err.message || 'Ýalňyşlyk ýüze çykdy'
  } finally {
    submittingComment.value = false
  }
}

watch(() => route.params.slug, () => loadArticle())
onMounted(() => loadArticle())
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8">

    <!-- Breadcrumb -->
    <div class="text-xs font-semibold text-[var(--brand-color)] flex items-center gap-1.5">
      <router-link to="/" class="hover:underline">Esasy sahypa</router-link>
      <span>›</span>
      <router-link
        v-if="article?.category"
        :to="`/category/${article.category.slug}`"
        class="hover:underline capitalize"
      >{{ getLocalized(article.category.name) }}</router-link>
      <span v-else>...</span>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-4 animate-pulse">
      <div class="h-4 w-32 bg-[var(--bg-card)] rounded"></div>
      <div class="h-10 bg-[var(--bg-card)] rounded"></div>
      <div class="aspect-video bg-[var(--bg-card)] rounded-2xl"></div>
    </div>

    <template v-else>
      <!-- Date & Views -->
      <div class="text-xs text-[var(--text-muted)]">
        {{ formatDate(article?.published_at) }} • {{ viewCount(article) }} {{ t('views') }}
      </div>

      <!-- Title -->
      <h1 class="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-[var(--text-primary)]">
        {{ getLocalized(article?.title) || '[HABARYN ADY ULY HARP BILEN]' }}
      </h1>

      <!-- Hero Image -->
      <div class="w-full aspect-video rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] flex items-center justify-center">
        <img
          v-if="article?.image"
          :src="article.image"
          :alt="getLocalized(article.title)"
          class="w-full h-full object-cover"
        />
        <span v-else class="text-[var(--text-muted)] text-sm">Habaryn suraty</span>
      </div>

      <!-- Article Content -->
      <div class="prose max-w-none text-[var(--text-primary)] leading-relaxed space-y-4">
        <div v-if="article?.content" v-html="getLocalized(article.content)"></div>
        <p v-else class="text-[var(--text-muted)] italic">
          [Habar hakda maglumat teksti. Birnace abzas.]
        </p>
      </div>

      <!-- ══════════════════════════
           COMMENTS SECTION
      ══════════════════════════ -->
      <section class="pt-6 border-t border-[var(--border-color)] space-y-5">
        <h3 class="text-lg md:text-xl font-bold text-[var(--text-primary)]">{{ t('comments') }}</h3>

        <!-- Comment form -->
        <div class="rounded-2xl p-5 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-3">
          <label class="block text-xs font-semibold text-[var(--text-muted)]">{{ t('write_comment') }}</label>
          <textarea
            v-model="newComment"
            rows="4"
            class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] transition-colors"
          ></textarea>

          <div v-if="commentError" class="text-xs text-red-500 font-medium">{{ commentError }}</div>

          <button
            @click="handleAddComment"
            :disabled="submittingComment || !newComment.trim()"
            class="rounded-lg px-6 py-2 text-xs font-bold text-white bg-[var(--brand-color)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submittingComment ? '...' : t('send') }}
          </button>
        </div>

        <!-- Comments list -->
        <div class="space-y-3">
          <div
            v-for="(comm, idx) in comments"
            :key="comm.id || idx"
            class="rounded-xl p-4 bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1"
          >
            <div class="text-xs font-bold text-[var(--text-primary)]">
              {{ comm.user?.name || '[Ulanyjy ady]' }}
              <span class="font-normal text-[var(--text-muted)] ml-2">{{ formatDate(comm.created_at) }}</span>
            </div>
            <div class="text-sm text-[var(--text-primary)] leading-relaxed">
              {{ comm.body || comm.content || '[Kommentariya teksti]' }}
            </div>
          </div>
          <div v-if="!comments.length" class="text-sm text-[var(--text-muted)] italic">
            Entek kommentariya ýok.
          </div>
        </div>
      </section>

      <!-- ══════════════════════════
           RELATED ARTICLES
      ══════════════════════════ -->
      <section class="pt-8 border-t border-[var(--border-color)] space-y-4">
        <h3 class="text-lg md:text-xl font-bold text-[var(--text-primary)]">{{ t('similar_news') }}</h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="(sim, idx) in (similarArticles.length ? similarArticles : Array(3).fill({}))"
            :key="sim.id || idx"
            @click="sim.slug && router.push(`/article/${sim.slug}`)"
            class="cursor-pointer group flex flex-col rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--brand-color)] transition-all"
          >
            <div class="aspect-[16/9] overflow-hidden flex items-center justify-center bg-[var(--bg-card)]">
              <img
                v-if="sim.image"
                :src="sim.image"
                :alt="getLocalized(sim.title)"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span v-else class="text-[var(--text-muted)] text-xs">{{ t('image') }}</span>
            </div>
            <div class="p-3 space-y-1">
              <div class="text-[10px] font-semibold text-[var(--brand-color)] flex gap-1 flex-wrap">
                <span>{{ getLocalized(article?.category?.name) || 'Sport' }}</span>
                <span class="text-[var(--text-muted)]">•</span>
                <span class="text-[var(--text-muted)]">{{ formatDate(sim.published_at) }}</span>
                <span class="text-[var(--text-muted)]">•</span>
                <span class="text-[var(--text-muted)]">{{ viewCount(sim) }}</span>
              </div>
              <h4 class="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-color)] transition-colors line-clamp-2">
                {{ getLocalized(sim.title) || '[Habar ady]' }}
              </h4>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
