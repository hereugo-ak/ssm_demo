import { useRef, useCallback } from 'react'
import useReducedMotion from './useReducedMotion.js'

/**
 * SUTRA §9 — magnetic hover wrapper.
 * Translates the child up to `strength`px toward the cursor within its own
 * bounding box; springs back on leave. Disabled under reduced-motion.
 */
export default function Magnetic({ children, strength = 6, as: Tag = 'div', ...rest }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()

  const onMove = useCallback(
    (e) => {
      const el = ref.current
      if (!el || reduced) return
      const r = el.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
      const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
      el.style.transition = 'transform 0.15s ease-out'
      el.style.transform = `translate(${(dx * strength).toFixed(1)}px, ${(dy * strength).toFixed(1)}px)`
    },
    [strength, reduced],
  )

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    // spring back
    el.style.transition = 'transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)'
    el.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <Tag ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>
      {children}
    </Tag>
  )
}
