import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useStore } from '../store'

/**
 * Site-19 O5 Command Terminal boot sequence.
 *
 * Four beats, in order, SCP red on black:
 *   1. a segmented status bar — "INITIALIZING SECURE CHANNEL" — over a
 *      scrolling classified boot log;
 *   2. concentric reticle rings resolving to "SITE · 19" at the centre;
 *   3. a containment chamber schematic — top-down blueprint with monitoring
 *      array call-outs;
 *   4. the SCP Foundation emblem lighting up — three curved segments assembling
 *      inside the outer ring, which hands off to the live scene.
 *
 * Same single-clock architecture as the original: one interval reading wall
 * time advances every stage, so throttled tabs can't stall the sequence.
 */

/** Stage boundaries in milliseconds from power-on. */
const T = { rings: 2600, blueprint: 5200, emblem: 7200 }

const LOG = [
  'MOUNT O5-SECURE-VAULT',
  'AUTHENTICATE SITE CREDENTIALS ..... OK',
  'MEMETIC FILTER ACTIVE',
  'LOAD FOUNDATION PROTOCOLS ......... OK',
  'DEPLOY COGNITOHAZARD SHIELDING',
  'CHECKSUM ...................... OK',
]

type Stage = 'bar' | 'rings' | 'blueprint' | 'emblem'

export function Boot() {
  const phase = useStore((s) => s.phase)
  const reduced = useReducedMotion()
  const [t, setT] = useState(0)

  useEffect(() => {
    if (phase !== 'boot') {
      setT(0)
      return
    }
    const start = Date.now()
    setT(0)
    const id = setInterval(() => setT(Date.now() - start), 50)
    return () => clearInterval(id)
  }, [phase])

  if (phase !== 'boot') return null

  const stage: Stage =
    t >= T.emblem
      ? 'emblem'
      : t >= T.blueprint
        ? 'blueprint'
        : t >= T.rings
          ? 'rings'
          : 'bar'

  const logShown = Math.min(LOG.length, Math.floor((t / T.rings) * (LOG.length + 1)))
  const barPct = Math.min(1, t / (T.rings - 300))

  return (
    <AnimatePresence>
      <motion.div
        className="boot"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.8 }}
      >
        {/* ---- beat 1: classified boot log ---- */}
        <div className={`boot-bar ${stage !== 'bar' ? 'boot-bar-dim' : ''}`}>
          <div className="boot-bar-frame">
            <span className="boot-bar-title">
              INITIALIZING SECURE CHANNEL 1<span className="boot-dots">…</span>
              <span className="boot-cursor" />
            </span>
            <div className="boot-seg">
              {Array.from({ length: 22 }, (_, i) => (
                <span
                  key={i}
                  className="boot-seg-cell"
                  data-on={i / 22 < barPct ? '1' : '0'}
                />
              ))}
            </div>
          </div>
          <div className="boot-log">
            {LOG.slice(0, logShown).map((l) => (
              <div key={l} className="boot-log-line">
                {l}
              </div>
            ))}
          </div>
        </div>

        {/* ---- beats 2-4: centre stage ---- */}
        <div className="boot-stage">
          {stage === 'rings' && <Rings reduced={!!reduced} />}
          {stage === 'blueprint' && <Blueprint reduced={!!reduced} />}
          {stage === 'emblem' && <Emblem reduced={!!reduced} t={t - T.emblem} />}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ beat 2 */

/** Concentric reticle rings drawing inward, with "SITE · 19" resolving. */
function Rings({ reduced }: { reduced: boolean }) {
  const ease = 'easeOut'
  const ring = (r: number, delay: number, dash: string, w = 1) => (
    <motion.circle
      cx="0"
      cy="0"
      r={r}
      className="boot-ring"
      strokeDasharray={dash}
      strokeWidth={w}
      initial={reduced ? { opacity: 1 } : { opacity: 0, rotate: -40, scale: 1.15 }}
      animate={{ opacity: 1, rotate: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease }}
    />
  )
  return (
    <svg className="boot-rings" viewBox="-160 -160 320 320">
      <g>
        {ring(150, 0.0, '3 6')}
        {ring(128, 0.08, '40 8 12 8', 1.4)}
        {ring(104, 0.16, '2 4')}
        {ring(84, 0.24, '30 6 6 6', 1.6)}
        {ring(60, 0.34, '1 3')}
      </g>
      <motion.text
        x="0"
        y="6"
        className="boot-name"
        initial={reduced ? { opacity: 1 } : { opacity: 0, letterSpacing: '1.4em' }}
        animate={{ opacity: 1, letterSpacing: '0.42em' }}
        transition={{ duration: 0.7, delay: 0.5, ease }}
      >
        SITE · 19
      </motion.text>
    </svg>
  )
}

/* ------------------------------------------------------------------ beat 3 */

/**
 * Containment chamber schematic — a top-down blueprint of a rectangular
 * chamber with blast-door entry and four corner monitoring arrays, using the
 * same wireframe call-out language as the original suit schematic.
 */
