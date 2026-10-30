import type { ReactNode } from "react"
import { TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Calculation } from "@/lib/types/calculation"
import { cn } from "@/lib/utils"

export type ToolReportProps = {
  calculation: Calculation
}

export function ToolReportLayout({
  title,
  description,
  badge = "Datos guardados",
  children,
  className,
}: {
  title: string
  description: string
  badge?: string | null
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-muted/10 p-4",
        className
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {badge ? (
          <Badge variant="outline" className="w-fit shrink-0">
            {badge}
          </Badge>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function ReportFigure({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <figure className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div>
        <figcaption className="text-xs font-medium">{title}</figcaption>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="print-avoid-break min-w-0">{children}</div>
    </figure>
  )
}

export function ReportMetricGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>{children}</div>
  )
}

export function ReportMetric({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  emphasis?: boolean
}) {
  return (
    <div className="print-avoid-break rounded-lg border bg-background/70 p-3">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-semibold break-words tabular-nums",
          emphasis ? "text-lg" : "text-sm"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function ReportDetailGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <dl className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {children}
    </dl>
  )
}

export function ReportDetail({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="min-w-0 space-y-0.5">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium break-words tabular-nums">{value}</dd>
    </div>
  )
}

export function ReportFormula({ formula }: { formula: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-[11px] text-muted-foreground">Fórmula aplicada</p>
      <p className="mt-1 text-sm font-medium break-words">{formula}</p>
    </div>
  )
}

export function ReportNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-muted-foreground">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-700 dark:text-amber-400" />
      <p className="min-w-0">{children}</p>
    </div>
  )
}

export function ToolReportFallback({
  message = "No se pudo reconstruir la vista gráfica de este cálculo guardado. A continuación se muestran los datos y resultados generales.",
}: {
  message?: string
}) {
  return (
    <section
      role="note"
      className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground"
    >
      <p className="font-medium text-foreground">Vista gráfica no disponible</p>
      <p className="mt-1">{message}</p>
    </section>
  )
}
