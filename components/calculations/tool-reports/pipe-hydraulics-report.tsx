import { PipeLossDiagram } from "@/components/tools/pipe-loss-diagram"
import {
  PIPE_FLOW_REGIME_LABELS,
  PIPE_METHOD_LABELS,
} from "@/lib/aguas/tuberias"
import type { PipeHydraulicsResult } from "@/lib/tools/pipe-hydraulics/calculate"
import {
  PIPE_MODE_LABELS,
  pipeHydraulicsSchema,
} from "@/lib/tools/pipe-hydraulics/schema"
import { parseSavedInput, readSavedResult } from "@/lib/tools/report-data"
import { formatNumber } from "@/lib/units/format"

import {
  ReportDetail,
  ReportDetailGrid,
  ReportFigure,
  ReportFormula,
  ReportMetric,
  ReportMetricGrid,
  ReportNote,
  ToolReportFallback,
  ToolReportLayout,
  type ToolReportProps,
} from "@/components/calculations/tool-reports/report-ui"

export function PipeHydraulicsReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(pipeHydraulicsSchema, calculation.inputs)
  const result = readSavedResult<PipeHydraulicsResult>(calculation.result, {
    numbers: ["length", "totalK"],
    strings: ["mode", "method", "formula"],
    booleans: ["converged"],
    arrays: ["warnings"],
  })

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const methodLabel = PIPE_METHOD_LABELS[result.method]
  const modeLabel = PIPE_MODE_LABELS[result.mode]

  if (!methodLabel || !modeLabel) {
    return <ToolReportFallback />
  }

  const diameterMm =
    result.diameterMm !== null && Number.isFinite(result.diameterMm)
      ? result.diameterMm
      : null
  const discharge =
    result.discharge !== null && Number.isFinite(result.discharge)
      ? result.discharge
      : null
  const headLoss =
    result.headLoss !== null && Number.isFinite(result.headLoss)
      ? result.headLoss
      : null
  const frictionLoss =
    result.frictionLoss !== null && Number.isFinite(result.frictionLoss)
      ? result.frictionLoss
      : null
  const localLoss =
    result.localLoss !== null && Number.isFinite(result.localLoss)
      ? result.localLoss
      : null
  const velocity =
    result.velocity !== null && Number.isFinite(result.velocity)
      ? result.velocity
      : null
  const localFraction =
    headLoss !== null && headLoss > 0 && localLoss !== null
      ? (localLoss / headLoss) * 100
      : null
  const canDrawChart =
    diameterMm !== null && headLoss !== null && result.length > 0
  const regimeLabel = result.flowRegime
    ? PIPE_FLOW_REGIME_LABELS[result.flowRegime]
    : "—"

  return (
    <ToolReportLayout
      title="Pérdidas y diámetro"
      description={`${methodLabel} — ${modeLabel}`}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-4">
          <ReportMetricGrid className="sm:grid-cols-2 lg:grid-cols-4">
            <ReportMetric
              label="Diámetro interno, D"
              value={
                diameterMm !== null ? `${formatNumber(diameterMm, 1)} mm` : "—"
              }
              hint={
                diameterMm !== null
                  ? `${formatNumber(diameterMm / 1000, 4)} m`
                  : undefined
              }
              emphasis
            />
            <ReportMetric
              label="Caudal, Q"
              value={
                discharge !== null ? `${formatNumber(discharge, 4)} m³/s` : "—"
              }
              hint={
                discharge !== null
                  ? `${formatNumber(discharge * 1000, 2)} L/s`
                  : undefined
              }
            />
            <ReportMetric
              label="Velocidad media, V"
              value={
                velocity !== null ? `${formatNumber(velocity, 3)} m/s` : "—"
              }
            />
            <ReportMetric
              label="Pérdida total, H"
              value={headLoss !== null ? `${formatNumber(headLoss, 3)} m` : "—"}
            />
            <ReportMetric
              label="Pérdida por fricción, h_f"
              value={
                frictionLoss !== null
                  ? `${formatNumber(frictionLoss, 3)} m`
                  : "—"
              }
            />
            <ReportMetric
              label="Pérdida local, h_m"
              value={
                localLoss !== null ? `${formatNumber(localLoss, 3)} m` : "—"
              }
              hint={
                localFraction !== null
                  ? `${formatNumber(localFraction, 1)} % del total`
                  : undefined
              }
            />
            <ReportMetric
              label="Coeficiente total, ΣK"
              value={formatNumber(result.totalK, 2)}
            />
            <ReportMetric
              label="Gradiente total, H/L"
              value={`${formatNumber(result.hydraulicGradient ?? 0, 5)} m/m`}
            />
          </ReportMetricGrid>

          <ReportDetailGrid>
            <ReportDetail
              label="Longitud, L"
              value={`${formatNumber(result.length, 2)} m`}
            />
            <ReportDetail
              label="Accesorios"
              value={`${input.accessories.length} tipo(s)`}
            />
            <ReportDetail label="Régimen de flujo" value={regimeLabel} />
            <ReportDetail
              label="Número de Reynolds, Re"
              value={
                result.reynolds !== null
                  ? formatNumber(result.reynolds, 0)
                  : "—"
              }
            />
            <ReportDetail
              label="Factor de fricción, f"
              value={
                result.frictionFactor !== null
                  ? formatNumber(result.frictionFactor, 5)
                  : "—"
              }
            />
            <ReportDetail
              label="Convergencia"
              value={result.converged ? "Sí" : "No"}
            />
          </ReportDetailGrid>

          <ReportFormula formula={result.formula} />

          {!result.converged ? (
            <ReportNote>
              El solver no alcanzó la tolerancia en todas las iteraciones; el
              resultado es aproximado.
            </ReportNote>
          ) : null}
        </div>

        {canDrawChart ? (
          <ReportFigure
            title="Esquema de pérdidas"
            description="Pérdida por fricción y pérdidas locales."
          >
            <PipeLossDiagram
              length={result.length}
              diameterMm={diameterMm}
              frictionLoss={frictionLoss ?? 0}
              localLoss={localLoss ?? 0}
              totalLoss={headLoss}
              totalK={result.totalK}
              className="mx-auto w-full max-w-md"
            />
          </ReportFigure>
        ) : (
          <ReportFigure
            title="Esquema de pérdidas"
            description="No hay diámetro y pérdida total válidos para dibujar el esquema."
          >
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Sin visualización de pérdidas
            </div>
          </ReportFigure>
        )}
      </div>
    </ToolReportLayout>
  )
}
