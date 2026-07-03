import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Magnetic from './Magnetic.jsx'
import useReducedMotion from './useReducedMotion.js'

/**
 * SUTRA §9 — Header system.
 * expanded (scroll 0) → condensed floating pill (inside pin zone, driven by
 * the `sutra:progress` event from useScrollChoreography) → direction-aware
 * spring hide/reveal below the hero.
 */

const NAV = [
  {
    label: 'Technology',
    icon: (
      // chip icon
      <svg className="sutra-nav__icon" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3.5" y="3.5" width="8" height="8" rx="1.5" />
        <path d="M5.5 3.5v-2M9.5 3.5v-2M5.5 13.5v-2M9.5 13.5v-2M3.5 5.5h-2M3.5 9.5h-2M13.5 5.5h-2M13.5 9.5h-2" />
      </svg>
    ),
  },
  {
    label: 'Fleet',
    icon: (
      // route/pin icon
      <svg className="sutra-nav__icon" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="3.5" cy="11.5" r="2" />
        <circle cx="11.5" cy="3.5" r="2" />
        <path d="M5 10L10 5" strokeDasharray="1.5 1.5" />
      </svg>
    ),
  },
  {
    label: 'Resources',
    icon: (
      // doc icon
      <svg className="sutra-nav__icon" width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M3.5 1.5h5l3 3v9h-8z" />
        <path d="M8.5 1.5v3h3" />
      </svg>
    ),
  },
]

function LogoMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {/* diamond node with mesh spokes — the SUTRA "thread" mark */}
      <path d="M10 2L18 10L10 18L2 10Z" stroke="var(--ink)" strokeWidth="1.3" />
      <circle cx="10" cy="10" r="2.2" fill="var(--signal)" />
      <path d="M10 4.5v3M10 12.5v3M4.5 10h3M12.5 10h3" stroke="var(--graphite)" strokeWidth="1" />
    </svg>
  )
}

export default function HeroHeader({ theme, onToggleTheme }) {
  const reduced = useReducedMotion()
  const [condensed, setCondensed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const belowHero = useRef(false)

  // condense when pin-zone progress passes 0.15 (§7 row 2)
  useEffect(() => {
    const onProgress = (e) => {
      const p = e.detail.progress
      setCondensed(p > 0.15)
      belowHero.current = p >= 1
    }
    window.addEventListener('sutra:progress', onProgress)
    return () => window.removeEventListener('sutra:progress', onProgress)
  }, [])

  // direction-aware reveal below the hero (§9)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (belowHero.current) {
        setHidden(y > lastY.current && y > 200)
      } else {
        setHidden(false)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className={`sutra-header${condensed ? ' is-condensed' : ''}`}
      animate={{ y: hidden ? -96 : 0 }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
    >
      <div className="sutra-header__pill">
        <Magnetic as="a" href="#" className="sutra-logo" aria-label="Six Sense Mobility home">
          <LogoMark />
          <AnimatePresence initial={false}>
            {!condensed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: reduced ? 0 : 0.3 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                SIX SENSE
              </motion.span>
            )}
          </AnimatePresence>
        </Magnetic>

        <nav className="sutra-nav" aria-label="Primary">
          {NAV.map((item) => (
            <Magnetic
              as="a"
              href="#"
              key={item.label}
              className="sutra-nav__link"
              data-tooltip={item.label}
              aria-label={item.label}
            >
              {item.icon}
              <AnimatePresence initial={false}>
                {!condensed && (
                  <motion.span
                    className="sutra-nav__label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: reduced ? 0 : 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Magnetic>
          ))}
        </nav>

        <div className="sutra-header__right">
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="7" cy="7" r="3" />
                <path d="M7 0.5v1.8M7 11.7v1.8M0.5 7h1.8M11.7 7h1.8M2.4 2.4l1.3 1.3M10.3 10.3l1.3 1.3M11.6 2.4l-1.3 1.3M3.7 10.3l-1.3 1.3" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M12 8.5A5.5 5.5 0 1 1 5.5 2 4.5 4.5 0 0 0 12 8.5Z" />
              </svg>
            )}
          </button>
          <Magnetic as="button" className={`cta cta--primary${condensed ? ' cta--compact' : ''}`}>
            Request Demo
          </Magnetic>
        </div>
      </div>
    </motion.header>
  )
}
