/** 21 glyphs cut from one triangular lattice; distinct per feature, one family. */
const PATHS: Record<string, string> = {
  'chat-ai': 'M4 5h16l-2 10H9l-5 4z',
  'study-ai': 'M3 6l9-2v14l-9 2zM12 4l9 2v14l-9-2z',
  'skill-ai': 'M12 3l3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1z',
  'research-ai': 'M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm5 10l5 5',
  'image-ai': 'M3 19l6-9 4 5 3-3 5 7zM17 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  'code-ai': 'M9 6l-6 6 6 6M15 6l6 6-6 6',
  'website-builder-ai': 'M3 4h18v16H3zM3 9h18M8 9v11',
  'video-ai': 'M6 4l14 8-14 8z',
  'video-search-ai': 'M4 5l12 7-12 7zM17 12h4',
  'writing-document-ai': 'M4 20l3-9 9-9 6 6-9 9zM4 20l5-1',
  'truth-verify-ai': 'M12 3l8 3v6c0 5-3 8-8 9-5-1-8-4-8-9V6zM8 12l3 3 5-6',
  'business-ai': 'M3 20h18M5 16l4-5 4 3 6-8',
  'goal-to-action-ai': 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 2v4',
  'agent-ai': 'M4 8h7v8H4zM13 8h7v8h-7zM10 12h4',
  'medical-support-ai': 'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z',
  'offline-ai': 'M4 12a8 8 0 0 1 14-5M20 12a8 8 0 0 1-14 5M3 3l18 18',
  'privacy-security-ai': 'M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3',
  'human-talent-ai': 'M9 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM3 20c0-4 3-6 6-6s6 2 6 6zM17 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM15 14c3 0 6 2 6 6',
  'marketing-content-ai': 'M3 10v4h4l8 5V5l-8 5zM18 9a4 4 0 0 1 0 6',
  'automation-ai': 'M3 12h5M11 12h5M19 12h2M8 9v6l3-3zM16 9v6l3-3z',
  'live-ai': 'M3 5h18v12H3zM8 21h8M17 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
}

export function FeatureIcon({ slug, size = 16, className }: { slug: string; size?: number; className?: string }) {
  const d = PATHS[slug] ?? PATHS['chat-ai']
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  )
}
