import type { ComponentType } from 'react'
import type { DemoKey } from './features'
import type { DemoProps } from '@/components/demonstrations/demoTypes'

export interface DemoEntry {
  key: DemoKey
  anchor: string
  featureSlug: string
  eyebrow: string
  title: string
  supporting: string
  takeaway: string
  steps: readonly string[]
  /** desktop pin distance in vh when scrubbed */
  lengthVh: number
  load: () => Promise<{ default: ComponentType<DemoProps> }>
}

export const DEMOS: DemoEntry[] = [
  {
    key: 'website-builder',
    anchor: 'engine-website',
    featureSlug: 'website-builder-ai',
    eyebrow: 'Website Builder AI',
    title: 'FROM A SENTENCE TO A SITE.',
    supporting: 'Design system, components, images, copy, motion and a responsive preview, assembled in order, visible at every step.',
    takeaway: 'A real site system: tokens, components, copy, three breakpoints. Not a screenshot.',
    steps: ['Prompt', 'Shakir understands', 'Design system', 'Components appear', 'Images appear', 'Copy appears', 'Animations activate', 'Responsive preview', 'Website complete'],
    lengthVh: 260,
    load: () => import('@/components/demonstrations/WebsiteBuilderDemo'),
  },
  {
    key: 'code',
    anchor: 'engine-code',
    featureSlug: 'code-ai',
    eyebrow: 'Code AI',
    title: 'WRITTEN. TESTED. FIXED. PASSED.',
    supporting: 'Code AI runs the tests, reads the failure and fixes it before it shows you the preview.',
    takeaway: 'Code AI verifies: it runs the tests, reads the failure, fixes the cause and shows the pass before the preview.',
    steps: ['Prompt', 'Code', 'Test', 'Error', 'Fix', 'Pass', 'Preview'],
    lengthVh: 200,
    load: () => import('@/components/demonstrations/CodeDemo'),
  },
  {
    key: 'image',
    anchor: 'engine-image',
    featureSlug: 'image-ai',
    eyebrow: 'Image AI',
    title: 'WORDS BECOME IMAGES.',
    supporting: 'One prompt, several directions. Text becomes particles; particles settle into an image.',
    takeaway: 'From a sentence to a finished image, with variations to choose from rather than a single take.',
    steps: ['Text', 'Geometric particles', 'Image formation', 'Variations'],
    lengthVh: 160,
    load: () => import('@/components/demonstrations/ImageDemo'),
  },
  {
    key: 'video',
    anchor: 'engine-video',
    featureSlug: 'video-ai',
    eyebrow: 'Video AI',
    title: 'IDEA TO FINISHED FILM.',
    supporting: 'A production you can read: idea, script, storyboard, scenes, video. Change any stage before rendering.',
    takeaway: 'Video AI works like a production, so you can change any stage before the render.',
    steps: ['Idea', 'Script', 'Storyboard', 'Scenes', 'Video'],
    lengthVh: 170,
    load: () => import('@/components/demonstrations/VideoDemo'),
  },
  {
    key: 'skill',
    anchor: 'engine-skill',
    featureSlug: 'skill-ai',
    eyebrow: 'Skill AI',
    title: 'SEVEN LESSONS. ONE SKILL.',
    supporting: 'Every skill follows the same arc, practice and mistakes included, ending in a project you make.',
    takeaway: 'Skill AI teaches in a fixed seven-step arc, ending in a project you actually make.',
    steps: ['Foundation', 'Core concepts', 'Demonstration', 'Guided practice', 'Common mistakes', 'Advanced application', 'Final project'],
    lengthVh: 180,
    load: () => import('@/components/demonstrations/SkillDemo'),
  },
  {
    key: 'business',
    anchor: 'engine-business',
    featureSlug: 'business-ai',
    eyebrow: 'Business AI',
    title: 'ONE IDEA, EVERY STAGE.',
    supporting: 'Market, customer, positioning, website, content, campaign, analytics: one connected workspace.',
    takeaway: 'The market work feeds the website and the website feeds the campaign.',
    steps: ['Idea', 'Market', 'Customer', 'Positioning', 'Website', 'Content', 'Campaign', 'Analytics'],
    lengthVh: 220,
    load: () => import('@/components/demonstrations/BusinessDemo'),
  },
  {
    key: 'automation',
    anchor: 'engine-automation',
    featureSlug: 'automation-ai',
    eyebrow: 'Automation AI',
    title: 'SET IT IN MOTION.',
    supporting: 'A workflow you can read: trigger, condition, actions, verification, done.',
    takeaway: 'Automation AI runs steps you can see, shows the branch it took, and checks the result before it calls the run complete.',
    steps: ['Trigger', 'Condition', 'Action', 'Action', 'Verify', 'Complete'],
    lengthVh: 180,
    load: () => import('@/components/demonstrations/AutomationDemo'),
  },
  {
    key: 'live',
    anchor: 'engine-live',
    featureSlug: 'live-ai',
    eyebrow: 'Live AI',
    title: 'SEE. GUIDE. ACT, WITH PERMISSION.',
    supporting: 'Live AI looks only at what you share, guides first and acts only when you authorize it.',
    takeaway: 'Live AI sees only what you share, when you share it, and acts only with your explicit approval.',
    steps: ['Permission', 'See', 'Understand', 'Guide', 'Authorized action', 'Verify'],
    lengthVh: 200,
    load: () => import('@/components/demonstrations/LiveAIDemo'),
  },
]

export const CHAT_DEMO: DemoEntry = {
  key: 'chat',
  anchor: 'chat',
  featureSlug: 'chat-ai',
  eyebrow: 'Chat AI',
  title: 'SAY WHAT YOU NEED.',
  supporting: 'Shakir reads the request, then brings in the capabilities the job calls for.',
  takeaway: 'One request. Five capabilities, in the right order, with you approving the next step.',
  steps: ['Request', 'Understands', 'Research', 'Business', 'Website Builder', 'Content', 'Goal-to-Action', 'Next step'],
  lengthVh: 240,
  load: () => import('@/components/demonstrations/ChatDemo'),
}

export const demoByKey = (key: DemoKey): DemoEntry | undefined =>
  key === 'chat' ? CHAT_DEMO : DEMOS.find((d) => d.key === key)
