export function StepControl({
  count,
  active,
  onChange,
  label = 'Demo step',
}: {
  count: number
  active: number
  onChange: (i: number) => void
  label?: string
}) {
  return (
    <div className="flex items-center gap-3" role="group" aria-label={label}>
      <button type="button" className="btn btn-ghost min-h-[40px] px-4" onClick={() => onChange(Math.max(0, active - 1))} disabled={active <= 0}>
        Previous
      </button>
      <span className="mono text-mist-60" aria-live="polite">
        {active + 1} / {count}
      </span>
      <button
        type="button"
        className="btn btn-ghost min-h-[40px] px-4"
        onClick={() => onChange(Math.min(count - 1, active + 1))}
        disabled={active >= count - 1}
      >
        Next
      </button>
    </div>
  )
}
