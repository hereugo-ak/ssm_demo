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
