import {
  AREA_SHAPE_LABELS,
  type AreaInput,
} from "@/lib/tools/area-calculator/schema"
import { formatNumber } from "@/lib/units/format"

type AreaDiagramProps = {
  input: AreaInput
  lengthSymbol: string
  className?: string
}

const VIEW_WIDTH = 360
const VIEW_HEIGHT = 230
const CENTER_X = 180
const CENTER_Y = 95

function formatLength(value: number, symbol: string): string {
  return `${formatNumber(value, 3)} ${symbol}`
}

function HorizontalDimension({
  x1,
  x2,
  y,
  label,
}: {
  x1: number
  x2: number
  y: number
  label: string
}) {
  return (
    <>
      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line x1={x1} y1={y} x2={x2} y2={y} />
        <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} />
        <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} />
      </g>
      <text
        x={(x1 + x2) / 2}
        y={y + 18}
        textAnchor="middle"
        className="fill-muted-foreground text-[12px]"
      >
        {label}
      </text>
    </>
  )
}

function VerticalDimension({
  x,
  y1,
  y2,
  label,
}: {
  x: number
  y1: number
  y2: number
  label: string
}) {
  const labelX = x + 20
  const labelY = (y1 + y2) / 2

  return (
    <>
      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line x1={x} y1={y1} x2={x} y2={y2} />
        <line x1={x - 5} y1={y1} x2={x + 5} y2={y1} />
        <line x1={x - 5} y1={y2} x2={x + 5} y2={y2} />
      </g>
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground text-[12px]"
        transform={`rotate(-90 ${labelX} ${labelY})`}
      >
        {label}
      </text>
    </>
  )
}

export function AreaDiagram({
  input,
  lengthSymbol,
  className,
}: AreaDiagramProps) {
  const ariaLabel = `Diagrama esquemático de ${AREA_SHAPE_LABELS[input.shape]}`

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      {renderShape(input, lengthSymbol)}
    </svg>
  )
}

