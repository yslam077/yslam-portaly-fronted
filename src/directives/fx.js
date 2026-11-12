// Yslam Portaly — mouse / 3D directives
// main.js:  import fx from './directives/fx';  app.use(fx)
//
//   v-tilt="7"        3D tilt + glare that follows the mouse
//   v-spot            soft spotlight that follows the mouse
//   v-magnetic="0.3"  element is pulled toward the cursor
//   v-parallax="16"   sets --px / --py (layers move opposite to the mouse)
//   v-reveal="120"    fade/slide in on scroll (value = delay in ms)

const hasWindow = typeof window !== 'undefined'
const canHover = () => hasWindow && window.matchMedia('(hover: hover) and (pointer: fine)').matches
const reduced = () => hasWindow && window.matchMedia('(prefers-reduced-motion: reduce)').matches
const num = (v, d) => (typeof v === 'number' ? v : d)

function ensurePositioned(el) {
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
}

/* ───────── tilt ───────── */
const tilt = {
  mounted(el, { value }) {
    if (!canHover() || reduced()) return
    const max = num(value, 7)
    ensurePositioned(el)
    el.classList.add('fx-tilt')
    let raf = 0
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--ry', `${(px - 0.5) * 2 * max}deg`)
        el.style.setProperty('--rx', `${-(py - 0.5) * 2 * max}deg`)
        el.style.setProperty('--mx', `${px * 100}%`)
        el.style.setProperty('--my', `${py * 100}%`)
      })
    }
    const enter = () => el.classList.add('is-active')
    const leave = () => {
      cancelAnimationFrame(raf)
      el.classList.remove('is-active')
      el.style.setProperty('--rx', '0deg')
      el.style.setProperty('--ry', '0deg')
    }
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    el._fxTilt = { enter, move, leave }
  },
  updated(el) {
    if (el._fxTilt) el.classList.add('fx-tilt') // Vue may reset :class on re-render
  },
  unmounted(el) {
    const h = el._fxTilt
    if (!h) return
    el.removeEventListener('mouseenter', h.enter)
    el.removeEventListener('mousemove', h.move)
    el.removeEventListener('mouseleave', h.leave)
  }
}

/* ───────── spotlight ───────── */
const spot = {
  mounted(el) {
    if (!canHover() || reduced()) return
    ensurePositioned(el)
    el.classList.add('fx-spot')
    const move = (e) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    el.addEventListener('mousemove', move)
    el._fxSpot = move
  },
  updated(el) {
    if (el._fxSpot) el.classList.add('fx-spot')
  },
  unmounted(el) {
    if (el._fxSpot) el.removeEventListener('mousemove', el._fxSpot)
  }
}

/* ───────── magnetic ───────── */
const magnetic = {
  mounted(el, { value }) {
    if (!canHover() || reduced()) return
    const strength = num(value, 0.3)
    el.classList.add('fx-magnetic')
    let raf = 0
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const radius = Math.max(r.width, r.height) * 1.1
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = Math.hypot(dx, dy) < radius
          ? `translate3d(${dx * strength}px, ${dy * strength}px, 0)`
          : ''
      })
    }
    window.addEventListener('mousemove', move, { passive: true })
    el._fxMag = move
  },
  updated(el) {
    if (el._fxMag) el.classList.add('fx-magnetic')
  },
  unmounted(el) {
    if (el._fxMag) window.removeEventListener('mousemove', el._fxMag)
  }
}

/* ───────── parallax (mouse) ───────── */
const parallax = {
  mounted(el, { value }) {
    if (!canHover() || reduced()) return
    const amt = num(value, 14)
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--px', `${-nx * 2 * amt}px`)
      el.style.setProperty('--py', `${-ny * 2 * amt}px`)
    }
    const leave = () => {
      el.style.setProperty('--px', '0px')
      el.style.setProperty('--py', '0px')
    }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    el._fxPar = { move, leave }
  },
  unmounted(el) {
    const h = el._fxPar
    if (!h) return
    el.removeEventListener('mousemove', h.move)
    el.removeEventListener('mouseleave', h.leave)
  }
}

/* ───────── reveal on scroll ───────── */
let io = null
function getObserver() {
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target._fxShown = true
            en.target.classList.add('is-visible')
            io.unobserve(en.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    )
  }
  return io
}

const reveal = {
  mounted(el, { value }) {
    if (!hasWindow || reduced() || !('IntersectionObserver' in window)) return
    el._fxReveal = true
    el.classList.add('fx-reveal')
    el.style.setProperty('--d', `${Number(value) || 0}ms`)
    getObserver().observe(el)
  },
  updated(el) {
    if (!el._fxReveal) return
    el.classList.add('fx-reveal')
    if (el._fxShown) el.classList.add('is-visible')
  },
  unmounted(el) {
    if (io && el._fxReveal) io.unobserve(el)
  }
}

export { tilt, spot, magnetic, parallax, reveal }

export default {
  install(app) {
    app.directive('tilt', tilt)
    app.directive('spot', spot)
    app.directive('magnetic', magnetic)
    app.directive('parallax', parallax)
    app.directive('reveal', reveal)
  }
}
