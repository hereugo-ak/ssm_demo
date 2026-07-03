import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Magnetic from './Magnetic.jsx'
import useReducedMotion from './useReducedMotion.js'

/**
 * SUTRA — HeroContent (§3 left column, copy from §11).
 *  - word-level stagger reveal on H1 (§10 — words, never characters)
 *  - deployment ticker: count 24,780 → 25,040 over 20s linear, hold 6s, reset (§6)
 */

const HEADLINE = 'Telematics that thinks at the edge.'

/** §6 — deployment ticker loop. */
function useDeploymentTicker(reduced) {
  const [count, setCount] = useState(reduced ? 24900 : 24780)
  useEffect(() => {
    if (reduced) return
    const FROM = 24780
    const TO = 25040
    const COUNT_MS = 20000
    const HOLD_MS = 6000
    const CYCLE = COUNT_MS + HOLD_MS
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = (now - start) % CYCLE
      const p = Math.min(t / COUNT_MS, 1) // linear count, then hold
      setCount(Math.round(FROM + (TO - FROM) * p))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])
  return count
}

export default function HeroContent() {
  const reduced = useReducedMotion()
  const count = useDeploymentTicker(reduced)
  const words = HEADLINE.split(' ')

  // §10 — word-level flip-up reveal: rotateX(-90deg) → 0, 60ms stagger, spring
  const wordVariants = {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, rotateX: -90, y: 14 },
    show: (i) => ({
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: reduced
        ? { duration: 0.3, delay: 0.1 }
        : { type: 'spring', stiffness: 210, damping: 20, delay: 0.55 + i * 0.06 },
    }),
  }

  const fadeUp = (delay) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: reduced ? { duration: 0.3 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  })

  return (
    <div className="hero-copy">
      <motion.p className="hero-eyebrow" {...fadeUp(0.35)}>
        AIS-140 Certified · Edge Intelligence
      </motion.p>

      <h1 className="hero-h1" aria-label={HEADLINE}>
        {words.map((w, i) => (
          <motion.span
            key={i}
            className="word"
            aria-hidden="true"
            custom={i}
            initial="hidden"
            animate="show"
            variants={wordVariants}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ))}
      </h1>

      <motion.p className="hero-sub" {...fadeUp(1.05)}>
        A single AIS-140 certified TCU with private mesh connectivity, on-device
        intelligence, and FOTA-ready firmware — built to keep fleets visible,
        secure, and moving.
      </motion.p>

      <motion.div className="hero-cta-row" {...fadeUp(1.2)}>
        <Magnetic as="button" className="cta cta--primary">
          Request a demo
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" />
          </svg>
        </Magnetic>
        <Magnetic as="button" className="cta cta--ghost">See the spec sheet</Magnetic>
      </motion.div>

      <motion.p className="hero-ticker" {...fadeUp(1.35)}>
        <span className="hero-ticker__dot" aria-hidden="true" />
        LIVE MESH ·{' '}
        <span className="hero-ticker__count">{count.toLocaleString('en-US')}+</span>{' '}
        DEVICES · INDIA · EUROPE
      </motion.p>
    </div>
  )
}
