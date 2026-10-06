import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom lacks these browser APIs used by the motion and canvas layers
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserverStub })
Object.defineProperty(window, 'IntersectionObserver', { value: IntersectionObserverStub })
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true })
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null)
