import { motion } from 'framer-motion'
import { iso, poly, line, boxFaces, roundedBoxFaces, roundedTopPath } from './iso.js'
import useReducedMotion from './useReducedMotion.js'

/**
 * SUTRA §1 — the signature element, v3.
 * A faithful isometric rendering of the SSM AIS-140 TCU as it actually is:
 * a low-profile rounded ABS enclosure with side mounting flanges, recessed
 * label panel, status-LED trio, and a vehicle wiring harness — exploding
 * into base shell → PCB → components → lid. Hand-coded SVG, monochrome +
 * single amber accent (§2.1).
 *
 * Explode offsets are in viewBox user units (CSS transforms on SVG children
 * operate in user space), and the viewBox reserves full headroom for the
 * exploded state — the animation can never escape the hero.
 */

// ---------- enclosure geometry (world units) ----------
const HW = 110 // half-length (x)
const HD = 70 // half-depth (y)
const R = 16 // corner radius
const BASE_H = 12
const LID_Z0 = BASE_H
const LID_H = 22
const LID_TOP = LID_Z0 + LID_H // 34

// L1 — base shell + mounting flanges + harness (never moves)
const baseShell = roundedBoxFaces(0, 0, HW, HD, BASE_H, 0, R)
const earL = boxFaces(-124, 0, 16, 24, 6, 0)
const earR = boxFaces(124, 0, 16, 24, 6, 0)
const screwL = iso(-128, 0, 6)
const screwR = iso(128, 0, 6)

// harness: ribbed gland boot on the front-right wall → cable → 12-pin connector
const boot = boxFaces(114, 30, 7, 9, 8, 2)
const conn = boxFaces(188, 96, 17, 11, 11, 0)
const cableA = iso(121, 30, 6)
const cableB = iso(171, 92, 6)
const CABLE = `M${cableA[0]},${cableA[1]} C${cableA[0] + 26},${cableA[1] + 16} ${cableB[0] - 30},${cableB[1] - 22} ${cableB[0]},${cableB[1]}`
const PINS = [0, 1, 2, 3, 4, 5].map((i) =>
  line([[206, 88 + i * 3.2, 5.5], [213, 88 + i * 3.2, 5.5]]),
)

// L2 — PCB
const pcb = boxFaces(0, 0, 100, 60, 5, BASE_H)
const PCB_TOP = 17.2
const TRACES = [
  line([[-88, -34, PCB_TOP], [-46, -34, PCB_TOP], [-36, -24, PCB_TOP], [-8, -24, PCB_TOP]]),
  line([[-88, 6, PCB_TOP], [-62, 6, PCB_TOP], [-56, 12, PCB_TOP], [-56, 34, PCB_TOP]]),
  line([[88, -40, PCB_TOP], [58, -40, PCB_TOP], [50, -32, PCB_TOP], [50, -14, PCB_TOP]]),
  line([[90, 30, PCB_TOP], [72, 30, PCB_TOP], [64, 38, PCB_TOP], [36, 38, PCB_TOP]]),
  line([[-8, -24, PCB_TOP], [-8, 2, PCB_TOP]]),
]
const VIAS = [
  [-88, -34], [-8, 2], [-88, 6], [-56, 34], [88, -40], [50, -14], [90, 30], [36, 38],
].map(([x, y]) => iso(x, y, PCB_TOP))
const HOLES = [[-90, -50], [90, -50], [90, 50], [-90, 50]].map(([x, y]) => iso(x, y, PCB_TOP))

// L3 — components (z0 = 17)
const CZ = 17
const patchBase = boxFaces(-56, -26, 14, 14, 4, CZ) // GNSS ceramic patch antenna
const patchEl = poly([
  [-64, -34, CZ + 4.2], [-48, -34, CZ + 4.2], [-48, -18, CZ + 4.2], [-64, -18, CZ + 4.2],
])
const lte = boxFaces(-4, -26, 21, 14, 4, CZ) // LTE Cat-1 module
const soc = boxFaces(-40, 20, 14, 14, 5, CZ) // edge SoC
const esim = boxFaces(28, -42, 7, 6, 3, CZ)
const canCtl = boxFaces(22, 18, 11, 7, 4, CZ)
const shieldCan = boxFaces(62, 28, 14, 11, 6, CZ) // RF shield can
// backup supercap — cylinder
const capC = [58, -22]
const capTop = iso(capC[0], capC[1], CZ + 14)
const capBot = iso(capC[0], capC[1], CZ)
const CAP_RX = 11
const CAP_RY = 6.4
// LTE module castellation dashes
const CASTS = [0, 1, 2, 3, 4].map((i) =>
  line([[-22 + i * 9, -11.5, CZ + 1], [-22 + i * 9, -9, CZ + 1]]),
)
// pin header near front edge
const HDR = [0, 1, 2, 3, 4, 5, 6].map((i) =>
  iso(-14 + i * 6, 48, CZ + 2),
)

