import { TriangleAlert } from "lucide-react"

import { renderToolReport } from "@/components/calculations/tool-report"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  buildReportEntries,
  formatReportCompactValue,
  formatReportNumber,
  formatReportScalar,
  getReportTableColumns,
  getReportWarnings,
  humanizeReportKey,
  isReportRecord,
  type ReportEntry,
} from "@/lib/calculations/report"
import { getToolInfo } from "@/lib/tools/catalog"
import type { Calculation } from "@/lib/types/calculation"
import { cn } from "@/lib/utils"

type CalculationReportProps = {
  calculation: Calculation
}

export function CalculationReport({ calculation }: CalculationReportProps) {
  const tool = getToolInfo(calculation.tool_id)
  const inputEntries = buildReportEntries(calculation.inputs)
  const resultEntries = buildReportEntries(calculation.result, ["warnings"])
  const warnings = getReportWarnings(calculation.result)

  return (
    <div className="flex flex-col gap-5">
      <h2 className="sr-only">Reporte del cálculo</h2>

      {calculation.summary && (
        <section className="print-avoid-break flex flex-col gap-1">
          <h3 className="text-sm font-medium">Resumen</h3>
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {calculation.summary}
          </p>
        </section>
      )}

      {renderToolReport(calculation)}

      {warnings.length > 0 && <ReportWarnings warnings={warnings} />}

      {tool?.reference && (
        <section className="print-avoid-break rounded-lg border bg-muted/20 p-3">
          <h3 className="text-xs font-medium text-muted-foreground">
            Referencia normativa
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{tool.reference}</p>
        </section>
      )}

      <ReportSection
        title="Datos de entrada"
        entries={inputEntries}
        empty="Este cálculo no tiene datos de entrada guardados."
      />
      <ReportSection
        title="Resultados"
        entries={resultEntries}
        empty="Este cálculo no tiene resultados guardados."
      />
    </div>
  )
}

function ReportWarnings({ warnings }: { warnings: string[] }) {
  return (
    <section className="print-avoid-break rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
      <h3 className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
        <TriangleAlert className="size-4" />
        Advertencias
      </h3>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-muted-foreground">
        {warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </section>
  )
}

function ReportSection({
  title,
  entries,
  empty,
}: {
  title: string
  entries: ReportEntry[]
  empty: string
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <dl className="overflow-hidden rounded-lg border">
          {entries.map((entry) => (
            <div
              key={entry.key}
              className="grid gap-1 border-b px-3 py-2 last:border-b-0 sm:grid-cols-[minmax(10rem,0.35fr)_1fr] sm:gap-4"
            >
              <dt className="text-xs font-medium text-muted-foreground">
                {entry.label}
              </dt>
              <dd className="min-w-0 text-sm">
                <ReportValue value={entry.value} />
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}

function ReportValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-muted-foreground">—</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">—</span>
    }

    if (value.every((item) => isReportRecord(item))) {
      return <ReportTable rows={value as Record<string, unknown>[]} />
    }

    return (
      <ul className="flex list-disc flex-col gap-1 pl-5">
        {value.map((item, index) => (
          <li key={index}>
            <ReportValue value={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    )
  }

  if (isReportRecord(value)) {
    const entries = buildReportEntries(value)
    if (entries.length === 0) {
      return <span className="text-muted-foreground">—</span>
    }

    return (
      <div
        className={cn(
          "grid gap-2",
          depth > 0 && "rounded-md border bg-muted/10 p-3"
        )}
      >
        {entries.map((entry) => (
          <div key={entry.key} className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              {entry.label}
            </span>
            <div className="min-w-0">
              <ReportValue value={entry.value} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (typeof value === "boolean") return <span>{value ? "Sí" : "No"}</span>
  if (typeof value === "number") {
    return <span className="tabular-nums">{formatReportNumber(value)}</span>
  }
  if (typeof value === "string") {
    return (
      <span className="break-words whitespace-pre-wrap">
        {formatReportScalar(value)}
      </span>
    )
  }

  return (
    <span className="break-words whitespace-pre-wrap">{String(value)}</span>
  )
}

function ReportTable({ rows }: { rows: Record<string, unknown>[] }) {
  const columns = getReportTableColumns(rows)

  if (columns.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{humanizeReportKey(column)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column} className="align-top whitespace-normal">
                  {formatReportCompactValue(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
