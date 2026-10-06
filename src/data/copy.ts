export const COPY = {
  brand: { name: 'SHAKIR AI', tagline: 'One intelligent system for creation, learning, research, building, automation and action.' },
  intro: { skip: 'Skip' },
  hero: {
    eyebrow: 'Shakir AI',
    h1: ['ONE INTELLIGENCE.', 'LIMITLESS POSSIBILITIES.'],
    supporting: 'Create. Learn. Research. Build. Automate.',
    primary: 'Enter Shakir',
    secondary: 'Explore features',
    scroll: 'Scroll',
  },
  system: {
    phaseA: 'NOT A COLLECTION OF TOOLS.',
    phaseB: 'ONE INTELLIGENT SYSTEM.',
    supporting:
      'Creation, learning, research, building, automation and action, connected, so each capability can hand work to the next.',
  },
  chat: {
    eyebrow: 'Chat AI',
    h2: 'SAY WHAT YOU NEED.',
    supporting: 'Shakir reads the request, then brings in the capabilities the job calls for.',
    takeaway: 'One request. Five capabilities, in the right order, with you approving the next step.',
  },
  universe: {
    eyebrow: 'Twenty-one capabilities',
    h2: ['TWENTY-ONE CAPABILITIES.', 'SIX WORLDS.', 'ONE CENTER.'],
    supporting:
      'Every capability belongs to a world, and every world connects through Chat and Shakir One. Open a node to see what it does and what it works with.',
    listToggle: 'View as list',
    gridToggle: 'View as constellation',
  },
  engine: {
    eyebrow: 'The creation engine',
    h2: 'THE SAME ENGINE BEHIND EVERY CAPABILITY.',
    supporting: 'Eight demonstrations of real work, each shown step by step. All of them are illustrative.',
  },
  shakirOne: {
    eyebrow: 'Shakir One',
    h2: 'ONE SHAKIR.',
    message: ['You ask.', 'Shakir figures out what comes next.'],
    supporting:
      'Twenty-one capabilities. One system that reads the request, chooses what it needs, runs it in order and checks the result before it reaches you.',
    pipeline: [
      { label: 'User request', caption: 'Summarize this contract and draft a reply.' },
      { label: 'Shakir One', caption: 'One entry point.' },
      { label: 'Understand', caption: 'Two jobs: read, then write. The reply depends on the summary.' },
      { label: 'Route', caption: 'Research AI first, Writing + Document AI second. Nothing else.' },
      { label: 'Create / Research / Build / Act', caption: 'Research reads the contract. Create drafts the reply in your tone.' },
      { label: 'Verify', caption: 'Checks every figure in the reply against the contract.' },
      { label: 'Result', caption: 'Summary, draft reply, and the three clauses worth a second look.' },
    ],
  },
  trust: {
    eyebrow: 'Trust',
    h2: 'POWER WITH CONTROL.',
    lead: 'Shakir can do a great deal. It does it inside limits you set, with results you can check and actions you approve.',
    items: [
      { title: 'Permissions', text: 'Shakir asks before it reaches your files, screen or accounts. Each permission is scoped to a task and can be withdrawn.' },
      { title: 'Privacy', text: 'Your work stays your work. You decide what Shakir can see, and what it keeps.' },
      { title: 'Verification', text: 'Results are checked before they are presented: code is tested, claims are sourced, actions are confirmed.' },
      { title: 'User approval', text: 'Anything that changes something, sending, buying, publishing, editing your screen, waits for your go-ahead.' },
      { title: 'Security', text: 'Access is scoped, logged and reviewable, and the same care applies to what you build and share.' },
      { title: 'Transparency', text: 'Shakir shows what it did, which capability did it and why, so every step can be reviewed.' },
    ],
  },
  cta: {
    h2: 'WHAT WILL YOU CREATE?',
    primary: 'Enter Shakir',
    secondary: 'Explore Shakir',
    note: 'Access opens in stages. Leave your email and we will write when your seat is ready.',
  },
  footer: {
    legal: ['Terms', 'Privacy policy', 'Cookies'],
  },
} as const
