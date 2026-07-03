/**
 * SUTRA §8 — Background system.
 * Three stacked layers, pointer-events: none:
 *  1. dot-grid plane (24px, --hairline, 6% opacity, 60s diagonal drift)
 *  2. single ambient glow blob behind the TCU hub (the ONLY blurred element)
 *  3. static feTurbulence grain overlay (~3%, blend overlay)
 */
export default function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      {/* Layer 1 — dot grid */}
      <svg className="hero-bg__grid" width="100%" height="100%">
        <defs>
          <pattern id="sutra-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--ink)" opacity="0.06" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sutra-dots)" />
      </svg>

      {/* Layer 2 — ambient glow (breathing, §6) */}
      <div className="hero-bg__glow" />

      {/* Layer 3 — grain */}
      <svg className="hero-bg__grain" width="100%" height="100%">
        <filter id="sutra-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#sutra-grain)" />
      </svg>
    </div>
  )
}
