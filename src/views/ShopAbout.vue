<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const translations = {
  tm: {
    tag: 'Online dükan',
    about_t: 'Biz barada',
    about_p: 'Yslam Shop China — online dükan. Harytlarymyzy TikTok we Instagram arkaly görkezýäris. Sargyt etmek ýa-da sorag bermek üçin bize jaň ediň ýa-da ýazyň.',
    c1: 'Täze harytlar barada wideolary TikTok-da görüň.',
    c2: 'Suratlar we täzelikler Instagram-da.',
    c3t: 'Telefon',
    c3: 'Sargyt we maslahat üçin jaň ediň.',
    contact: 'Habarlaşyň',
    contact_p: 'Harytlar barada soragyňyz barmy? Bize ýazyň ýa-da jaň ediň.',
    call: 'Jaň etmek'
  },
  en: {
    tag: 'Online shop',
    about_t: 'About us',
    about_p: 'Yslam Shop China is an online shop. We show our products on TikTok and Instagram. To order or ask a question, call or write to us.',
    c1: 'Watch videos about new products on TikTok.',
    c2: 'Photos and news on Instagram.',
    c3t: 'Phone',
    c3: 'Call us to order or for advice.',
    contact: 'Contact us',
    contact_p: 'Have a question about a product? Write or call us.',
    call: 'Call now'
  },
  ru: {
    tag: 'Онлайн-магазин',
    about_t: 'О нас',
    about_p: 'Yslam Shop China — онлайн-магазин. Мы показываем наши товары в TikTok и Instagram. Чтобы заказать или задать вопрос, позвоните или напишите нам.',
    c1: 'Смотрите видео о новых товарах в TikTok.',
    c2: 'Фото и новости в Instagram.',
    c3t: 'Телефон',
    c3: 'Звоните, чтобы заказать или получить совет.',
    contact: 'Связаться с нами',
    contact_p: 'Есть вопрос по товару? Напишите или позвоните нам.',
    call: 'Позвонить'
  }
}

const langs = ['tm', 'en', 'ru']
const curLang = ref('tm')
const t = computed(() => translations[curLang.value])
const currentYear = new Date().getFullYear()

function setLang(l) {
  if (!translations[l]) return
  curLang.value = l
  document.documentElement.lang = l
  try {
    localStorage.setItem('lang', l)
  } catch (e) {}
}

const glowTransform = ref('translate(-300px, -300px)')
const rootRef = ref(null)
let isFine = false
let observer = null

const cardStates = ref([
  { on: false, rx: '0deg', ry: '0deg', mx: '50%', my: '50%' },
  { on: false, rx: '0deg', ry: '0deg', mx: '50%', my: '50%' },
  { on: false, rx: '0deg', ry: '0deg', mx: '50%', my: '50%' }
])

function onMouseMove(e) {
  if (!isFine) return
  glowTransform.value = `translate(${e.clientX - 230}px, ${e.clientY - 230}px)`
}

function onCardEnter(idx) {
  if (!isFine) return
  cardStates.value[idx].on = true
}

function onCardMove(idx, e) {
  if (!isFine) return
  const r = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  cardStates.value[idx].ry = ((x - 0.5) * 14) + 'deg'
  cardStates.value[idx].rx = (-(y - 0.5) * 14) + 'deg'
  cardStates.value[idx].mx = (x * 100) + '%'
  cardStates.value[idx].my = (y * 100) + '%'
}

function onCardLeave(idx) {
  if (!isFine) return
  cardStates.value[idx].on = false
  cardStates.value[idx].rx = '0deg'
  cardStates.value[idx].ry = '0deg'
}

onMounted(() => {
  let saved = 'tm'
  try {
    saved = localStorage.getItem('lang') || 'tm'
  } catch (e) {}
  setLang(translations[saved] ? saved : 'tm')

  isFine = window.matchMedia('(hover:hover) and (pointer:fine)').matches
  if (isFine) {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
  }

  const reveals = rootRef.value ? rootRef.value.querySelectorAll('.reveal') : []
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    reveals.forEach((el, i) => {
      el.style.transitionDelay = (i % 4) * 90 + 'ms'
      observer.observe(el)
    })
  } else {
    reveals.forEach((el) => el.classList.add('in'))
  }
})

