export interface NavItem {
  label: string
  /** anchor id of the home scene it seeks to */
  target: string
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Features', target: 'universe' },
  { label: 'Shakir One', target: 'shakir-one' },
  { label: 'Security', target: 'trust' },
]

export const NAV_CTA = { label: 'Enter Shakir', target: 'create' }

export const SCENE_RAIL: { id: string; label: string }[] = [
  { id: 'hero', label: 'Shakir' },
  { id: 'system', label: 'One system' },
  { id: 'chat', label: 'Chat' },
  { id: 'universe', label: 'Features' },
  { id: 'engine', label: 'Engine' },
  { id: 'shakir-one', label: 'Shakir One' },
  { id: 'trust', label: 'Trust' },
  { id: 'create', label: 'Create' },
]

export const FOOTER_COLUMNS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Product',
    items: [
      { label: 'Features', target: 'universe' },
      { label: 'Shakir One', target: 'shakir-one' },
      { label: 'Pricing', target: 'create' },
    ],
  },
  {
    title: 'Trust',
    items: [
      { label: 'Security', target: 'trust' },
      { label: 'Privacy', target: 'trust' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Developers', target: 'create' },
      { label: 'Contact', target: 'create' },
    ],
  },
]
