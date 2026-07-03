import { motion } from 'framer-motion'
import { iso, poly, line, boxFaces } from './iso.js'
import useReducedMotion from './useReducedMotion.js'

/**
 * SUTRA §1 — the signature element, v2.
 * A detailed, engineering-drawing-grade exploded view of the SSM TCU itself:
 * die-cast base → 6-layer PCB → compute components → EMI shield → enclosure
 * lid → GNSS/LTE antenna puck. Hand-coded isometric SVG, precision linework,
 * monochrome + single amber signal accent (§2.1).
 *
 * Layers carry data-layer + data-explode (screen px). useScrollChoreography
 * scrubs each layer's translateY to its exploded offset 1:1 with scroll.
 * At idle only the product itself animates: LED blink, antenna ring, bob.
 */

// ---------- geometry (world units) ----------
const S = 1 // world scale

// Layer 1 — die-cast base tray
const base = boxFaces(0, 0, 104, 74, 18, 0)
const baseFoot = [
  boxFaces(-118, -60, 12, 10, 8, 0),
  boxFaces(-118, 60, 12, 10, 8, 0),
  boxFaces(118, -60, 12, 10, 8, 0),
  boxFaces(118, 60, 12, 10, 8, 0),
]

// Layer 2 — PCB
const pcb = boxFaces(0, 0, 94, 64, 6, 18)
const PCB_TOP_Z = 24.2

// PCB copper traces on top face (world z just above pcb top)
const TRACES = [
  line([[-80, -40, PCB_TOP_Z], [-30, -40, PCB_TOP_Z], [-18, -28, PCB_TOP_Z], [12, -28, PCB_TOP_Z]]),
  line([[-80, -18, PCB_TOP_Z], [-52, -18, PCB_TOP_Z], [-44, -10, PCB_TOP_Z], [-44, 14, PCB_TOP_Z]]),
  line([[-80, 34, PCB_TOP_Z], [-58, 34, PCB_TOP_Z], [-50, 42, PCB_TOP_Z], [-8, 42, PCB_TOP_Z]]),
  line([[78, -44, PCB_TOP_Z], [52, -44, PCB_TOP_Z], [44, -36, PCB_TOP_Z], [44, -20, PCB_TOP_Z]]),
  line([[82, 20, PCB_TOP_Z], [66, 20, PCB_TOP_Z], [58, 28, PCB_TOP_Z], [58, 46, PCB_TOP_Z]]),
  line([[12, -28, PCB_TOP_Z], [12, -6, PCB_TOP_Z]]),
]
// via dots at trace ends
const VIAS = [
  [-80, -40], [12, -6], [-80, -18], [-44, 14], [-80, 34], [-8, 42], [78, -44], [44, -20], [82, 20], [58, 46],
].map(([x, y]) => iso(x, y, PCB_TOP_Z))

// mounting holes on PCB corners
const HOLES = [
  [-84, -54], [84, -54], [84, 54], [-84, 54],
].map(([x, y]) => iso(x, y, PCB_TOP_Z))

// Layer 3 — components (sit on PCB, world z0 = 24)
const CZ = 24
const soc = boxFaces(-34, -8, 17, 17, 9, CZ) // edge-compute SoC
const lte = boxFaces(34, -30, 21, 13, 7, CZ) // 4G/LTE + mesh radio
const gnss = boxFaces(42, 26, 13, 13, 8, CZ) // GNSS receiver
const esim = boxFaces(-52, 32, 10, 7, 3, CZ) // eSIM
const canCtl = boxFaces(-2, 30, 12, 8, 5, CZ) // CAN transceiver
const supercap = boxFaces(4, -44, 8, 8, 11, CZ) // backup supercap (round-ish box)
// DB connector block on the front-right PCB edge
const connBlock = boxFaces(88, 10, 7, 22, 12, CZ)

// SoC pin stubs (little legs on two visible sides)
const SOC_PINS = []
for (let i = 0; i < 6; i++) {
  const t = -22 + i * 6
  SOC_PINS.push(line([[-34 + 17, -8 + t * 0.9, CZ + 2], [-34 + 21, -8 + t * 0.9, CZ + 2]]))
  SOC_PINS.push(line([[-34 + t * 0.9, -8 + 17, CZ + 2], [-34 + t * 0.9, -8 + 21, CZ + 2]]))
}

