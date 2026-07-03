import { useEffect, useRef, useState } from 'react'
import HeroBackground from './HeroBackground.jsx'
import HeroHeader from './HeroHeader.jsx'
import HeroContent from './HeroContent.jsx'
import HeroIsometricAssembly from './HeroIsometricAssembly.jsx'
import useScrollChoreography from './useScrollChoreography.js'
import useReducedMotion from './useReducedMotion.js'
import './hero.css'

/**
 * SUTRA — HeroSection composition root (§12), v2.
 * The product IS the hero: a precision exploded-view TCU. No floating
 * dashboard cards. Framer Motion owns ASSEMBLE + idle; GSAP owns pin+scrub.
 */

/** §6 — cursor-reactive tilt: ≤4° rotateX/rotateY, desktop ≥1024px only. */
function useCursorTilt(ref, reduced) {
  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    if (window.matchMedia('(max-width: 1023px)').matches) return

    let raf = 0
    let tx = 0
    let ty = 0
    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      // clamp hard at ±4°
      tx = Math.max(-4, Math.min(4, -ny * 8))
      ty = Math.max(-4, Math.min(4, nx * 8))
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.transform = `rotateX(${tx.toFixed(2)}deg) rotateY(${ty.toFixed(2)}deg)`
          raf = 0
        })
      }
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [ref, reduced])
}

/** §13 mobile — simple scroll-triggered fade/slide-up in place of the pin. */
function useMobileReveals(rootRef) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !window.matchMedia('(max-width: 767px)').matches) return
    const els = root.querySelectorAll('.m-reveal')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [rootRef])
}

export default function HeroSection() {
  const heroRef = useRef(null)
  const tiltRef = useRef(null)
  const reduced = useReducedMotion()
  const [theme, setTheme] = useState('light') // light is the default theme

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useCursorTilt(tiltRef, reduced)
  useScrollChoreography(heroRef, { reduced })
  useMobileReveals(heroRef)

  return (
    <>
      <HeroHeader theme={theme} onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />

      <section className="hero" ref={heroRef} aria-label="Six Sense Mobility TCU hero">
        <HeroBackground />

        <div className="hero-frame">
          <HeroContent />

          <div className="hero-stage">
            <div className="assembly-scroll">
              <div className="assembly-tilt" ref={tiltRef}>
                <HeroIsometricAssembly />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