function renderShape(input: AreaInput, lengthSymbol: string) {
  switch (input.shape) {
    case "square": {
      const size = 110
      const x = CENTER_X - size / 2
      const y = CENTER_Y - size / 2
      const bottom = y + size

      return (
        <>
          <rect
            x={x}
            y={y}
            width={size}
            height={size}
            rx={2}
            className="fill-primary/10 stroke-primary"
            strokeWidth={2}
          />
          <HorizontalDimension
            x1={x}
            x2={x + size}
            y={bottom + 24}
            label={`L = ${formatLength(input.side, lengthSymbol)}`}
          />
        </>
      )
    }

    case "rectangle": {
      const scale = Math.min(200 / input.base, 100 / input.height)
      const width = Math.max(input.base * scale, 8)
      const height = Math.max(input.height * scale, 8)
      const x = CENTER_X - width / 2
      const y = CENTER_Y - height / 2
      const bottom = y + height
      const right = x + width

      return (
        <>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={2}
            className="fill-primary/10 stroke-primary"
            strokeWidth={2}
          />
          <HorizontalDimension
            x1={x}
            x2={right}
            y={bottom + 24}
            label={`b = ${formatLength(input.base, lengthSymbol)}`}
          />
          <VerticalDimension
            x={right + 22}
            y1={y}
            y2={bottom}
            label={`h = ${formatLength(input.height, lengthSymbol)}`}
          />
        </>
      )
    }

    case "triangle": {
      const scale = Math.min(200 / input.base, 100 / input.height)
      const width = Math.max(input.base * scale, 8)
      const height = Math.max(input.height * scale, 8)
      const baseLeft = CENTER_X - width / 2
      const baseRight = CENTER_X + width / 2
      const baseline = CENTER_Y + height / 2
      const apexY = baseline - height

      return (
        <>
          <polygon
            points={`${baseLeft},${baseline} ${baseRight},${baseline} ${CENTER_X},${apexY}`}
            className="fill-primary/10 stroke-primary"
            strokeWidth={2}
          />
          <line
            x1={CENTER_X}
            y1={apexY}
            x2={CENTER_X}
            y2={baseline}
            className="stroke-muted-foreground"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={CENTER_X + 7}
            y={(apexY + baseline) / 2}
            dominantBaseline="middle"
            className="fill-muted-foreground text-[12px]"
          >
            h = {formatLength(input.height, lengthSymbol)}
          </text>
          <HorizontalDimension
            x1={baseLeft}
            x2={baseRight}
            y={baseline + 24}
            label={`b = ${formatLength(input.base, lengthSymbol)}`}
          />
        </>
      )
    }

    case "circle": {
      const radius = 60
      const isDiameter = input.circleMeasure === "diameter"

      return (
        <>
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={radius}
            className="fill-primary/10 stroke-primary"
            strokeWidth={2}
          />
          {isDiameter ? (
            <>
              <line
                x1={CENTER_X - radius}
                y1={CENTER_Y}
                x2={CENTER_X + radius}
                y2={CENTER_Y}
                className="stroke-muted-foreground"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text
                x={CENTER_X}
                y={CENTER_Y - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[12px]"
              >
                d = {formatLength(input.circleSize, lengthSymbol)}
              </text>
            </>
          ) : (
            <>
              <line
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={CENTER_X + radius}
                y2={CENTER_Y}
                className="stroke-muted-foreground"
                strokeWidth={1}
              />
              <circle
                cx={CENTER_X}
                cy={CENTER_Y}
                r={2.5}
                className="fill-muted-foreground"
              />
              <text
                x={CENTER_X + radius + 8}
                y={CENTER_Y - 8}
                className="fill-muted-foreground text-[12px]"
              >
                r = {formatLength(input.circleSize, lengthSymbol)}
              </text>
            </>
          )}
        </>
      )
    }

    case "trapezoid": {
      const maxBase = Math.max(input.baseMajor, input.baseMinor)
      const scale = Math.min(200 / maxBase, 90 / input.height)
      const major = Math.max(input.baseMajor * scale, 8)
      const minor = Math.max(input.baseMinor * scale, 8)
      const height = Math.max(input.height * scale, 8)
      const baseline = CENTER_Y + height / 2
      const top = baseline - height
      const right = CENTER_X + Math.max(major, minor) / 2

      return (
        <>
          <polygon
            points={`${CENTER_X - major / 2},${baseline} ${CENTER_X + major / 2},${baseline} ${CENTER_X + minor / 2},${top} ${CENTER_X - minor / 2},${top}`}
            className="fill-primary/10 stroke-primary"
            strokeWidth={2}
          />
          <text
            x={CENTER_X}
            y={top - 12}
            textAnchor="middle"
            className="fill-muted-foreground text-[12px]"
          >
            b = {formatLength(input.baseMinor, lengthSymbol)}
          </text>
          <HorizontalDimension
            x1={CENTER_X - major / 2}
            x2={CENTER_X + major / 2}
            y={baseline + 24}
            label={`B = ${formatLength(input.baseMajor, lengthSymbol)}`}
          />
          <VerticalDimension
            x={right + 22}
            y1={top}
            y2={baseline}
            label={`h = ${formatLength(input.height, lengthSymbol)}`}
          />
        </>
      )
    }

    case "parallelogram": {
      const scale = Math.min(170 / input.base, 90 / input.height)
      const width = Math.max(input.base * scale, 8)
      const height = Math.max(input.height * scale, 8)
      const skew = Math.min(28, width * 0.2)
      const baseline = CENTER_Y + height / 2
      const top = baseline - height
      const bottomLeft = CENTER_X - width / 2 - skew / 2
      const bottomRight = CENTER_X + width / 2 - skew / 2
      const topLeft = bottomLeft + skew
      const topRight = bottomRight + skew

      return (
        <>
          <polygon
            points={`${bottomLeft},${baseline} ${bottomRight},${baseline} ${topRight},${top} ${topLeft},${top}`}
            className="fill-primary/10 stroke-primary"
            strokeWidth={2}
          />
          <HorizontalDimension
            x1={bottomLeft}
            x2={bottomRight}
            y={baseline + 24}
            label={`b = ${formatLength(input.base, lengthSymbol)}`}
          />
          <VerticalDimension
            x={topRight + 22}
            y1={top}
            y2={baseline}
            label={`h = ${formatLength(input.height, lengthSymbol)}`}
          />
        </>
      )
    }

    case "rhombus": {
      const scale = Math.min(
        100 / input.diagonalMajor,
        170 / input.diagonalMinor
      )
      const height = Math.max(input.diagonalMajor * scale, 8)
      const width = Math.max(input.diagonalMinor * scale, 8)
      const top = CENTER_Y - height / 2
      const bottom = CENTER_Y + height / 2
      const left = CENTER_X - width / 2
      const right = CENTER_X + width / 2

      return (
        <>
          <polygon
            points={`${CENTER_X},${top} ${right},${CENTER_Y} ${CENTER_X},${bottom} ${left},${CENTER_Y}`}
            className="fill-primary/10 stroke-primary"
            strokeWidth={2}
          />
          <g className="stroke-muted-foreground" strokeWidth={1}>
            <line
              x1={CENTER_X}
              y1={top}
              x2={CENTER_X}
              y2={bottom}
              strokeDasharray="3 3"
            />
            <line
              x1={left}
              y1={CENTER_Y}
              x2={right}
              y2={CENTER_Y}
              strokeDasharray="3 3"
            />
          </g>
          <HorizontalDimension
            x1={left}
            x2={right}
            y={bottom + 24}
            label={`d = ${formatLength(input.diagonalMinor, lengthSymbol)}`}
          />
          <VerticalDimension
            x={right + 22}
            y1={top}
            y2={bottom}
            label={`D = ${formatLength(input.diagonalMajor, lengthSymbol)}`}
          />
        </>
      )
    }

    case "regular-polygon": {
      const displaySides = Math.min(input.sides, 12)
      const radius = 65
      const rotation = displaySides % 2 === 0 ? Math.PI / displaySides : 0
      const points = Array.from({ length: displaySides }, (_, index) => {
        const angle =
          -Math.PI / 2 + rotation + (2 * Math.PI * index) / displaySides
        return `${CENTER_X + radius * Math.cos(angle)},${
          CENTER_Y + radius * Math.sin(angle)
        }`
      }).join(" ")

      return (
        <>
          <polygon
            points={points}
            className="fill-primary/10 stroke-primary"
            strokeWidth={2}
          />
          <text
            x={CENTER_X}
            y={CENTER_Y - radius - 12}
            textAnchor="middle"
            className="fill-muted-foreground text-[12px]"
          >
            n = {input.sides}
          </text>
          <text
            x={CENTER_X}
            y={CENTER_Y + radius + 20}
            textAnchor="middle"
            className="fill-muted-foreground text-[12px]"
          >
            l = {formatLength(input.side, lengthSymbol)}
          </text>
        </>
      )
    }
  }

  return null
}
