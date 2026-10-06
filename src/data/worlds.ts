export type WorldId = 'center' | 'create' | 'learn' | 'build' | 'human' | 'act' | 'trust'

export interface World {
  id: WorldId
  name: string
  meaning: string
  /** degrees clockwise from 12 o'clock on the desktop constellation */
  arcStart: number
  arcEnd: number
  order: number
}

export const WORLDS: World[] = [
  {
    id: 'center',
    name: 'Chat + Shakir One',
    meaning: 'Where every request starts, and where Shakir decides what comes next.',
    arcStart: 0,
    arcEnd: 0,
    order: 0,
  },
  { id: 'create', name: 'Create', meaning: 'Make things: images, video, words, websites, code.', arcStart: -50, arcEnd: 50, order: 1 },
  { id: 'learn', name: 'Learn', meaning: 'Study, build a skill, find what holds up.', arcStart: 50, arcEnd: 122, order: 2 },
  { id: 'build', name: 'Build & Grow', meaning: 'Take an idea to market and keep it moving.', arcStart: 122, arcEnd: 170, order: 3 },
  { id: 'human', name: 'Human', meaning: 'Match people, skills and paths.', arcStart: 170, arcEnd: 190, order: 4 },
  { id: 'act', name: 'Act', meaning: 'Carry out work, with your approval at every consequential step.', arcStart: 190, arcEnd: 238, order: 5 },
  { id: 'trust', name: 'Trust', meaning: 'Verification, privacy, offline work and careful support.', arcStart: 238, arcEnd: 310, order: 6 },
]

export const worldById = (id: WorldId): World => WORLDS.find((w) => w.id === id)!
export const worldVar = (id: WorldId) => `var(--world-${id})`
export const worldTextVar = (id: WorldId) => `var(--world-${id}-text)`
