import type {
  DoubleInput,
  LinearInput,
} from "@/lib/tools/interpolation-calculator/schema"
import type {
  DoubleResult,
  LinearResult,
} from "@/lib/tools/interpolation-calculator/calculate"
import { formatNumber } from "@/lib/units/format"

type InterpolationDiagramProps =
  | {
      input: LinearInput
      result: LinearResult
      className?: string
    }
  | {
      input: DoubleInput
      result: DoubleResult
      className?: string
    }

const LINEAR_WIDTH = 440
const LINEAR_HEIGHT = 260
const LINEAR_PADDING = { top: 24, right: 24, bottom: 40, left: 48 }

const DOUBLE_WIDTH = 440
const DOUBLE_HEIGHT = 302
const DOUBLE_GRID = { left: 94, top: 58, cellWidth: 140, cellHeight: 88 }

function formatLabel(value: number): string {
  return formatNumber(value, 2)
}

function paddedDomain(values: number[]): [number, number] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min
  const padding = span === 0 ? 1 : span * 0.18

  return [min - padding, max + padding]
}

function LinearDiagram({
  input,
  result,
  className,
}: {
  input: LinearInput
  result: LinearResult
  className?: string
}) {
  const [domainXMin, domainXMax] = paddedDomain([
    input.x1,
    input.x2,
    result.targetX,
  ])
  const [domainYMin, domainYMax] = paddedDomain([
    input.y1,
    input.y2,
    result.targetY,
  ])

  const plotLeft = LINEAR_PADDING.left
  const plotRight = LINEAR_WIDTH - LINEAR_PADDING.right
  const plotTop = LINEAR_PADDING.top
  const plotBottom = LINEAR_HEIGHT - LINEAR_PADDING.bottom
  const plotWidth = plotRight - plotLeft
  const plotHeight = plotBottom - plotTop

  const scaleX = (value: number) =>
    plotLeft + ((value - domainXMin) / (domainXMax - domainXMin)) * plotWidth
  const scaleY = (value: number) =>
    plotBottom - ((value - domainYMin) / (domainYMax - domainYMin)) * plotHeight

  const p1x = scaleX(input.x1)
  const p1y = scaleY(input.y1)
  const p2x = scaleX(input.x2)
  const p2y = scaleY(input.y2)
  const targetX = scaleX(result.targetX)
  const targetY = scaleY(result.targetY)

  const targetLabelX = Math.min(
    Math.max(targetX, plotLeft + 48),
    plotRight - 48
  )
  const targetLabelY = targetY < plotTop + 24 ? targetY + 18 : targetY - 12

  const p1Anchor = input.x1 <= input.x2 ? "end" : "start"
  const p2Anchor = input.x1 <= input.x2 ? "start" : "end"
  const p1LabelX = p1Anchor === "end" ? p1x - 9 : p1x + 9
  const p2LabelX = p2Anchor === "end" ? p2x - 9 : p2x + 9

  return (
    <svg
      viewBox={`0 0 ${LINEAR_WIDTH} ${LINEAR_HEIGHT}`}
      role="img"
      aria-label={`Interpolación lineal entre P₁ (${formatLabel(
        input.x1
      )}; ${formatLabel(input.y1)}) y P₂ (${formatLabel(
        input.x2
      )}; ${formatLabel(input.y2)}), con objetivo (${formatLabel(
        result.targetX
      )}; ${formatLabel(result.targetY)})`}
      className={className}
    >
      <g className="stroke-muted-foreground/50" strokeWidth={1}>
        <line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} />
        <line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} />
      </g>

      <text
        x={plotRight}
        y={plotBottom + 22}
        textAnchor="end"
        className="fill-muted-foreground text-[11px]"
      >
        x
      </text>
      <text
        x={plotLeft - 14}
        y={plotTop + 10}
        textAnchor="end"
        className="fill-muted-foreground text-[11px]"
      >
        y
      </text>

      <line
        x1={targetX}
        y1={targetY}
        x2={targetX}
        y2={plotBottom}
        strokeDasharray="3 4"
        className="stroke-muted-foreground/50"
        strokeWidth={1}
      />
      <line
        x1={plotLeft}
        y1={targetY}
        x2={targetX}
        y2={targetY}
        strokeDasharray="3 4"
        className="stroke-muted-foreground/50"
        strokeWidth={1}
      />

      <line
        x1={p1x}
        y1={p1y}
        x2={p2x}
        y2={p2y}
        className="stroke-primary"
        strokeWidth={2.5}
      />

      <circle
        cx={p1x}
        cy={p1y}
        r={4.5}
        className="fill-background stroke-primary"
        strokeWidth={2}
      />
      <circle
        cx={p2x}
        cy={p2y}
        r={4.5}
        className="fill-background stroke-primary"
        strokeWidth={2}
      />

      <circle
        cx={targetX}
        cy={targetY}
        r={8}
        className="fill-primary/15 stroke-primary"
        strokeWidth={2}
      />
      <circle cx={targetX} cy={targetY} r={3.5} className="fill-primary" />

      <text
        x={p1LabelX}
        y={p1y - 10}
        textAnchor={p1Anchor}
        className="fill-muted-foreground text-[11px]"
      >
        P₁ ({formatLabel(input.x1)}; {formatLabel(input.y1)})
      </text>
      <text
        x={p2LabelX}
        y={p2y - 10}
        textAnchor={p2Anchor}
        className="fill-muted-foreground text-[11px]"
      >
        P₂ ({formatLabel(input.x2)}; {formatLabel(input.y2)})
      </text>
      <text
        x={targetLabelX}
        y={targetLabelY}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-medium"
      >
        objetivo ({formatLabel(result.targetX)}; {formatLabel(result.targetY)})
      </text>

      <text
        x={(plotLeft + plotRight) / 2}
        y={LINEAR_HEIGHT - 8}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
      >
        Diagrama esquemático, no a escala
      </text>
    </svg>
  )
}

