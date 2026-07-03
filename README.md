# SUTRA — Six Sense Mobility Hero System

Marketing-site hero for the **SSM TCU-01** — an AIS-140 certified Telematics
Control Unit with private mesh connectivity and edge intelligence.

Built to the full spec in [`SUTRA-hero-system.md`](./SUTRA-hero-system.md).

## The signature element (§1)

A precision, engineering-drawing-grade **exploded isometric view of the
product itself**, hand-coded as SVG (no Lottie, no raster, no 3D renders):

1. GNSS + LTE mesh antenna puck
2. Die-cast enclosure lid (IP67)
3. Perforated EMI shield
4. Edge SoC · CAN transceiver · eSIM · supercap
5. 6-layer PCB with copper traces + AIS-140 I/O connector
6. Aluminium base tray with vibration mounts

Scrolling pins the hero for 180vh and scrubs the device apart layer by layer,
1:1 with scroll position, revealing numbered engineering callouts — then
re-assembles it for the handoff.

## Stack

- React 19 + Vite
- Framer Motion — ASSEMBLE entrance + idle loops (§5, §6)
- GSAP ScrollTrigger — pinned scrub choreography (§7)
- Design tokens as CSS variables (§2.1) — light default, dark via `data-theme`
- Bricolage Grotesque / Inter / JetBrains Mono (§2.2)

## Run

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
```

## Spec compliance

- Zero hex values outside `src/components/hero/tokens.css`
- Copy verbatim from §11 (card-internal telemetry readouts flagged as suggestions)
- transform/opacity-only animation (§13)
- `prefers-reduced-motion` → static assembled device, no pin, opacity fades only
- Mobile (<768px) → assembly above text, no pin/tilt, simple fade/slide reveals
- §14 anti-pattern checklist verified item-by-item