onUnmounted(() => {
  if (isFine) {
    window.removeEventListener('mousemove', onMouseMove)
  }
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="page-root" ref="rootRef">
    <div class="glow" :style="{ transform: glowTransform }"></div>

    <header>
      <div class="wrap">
        <div class="brand">
          <img src="../images/yslam-shop-china-avatar.png" alt="" width="38" height="38">
          <span>Yslam Shop China</span>
        </div>
        <div class="lang">
          <button
            v-for="l in langs"
            :key="l"
            :class="{ on: curLang === l }"
            @click="setLang(l)"
          >
            {{ l.toUpperCase() }}
          </button>
        </div>
      </div>
    </header>

    <main class="wrap">
      <div class="hero reveal">
        <img src="../images/yslam-shop-china-banner.png" alt="Yslam Shop China" width="1600" height="400">
      </div>

      <h1 class="reveal">
        <span>Yslam Shop China</span><br>
        <em style="font-style:normal;font-size:.5em;font-weight:800;color:var(--muted)">{{ t.tag }}</em>
      </h1>

      <section class="reveal">
        <h2>{{ t.about_t }}</h2>
        <p style="font-size:17px;max-width:760px">{{ t.about_p }}</p>
      </section>

      <section class="grid">
        <a
          class="card reveal"
          :class="{ on: cardStates[0].on }"
          :style="{
            '--rx': cardStates[0].rx,
            '--ry': cardStates[0].ry,
            '--mx': cardStates[0].mx,
            '--my': cardStates[0].my
          }"
          href="https://www.tiktok.com/@yslam.shop.china"
          target="_blank"
          rel="noopener noreferrer"
          @mouseenter="onCardEnter(0)"
          @mousemove="onCardMove(0, $event)"
          @mouseleave="onCardLeave(0)"
        >
          <div class="ico">▶</div>
          <b>TikTok</b>
          <p>{{ t.c1 }}</p>
          <small>@yslam.shop.china</small>
        </a>

        <a
          class="card reveal"
          :class="{ on: cardStates[1].on }"
          :style="{
            '--rx': cardStates[1].rx,
            '--ry': cardStates[1].ry,
            '--mx': cardStates[1].mx,
            '--my': cardStates[1].my
          }"
          href="https://www.instagram.com/yslam_shop_china/"
          target="_blank"
          rel="noopener noreferrer"
          @mouseenter="onCardEnter(1)"
          @mousemove="onCardMove(1, $event)"
          @mouseleave="onCardLeave(1)"
        >
          <div class="ico">◎</div>
          <b>Instagram</b>
          <p>{{ t.c2 }}</p>
          <small>@yslam_shop_china</small>
        </a>

        <a
          class="card reveal"
          :class="{ on: cardStates[2].on }"
          :style="{
            '--rx': cardStates[2].rx,
            '--ry': cardStates[2].ry,
            '--mx': cardStates[2].mx,
            '--my': cardStates[2].my
          }"
          href="tel:+99361908091"
          @mouseenter="onCardEnter(2)"
          @mousemove="onCardMove(2, $event)"
          @mouseleave="onCardLeave(2)"
        >
          <div class="ico">☎</div>
          <b>{{ t.c3t }}</b>
          <p>{{ t.c3 }}</p>
          <small>+993 61 90 80 91</small>
        </a>
      </section>

      <section class="reveal" style="text-align:center">
        <h2 style="display:inline-block">{{ t.contact }}</h2>
        <p>{{ t.contact_p }}</p>
        <a class="btn" href="tel:+99361908091">{{ t.call }}</a>
      </section>
    </main>

    <footer>
      <div class="wrap">© {{ currentYear }} Yslam Shop China · TikTok @yslam.shop.china · Instagram @yslam_shop_china · +993 61 90 80 91</div>
    </footer>
  </div>
