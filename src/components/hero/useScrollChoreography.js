import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * SUTRA §7 — Scroll choreography, v2 (exploded product view).
 * One pinned ScrollTrigger, 180vh, scrub: true — 1:1 with scrollProgress,
 * never time-based. The product is the only performer:
 *
 *   0.00–0.15  idle (assembled, breathing)
 *   0.15–0.35  header condenses · text exits · assembly slides to center,
 *              scales up · layers begin separating
 *   0.35–0.60  full exploded view — every layer at its data-explode offset,
 *              corner guide lines draw in
 *   0.60–0.85  engineering callouts reveal one at a time (real ordered BOM)
 *   0.85–1.00  device re-assembles + fades back, hands off to next section
 *
 * Guards (§13): skipped under prefers-reduced-motion and <768px; created
 * lazily on viewport entry; killed on unmount.
 */
export default function useScrollChoreography(heroRef, { reduced }) {
  useEffect(() => {
    const heroEl = heroRef.current
    if (!heroEl || reduced) return
    if (window.matchMedia('(max-width: 767px)').matches) return

    let ctx
    let created = false

    const build = () => {
      if (created) return
      created = true

      ctx = gsap.context(() => {
        const q = gsap.utils.selector(heroEl)
        const copy = q('.hero-copy')
        const scrollWrap = q('.assembly-scroll')
        const layers = q('[data-layer]')
        const guides = q('[data-guides]')
        const callouts = q('[data-callout]')

        const tl = gsap.timeline({
          defaults: { ease: 'none' }, // scrub owns the feel
          scrollTrigger: {
            trigger: heroEl,
            start: 'top top',
            end: '+=180%', // §7 — pinned for 180vh
            pin: true,
            scrub: true, // 1:1 with scroll position
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              window.dispatchEvent(
                new CustomEvent('sutra:progress', { detail: { progress: self.progress } }),
              )
            },
          },
        })

        // Timeline is 100 units → position N === scrollProgress N/100.

        // ---- 0.15–0.35 : text exits; assembly takes center stage
        tl.to(copy, { y: -40, autoAlpha: 0, duration: 20 }, 15)
        tl.to(scrollWrap, { x: '-16vw', y: '6vh', scale: 1.02, duration: 25 }, 15)

        // layers begin separating (30% of full explode)
        layers.forEach((el) => {
          const off = +el.dataset.explode || 0
          if (off) tl.to(el, { y: -off * 0.3, duration: 20 }, 15)
        })

        // ---- 0.35–0.60 : full exploded view + guide lines
        layers.forEach((el) => {
          const off = +el.dataset.explode || 0
          if (off) tl.to(el, { y: -off, duration: 25 }, 35)
        })
        // keep the exploded stack centered: layers rise, container compensates down
        tl.to(scrollWrap, { y: '14vh', scale: 0.92, duration: 25 }, 35)
        tl.to(guides, { autoAlpha: 1, duration: 10 }, 40)

        // ---- 0.60–0.85 : callouts reveal one at a time (real ordered BOM)
        tl.to(callouts, { autoAlpha: 1, duration: 5, stagger: 3.5 }, 60)

        // ---- 0.85–1.00 : re-assemble, fade to background, hand off
        tl.to(callouts, { autoAlpha: 0, duration: 8 }, 85)
        tl.to(guides, { autoAlpha: 0, duration: 8 }, 85)
        layers.forEach((el) => {
          const off = +el.dataset.explode || 0
          if (off) tl.to(el, { y: 0, duration: 15 }, 85)
        })
        tl.to(scrollWrap, { autoAlpha: 0.35, scale: 1.0, x: '-8vw', y: '0vh', duration: 15 }, 85)
      }, heroEl)

      ScrollTrigger.refresh()
    }

    // §13 — create only when the hero enters the viewport
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          build()
          io.disconnect()
        }
      },
      { threshold: 0 },
    )
    io.observe(heroEl)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      io.disconnect()
      window.removeEventListener('resize', onResize)
      ctx?.revert()
    }
  }, [heroRef, reduced])
}