function DoubleDiagram({
  input,
  result,
  className,
}: {
  input: DoubleInput
  result: DoubleResult
  className?: string
}) {
  const gridLeft = DOUBLE_GRID.left
  const gridTop = DOUBLE_GRID.top
  const cellWidth = DOUBLE_GRID.cellWidth
  const cellHeight = DOUBLE_GRID.cellHeight
  const gridWidth = cellWidth * 2
  const gridHeight = cellHeight * 2
  const gridRight = gridLeft + gridWidth
  const gridBottom = gridTop + gridHeight

  const targetX = gridLeft + result.tx * gridWidth
  const targetY = gridTop + result.ty * gridHeight

  const cells = [
    {
      x: gridLeft + cellWidth / 2,
      y: gridTop + cellHeight / 2,
      label: `z₁₁ = ${formatLabel(input.z11)}`,
    },
    {
      x: gridLeft + cellWidth * 1.5,
      y: gridTop + cellHeight / 2,
      label: `z₂₁ = ${formatLabel(input.z21)}`,
    },
    {
      x: gridLeft + cellWidth / 2,
      y: gridTop + cellHeight * 1.5,
      label: `z₁₂ = ${formatLabel(input.z12)}`,
    },
    {
      x: gridLeft + cellWidth * 1.5,
      y: gridTop + cellHeight * 1.5,
      label: `z₂₂ = ${formatLabel(input.z22)}`,
    },
  ]

  return (
    <svg
      viewBox={`0 0 ${DOUBLE_WIDTH} ${DOUBLE_HEIGHT}`}
      role="img"
      aria-label={`Interpolación doble: z₁₁=${formatLabel(
        input.z11
      )}, z₂₁=${formatLabel(input.z21)}, z₁₂=${formatLabel(
        input.z12
      )}, z₂₂=${formatLabel(input.z22)}; objetivo x=${formatLabel(
        input.targetX
      )}, y=${formatLabel(input.targetY)}, z=${formatLabel(result.value)}`}
      className={className}
    >
      <rect
        x={gridLeft}
        y={gridTop}
        width={gridWidth}
        height={gridHeight}
        className="fill-muted/10 stroke-border"
        strokeWidth={1.5}
      />
      <g className="stroke-border" strokeWidth={1}>
        <line
          x1={gridLeft + cellWidth}
          y1={gridTop}
          x2={gridLeft + cellWidth}
          y2={gridBottom}
        />
        <line
          x1={gridLeft}
          y1={gridTop + cellHeight}
          x2={gridRight}
          y2={gridTop + cellHeight}
        />
      </g>

      <text
        x={gridLeft + cellWidth / 2}
        y={gridTop - 18}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
      >
        x₁ = {formatLabel(input.x1)}
      </text>
      <text
        x={gridLeft + cellWidth * 1.5}
        y={gridTop - 18}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px]"
      >
        x₂ = {formatLabel(input.x2)}
      </text>
      <text
        x={gridLeft - 12}
        y={gridTop + cellHeight / 2}
        textAnchor="end"
        dominantBaseline="middle"
        className="fill-muted-foreground text-[11px]"
      >
        y₁ = {formatLabel(input.y1)}
      </text>
      <text
        x={gridLeft - 12}
        y={gridTop + cellHeight * 1.5}
        textAnchor="end"
        dominantBaseline="middle"
        className="fill-muted-foreground text-[11px]"
      >
        y₂ = {formatLabel(input.y2)}
      </text>

      {cells.map((cell) => (
        <text
          key={cell.label}
          x={cell.x}
          y={cell.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground text-[12px] font-medium"
        >
          {cell.label}
        </text>
      ))}

      <g className="stroke-muted-foreground/60" strokeWidth={1}>
        <line
          x1={targetX}
          y1={gridTop}
          x2={targetX}
          y2={gridBottom}
          strokeDasharray="3 4"
        />
        <line
          x1={gridLeft}
          y1={targetY}
          x2={gridRight}
          y2={targetY}
          strokeDasharray="3 4"
        />
      </g>

      <circle
        cx={targetX}
        cy={targetY}
        r={8}
        className="fill-primary/15 stroke-primary"
        strokeWidth={2}
      />
      <circle cx={targetX} cy={targetY} r={3.5} className="fill-primary" />

      <text
        x={DOUBLE_WIDTH / 2}
        y={gridBottom + 26}
        textAnchor="middle"
        className="fill-foreground text-[11px] font-medium"
      >
        Objetivo: x = {formatLabel(result.targetX)}, y ={" "}
        {formatLabel(result.targetY)} → z = {formatLabel(result.value)}
      </text>
      <text
        x={DOUBLE_WIDTH / 2}
        y={DOUBLE_HEIGHT - 8}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
      >
        Diagrama esquemático, no a escala
      </text>
    </svg>
  )
}

export function InterpolationDiagram(props: InterpolationDiagramProps) {
  if (props.input.mode === "linear" && props.result.mode === "linear") {
    return (
      <LinearDiagram
        input={props.input}
        result={props.result}
        className={props.className}
      />
    )
  }

  if (props.input.mode === "double" && props.result.mode === "double") {
    return (
      <DoubleDiagram
        input={props.input}
        result={props.result}
        className={props.className}
      />
    )
  }

  return null
}
