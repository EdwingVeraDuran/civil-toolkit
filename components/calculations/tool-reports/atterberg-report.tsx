import { FlowCurveChart } from "@/components/tools/flow-curve-chart"
import { PlasticityChart } from "@/components/tools/plasticity-chart"
import type {
  FlowCurvePoint,
  FlowCurveRegression,
  PlasticityClassification,
  PlasticLimitSummary,
} from "@/lib/suelos/atterberg"
import type { AtterbergLimitsResult } from "@/lib/tools/atterberg-limits/calculate"
import { atterbergLimitsSchema } from "@/lib/tools/atterberg-limits/schema"
import {
  parseSavedInput,
  readSavedRecord,
  readSavedRecordArray,
  readSavedResult,
} from "@/lib/tools/report-data"
import { formatNumber } from "@/lib/units/format"

import {
  ReportDetail,
  ReportDetailGrid,
  ReportFigure,
  ReportMetric,
  ReportMetricGrid,
  ReportNote,
  ToolReportFallback,
  ToolReportLayout,
  type ToolReportProps,
} from "@/components/calculations/tool-reports/report-ui"

export function AtterbergReport({ calculation }: ToolReportProps) {
  const input = parseSavedInput(atterbergLimitsSchema, calculation.inputs)
  const result = readSavedResult<AtterbergLimitsResult>(calculation.result, {
    numbers: [
      "liquidLimit",
      "liquidLimitRounded",
      "plasticLimit",
      "plasticLimitRounded",
      "plasticityIndex",
      "plasticityIndexRounded",
    ],
    booleans: ["nonPlastic"],
    arrays: ["flowCurvePoints", "warnings"],
    records: ["regression", "plasticLimitSummary", "classification"],
  })

  if (!input || !result) {
    return <ToolReportFallback />
  }

  const regression = readSavedRecord<FlowCurveRegression>(result.regression, {
    numbers: [
      "liquidLimit",
      "slope",
      "intercept",
      "flowIndex",
      "rSquared",
      "pointCount",
    ],
    strings: ["equation"],
  })
  const plasticLimitSummary = readSavedRecord<PlasticLimitSummary>(
    result.plasticLimitSummary,
    { numbers: ["plasticLimit", "min", "max", "range", "count"] }
  )
  const classification = readSavedRecord<PlasticityClassification>(
    result.classification,
    {
      strings: ["symbol", "name", "description"],
      booleans: ["aboveALine", "aboveULine", "nonPlastic"],
    }
  )
  const points = readSavedRecordArray<FlowCurvePoint>(result.flowCurvePoints, {
    numbers: ["blows", "moisture"],
  })

  if (!regression || !plasticLimitSummary || !classification || !points) {
    return <ToolReportFallback />
  }

  return (
    <ToolReportLayout
      title="Curva de fluidez y carta de plasticidad"
      description="Resultados del ensayo y clasificación SUCS."
    >
      <ReportMetricGrid className="sm:grid-cols-2 lg:grid-cols-4">
        <ReportMetric
          label="Límite líquido, LL"
          value={`${formatNumber(result.liquidLimit, 2)} %`}
          hint={`Reporte: ${result.liquidLimitRounded} %`}
          emphasis
        />
        <ReportMetric
          label="Límite plástico, LP"
          value={`${formatNumber(result.plasticLimit, 2)} %`}
          hint={`Reporte: ${result.plasticLimitRounded} %`}
        />
        <ReportMetric
          label="Índice de plasticidad, IP"
          value={
            result.nonPlastic
              ? "NP"
              : `${formatNumber(result.plasticityIndex, 2)} %`
          }
          hint={
            result.nonPlastic
              ? "LP ≥ LL; no plástico"
              : `Reporte: ${result.plasticityIndexRounded} %`
          }
        />
        <ReportMetric
          label="Clasificación SUCS"
          value={classification.symbol}
          hint={classification.name}
        />
      </ReportMetricGrid>

      <p className="text-sm text-muted-foreground">
        {classification.description}
      </p>

      <ReportDetailGrid className="lg:grid-cols-5">
        <ReportDetail
          label="Ecuación de la recta"
          value={regression.equation}
        />
        <ReportDetail
          label="Coeficiente de determinación, R²"
          value={formatNumber(regression.rSquared, 4)}
        />
        <ReportDetail
          label="Índice de flujo, IF"
          value={`${formatNumber(regression.flowIndex, 2)} % / ciclo`}
        />
        <ReportDetail
          label="Puntos del ajuste"
          value={String(regression.pointCount)}
        />
        <ReportDetail
          label="Rango del LP"
          value={`${formatNumber(plasticLimitSummary.range, 2)} puntos`}
        />
      </ReportDetailGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <ReportFigure
          title="Curva de fluidez"
          description="Contenido de agua contra el logaritmo del número de golpes."
        >
          <FlowCurveChart
            points={points}
            regression={regression}
            liquidLimit={result.liquidLimit}
            className="mx-auto w-full max-w-xl"
          />
        </ReportFigure>

        <ReportFigure
          title="Carta de plasticidad"
          description="Punto (LL, IP) con las líneas A y U de Casagrande."
        >
          <PlasticityChart
            liquidLimit={result.liquidLimitRounded}
            plasticityIndex={result.plasticityIndexRounded}
            classification={classification}
            className="mx-auto w-full max-w-xl"
          />
        </ReportFigure>
      </div>

      <ReportNote>
        Resultados orientativos. Verifica el ensayo y la normativa aplicable
        antes de usarlos en diseño.
      </ReportNote>
    </ToolReportLayout>
  )
}
