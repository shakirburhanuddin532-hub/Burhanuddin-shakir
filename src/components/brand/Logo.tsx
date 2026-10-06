const BASE = import.meta.env.BASE_URL

/** The official logo asset, keyed out from its white backdrop; never redrawn or stretched. */
export const LOGO_SRC = {
  full: `${BASE}brand/shakir-logo.png`,
  md: `${BASE}brand/shakir-logo-512.png`,
  sm: `${BASE}brand/shakir-logo-256.png`,
  xs: `${BASE}brand/shakir-logo-96.png`,
}
/** intrinsic aspect of the cut-out (492 × 1014) */
export const LOGO_ASPECT = 492 / 1014

export interface LogoProps {
  /** rendered height in px (width follows the intrinsic ratio) */
  height?: number
  className?: string
  priority?: boolean
  /** decorative when the wordmark sits next to it */
  decorative?: boolean
  style?: React.CSSProperties
}

export function Logo({ height = 40, className, priority, decorative, style }: LogoProps) {
  const src = height <= 48 ? LOGO_SRC.xs : height <= 128 ? LOGO_SRC.sm : height <= 320 ? LOGO_SRC.md : LOGO_SRC.full
  return (
    <img
      src={src}
      width={Math.round(height * LOGO_ASPECT)}
      height={height}
      alt={decorative ? '' : 'Shakir AI logo: a faceted hand making a victory sign, wearing a crown'}
      aria-hidden={decorative ? true : undefined}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      draggable={false}
      className={className}
      style={{ height, width: 'auto', ...style }}
    />
  )
}

export function Wordmark({ className, size = 13 }: { className?: string; size?: number }) {
  return (
    <span
      className={`font-display font-semibold whitespace-nowrap uppercase ${className ?? ''}`}
      style={{ fontSize: size, letterSpacing: '0.3em' }}
    >
      SHAKIR AI
    </span>
  )
}
