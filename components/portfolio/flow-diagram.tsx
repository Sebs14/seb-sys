/* ══════════════════════════════════════════════════════════════
   DIAGRAMA DE FLUJO

   El `flow` de cada proyecto es una línea "a ─▶ b ─▶ c". Acá se
   convierte en pasos HTML: en ancho suficiente van en fila con
   flechas; en angosto se apilan. Sin canvas, sin scroll horizontal.
   ══════════════════════════════════════════════════════════════ */

export function parseFlow(flow: string): string[] {
  return flow
    .split(/─▶|->|→/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function FlowDiagram({ flow, labels }: { flow?: string; labels?: string[] }) {
  const steps = labels ?? (flow ? parseFlow(flow) : []);
  if (!steps.length) return null;
  return (
    <ol className="flex flex-wrap items-stretch gap-y-2" aria-label={steps.join(" → ")}>
      {steps.map((step, i) => (
        <li key={`${step}-${i}`} className="flex items-center">
          <span className="t-meta inline-flex min-h-9 items-center rounded-[10px] border border-stroke bg-section px-3 text-ink">
            {step}
          </span>
          {i < steps.length - 1 && (
            <svg aria-hidden width="28" height="12" viewBox="0 0 28 12" className="mx-1 shrink-0 text-ink-3">
              <path d="M0 6h24M20 1l6 5-6 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
}