// Layer 4 — EMI shield frame (thin plate with a big cutout look)
const shield = boxFaces(0, 0, 96, 66, 4, 36)
const SHIELD_TOP = 40.2
const shieldCut = poly([
  [-70, -44, SHIELD_TOP], [70, -44, SHIELD_TOP], [70, 44, SHIELD_TOP], [-70, 44, SHIELD_TOP],
])
// perforation dots on shield rim
const PERF = []
for (let i = 0; i < 9; i++) {
  PERF.push(iso(-84 + i * 21, -55, SHIELD_TOP))
  PERF.push(iso(-84 + i * 21, 55, SHIELD_TOP))
}

// Layer 5 — enclosure lid
const lid = boxFaces(0, 0, 104, 74, 16, 44)
const LID_TOP = 60.2
// lid vents
const VENTS = []
for (let i = 0; i < 6; i++) {
  const y = -20 + i * 9
  VENTS.push(line([[30, y, LID_TOP], [78, y, LID_TOP]]))
}
// lid screws
const SCREWS = [
  [-92, -62], [92, -62], [92, 62], [-92, 62],
].map(([x, y]) => iso(x, y, LID_TOP))
// recessed label plate
const labelPlate = poly([
  [-78, -30, LID_TOP], [-18, -30, LID_TOP], [-18, 26, LID_TOP], [-78, 26, LID_TOP],
])

// Layer 6 — antenna puck + mast
const puck = boxFaces(46, -34, 16, 16, 7, 60)
const mastB = iso(46, -34, 67)
const mastT = iso(46, -34, 118)
const ringC = iso(46, -34, 118)

// corner guide lines (dashed verticals shown while exploded)
const GUIDES = [
  [-104, -74], [104, -74], [104, 74], [-104, 74],
].map(([x, y]) => ({ from: iso(x, y, 18), len: 300 }))

// ground grid
const GR = 175
const GRID = []
for (let i = -3; i <= 3; i++) {
  const c = (i * GR) / 3.5
  GRID.push(line([[c, -GR, 0], [c, GR, 0]]))
  GRID.push(line([[-GR, c, 0], [GR, c, 0]]))
}

const stroke = (o = 0.85, w = 1.2) => ({
  stroke: 'var(--ink)',
  strokeOpacity: o,
  strokeWidth: w,
  strokeLinejoin: 'round',
})

/** A standard 3-face box with consistent light-side shading. */
function Box({ f, topFill = 'var(--surface)', sideFill = 'var(--void)', dark, w = 1.1, o = 0.75 }) {
  return (
    <g {...stroke(o, w)}>
      <path d={f.left} fill={dark ? 'var(--ink)' : sideFill} fillOpacity={dark ? 0.85 : 1} />
      <path d={f.right} fill={dark ? 'var(--ink)' : topFill} fillOpacity={dark ? 0.7 : 1} />
      <path d={f.top} fill={dark ? 'var(--ink)' : topFill} fillOpacity={dark ? 0.95 : 1} />
    </g>
  )
}

const springIn = { type: 'spring', stiffness: 120, damping: 18 }

