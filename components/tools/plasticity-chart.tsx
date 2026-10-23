import {
  aLineValue,
  plasticityChartMax,
  uLineValue,
  type PlasticityClassification,
} from "@/lib/suelos/atterberg"
import { formatNumber } from "@/lib/units/format"

type PlasticityChartProps = {
  liquidLimit: number
  plasticityIndex: number
  classification: PlasticityClassification
  className?: string
}

const VIEW_WIDTH = 560
const VIEW_HEIGHT = 560
const MARGIN_LEFT = 64
const MARGIN_RIGHT = 24
const MARGIN_TOP = 24
const MARGIN_BOTTOM = 64
const PLOT_LEFT = MARGIN_LEFT
const PLOT_TOP = MARGIN_TOP
const PLOT_WIDTH = VIEW_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const PLOT_HEIGHT = VIEW_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM
const PLOT_RIGHT = PLOT_LEFT + PLOT_WIDTH
const PLOT_BOTTOM = PLOT_TOP + PLOT_HEIGHT

const CL_ML_START = 20 + 4 / 0.73
const CL_ML_END = 20 + 7 / 0.73
const A_LINE_AT_50 = aLineValue(50)

export function PlasticityChart({
  liquidLimit,
  plasticityIndex,
  classification,
  className,
}: PlasticityChartProps) {
  const chartMax = plasticityChartMax(liquidLimit, plasticityIndex)
  const tickStep = chartMax <= 100 ? 20 : 10
  const ticks: number[] = []

  for (let value = 0; value <= chartMax; value += tickStep) {
    ticks.push(value)
  }

  const xScale = (value: number) => PLOT_LEFT + (value / chartMax) * PLOT_WIDTH
  const yScale = (value: number) =>
    PLOT_TOP + (1 - value / chartMax) * PLOT_HEIGHT

  const pointX = xScale(liquidLimit)
  const pointY = yScale(plasticityIndex)
  const aLineMax = aLineValue(chartMax)
  const uLineMax = uLineValue(chartMax)
  const labelAnchor = pointX > PLOT_LEFT + PLOT_WIDTH * 0.7 ? "end" : "start"
  const labelX = pointX + (labelAnchor === "start" ? 10 : -10)
  const labelY = pointY < PLOT_TOP + 24 ? pointY + 18 : pointY - 10
  const pointLabel = classification.nonPlastic
    ? `LL ${formatNumber(liquidLimit, 0)} · NP`
    : `${classification.symbol} · LL ${formatNumber(
        liquidLimit,
        0
      )} · IP ${formatNumber(plasticityIndex, 0)}`

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Carta de plasticidad: LL ${formatNumber(
        liquidLimit,
        0
      )} por ciento, IP ${formatNumber(
        plasticityIndex,
        0
      )} por ciento, clasificación ${classification.symbol}`}
      className={className}
    >
      <polygon
        points={`${xScale(0)},${yScale(0)} ${xScale(50)},${yScale(
          0
        )} ${xScale(50)},${yScale(A_LINE_AT_50)} ${xScale(CL_ML_START)},${yScale(
          4
        )} ${xScale(0)},${yScale(4)}`}
        className="fill-sky-500/10"
      />

      <polygon
        points={`${xScale(0)},${yScale(4)} ${xScale(CL_ML_START)},${yScale(
          4
        )} ${xScale(CL_ML_END)},${yScale(7)} ${xScale(0)},${yScale(7)}`}
        className="fill-amber-500/15"
      />

      <polygon
        points={`${xScale(0)},${yScale(7)} ${xScale(CL_ML_END)},${yScale(
          7
        )} ${xScale(50)},${yScale(A_LINE_AT_50)} ${xScale(50)},${yScale(
          chartMax
        )} ${xScale(0)},${yScale(chartMax)}`}
        className="fill-emerald-500/10"
      />

      <polygon
        points={`${xScale(50)},${yScale(A_LINE_AT_50)} ${xScale(
          chartMax
        )},${yScale(aLineMax)} ${xScale(chartMax)},${yScale(
          chartMax
        )} ${xScale(50)},${yScale(chartMax)}`}
        className="fill-violet-500/10"
      />

      <polygon
        points={`${xScale(50)},${yScale(0)} ${xScale(chartMax)},${yScale(
          0
        )} ${xScale(chartMax)},${yScale(aLineMax)} ${xScale(50)},${yScale(
          A_LINE_AT_50
        )}`}
        className="fill-sky-500/10"
      />

      {ticks.map((tick) => (
        <g key={`grid-${tick}`}>
          <line
            x1={xScale(tick)}
            y1={PLOT_TOP}
            x2={xScale(tick)}
            y2={PLOT_BOTTOM}
            className="stroke-border/60"
            strokeDasharray="3 4"
          />
          <line
            x1={PLOT_LEFT}
            y1={yScale(tick)}
            x2={PLOT_RIGHT}
            y2={yScale(tick)}
            className="stroke-border/60"
            strokeDasharray="3 4"
          />
        </g>
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

      {ticks.map((tick) => (
        <g key={`labels-${tick}`}>
          <text
            x={xScale(tick)}
            y={PLOT_BOTTOM + 18}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px] tabular-nums"
          >
            {tick}
          </text>
          <text
            x={PLOT_LEFT - 10}
            y={yScale(tick) + 4}
            textAnchor="end"
            className="fill-muted-foreground text-[11px] tabular-nums"
          >
            {tick}
          </text>
        </g>
      ))}

      <line
        x1={xScale(50)}
        y1={PLOT_TOP}
        x2={xScale(50)}
        y2={PLOT_BOTTOM}
        className="stroke-muted-foreground/70"
        strokeDasharray="5 4"
      />
      <text
        x={xScale(50) + 5}
        y={PLOT_TOP + 13}
        className="fill-muted-foreground text-[10px]"
      >
        LL = 50
      </text>

      <line
        x1={xScale(20)}
        y1={yScale(0)}
        x2={xScale(chartMax)}
        y2={yScale(aLineMax)}
        className="stroke-foreground/60"
        strokeWidth={1.5}
      />
      <line
        x1={xScale(8)}
        y1={yScale(uLineValue(8))}
        x2={xScale(chartMax)}
        y2={yScale(uLineMax)}
        className="stroke-foreground/40"
        strokeDasharray="6 4"
        strokeWidth={1.5}
      />

      <text
        x={xScale(72)}
        y={yScale(aLineValue(72)) - 4}
        className="fill-muted-foreground text-[10px] font-medium"
      >
        A
      </text>
      <text
        x={xScale(82)}
        y={yScale(uLineValue(82)) - 4}
        className="fill-muted-foreground text-[10px] font-medium"
      >
        U
      </text>

      <text
        x={xScale(10)}
        y={yScale(2)}
        className="fill-muted-foreground text-[10px] font-medium"
      >
        ML/OL
      </text>
      <text
        x={xScale(8)}
        y={yScale(5.5)}
        className="fill-muted-foreground text-[10px] font-medium"
      >
        CL-ML
      </text>
      <text
        x={xScale(42)}
        y={yScale(34)}
        className="fill-muted-foreground text-xs font-semibold"
      >
        CL
      </text>
      <text
        x={xScale(76)}
        y={yScale(62)}
        className="fill-muted-foreground text-xs font-semibold"
      >
        CH
      </text>
      <text
        x={xScale(70)}
        y={yScale(10)}
        className="fill-muted-foreground text-[10px] font-medium"
      >
        MH/OH
      </text>

      <circle
        cx={pointX}
        cy={pointY}
        r={6}
        className={
          classification.aboveULine
            ? "fill-rose-500 stroke-background"
            : "fill-primary stroke-background"
        }
        strokeWidth={2}
      >
        <title>
          {`LL = ${formatNumber(liquidLimit, 0)} %, IP = ${formatNumber(
            plasticityIndex,
            0
          )} %, clasificación ${classification.symbol}`}
        </title>
      </circle>
      <text
        x={labelX}
        y={labelY}
        textAnchor={labelAnchor}
        className="fill-foreground text-[11px] font-medium tabular-nums"
      >
        {pointLabel}
      </text>

      <text
        x={PLOT_LEFT + PLOT_WIDTH / 2}
        y={VIEW_HEIGHT - 12}
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
      >
        Límite líquido, LL (%)
      </text>
      <text
        x={18}
        y={PLOT_TOP + PLOT_HEIGHT / 2}
        textAnchor="middle"
        transform={`rotate(-90 18 ${PLOT_TOP + PLOT_HEIGHT / 2})`}
        className="fill-muted-foreground text-xs"
      >
        Índice de plasticidad, IP (%)
      </text>
    </svg>
  )
}
