import type { WorldId } from './worlds'

export type DemoTier = 'cinematic' | 'preview' | 'card'
export type DemoKey =
  | 'chat'
  | 'website-builder'
  | 'image'
  | 'video'
  | 'code'
  | 'skill'
  | 'business'
  | 'automation'
  | 'live'

export interface Feature {
  /** two-digit id from the brief, '01'…'21' */
  id: string
  number: number
  slug: string
  name: string
  shortName: string
  world: WorldId
  blurb: string
  description: string
  /** how Shakir One routes to it */
  inOne: string
  connections: string[]
  tier: DemoTier
  demo?: DemoKey
  /** degrees clockwise from 12 o'clock on the desktop constellation */
  angle: number
  /** optional note shown in the detail view (e.g. medical disclaimer) */
  note?: string
}

export const FEATURES: Feature[] = [
  {
    id: '01',
    number: 1,
    slug: 'chat-ai',
    name: 'Chat AI',
    shortName: 'Chat AI',
    world: 'center',
    blurb: 'Where every request starts, and where Shakir decides what comes next.',
    description:
      'Say what you need in plain language. Chat AI reads the request, asks only when something is unclear, and brings in the capabilities the job calls for.',
    inOne: 'Every request enters here; Shakir One routes it from this point.',
    connections: ['research-ai', 'writing-document-ai', 'goal-to-action-ai', 'agent-ai'],
    tier: 'cinematic',
    demo: 'chat',
    angle: 0,
  },
  {
    id: '02',
    number: 2,
    slug: 'study-ai',
    name: 'Study AI',
    shortName: 'Study AI',
    world: 'learn',
    blurb: 'Turns your material into a plan, clear explanations and practice at your pace.',
    description:
      'Give Study AI your notes, slides or a syllabus. It builds a plan around your deadline, explains each topic plainly and checks understanding with practice questions.',
    inOne: 'Routed when a request is about learning material you already have.',
    connections: ['skill-ai', 'research-ai', 'video-search-ai', 'writing-document-ai'],
    tier: 'preview',
    angle: 95,
  },
  {
    id: '03',
    number: 3,
    slug: 'skill-ai',
    name: 'Skill AI',
    shortName: 'Skill AI',
    world: 'learn',
    blurb: 'Teaches a skill in seven structured lessons, from foundation to a final project.',
    description:
      'Skill AI follows a fixed seven-lesson arc for any skill: foundation, core concepts, demonstration, guided practice, common mistakes, advanced application and a final project you actually make.',
    inOne: 'Routed when the goal is to be able to do something new.',
    connections: ['study-ai', 'video-ai', 'human-talent-ai'],
    tier: 'cinematic',
    demo: 'skill',
    angle: 113,
  },
  {
    id: '04',
    number: 4,
    slug: 'research-ai',
    name: 'Research AI',
    shortName: 'Research AI',
    world: 'learn',
    blurb: 'Gathers sources, compares them and writes up what holds, with citations you can check.',
    description:
      'Research AI collects sources, weighs them against each other and writes a synthesis that says what is supported, what is disputed and what is still unknown.',
    inOne: 'Routed first whenever an answer depends on facts that need sources.',
    connections: ['truth-verify-ai', 'writing-document-ai', 'business-ai', 'study-ai'],
    tier: 'preview',
    angle: 59,
  },
  {
    id: '05',
    number: 5,
    slug: 'image-ai',
    name: 'Image AI + Image Search',
    shortName: 'Image AI',
    world: 'create',
    blurb: 'Creates images from a description, offers variations, and finds existing images by meaning.',
    description:
      'Describe the image you want and Image AI composes it, then offers directions to choose from. Image Search finds existing images by what they show, not just their file names.',
    inOne: 'Routed when the result needs a picture, new or found.',
    connections: ['website-builder-ai', 'marketing-content-ai', 'video-ai'],
    tier: 'cinematic',
    demo: 'image',
    angle: -20,
  },
  {
    id: '06',
    number: 6,
    slug: 'code-ai',
    name: 'Code AI',
    shortName: 'Code AI',
    world: 'create',
    blurb: 'Writes code, runs the tests, fixes what fails and shows the passing result.',
    description:
      'Code AI does not stop at printing code. It writes the change, runs the tests, reads the failure, fixes the cause and shows you the passing run before the preview.',
    inOne: 'Routed when a request needs working code; always followed by a test run.',
    connections: ['website-builder-ai', 'automation-ai', 'agent-ai'],
    tier: 'cinematic',
    demo: 'code',
    angle: 20,
  },
  {
    id: '07',
    number: 7,
    slug: 'website-builder-ai',
    name: 'Website Builder AI',
    shortName: 'Website Builder',
    world: 'create',
    blurb: 'Builds a complete, responsive website from one sentence: system, components, copy, images.',
    description:
      'From a single sentence, Website Builder AI derives a design system, assembles components, writes the copy, places images and checks the layout at three breakpoints.',
    inOne: 'Routed when the outcome is a site people can visit.',
    connections: ['code-ai', 'image-ai', 'writing-document-ai', 'business-ai'],
    tier: 'cinematic',
    demo: 'website-builder',
    angle: 0,
  },
  {
    id: '08',
    number: 8,
    slug: 'video-ai',
    name: 'Video AI',
    shortName: 'Video AI',
    world: 'create',
    blurb: 'Takes an idea through script, storyboard and scenes to a finished video.',
    description:
      'Video AI works like a production: idea, script, storyboard, scenes, then the render. You can change any stage before the video is made.',
    inOne: 'Routed when the result is moving pictures.',
    connections: ['image-ai', 'writing-document-ai', 'marketing-content-ai', 'video-search-ai'],
    tier: 'cinematic',
    demo: 'video',
    angle: -40,
  },
  {
    id: '09',
    number: 9,
    slug: 'video-search-ai',
    name: 'Video Search AI',
    shortName: 'Video Search',
    world: 'learn',
    blurb: 'Finds the exact moment inside hours of video from a plain-language question.',
    description:
      'Ask for the moment, not the timestamp. Video Search AI reads what is said and shown across hours of footage and jumps to the segment that answers you.',
    inOne: 'Routed when the answer is somewhere inside a recording.',
    connections: ['video-ai', 'study-ai', 'research-ai'],
    tier: 'card',
    angle: 77,
  },
  {
    id: '10',
    number: 10,
    slug: 'writing-document-ai',
    name: 'Writing + Document AI',
    shortName: 'Writing AI',
    world: 'create',
    blurb: 'Drafts, edits and structures writing in your voice, from a note to a full report.',
    description:
      'Writing + Document AI drafts in your tone, restructures long documents and keeps formatting intact, whether the output is a message, a brief or a formal report.',
    inOne: 'Routed when the result is text someone will read.',
    connections: ['research-ai', 'business-ai', 'marketing-content-ai', 'chat-ai'],
    tier: 'preview',
    angle: 40,
  },
  {
    id: '11',
    number: 11,
    slug: 'truth-verify-ai',
    name: 'Truth & Verify AI',
    shortName: 'Truth & Verify',
    world: 'trust',
    blurb: 'Checks claims against sources and shows what is supported, disputed or unknown.',
    description:
      'Truth & Verify AI tests a claim against sources and returns a verdict with its evidence: supported, disputed or not enough evidence. It never pretends to certainty it does not have.',
    inOne: 'Runs inside the verify step whenever a result contains claims.',
    connections: ['research-ai', 'chat-ai', 'medical-support-ai', 'writing-document-ai'],
    tier: 'preview',
    angle: 301,
  },
  {
    id: '12',
    number: 12,
    slug: 'business-ai',
    name: 'Business AI',
    shortName: 'Business AI',
    world: 'build',
    blurb: 'Carries one idea from market and customer through positioning, content, campaign and analytics.',
    description:
      'Business AI keeps one idea in one connected workspace: market, customer, positioning, website, content, campaign and analytics, each stage feeding the next.',
    inOne: 'Routed when a request is about making an idea work commercially.',
    connections: ['marketing-content-ai', 'website-builder-ai', 'goal-to-action-ai', 'research-ai'],
    tier: 'cinematic',
    demo: 'business',
    angle: 146,
  },
  {
    id: '13',
    number: 13,
    slug: 'goal-to-action-ai',
    name: 'Goal-to-Action AI',
    shortName: 'Goal-to-Action',
    world: 'build',
    blurb: 'Turns a goal into milestones, tasks and a first next action, then tracks them with you.',
    description:
      'State the goal. Goal-to-Action AI breaks it into milestones and tasks with dates, picks the first concrete action and keeps the plan current as things change.',
    inOne: 'Routed when the request is a goal rather than a task.',
    connections: ['business-ai', 'agent-ai', 'automation-ai', 'study-ai'],
    tier: 'preview',
    angle: 130,
  },
  {
    id: '14',
    number: 14,
    slug: 'agent-ai',
    name: 'Agent AI',
    shortName: 'Agent AI',
    world: 'act',
    blurb: 'Carries out multi-step tasks for you and pauses for approval at every consequential step.',
    description:
      'Agent AI plans the steps, does the ones that are safe to do, and stops to ask before anything that changes something outside the conversation.',
    inOne: 'Routed when the request needs several steps carried out in order.',
    connections: ['automation-ai', 'live-ai', 'code-ai', 'goal-to-action-ai'],
    tier: 'preview',
    angle: 198,
  },
  {
    id: '15',
    number: 15,
    slug: 'medical-support-ai',
    name: 'Medical Support AI',
    shortName: 'Medical Support',
    world: 'trust',
    blurb: 'Helps you understand health information and prepare for care conversations.',
    description:
      'Medical Support AI explains reports and terms in plain language and helps you prepare questions for your clinician. It supports care decisions; it does not make them.',
    inOne: 'Routed with extra verification whenever a request touches health.',
    connections: ['truth-verify-ai', 'research-ai', 'privacy-security-ai'],
    tier: 'card',
    angle: 283,
    note: 'Shakir helps you understand and prepare. Care decisions stay with you and your clinician.',
  },
  {
    id: '16',
    number: 16,
    slug: 'offline-ai',
    name: 'Offline AI',
    shortName: 'Offline AI',
    world: 'trust',
    blurb: 'Keeps selected capabilities working without a connection, with that work staying on your device.',
    description:
      'Offline AI keeps a set of capabilities available when there is no connection. Work done offline stays on the device until you choose otherwise.',
    inOne: 'Takes over automatically when the connection drops.',
    connections: ['privacy-security-ai', 'writing-document-ai', 'code-ai'],
    tier: 'card',
    angle: 265,
  },
  {
    id: '17',
    number: 17,
    slug: 'privacy-security-ai',
    name: 'Privacy & Security AI',
    shortName: 'Privacy & Security',
    world: 'trust',
    blurb: 'Scoped permissions, encryption and a visible record of what Shakir accessed and why.',
    description:
      'Privacy & Security AI scopes every permission to a task, keeps a readable record of every access and applies the same care to what you build and share.',
    inOne: 'Present on every route; it decides what Shakir may touch.',
    connections: ['offline-ai', 'live-ai', 'agent-ai', 'medical-support-ai'],
    tier: 'card',
    angle: 247,
  },
  {
    id: '18',
    number: 18,
    slug: 'human-talent-ai',
    name: 'Human Talent AI',
    shortName: 'Human Talent',
    world: 'human',
    blurb: 'Matches skills to roles and teams, and maps the path from where you are to where you want to be.',
    description:
      'Human Talent AI reads skills, not just titles. It matches people to roles and teams, and shows the path between a current role and the next one.',
    inOne: 'Routed when the request is about people and their paths.',
    connections: ['skill-ai', 'business-ai', 'marketing-content-ai'],
    tier: 'card',
    angle: 180,
  },
  {
    id: '19',
    number: 19,
    slug: 'marketing-content-ai',
    name: 'Marketing & Content Creator AI',
    shortName: 'Marketing AI',
    world: 'build',
    blurb: 'Plans and produces campaign content across channels, consistent with one brand voice.',
    description:
      'Marketing & Content Creator AI turns one message into a campaign: posts, emails, product pages and schedules, all in the same brand voice.',
    inOne: 'Routed when the result must reach an audience.',
    connections: ['business-ai', 'writing-document-ai', 'image-ai', 'video-ai'],
    tier: 'preview',
    angle: 162,
  },
  {
    id: '20',
    number: 20,
    slug: 'automation-ai',
    name: 'Automation AI',
    shortName: 'Automation AI',
    world: 'act',
    blurb: 'Builds workflows you can see, trigger to action, and verifies each run before calling it complete.',
    description:
      'Automation AI builds workflows as readable steps: trigger, condition, actions, verification. Every run shows the branch it took and is checked before it is marked complete.',
    inOne: 'Routed when the same work should happen every time a condition is met.',
    connections: ['agent-ai', 'code-ai', 'business-ai'],
    tier: 'cinematic',
    demo: 'automation',
    angle: 214,
  },
  {
    id: '21',
    number: 21,
    slug: 'live-ai',
    name: 'Live AI / Screen & Device AI',
    shortName: 'Live AI',
    world: 'act',
    blurb: 'Sees only what you share, guides first, and acts only with your approval, with a visible LIVE indicator.',
    description:
      'Live AI looks at the screen or device you choose to share, explains what it sees, guides you, and performs an action only after you authorize it. A LIVE indicator stays visible the whole time.',
    inOne: 'Routed only with your permission, for work that happens on your screen.',
    connections: ['agent-ai', 'privacy-security-ai', 'code-ai', 'automation-ai'],
    tier: 'cinematic',
    demo: 'live',
    angle: 230,
  },
]

export const featureBySlug = (slug: string): Feature | undefined => FEATURES.find((f) => f.slug === slug)
export const featureIndex = (slug: string): number => FEATURES.findIndex((f) => f.slug === slug)
export const featuresInWorld = (world: WorldId): Feature[] =>
  FEATURES.filter((f) => f.world === world).sort((a, b) => a.angle - b.angle)