</template>

<style>
:root{--bg:#0b1020;--card:#141a2e;--line:#26304d;--text:#f1f5f9;--muted:#94a3b8;--gold:#f59e0b;--gold2:#fde68a;--red:#ef4444;--ease:cubic-bezier(.2,.8,.2,1)}
@media (prefers-color-scheme:light){:root{--bg:#fff8ee;--card:#fff;--line:#f1dcc0;--text:#1c1917;--muted:#78716c}}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;overflow-x:hidden}
</style>

<style scoped>
.glow{position:fixed;left:0;top:0;width:460px;height:460px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(245,158,11,.18),transparent 65%);transform:translate(-300px,-300px)}
.wrap{position:relative;z-index:1;max-width:1100px;margin:0 auto;padding:0 18px}
header{position:sticky;top:0;z-index:10;backdrop-filter:blur(14px);background:color-mix(in srgb,var(--bg) 78%,transparent);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 18px}
.brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:18px}
.brand img{width:38px;height:38px;border-radius:12px}
.lang{display:flex;border:1px solid var(--line);border-radius:12px;padding:3px;gap:2px}
.lang button{border:0;background:none;color:var(--muted);font:700 12px inherit;padding:6px 11px;border-radius:9px;cursor:pointer;transition:.25s}
.lang button.on{background:linear-gradient(135deg,var(--gold),#b45309);color:#1c1007}
.hero{margin-top:22px;border-radius:26px;overflow:hidden;border:1px solid var(--line);box-shadow:0 30px 60px -30px rgba(0,0,0,.6)}
.hero img{display:block;width:100%;height:auto}
h1{font-size:clamp(30px,6vw,54px);line-height:1.1;margin:34px 0 8px;font-weight:900}
h1 span{background:linear-gradient(90deg,var(--gold),#b45309);-webkit-background-clip:text;background-clip:text;color:transparent}
h2{font-size:26px;margin:0 0 10px;font-weight:900;padding-left:14px;position:relative}
h2:before{content:"";position:absolute;left:0;top:15%;bottom:15%;width:5px;border-radius:5px;background:linear-gradient(var(--gold2),var(--gold))}
p{color:var(--muted);margin:0}
section{margin:46px 0}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}
.card{position:relative;border:1px solid var(--line);background:var(--card);border-radius:20px;padding:20px;color:inherit;text-decoration:none;display:block;transform:perspective(800px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .45s var(--ease),border-color .3s,box-shadow .3s;overflow:hidden}
.card.on{transition:transform .08s linear,border-color .3s,box-shadow .3s;border-color:var(--gold);box-shadow:0 22px 44px -22px rgba(0,0,0,.6),0 0 36px -12px rgba(245,158,11,.6)}
.card:after{content:"";position:absolute;inset:0;pointer-events:none;opacity:0;transition:.3s;background:radial-gradient(360px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.14),transparent 50%)}
.card.on:after{opacity:1}
.ico{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:22px;margin-bottom:12px;background:linear-gradient(135deg,var(--gold2),var(--gold),#b45309);color:#1c1007}
.card b{display:block;font-size:17px;margin-bottom:4px}
.card small{display:block;color:var(--gold);font-weight:800;margin-top:10px;word-break:break-all}
.btn{display:inline-block;margin-top:18px;padding:13px 26px;border-radius:14px;font-weight:800;text-decoration:none;color:#1c1007;background:linear-gradient(135deg,var(--gold2),var(--gold),#b45309);box-shadow:0 12px 28px -10px rgba(245,158,11,.7);transition:transform .25s var(--ease)}
.btn:hover{transform:translateY(-3px) scale(1.03)}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .8s var(--ease),transform .8s var(--ease)}
.reveal.in{opacity:1;transform:none}
footer{border-top:1px solid var(--line);padding:22px 0 34px;text-align:center;font-size:13px;color:var(--muted)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}.reveal{opacity:1;transform:none}}
</style>
