/**
 * Handoff section — exists so the §7 0.85–1.00 crossfade lands on a real page
 * section. Content reuses the §7 filmstrip feature set (real, ordered).
 */
const FEATURES = [
  ['01', 'Immobilization'],
  ['02', 'Real-Time GPS'],
  ['03', 'Health & Diagnostics'],
  ['04', 'Crash Detection'],
  ['05', 'Trip Reports'],
]

export default function NextSection() {
  return (
    <section className="next-section" aria-label="Platform capabilities">
      <div className="next-section__inner">
        <h2>One device. Every signal your fleet sends.</h2>
        <div className="spec-list">
          {FEATURES.map(([idx, name]) => (
            <div className="spec-list__row" key={idx}>
              <span className="idx">{idx}</span>
              <span className="name">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
