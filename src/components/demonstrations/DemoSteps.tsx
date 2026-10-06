export function DemoSteps({ steps, active, world = 'create' }: { steps: readonly string[]; active: number; world?: string }) {
  return (
    <ol className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0" aria-label="Steps">
      {steps.map((s, i) => (
        <li
          key={`${s}-${i}`}
          className="label flex items-center gap-2 transition-colors duration-300"
          style={{ color: i === active ? `var(--world-${world}-text)` : i < active ? 'var(--color-mist)' : 'var(--color-mist-40)' }}
          aria-current={i === active ? 'step' : undefined}
        >
          <span
            className="inline-block h-[7px] w-[7px] rotate-45 transition-colors duration-300"
            style={{ background: i <= active ? `var(--world-${world})` : 'var(--color-slate)' }}
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">
            <span className="mono mr-1 opacity-60">{String(i + 1).padStart(2, '0')}</span>
            {s}
          </span>
        </li>
      ))}
    </ol>
  )
}