function Blueprint({ reduced }: { reduced: boolean }) {
  const delay = (n: number) => ({ duration: 0.5, delay: 0.3 + n * 0.1 })
  const fade = reduced ? { opacity: 1 } : { opacity: 0, x: 0, y: 10 }

  return (
    <svg className="boot-suit" viewBox="-200 -150 400 300">
      {/* Main chamber walls */}
      <motion.g
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Outer walls */}
        <motion.path
          className="boot-wire"
          d="M-80,-100 L80,-100 L80,100 L-80,100 Z"
          fill="none"
          initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
        {/* Inner room boundary */}
        <path
          className="boot-wire boot-wire-dim"
          d="M-52,-72 L52,-72 L52,72 L-52,72 Z"
          fill="none"
        />
        {/* Blast door — entry side (top) */}
        <path className="boot-wire" d="M-80,-100 L-80,-118 L80,-118 L80,-100" fill="none" />
        <path
          className="boot-wire boot-wire-dim"
          d="M-20,-100 L-20,-118 M20,-100 L20,-118"
        />
        {/* Centre crosshair */}
        <circle className="boot-wire" cx="0" cy="0" r="12" fill="none" />
        <path className="boot-wire boot-wire-dim" d="M0,-12 L0,12 M-12,0 L12,0" />
      </motion.g>

      {/* Corner monitoring arrays */}
      {([
        { x: -120, y: -80, lx: -94, tx: -130, ty: -104, label: 'MON / A' },
        { x:  120, y: -80, lx:  52, tx:  100, ty: -104, label: 'MON / B' },
        { x: -120, y:  80, lx: -94, tx: -130, ty:  106, label: 'PWR / C' },
        { x:  120, y:  80, lx:  52, tx:  100, ty:  106, label: 'PWR / D' },
      ] as const).map(({ x, y, lx, tx, ty, label }, i) => (
        <motion.g
          key={label}
          initial={fade}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={delay(i)}
        >
          <circle
            className="boot-wire"
            cx={x}
            cy={y}
            r="20"
            fill="none"
            strokeDasharray="22 5 5 5"
          />
          <circle className="boot-wire boot-wire-dim" cx={x} cy={y} r="10" fill="none" />
          <circle className="boot-wire" cx={x} cy={y} r="2" fill="none" />
          {/* Line from callout to inner chamber */}
          <path
            className="boot-wire boot-wire-dim"
            d={`M${lx},${y} L${x > 0 ? 52 : -52},${y}`}
          />
          <text x={tx} y={ty} className="boot-tag">
            {label}
          </text>
        </motion.g>
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ beat 4 */

/**
 * SCP Foundation emblem — three curved segments lighting up clockwise inside
 * the outer ring. Same `--glow` mechanic as the original arc reactor; the
 * segments sweep in as glow increases toward 1.
 *
 * Blade geometry: each of the three arms is a curved wedge spanning ~110° of
 * arc, with a pointed leading edge at the CCW tip. Outer radius 52, inner 22.
 * Three copies rotated 0°/120°/240° form the recognised three-arrow mark.
 */
function Emblem({ reduced, t }: { reduced: boolean; t: number }) {
  const glow = reduced ? 1 : Math.min(1, Math.max(0, t / 1400))
  const seg = Array.from({ length: 16 }, (_, i) => i)

  // One SCP blade: pointed at bearing -60° (top-left), body arcing to +50°.
  // Outer arc r=52, inner arc r=22, all measured from SVG origin.
  const blade =
    'M 40,-33 A 52,52 0 0,0 -45,-26 L -17,-14 A 22,22 0 0,0 17,-14 Z'

  return (
    <svg
      className="boot-reactor"
      viewBox="-120 -120 240 240"
      style={{ ['--glow' as string]: glow }}
    >
      {/* Outer ring segments light up as glow advances */}
      {seg.map((i) => {
        const a = (i / seg.length) * Math.PI * 2 - Math.PI / 2
        const on = i / seg.length < glow * 1.05
        return (
          <line
            key={i}
            x1={Math.cos(a) * 70}
            y1={Math.sin(a) * 70}
            x2={Math.cos(a) * 100}
            y2={Math.sin(a) * 100}
            className={on ? 'boot-r-seg boot-r-on' : 'boot-r-seg'}
          />
        )
      })}

      <circle className="boot-r-ring" cx="0" cy="0" r="102" />
      <circle className="boot-r-ring boot-r-ring-in" cx="0" cy="0" r="66" />

      {/* SCP Foundation three-segment emblem */}
      <g
        style={{
          opacity: glow,
          filter: `drop-shadow(0 0 ${8 * glow}px var(--accent))`,
        }}
      >
        {[0, 120, 240].map((deg) => (
          <path
            key={deg}
            d={blade}
            className="boot-scp-seg"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
    </svg>
  )
}
