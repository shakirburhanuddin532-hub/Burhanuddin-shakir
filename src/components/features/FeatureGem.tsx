import { WORLD_RGB } from '@/lowpoly/palette'
import type { WorldId } from '@/data/worlds'
import { FeatureIcon } from './icons/FeatureIcon'

const rgb = (c: [number, number, number], f: number) =>
  `rgb(${Math.min(255, c[0] * f) | 0},${Math.min(255, c[1] * f) | 0},${Math.min(255, c[2] * f) | 0})`

/** A low-poly gem: eight facets sharing the center, three tones of the world hue. */
export function FeatureGem({ world, slug, size = 56, halo = false }: { world: WorldId; slug: string; size?: number; halo?: boolean }) {
  const c = WORLD_RGB[world]
  const pts = [
    [50, 4],
    [86, 22],
    [96, 58],
    [74, 92],
    [34, 96],
    [8, 70],
    [10, 30],
    [30, 10],
  ]
  const tones = [1.18, 0.86, 1.0, 1.1, 0.8, 1.0, 1.2, 0.9]
  return (
    <span className="gem-wrap relative inline-block" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="gem" aria-hidden="true">
        {halo && <circle cx="50" cy="50" r="48" fill="none" stroke={rgb(c, 1)} strokeWidth="1" opacity="0.3" />}
        {pts.map((p, i) => {
          const q = pts[(i + 1) % pts.length]
          return <polygon key={i} points={`50,50 ${p[0]},${p[1]} ${q[0]},${q[1]}`} fill={rgb(c, tones[i])} stroke="rgba(242,241,236,0.18)" strokeWidth="0.8" />
        })}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-ink/90">
        <FeatureIcon slug={slug} size={Math.round(size * 0.34)} />
      </span>
    </span>
  )
}
