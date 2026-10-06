import { describe, expect, it } from 'vitest'
import { FEATURES, featureBySlug } from '../features'
import { WORLDS } from '../worlds'
import { CHAT_DEMO, DEMOS } from '../demos'

describe('feature data (brief §10)', () => {
  it('has exactly the 21 capabilities, numbered 01–21 in order', () => {
    expect(FEATURES).toHaveLength(21)
    FEATURES.forEach((f, i) => {
      expect(f.number).toBe(i + 1)
      expect(f.id).toBe(String(i + 1).padStart(2, '0'))
    })
  })
  it('uses unique slugs and names', () => {
    expect(new Set(FEATURES.map((f) => f.slug)).size).toBe(21)
    expect(new Set(FEATURES.map((f) => f.name)).size).toBe(21)
  })
  it('places every feature in a known world, with Chat AI alone at the center', () => {
    const ids = new Set(WORLDS.map((w) => w.id))
    for (const f of FEATURES) expect(ids.has(f.world)).toBe(true)
    expect(FEATURES.filter((f) => f.world === 'center').map((f) => f.slug)).toEqual(['chat-ai'])
    expect(FEATURES.filter((f) => f.world === 'create')).toHaveLength(5)
    expect(FEATURES.filter((f) => f.world === 'trust')).toHaveLength(4)
    expect(FEATURES.filter((f) => f.world === 'human')).toHaveLength(1)
  })
  it('only connects to features that exist, never to itself', () => {
    for (const f of FEATURES) {
      expect(f.connections.length).toBeGreaterThanOrEqual(2)
      for (const c of f.connections) {
        expect(featureBySlug(c), `${f.slug} → ${c}`).toBeDefined()
        expect(c).not.toBe(f.slug)
      }
    }
  })
  it('gives the nine brief demonstrations (§12–§20) a cinematic demo', () => {
    const cinematic = FEATURES.filter((f) => f.tier === 'cinematic').map((f) => f.demo)
    expect(cinematic.sort()).toEqual(['automation', 'business', 'chat', 'code', 'image', 'live', 'skill', 'video', 'website-builder'])
  })
  it('keeps the content rule: no hype words in blurbs or descriptions', () => {
    const banned = /world'?s #1|guaranteed|instantly|master anything|perfect/i
    for (const f of FEATURES) {
      expect(f.blurb).not.toMatch(banned)
      expect(f.description).not.toMatch(banned)
    }
  })
  it('registers every cinematic demo with its brief step chain', () => {
    const all = [CHAT_DEMO, ...DEMOS]
    expect(all.map((d) => d.key).sort()).toEqual(['automation', 'business', 'chat', 'code', 'image', 'live', 'skill', 'video', 'website-builder'])
    const byKey = Object.fromEntries(all.map((d) => [d.key, d.steps]))
    expect(byKey['website-builder']).toEqual(['Prompt', 'Shakir understands', 'Design system', 'Components appear', 'Images appear', 'Copy appears', 'Animations activate', 'Responsive preview', 'Website complete'])
    expect(byKey.code).toEqual(['Prompt', 'Code', 'Test', 'Error', 'Fix', 'Pass', 'Preview'])
    expect(byKey.skill).toHaveLength(7)
    expect(byKey.business).toEqual(['Idea', 'Market', 'Customer', 'Positioning', 'Website', 'Content', 'Campaign', 'Analytics'])
    expect(byKey.automation).toEqual(['Trigger', 'Condition', 'Action', 'Action', 'Verify', 'Complete'])
    for (const d of all) expect(d.lengthVh).toBeGreaterThanOrEqual(140)
  })
})