export default function HeroIsometricAssembly() {
  const reduced = useReducedMotion()
  const g = (props) => (reduced ? { initial: false } : props)

  // ASSEMBLE (§5): layers drop/rise into place, staggered, ~1.4s total
  const layerIn = (delay, fromY) =>
    g({
      initial: { opacity: 0, y: fromY },
      animate: { opacity: 1, y: 0 },
      transition: { ...springIn, delay },
    })

  return (
    <svg
      className="assembly-svg"
      viewBox="-345 -275 690 505"
      role="img"
      aria-label="Exploded isometric engineering view of the Six Sense Mobility AIS-140 TCU: die-cast base, 6-layer PCB, edge-compute components, EMI shield, IP67 enclosure lid, and GNSS/LTE antenna."
    >
      {/* ground plane */}
      <motion.g
        {...g({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.8, delay: 0.1 } })}
        stroke="var(--hairline)" strokeWidth="1" fill="none"
      >
        <path d={poly([[-GR, -GR, 0], [GR, -GR, 0], [GR, GR, 0], [-GR, GR, 0]])} />
        {GRID.map((d, i) => <path key={i} d={d} opacity="0.55" />)}
      </motion.g>

      {/* corner guide lines — revealed by scroll explode */}
      <g data-guides="1" opacity="0">
        {GUIDES.map(({ from }, i) => (
          <path
            key={i}
            d={`M${from[0]},${from[1]} L${from[0]},${from[1] - 300}`}
            stroke="var(--graphite)" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 4" fill="none"
          />
        ))}
      </g>

      {/* whole-device idle bob (§6 hub row: ±6px 4.2s) */}
      <g className="loop-hub-bob">

        {/* L1 — die-cast base tray */}
        <motion.g data-layer="base" data-explode="0" {...layerIn(0.2, 60)}>
          {baseFoot.map((f, i) => <Box key={i} f={f} w={1} o={0.6} />)}
          <Box f={base} w={1.25} />
          {/* base ribs */}
          {[-60, -20, 20, 60].map((x, i) => (
            <path key={i} d={line([[x, 74.5, 4], [x, 74.5, 14]])} {...stroke(0.4, 1)} fill="none" />
          ))}
          <text x={iso(0, 76, 8)[0]} y={iso(0, 76, 8)[1]} fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" fill="var(--graphite)" textAnchor="middle">DIE-CAST AL · IP67</text>
        </motion.g>

        {/* L2 — PCB */}
        <motion.g data-layer="pcb" data-explode="56" {...layerIn(0.38, 70)}>
          <g {...stroke(0.75, 1.1)}>
            <path d={pcb.left} fill="var(--surface)" />
            <path d={pcb.right} fill="var(--surface)" />
            <path d={pcb.top} fill="var(--void)" />
          </g>
          {TRACES.map((d, i) => (
            <path key={i} d={d} stroke={i === 0 ? 'var(--signal)' : 'var(--graphite)'} strokeOpacity={i === 0 ? 0.9 : 0.6} strokeWidth="1.1" fill="none" />
          ))}
          {VIAS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="var(--graphite)" />)}
          {HOLES.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="3.4" fill="none" stroke="var(--graphite)" strokeOpacity="0.7" strokeWidth="1" />
              <circle cx={x} cy={y} r="1.2" fill="var(--graphite)" />
            </g>
          ))}
        </motion.g>

        {/* L3 — compute components */}
        <motion.g data-layer="comps" data-explode="102" {...layerIn(0.56, 80)}>
          {SOC_PINS.map((d, i) => <path key={i} d={d} {...stroke(0.4, 0.9)} fill="none" />)}
          <Box f={soc} dark />
          <Box f={lte} dark />
          <Box f={gnss} />
          <Box f={esim} />
          <Box f={canCtl} />
          <Box f={supercap} />
          <Box f={connBlock} />
          {/* chip markings */}
          <text x={iso(-34, -8, 34)[0]} y={iso(-34, -8, 34)[1]} fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1" fill="var(--void)" textAnchor="middle">SSM-EDGE</text>
          <text x={iso(34, -30, 32)[0]} y={iso(34, -30, 32)[1]} fontFamily="var(--font-mono)" fontSize="6.5" letterSpacing="0.5" fill="var(--void)" textAnchor="middle">LTE·MESH</text>
          <text x={iso(42, 26, 33)[0]} y={iso(42, 26, 33)[1]} fontFamily="var(--font-mono)" fontSize="6" letterSpacing="0.5" fill="var(--ink)" textAnchor="middle">GNSS</text>
          {/* status LED on SoC — only the product animates */}
          <circle className="loop-led" cx={iso(-14, -22, CZ + 9.5)[0]} cy={iso(-14, -22, CZ + 9.5)[1]} r="2.2" fill="var(--signal)" />
          {/* connector pins */}
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={line([[95.5, 0 + i * 7 - 4, CZ + 3], [101, 0 + i * 7 - 4, CZ + 3]])} {...stroke(0.55, 1.6)} fill="none" />
          ))}
        </motion.g>

        {/* L4 — EMI shield frame */}
        <motion.g data-layer="shield" data-explode="150" {...layerIn(0.74, 90)}>
          <g {...stroke(0.7, 1.1)}>
            <path d={shield.left} fill="var(--surface)" />
            <path d={shield.right} fill="var(--surface)" />
            <path d={shield.top} fill="var(--surface)" />
          </g>
          <path d={shieldCut} fill="var(--void)" fillOpacity="0.35" stroke="var(--ink)" strokeOpacity="0.5" strokeWidth="1" />
          {PERF.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.1" fill="var(--graphite)" />)}
        </motion.g>

        {/* L5 — enclosure lid (bold dark body — the product's face) */}
        <motion.g data-layer="lid" data-explode="206" {...layerIn(0.92, 100)}>
          <Box f={lid} dark w={1.25} />
          {VENTS.map((d, i) => <path key={i} d={d} stroke="var(--void)" strokeOpacity="0.5" strokeWidth="1.1" fill="none" />)}
          {SCREWS.map(([x, y], i) => (
            <g key={i} stroke="var(--void)" strokeOpacity="0.75" strokeWidth="0.9">
              <circle cx={x} cy={y} r="3" fill="var(--ink)" />
              <path d={`M${x - 1.7},${y} L${x + 1.7},${y}`} />
            </g>
          ))}
          <path d={labelPlate} fill="var(--void)" fillOpacity="0.08" stroke="var(--void)" strokeOpacity="0.45" strokeWidth="0.9" />
          <text x={iso(-48, -2, LID_TOP)[0]} y={iso(-48, -2, LID_TOP)[1]} fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.5" fill="var(--void)" fillOpacity="0.9" textAnchor="middle" transform={`rotate(-30 ${iso(-48, -2, LID_TOP)[0]} ${iso(-48, -2, LID_TOP)[1]})`}>SSM TCU-01</text>
        </motion.g>

        {/* L6 — antenna puck + mast + ring */}
        <motion.g data-layer="antenna" data-explode="258" {...layerIn(1.1, 110)}>
          <Box f={puck} dark />
          <path d={`M${mastB[0]},${mastB[1]} L${mastT[0]},${mastT[1]}`} {...stroke(0.8, 1.4)} fill="none" />
          <circle cx={mastT[0]} cy={mastT[1]} r="3" fill="var(--signal)" />
          <g className="loop-ring-scale">
            <ellipse cx={ringC[0]} cy={ringC[1]} rx="86" ry="39" fill="none" stroke="var(--graphite)" strokeOpacity="0.3" strokeWidth="1" />
            <ellipse className="loop-ring-rotate" cx={ringC[0]} cy={ringC[1]} rx="86" ry="39" pathLength="100" fill="none" stroke="var(--graphite)" strokeOpacity="0.6" strokeWidth="1.1" />
            {!reduced && (
              <circle r="2.6" fill="var(--signal)">
                <animateMotion dur="40s" repeatCount="indefinite" path={`M${ringC[0] + 86},${ringC[1]} a86,39 0 1,0 -172,0 a86,39 0 1,0 172,0`} />
              </circle>
            )}
          </g>

        </motion.g>
      </g>

      {/* engineering callouts — revealed sequentially by scroll (§7) */}
      <g fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.2">
        {[
          { id: 'antenna', n: '01', t: 'GNSS · LTE MESH ANTENNA', side: 1, y: -252 },
          { id: 'lid', n: '02', t: 'DIE-CAST ENCLOSURE · IP67', side: -1, y: -172 },
          { id: 'shield', n: '03', t: 'EMI SHIELD · PERFORATED', side: 1, y: -112 },
          { id: 'comps', n: '04', t: 'EDGE SoC · CAN · eSIM', side: -1, y: -58 },
          { id: 'pcb', n: '05', t: '6-LAYER PCB · AIS-140 I/O', side: 1, y: 0 },
          { id: 'base', n: '06', t: 'AL BASE · VIBRATION MOUNT', side: -1, y: 56 },
        ].map(({ id, n, t, side, y }) => {
          const xEdge = side * 175
          const xText = side * 318
          return (
            <g key={id} data-callout={id} opacity="0">
              <path d={`M${xEdge},${y} L${side * 288},${y}`} stroke="var(--graphite)" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 3" fill="none" />
              <circle cx={xEdge} cy={y} r="2.2" fill="var(--signal)" />
              <text x={xText} y={y - 6} textAnchor={side === 1 ? 'end' : 'start'} fill="var(--signal)" fontSize="9">{n}</text>
              <text x={xText} y={y + 8} textAnchor={side === 1 ? 'end' : 'start'} fill="var(--ink)" fillOpacity="0.85">{t}</text>
            </g>
          )
        })}
      </g>

      {/* caption */}
      <motion.text
        {...g({ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, delay: 1.4 } })}
        x={0} y={198} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2" fill="var(--graphite)"
      >
        SSM · TCU-01 · AIS-140 CERTIFIED
      </motion.text>
    </svg>
  )
}