// L4 — lid shell
const lidShell = roundedBoxFaces(0, 0, HW, HD, LID_H, LID_Z0, R)
const lidPanel = roundedTopPath(-14, 0, 64, 44, 10, LID_TOP + 0.2)
const seam = roundedTopPath(0, 0, HW, HD, R, LID_Z0) // parting line
// status LED trio on top face, front-right
const LEDS = [
  { p: iso(78, 44, LID_TOP + 0.2), on: true },
  { p: iso(89, 44, LID_TOP + 0.2), on: false },
  { p: iso(100, 44, LID_TOP + 0.2), on: false },
]
// side ribs on the front wall of the lid
const RIBS = [-72, -48, -24, 0, 24, 48, 72].map((x) =>
  line([[x, HD, LID_Z0 + 5], [x, HD, LID_Z0 + LID_H - 5]]),
)
// iso-plane text transform: maps flat text onto the top face
const isoText = (wx, wy, wz) => {
  const [px, py] = iso(wx, wy, wz)
  return `matrix(0.866 0.5 -0.866 0.5 ${px.toFixed(1)} ${py.toFixed(1)})`
}

// idle GNSS signal arcs above the patch corner (opacity pulse only)
const arcAt = (z, r) => {
  const [cx, cy] = iso(-56, -26, z)
  return `M${cx - r},${cy} A${r},${r * 0.55} 0 0 1 ${cx + r},${cy}`
}

// corner guide lines shown while exploded
const GUIDES = [[-HW, -HD], [HW, -HD], [HW, HD], [-HW, HD]].map(([x, y]) => iso(x, y, BASE_H))

// ground grid
const GR = 150
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

/** Standard 3-face box. */
function Box({ f, topFill = 'var(--surface)', dark, w = 1.1, o = 0.75 }) {
  return (
    <g {...stroke(o, w)}>
      <path d={f.left} fill={dark ? 'var(--ink)' : 'var(--void)'} fillOpacity={dark ? 0.85 : 1} />
      <path d={f.right} fill={dark ? 'var(--ink)' : topFill} fillOpacity={dark ? 0.7 : 1} />
      <path d={f.top} fill={dark ? 'var(--ink)' : topFill} fillOpacity={dark ? 0.95 : 1} />
    </g>
  )
}

/** Rounded enclosure shell: single wrapped side band + top. */
function Shell({ f, dark, w = 1.2 }) {
  return (
    <g {...stroke(0.85, w)}>
      <path d={f.side} fill={dark ? 'var(--ink)' : 'var(--surface)'} fillOpacity={dark ? 0.82 : 1} />
      <path d={f.top} fill={dark ? 'var(--ink)' : 'var(--surface)'} fillOpacity={dark ? 0.96 : 1} />
    </g>
  )
}

const springIn = { type: 'spring', stiffness: 120, damping: 18 }

