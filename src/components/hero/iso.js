/**
 * SUTRA — isometric projection helpers for the hand-coded SVG assembly (§1, §12).
 * World space: x → down-right, y → down-left, z → up. Classic 30° isometric.
 */
const COS30 = 0.8660254
const SIN30 = 0.5

/** Project world (x, y, z) → screen [sx, sy]. */
export const iso = (x, y, z = 0) => [(x - y) * COS30, (x + y) * SIN30 - z]

const pt = (x, y, z) => iso(x, y, z).map((n) => +n.toFixed(2)).join(',')

/** Closed polygon path through world-space points. */
export const poly = (pts) =>
  'M' + pts.map(([x, y, z]) => pt(x, y, z)).join('L') + 'Z'

/** Open polyline path through world-space points (used for mesh traces). */
export const line = (pts) =>
  'M' + pts.map(([x, y, z]) => pt(x, y, z)).join('L')

/**
 * Faces of an axis-aligned box centered at world (cx, cy), base at z0,
 * half-width hw (x), half-depth hd (y), height h.
 * Returns { top, right, left } face path strings.
 */
export function boxFaces(cx, cy, hw, hd, h, z0 = 0) {
  const zt = z0 + h
  // top corners (clockwise on screen): back, right, front, left
  const T = {
    back: [cx - hw, cy - hd, zt],
    right: [cx + hw, cy - hd, zt],
    front: [cx + hw, cy + hd, zt],
    left: [cx - hw, cy + hd, zt],
  }
  const B = {
    right: [cx + hw, cy - hd, z0],
    front: [cx + hw, cy + hd, z0],
    left: [cx - hw, cy + hd, z0],
  }
  return {
    top: poly([T.back, T.right, T.front, T.left]),
    right: poly([T.right, B.right, B.front, T.front]), // +x facing face (screen right)
    left: poly([T.front, B.front, B.left, T.left]), // +y facing face (screen left)
  }
}

/**
 * World-space perimeter of a rounded rectangle centered (cx, cy),
 * half-width hw, half-depth hd, corner radius r. Clockwise in world XY,
 * corner arcs sampled with `seg` segments each.
 */
export function roundedOutline(cx, cy, hw, hd, r, seg = 5) {
  const pts = []
  const arc = (ccx, ccy, a0, a1) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + ((a1 - a0) * i) / seg
      pts.push([ccx + r * Math.cos(a), ccy + r * Math.sin(a)])
    }
  }
  const HP = Math.PI / 2
  // clockwise in world XY: back-right, front-right, front-left, back-left corners
  arc(cx + hw - r, cy - hd + r, -HP, 0)
  arc(cx + hw - r, cy + hd - r, 0, HP)
  arc(cx - hw + r, cy + hd - r, HP, Math.PI)
  arc(cx - hw + r, cy - hd + r, Math.PI, 1.5 * Math.PI)
  return pts
}

/** Closed path of a rounded rect outline at height z. */
export const roundedTopPath = (cx, cy, hw, hd, r, z) =>
  poly(roundedOutline(cx, cy, hw, hd, r).map(([x, y]) => [x, y, z]))

/**
 * Faces of a rounded-corner box (realistic enclosure shells).
 * Returns { top, side } — `side` is the single camera-facing wall band
 * running from the rightmost silhouette point through the front corners
 * to the leftmost silhouette point.
 */
export function roundedBoxFaces(cx, cy, hw, hd, h, z0 = 0, r = 10) {
  const zt = z0 + h
  const pts = roundedOutline(cx, cy, hw, hd, r)
  // silhouette extremes in screen-x: max(x−y) → right edge, min(x−y) → left edge
  let iMax = 0
  let iMin = 0
  pts.forEach(([x, y], i) => {
    if (x - y > pts[iMax][0] - pts[iMax][1]) iMax = i
    if (x - y < pts[iMin][0] - pts[iMin][1]) iMin = i
  })
  const chain = []
  for (let i = iMax; ; i = (i + 1) % pts.length) {
    chain.push(pts[i])
    if (i === iMin) break
  }
  const topChain = chain.map(([x, y]) => [x, y, zt])
  const botChain = [...chain].reverse().map(([x, y]) => [x, y, z0])
  return {
    top: poly(pts.map(([x, y]) => [x, y, zt])),
    side: poly([...topChain, ...botChain]),
  }
}
