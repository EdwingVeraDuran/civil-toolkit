import type {
  FlowCurvePoint,
  FlowCurveRegression,
} from "@/lib/suelos/atterberg"
import { formatNumber } from "@/lib/units/format"

type FlowCurveChartProps = {
  points: FlowCurvePoint[]
  regression: FlowCurveRegression
  liquidLimit: number
  className?: string
}

const VIEW_WIDTH = 540
const VIEW_HEIGHT = 380
const MARGIN_LEFT = 64
const MARGIN_RIGHT = 24
const MARGIN_TOP = 24
const MARGIN_BOTTOM = 58
const PLOT_LEFT = MARGIN_LEFT
const PLOT_TOP = MARGIN_TOP
const PLOT_WIDTH = VIEW_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const PLOT_HEIGHT = VIEW_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM
const PLOT_RIGHT = PLOT_LEFT + PLOT_WIDTH
const PLOT_BOTTOM = PLOT_TOP + PLOT_HEIGHT
const X_TICKS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100]

export function FlowCurveChart({
  points,
  regression,
  liquidLimit,
  className,
}: FlowCurveChartProps) {
  const xValues = points.map((point) => point.blows)
  const xMin = Math.min(10, ...xValues)
  const xMax = Math.max(40, ...xValues)
  const logMin = Math.log10(xMin)
  const logMax = Math.log10(xMax)

  const yValues = [...points.map((point) => point.moisture), liquidLimit]
  const rawMin = Math.min(...yValues)
  const rawMax = Math.max(...yValues)
  const padding = Math.max(2, (rawMax - rawMin) * 0.08)
  const yMin = Math.max(0, Math.floor((rawMin - padding) / 5) * 5)
  const yMax = Math.max(yMin + 5, Math.ceil((rawMax + padding) / 5) * 5)

  const xScale = (blows: number) =>
    PLOT_LEFT + ((Math.log10(blows) - logMin) / (logMax - logMin)) * PLOT_WIDTH

  const yScale = (moisture: number) =>
    PLOT_TOP + (1 - (moisture - yMin) / (yMax - yMin)) * PLOT_HEIGHT

  const xTicks = X_TICKS.filter((value) => value >= xMin && value <= xMax)
  const yStep = yMax - yMin <= 30 ? 5 : 10
  const yTicks: number[] = []

  for (
    let value = Math.ceil(yMin / yStep) * yStep;
    value <= yMax;
    value += yStep
  ) {
    yTicks.push(value)
  }

  const lineStartMoisture =
    regression.intercept + regression.slope * Math.log10(xMin)
  const lineEndMoisture =
    regression.intercept + regression.slope * Math.log10(xMax)
  const liquidLimitY = yScale(liquidLimit)
  const liquidLimitX = xScale(25)
  const liquidLimitInside = liquidLimit >= yMin && liquidLimit <= yMax
  const labelAnchor =
    liquidLimitX < PLOT_LEFT + PLOT_WIDTH * 0.65 ? "start" : "end"
  const labelX = liquidLimitX + (labelAnchor === "start" ? 10 : -10)
  const labelY =
    liquidLimitY < PLOT_TOP + 24 ? liquidLimitY + 18 : liquidLimitY - 10

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Curva de fluidez con ${points.length} puntos, ajuste ${regression.equation}, R² ${formatNumber(
        regression.rSquared,
        4
      )} y límite líquido ${formatNumber(liquidLimit, 2)} por ciento`}
      className={className}
    >
      <defs>
        <clipPath id="atterberg-flow-curve-clip">
          <rect
            x={PLOT_LEFT}
            y={PLOT_TOP}
            width={PLOT_WIDTH}
            height={PLOT_HEIGHT}
          />
        </clipPath>
      </defs>

      {xTicks.map((tick) => (
        <line
          key={`x-grid-${tick}`}
          x1={xScale(tick)}
          y1={PLOT_TOP}
          x2={xScale(tick)}
          y2={PLOT_BOTTOM}
          className="stroke-border/60"
          strokeDasharray="3 4"
        />
      ))}

      {yTicks.map((tick) => (
        <line
          key={`y-grid-${tick}`}
          x1={PLOT_LEFT}
          y1={yScale(tick)}
          x2={PLOT_RIGHT}
          y2={yScale(tick)}
          className="stroke-border/60"
          strokeDasharray="3 4"
        />
      ))}

      <line
        x1={PLOT_LEFT}
        y1={PLOT_BOTTOM}
        x2={PLOT_RIGHT}
        y2={PLOT_BOTTOM}
        className="stroke-foreground/30"
      />
      <line
        x1={PLOT_LEFT}
        y1={PLOT_TOP}
        x2={PLOT_LEFT}
        y2={PLOT_BOTTOM}
        className="stroke-foreground/30"
      />

      {xTicks.map((tick) => (
        <text
          key={`x-label-${tick}`}
          x={xScale(tick)}
          y={PLOT_BOTTOM + 18}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px] tabular-nums"
        >
          {tick}
        </text>
      ))}

      {yTicks.map((tick) => (
        <text
          key={`y-label-${tick}`}
          x={PLOT_LEFT - 10}
          y={yScale(tick) + 4}
          textAnchor="end"
          className="fill-muted-foreground text-[11px] tabular-nums"
        >
          {tick}
        </text>
      ))}

      <line
        x1={xScale(25)}
        y1={PLOT_TOP}
        x2={xScale(25)}
        y2={PLOT_BOTTOM}
        className="stroke-muted-foreground/70"
        strokeDasharray="5 4"
      />

      <line
        x1={xScale(xMin)}
        y1={yScale(lineStartMoisture)}
        x2={xScale(xMax)}
        y2={yScale(lineEndMoisture)}
        clipPath="url(#atterberg-flow-curve-clip)"
        className="stroke-primary"
        strokeWidth={2}
      />

      {points.map((point, index) => (
        <circle
          key={`point-${point.blows}-${index}`}
          cx={xScale(point.blows)}
          cy={yScale(point.moisture)}
          r={4}
          className="fill-background stroke-primary"
          strokeWidth={2}
        >
          <title>
            {`N = ${formatNumber(point.blows, 0)} golpes, w = ${formatNumber(
              point.moisture,
              2
            )} %`}
          </title>
        </circle>
      ))}

      {liquidLimitInside ? (
        <>
          <circle
            cx={liquidLimitX}
            cy={liquidLimitY}
            r={5.5}
            className="fill-amber-500 stroke-background"
            strokeWidth={2}
          >
            <title>
              {`Límite líquido = ${formatNumber(liquidLimit, 2)} % a 25 golpes`}
            </title>
          </circle>
          <text
            x={labelX}
            y={labelY}
            textAnchor={labelAnchor}
            className="fill-foreground text-[11px] font-medium tabular-nums"
          >
            {`LL = ${formatNumber(liquidLimit, 2)} %`}
          </text>
        </>
      ) : null}

      <text
        x={PLOT_LEFT + PLOT_WIDTH / 2}
        y={VIEW_HEIGHT - 10}
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
      >
        Número de golpes, N (escala logarítmica)
      </text>
      <text
        x={16}
        y={PLOT_TOP + PLOT_HEIGHT / 2}
        textAnchor="middle"
        transform={`rotate(-90 16 ${PLOT_TOP + PLOT_HEIGHT / 2})`}
        className="fill-muted-foreground text-xs"
      >
        Contenido de agua, w (%)
      </text>
    </svg>
  )
}