export default function HeroIsometricAssembly() {
  const reduced = useReducedMotion()
  const g = (props) => (reduced ? { initial: false } : props)

  const layerIn = (delay, fromY) =>
    g({
      initial: { opacity: 0, y: fromY },
      animate: { opacity: 1, y: 0 },
      transition: { ...springIn, delay },
    })

  return (
    <svg
      className="assembly-svg"
      viewBox="-330 -285 660 505"
      role="img"
      aria-label="Exploded isometric view of the Six Sense Mobility AIS-140 TCU: rugged IP67 enclosure base with mounting flanges and vehicle harness, 4-layer PCB, GNSS ceramic patch antenna, LTE and edge-compute modules, and status-LED lid."
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
        {GUIDES.map(([x, y], i) => (
          <path
            key={i}
            d={`M${x},${y} L${x},${y - 230}`}
            stroke="var(--graphite)" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 4" fill="none"
          />
        ))}
      </g>

      {/* whole-device idle bob (§6 hub row: ±6px 4.2s) */}
      <g className="loop-hub-bob">

        {/* L1 — base shell · flanges · vehicle harness (grounded, explode 0) */}
        <motion.g data-layer="base" data-explode="0" {...layerIn(0.2, 46)}>
          {/* harness first (behind base): boot → cable → 12-pin connector */}
          <path d={CABLE} fill="none" {...stroke(0.8, 3.4)} strokeLinecap="round" />
          <path d={CABLE} fill="none" stroke="var(--void)" strokeOpacity="0.55" strokeWidth="1.1" strokeLinecap="round" />
          <Box f={conn} dark w={1.1} />
          {PINS.map((d, i) => <path key={i} d={d} {...stroke(0.6, 1.5)} fill="none" />)}
          <text transform={isoText(188, 118, 0)} fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="1" fill="var(--graphite)" textAnchor="middle">12-PIN</text>

          <Box f={earL} w={1} o={0.65} />
          <Box f={earR} w={1} o={0.65} />
          <circle cx={screwL[0]} cy={screwL[1]} r="4" fill="none" stroke="var(--ink)" strokeOpacity="0.6" strokeWidth="1.1" />
          <circle cx={screwL[0]} cy={screwL[1]} r="1.4" fill="var(--graphite)" />
          <circle cx={screwR[0]} cy={screwR[1]} r="4" fill="none" stroke="var(--ink)" strokeOpacity="0.6" strokeWidth="1.1" />
          <circle cx={screwR[0]} cy={screwR[1]} r="1.4" fill="var(--graphite)" />

          <Shell f={baseShell} />
          <Box f={boot} dark w={1} o={0.7} />
          {/* boot ribs */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={line([[109 + i * 4, 39.2, 3], [109 + i * 4, 39.2, 9]])} stroke="var(--void)" strokeOpacity="0.5" strokeWidth="1" fill="none" />
          ))}
          {/* SIM tray slot on front wall */}
          <path d={line([[-84, HD + 0.4, 4.5], [-58, HD + 0.4, 4.5]])} {...stroke(0.55, 2.4)} strokeLinecap="round" fill="none" />
          <text transform={isoText(0, 92, 0)} fontFamily="var(--font-mono)" fontSize="8" letterSpacing="1.5" fill="var(--graphite)" textAnchor="middle">IP67 · ABS · VIBRATION MOUNT</text>
        </motion.g>

        {/* L2 — PCB */}
        <motion.g data-layer="pcb" data-explode="46" {...layerIn(0.38, 56)}>
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
              <circle cx={x} cy={y} r="3.2" fill="none" stroke="var(--graphite)" strokeOpacity="0.7" strokeWidth="1" />
              <circle cx={x} cy={y} r="1.1" fill="var(--graphite)" />
            </g>
          ))}
        </motion.g>

        {/* L3 — components */}
        <motion.g data-layer="comps" data-explode="84" {...layerIn(0.56, 64)}>
          {/* GNSS ceramic patch */}
          <Box f={patchBase} topFill="var(--surface)" />
          <path d={patchEl} fill="var(--ink)" fillOpacity="0.12" stroke="var(--ink)" strokeOpacity="0.6" strokeWidth="1" />
          <circle cx={iso(-56, -26, CZ + 4.4)[0]} cy={iso(-56, -26, CZ + 4.4)[1]} r="1.4" fill="var(--graphite)" />
          {/* LTE module */}
          <Box f={lte} dark />
          {CASTS.map((d, i) => <path key={i} d={d} stroke="var(--void)" strokeOpacity="0.6" strokeWidth="1" fill="none" />)}
          <text transform={isoText(-4, -26, CZ + 4.2)} fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.8" fill="var(--void)" textAnchor="middle">LTE CAT-1</text>
          {/* edge SoC */}
          <Box f={soc} dark />
          <text transform={isoText(-40, 20, CZ + 5.2)} fontFamily="var(--font-mono)" fontSize="7" letterSpacing="0.8" fill="var(--void)" textAnchor="middle">SSM-EDGE</text>
          {/* eSIM · CAN · shield can */}
          <Box f={esim} />
          <Box f={canCtl} />
          <Box f={shieldCan} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={iso(54 + i * 6, 22, CZ + 6.2)[0]} cy={iso(54 + i * 6, 22, CZ + 6.2)[1]} r="0.9" fill="var(--graphite)" />
          ))}
          {/* supercap cylinder */}
          <g {...stroke(0.7, 1.1)}>
            <path d={`M${capBot[0] - CAP_RX},${capBot[1]} L${capTop[0] - CAP_RX},${capTop[1]} M${capBot[0] + CAP_RX},${capBot[1]} L${capTop[0] + CAP_RX},${capTop[1]}`} fill="none" />
            <ellipse cx={capBot[0]} cy={capBot[1]} rx={CAP_RX} ry={CAP_RY} fill="var(--surface)" />
            <ellipse cx={capTop[0]} cy={capTop[1]} rx={CAP_RX} ry={CAP_RY} fill="var(--surface)" />
            <path d={`M${capTop[0] - 4},${capTop[1]} L${capTop[0] + 4},${capTop[1]}`} stroke="var(--graphite)" />
          </g>
          {/* pin header */}
          {HDR.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.1" fill="var(--graphite)" />)}
        </motion.g>

        {/* L4 — lid shell (the product's face) */}
        <motion.g data-layer="lid" data-explode="156" {...layerIn(0.8, 76)}>
          <Shell f={lidShell} dark />
          <path d={seam} fill="none" stroke="var(--void)" strokeOpacity="0.35" strokeWidth="0.9" />
          {RIBS.map((d, i) => <path key={i} d={d} stroke="var(--void)" strokeOpacity="0.35" strokeWidth="1" fill="none" />)}
          {/* recessed label panel + branding */}
          <path d={lidPanel} fill="var(--void)" fillOpacity="0.1" stroke="var(--void)" strokeOpacity="0.4" strokeWidth="0.9" />
          <text transform={isoText(-40, -10, LID_TOP + 0.4)} fontFamily="var(--font-display)" fontSize="15" fontWeight="700" letterSpacing="1.5" fill="var(--void)" fillOpacity="0.92" textAnchor="middle">SIX SENSE</text>
          <text transform={isoText(-40, 8, LID_TOP + 0.4)} fontFamily="var(--font-mono)" fontSize="8" letterSpacing="2.5" fill="var(--void)" fillOpacity="0.7" textAnchor="middle">MOBILITY · TCU-01</text>
          <text transform={isoText(-40, 26, LID_TOP + 0.4)} fontFamily="var(--font-mono)" fontSize="6.5" letterSpacing="1.5" fill="var(--void)" fillOpacity="0.55" textAnchor="middle">AIS-140 CERTIFIED</text>
          {/* status LED trio — only the product animates */}
          {LEDS.map(({ p: [x, y], on }, i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="3" fill="none" stroke="var(--void)" strokeOpacity="0.5" strokeWidth="0.8" />
              <circle className={on ? 'loop-led' : undefined} cx={x} cy={y} r="1.8" fill={on ? 'var(--signal)' : 'var(--void)'} fillOpacity={on ? 1 : 0.35} />
            </g>
          ))}
          <text transform={isoText(89, 54, LID_TOP + 0.4)} fontFamily="var(--font-mono)" fontSize="5.5" letterSpacing="1.2" fill="var(--void)" fillOpacity="0.55" textAnchor="middle">GPS · NET · PWR</text>
        </motion.g>

        {/* idle GNSS signal arcs above the assembled device */}
        {!reduced && (
          <g fill="none" stroke="var(--signal)" strokeWidth="1.2" strokeLinecap="round">
            <path className="loop-sig" d={arcAt(50, 10)} style={{ animationDelay: '0s' }} />
            <path className="loop-sig" d={arcAt(60, 17)} style={{ animationDelay: '0.4s' }} />
            <path className="loop-sig" d={arcAt(70, 24)} style={{ animationDelay: '0.8s' }} />
          </g>
        )}
      </g>

      {/* engineering callouts — revealed sequentially by scroll (§7) */}
      <g fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1.2">
        {[
          { id: 'lid', n: '01', t: 'IP67 ENCLOSURE · ABS', side: -1, y: -196 },
          { id: 'patch', n: '02', t: 'GNSS CERAMIC PATCH', side: 1, y: -150 },
          { id: 'soc', n: '03', t: 'EDGE SoC · eSIM · CAN', side: -1, y: -112 },
          { id: 'pcb', n: '04', t: '4-LAYER PCB · AIS-140 I/O', side: 1, y: -62 },
          { id: 'flange', n: '05', t: 'MOUNTING FLANGE · M4', side: -1, y: -18 },
          { id: 'harness', n: '06', t: 'VEHICLE HARNESS · 12-PIN', side: 1, y: 108 },
        ].map(({ id, n, t, side, y }) => {
          const xEdge = side * 168
          const xText = side * 300
          return (
            <g key={id} data-callout={id} opacity="0">
              <path d={`M${xEdge},${y} L${side * 272},${y}`} stroke="var(--graphite)" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="2 3" fill="none" />
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
        x={0} y={196} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2" fill="var(--graphite)"
      >
        SSM · TCU-01 · AIS-140 CERTIFIED
      </motion.text>
    </svg>
  )
}
