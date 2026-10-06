import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { App } from '@/App'

const params = new URLSearchParams(window.location.search)
const demo = params.get('demo')
const DemoHarness = demo ? lazy(() => import('@/dev/DemoHarness')) : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {DemoHarness && demo ? (
      <Suspense fallback={null}>
        <DemoHarness demoKey={demo} step={Number(params.get('step') ?? 0)} />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
