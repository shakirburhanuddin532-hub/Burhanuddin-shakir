import type { ReactNode } from 'react'
import type { WorldId } from '@/data/worlds'

/** Faceted stage frame shared by every demonstration (brief §28 centralisation). */
export function DemoFrame({ world = 'create', children, className = '' }: { world?: WorldId; children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative ${className}`}
      style={{ ['--w' as string]: `var(--world-${world})` }}
    >
      <svg className="pointer-events-none absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)]" aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100">
        <polygon points="2,0 98,0 100,2 100,98 98,100 2,100 0,98 0,2" fill="rgba(18,20,24,0.78)" stroke="var(--color-slate)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
        <polyline points="0,14 0,2 2,0 14,0" fill="none" stroke="var(--w)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" opacity="0.9" />
        <polyline points="86,100 98,100 100,98 100,86" fill="none" stroke="var(--w)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" opacity="0.9" />
      </svg>
      <span className="label pointer-events-none absolute top-3 right-4 z-10 text-[10px] opacity-50">Example</span>
      <div className="relative z-[1] h-full w-full">{children}</div>
    </div>
  )
}
