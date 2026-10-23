import type { ChannelGeometry } from "@/lib/aguas/canales"
import { CHANNEL_SECTION_LABELS } from "@/lib/tools/open-channel-flow/schema"
import { formatNumber } from "@/lib/units/format"

type ChannelSectionDiagramProps = {
  geometry: ChannelGeometry
  depth: number
  criticalDepth?: number | null
  className?: string
}

const VIEW_WIDTH = 380
const VIEW_HEIGHT = 260
const CENTER_X = 190
const BOTTOM_Y = 205
const TOP_Y = 55
const DRAW_HEIGHT = BOTTOM_Y - TOP_Y
const MAX_DRAW_WIDTH = 220

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function formatLength(value: number): string {
  return `${formatNumber(value, 2)} m`
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
  if (x2 - x1 < 1) return null

  return (
    <>
      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line x1={x1} y1={y} x2={x2} y2={y} />
        <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} />
        <line x1={x2} y1={y - 5} x2={x2} y2={y + 5} />
      </g>
      <text
        x={(x1 + x2) / 2}
        y={y + 17}
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
  if (Math.abs(y2 - y1) < 1) return null

  const labelX = x + 16
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

function TrapezoidDiagram({
  geometry,
  depth,
  criticalDepth,
}: {
  geometry: Exclude<ChannelGeometry, { section: "circular" }>
  depth: number
  criticalDepth?: number | null
}) {
  const bottomWidth =
    geometry.section === "triangular" ? 0 : geometry.bottomWidth
  const sideSlope = geometry.section === "rectangular" ? 0 : geometry.sideSlope
  const maxDepth = Math.max(
    depth * 1.35,
    depth + 0.5,
    criticalDepth ? criticalDepth * 1.1 : 0
  )
  const maxTopWidth = bottomWidth + 2 * sideSlope * maxDepth
  const xScale = MAX_DRAW_WIDTH / Math.max(maxTopWidth, 1e-9)

  const bottomWidthPx = bottomWidth * xScale
  const topWidthPx = maxTopWidth * xScale
  const bottomLeft = CENTER_X - bottomWidthPx / 2
  const bottomRight = CENTER_X + bottomWidthPx / 2
  const topLeft = CENTER_X - topWidthPx / 2
  const topRight = CENTER_X + topWidthPx / 2

  const waterY = BOTTOM_Y - (depth / maxDepth) * DRAW_HEIGHT
  const waterWidth = bottomWidth + 2 * sideSlope * depth
  const waterWidthPx = waterWidth * xScale
  const waterLeft = CENTER_X - waterWidthPx / 2
  const waterRight = CENTER_X + waterWidthPx / 2

  const criticalY =
    criticalDepth !== null && criticalDepth !== undefined
      ? BOTTOM_Y - clamp(criticalDepth / maxDepth, 0, 1) * DRAW_HEIGHT
      : null
  const criticalWidth =
    criticalDepth !== null && criticalDepth !== undefined
      ? bottomWidth + 2 * sideSlope * criticalDepth
      : 0
  const criticalWidthPx = criticalWidth * xScale
  const criticalLeft = CENTER_X - criticalWidthPx / 2
  const criticalRight = CENTER_X + criticalWidthPx / 2

  return (
    <>
      <polygon
        points={`${bottomLeft},${BOTTOM_Y} ${bottomRight},${BOTTOM_Y} ${topRight},${TOP_Y} ${topLeft},${TOP_Y}`}
        className="fill-muted/40 stroke-primary"
        strokeWidth={2}
      />
      <polygon
        points={`${bottomLeft},${BOTTOM_Y} ${bottomRight},${BOTTOM_Y} ${waterRight},${waterY} ${waterLeft},${waterY}`}
        className="fill-primary/25 stroke-primary/70"
        strokeWidth={1}
      />
      <line
        x1={waterLeft}
        y1={waterY}
        x2={waterRight}
        y2={waterY}
        className="stroke-primary"
        strokeWidth={2}
      />

      {criticalY !== null ? (
        <>
          <line
            x1={criticalLeft}
            y1={criticalY}
            x2={criticalRight}
            y2={criticalY}
            className="stroke-amber-600"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          <text
            x={criticalRight + 6}
            y={criticalY}
            dominantBaseline="middle"
            className="fill-amber-700 text-[11px] dark:fill-amber-400"
          >
            y_c
          </text>
        </>
      ) : null}

      <HorizontalDimension
        x1={bottomLeft}
        x2={bottomRight}
        y={BOTTOM_Y + 22}
        label={`b = ${formatLength(bottomWidth)}`}
      />
      <VerticalDimension
        x={Math.max(topRight, waterRight) + 24}
        y1={waterY}
        y2={BOTTOM_Y}
        label={`y = ${formatLength(depth)}`}
      />

      {sideSlope > 0 ? (
        <text
          x={14}
          y={TOP_Y + 2}
          className="fill-muted-foreground text-[12px]"
        >
          z = {formatNumber(sideSlope, 2)} (H:V)
        </text>
      ) : null}
    </>
  )
}

function CircularDiagram({
  diameter,
  depth,
  criticalDepth,
}: {
  diameter: number
  depth: number
  criticalDepth?: number | null
}) {
  const radius = 70
  const centerY = (TOP_Y + BOTTOM_Y) / 2
  const depthRatio = clamp(depth / diameter, 0, 1)
  const surfaceY = centerY + radius - 2 * radius * depthRatio

  const waterPoints: string[] = []
  const relativeY = clamp((surfaceY - centerY) / radius, -1, 1)
  const startAngle = Math.asin(relativeY)
  const endAngle = Math.PI - startAngle
  const steps = 36

  for (let index = 0; index <= steps; index += 1) {
    const angle = startAngle + ((endAngle - startAngle) * index) / steps
    waterPoints.push(
      `${CENTER_X + radius * Math.cos(angle)},${
        centerY + radius * Math.sin(angle)
      }`
    )
  }

  const chordHalfWidth = Math.sqrt(
    Math.max(0, radius * radius - (surfaceY - centerY) ** 2)
  )

  const criticalY =
    criticalDepth !== null && criticalDepth !== undefined
      ? centerY + radius - 2 * radius * clamp(criticalDepth / diameter, 0, 1)
      : null
  const criticalHalfWidth =
    criticalY !== null
      ? Math.sqrt(Math.max(0, radius * radius - (criticalY - centerY) ** 2))
      : 0

  return (
    <>
      <circle
        cx={CENTER_X}
        cy={centerY}
        r={radius}
        className="fill-muted/30 stroke-primary"
        strokeWidth={2}
      />
      <polygon
        points={waterPoints.join(" ")}
        className="fill-primary/25 stroke-primary/70"
        strokeWidth={1}
      />
      <line
        x1={CENTER_X - chordHalfWidth}
        y1={surfaceY}
        x2={CENTER_X + chordHalfWidth}
        y2={surfaceY}
        className="stroke-primary"
        strokeWidth={2}
      />

      {criticalY !== null ? (
        <>
          <line
            x1={CENTER_X - criticalHalfWidth}
            y1={criticalY}
            x2={CENTER_X + criticalHalfWidth}
            y2={criticalY}
            className="stroke-amber-600"
            strokeWidth={1.5}
            strokeDasharray="5 4"
          />
          <text
            x={CENTER_X + criticalHalfWidth + 6}
            y={criticalY}
            dominantBaseline="middle"
            className="fill-amber-700 text-[11px] dark:fill-amber-400"
          >
            y_c
          </text>
        </>
      ) : null}

      <VerticalDimension
        x={CENTER_X + radius + 20}
        y1={surfaceY}
        y2={centerY + radius}
        label={`y = ${formatLength(depth)}`}
      />
      <VerticalDimension
        x={CENTER_X + radius + 48}
        y1={centerY - radius}
        y2={centerY + radius}
        label={`D = ${formatLength(diameter)}`}
      />
    </>
  )
}

export function ChannelSectionDiagram({
  geometry,
  depth,
  criticalDepth,
  className,
}: ChannelSectionDiagramProps) {
  const ariaLabel = `Esquema de la sección ${CHANNEL_SECTION_LABELS[
    geometry.section
  ].toLowerCase()} con nivel de agua`

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      {geometry.section === "circular" ? (
        <CircularDiagram
          diameter={geometry.diameter}
          depth={depth}
          criticalDepth={criticalDepth}
        />
      ) : (
        <TrapezoidDiagram
          geometry={geometry}
          depth={depth}
          criticalDepth={criticalDepth}
        />
      )}
    </svg>
  )
}
