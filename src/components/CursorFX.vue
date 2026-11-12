<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const enabled = ref(false)
const progress = ref(0)
const showTop = ref(false)
const hot = ref(false)
const ripples = ref([])

const glow = ref(null)
const ring = ref(null)
const dot = ref(null)

let mx = -200, my = -200
let rx = -200, ry = -200
let gx = -200, gy = -200
let raf = 0
let rid = 0

function onMove(e) {
  mx = e.clientX
  my = e.clientY
  hot.value = !!e.target?.closest?.('a, button, [role="button"], input, textarea, .cursor-pointer')
}

function loop() {
  rx += (mx - rx) * 0.2
  ry += (my - ry) * 0.2
  gx += (mx - gx) * 0.07
  gy += (my - gy) * 0.07
  if (dot.value) dot.value.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
  if (ring.value) ring.value.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
  if (glow.value) glow.value.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`
  raf = requestAnimationFrame(loop)
}

function onScroll() {
  const h = document.documentElement
  const max = h.scrollHeight - h.clientHeight
  progress.value = max > 0 ? Math.min(1, h.scrollTop / max) : 0
  showTop.value = h.scrollTop > 500
}

function onClick(e) {
  const id = ++rid
  ripples.value.push({ id, x: e.clientX, y: e.clientY })
  setTimeout(() => {
    ripples.value = ripples.value.filter((r) => r.id !== id)
  }, 750)
}

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  enabled.value =
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  if (enabled.value) {
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('click', onClick)
    raf = requestAnimationFrame(loop)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('click', onClick)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <!-- scroll progress bar -->
  <div class="fx-progress" :style="{ transform: `scaleX(${progress})` }"></div>

  <!-- soft moving color blobs in the background -->
  <div class="fx-aurora" aria-hidden="true">
    <span class="b1"></span><span class="b2"></span><span class="b3"></span>
  </div>

  <!-- mouse effects (desktop only) -->
  <template v-if="enabled">
    <div ref="glow" class="fx-cursor-glow"></div>
    <div ref="ring" class="fx-cursor-ring" :class="{ hot }"></div>
    <div ref="dot" class="fx-cursor-dot"></div>
    <span
      v-for="r in ripples"
      :key="r.id"
      class="fx-ripple"
      :style="{ left: r.x + 'px', top: r.y + 'px' }"
    ></span>
  </template>

  <!-- back to top -->
  <button
    type="button"
    class="fx-top fx-btn fx-btn-primary"
    :class="{ show: showTop }"
    :aria-label="t('back_to_top')"
    :title="t('back_to_top')"
    @click="toTop"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  </button>
</template>

<style scoped>
.fx-progress {
  position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 10000;
  transform-origin: left; pointer-events: none;
  background: linear-gradient(90deg, var(--brand-color), color-mix(in srgb, var(--brand-color) 40%, #f59e0b));
  box-shadow: 0 0 12px var(--fx-glow);
}

.fx-aurora { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.fx-aurora span {
  position: absolute; width: 46vmax; height: 46vmax; border-radius: 50%;
  background: radial-gradient(circle, var(--brand-color), transparent 65%);
  filter: blur(70px); opacity: .09; animation: fx-blob 18s ease-in-out infinite;
}
.fx-aurora .b1 { top: -18vmax; left: -12vmax; }
.fx-aurora .b2 { bottom: -22vmax; right: -14vmax; animation-delay: -6s; }
.fx-aurora .b3 { top: 38%; left: 52%; width: 30vmax; height: 30vmax; opacity: .06; animation-delay: -11s; }

.fx-cursor-glow {
  position: fixed; left: 0; top: 0; width: 440px; height: 440px; border-radius: 50%;
  pointer-events: none; z-index: 40;
  background: radial-gradient(circle, var(--fx-glow-soft), transparent 66%);
}
.fx-cursor-ring {
  position: fixed; left: 0; top: 0; width: 34px; height: 34px; border-radius: 50%;
  border: 1.5px solid var(--brand-color); pointer-events: none; z-index: 9999; opacity: .85;
  transition: width .25s var(--fx-ease), height .25s var(--fx-ease), background .25s;
}
.fx-cursor-ring.hot { width: 58px; height: 58px; background: color-mix(in srgb, var(--brand-color) 14%, transparent); }
.fx-cursor-dot {
  position: fixed; left: 0; top: 0; width: 6px; height: 6px; border-radius: 50%;
  background: var(--brand-color); pointer-events: none; z-index: 9999;
}
.fx-ripple {
  position: fixed; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%;
  border: 2px solid var(--brand-color); pointer-events: none; z-index: 9998;
  animation: fx-ripple .75s ease-out forwards;
}
@keyframes fx-ripple { from { transform: scale(.4); opacity: .9; } to { transform: scale(7); opacity: 0; } }

.fx-top {
  position: fixed; right: 20px; bottom: 20px; z-index: 60;
  width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center;
  opacity: 0; transform: translateY(24px) scale(.7) rotateX(70deg); pointer-events: none;
  transition: opacity .4s, transform .5s var(--fx-ease), box-shadow .3s, filter .3s;
}
.fx-top.show { opacity: 1; transform: none; pointer-events: auto; animation: fx-pulse-ring 2.4s infinite; }
.fx-top.show:hover { transform: translateY(-5px) rotate(-6deg) scale(1.08); }
</style>
