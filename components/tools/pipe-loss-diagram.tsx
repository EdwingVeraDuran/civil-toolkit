import { formatNumber } from "@/lib/units/format"

type PipeLossDiagramProps = {
  length: number
  diameterMm: number
  frictionLoss: number
  localLoss: number
  totalLoss: number
  totalK: number
  className?: string
}

const VIEW_WIDTH = 440
const VIEW_HEIGHT = 240
const PIPE_LEFT = 38
const PIPE_RIGHT = 402
const PIPE_TOP = 66
const PIPE_BOTTOM = 104
const PIPE_MIDDLE = (PIPE_TOP + PIPE_BOTTOM) / 2
const BAR_TOP = 174
const BAR_HEIGHT = 22
const BAR_WIDTH = PIPE_RIGHT - PIPE_LEFT

function FlowArrow({ x }: { x: number }) {
  return (
    <g className="stroke-primary" strokeWidth={2} strokeLinecap="round">
      <line x1={x} y1={PIPE_MIDDLE} x2={x + 20} y2={PIPE_MIDDLE} />
      <polyline
        points={`${x + 14},${PIPE_MIDDLE - 5} ${x + 20},${PIPE_MIDDLE} ${x + 14},${PIPE_MIDDLE + 5}`}
        fill="none"
      />
    </g>
  )
}

export function PipeLossDiagram({
  length,
  diameterMm,
  frictionLoss,
  localLoss,
  totalLoss,
  totalK,
  className,
}: PipeLossDiagramProps) {
  const total = Math.max(totalLoss, 1e-12)
  const frictionFraction = Math.min(1, Math.max(0, frictionLoss / total))
  const localFraction = Math.min(1, Math.max(0, localLoss / total))
  const frictionWidth = BAR_WIDTH * frictionFraction
  const localWidth = BAR_WIDTH * localFraction

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label="Esquema de tubería a presión y desglose de pérdidas por fricción y locales"
      className={className}
    >
      <text
        x={VIEW_WIDTH / 2}
        y={24}
        textAnchor="middle"
        className="fill-muted-foreground text-[12px]"
      >
        Tubería a presión
      </text>
      <text
        x={VIEW_WIDTH / 2}
        y={42}
        textAnchor="middle"
        className="fill-foreground text-[13px] font-medium"
      >
        D = {formatNumber(diameterMm, 1)} mm
      </text>

      <rect
        x={PIPE_LEFT}
        y={PIPE_TOP}
        width={PIPE_RIGHT - PIPE_LEFT}
        height={PIPE_BOTTOM - PIPE_TOP}
        rx={6}
        className="fill-primary/10 stroke-primary"
        strokeWidth={2}
      />

      <line
        x1={PIPE_LEFT}
        y1={PIPE_TOP - 8}
        x2={PIPE_LEFT}
        y2={PIPE_BOTTOM + 8}
        className="stroke-primary"
        strokeWidth={3}
      />
      <line
        x1={PIPE_RIGHT}
        y1={PIPE_TOP - 8}
        x2={PIPE_RIGHT}
        y2={PIPE_BOTTOM + 8}
        className="stroke-primary"
        strokeWidth={3}
      />

      <FlowArrow x={92} />
      <FlowArrow x={174} />
      <FlowArrow x={256} />
      <FlowArrow x={338} />

      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line
          x1={PIPE_LEFT}
          y1={PIPE_BOTTOM + 24}
          x2={PIPE_RIGHT}
          y2={PIPE_BOTTOM + 24}
        />
        <line
          x1={PIPE_LEFT}
          y1={PIPE_BOTTOM + 19}
          x2={PIPE_LEFT}
          y2={PIPE_BOTTOM + 29}
        />
        <line
          x1={PIPE_RIGHT}
          y1={PIPE_BOTTOM + 19}
          x2={PIPE_RIGHT}
          y2={PIPE_BOTTOM + 29}
        />
      </g>
      <text
        x={VIEW_WIDTH / 2}
        y={PIPE_BOTTOM + 41}
        textAnchor="middle"
        className="fill-muted-foreground text-[12px]"
      >
        L = {formatNumber(length, 2)} m
      </text>

      <text
        x={PIPE_LEFT}
        y={BAR_TOP - 10}
        className="fill-muted-foreground text-[11px]"
      >
        h_f = {formatNumber(frictionLoss, 3)} m
      </text>
      <text
        x={PIPE_RIGHT}
        y={BAR_TOP - 10}
        textAnchor="end"
        className="fill-muted-foreground text-[11px]"
      >
        h_m = {formatNumber(localLoss, 3)} m
      </text>

      <rect
        x={PIPE_LEFT}
        y={BAR_TOP}
        width={BAR_WIDTH}
        height={BAR_HEIGHT}
        rx={4}
        className="fill-muted/40 stroke-border"
        strokeWidth={1}
      />
      {frictionWidth > 0 ? (
        <rect
          x={PIPE_LEFT}
          y={BAR_TOP}
          width={frictionWidth}
          height={BAR_HEIGHT}
          rx={4}
          className="fill-primary/70"
        />
      ) : null}
      {localWidth > 0 ? (
        <rect
          x={PIPE_LEFT + frictionWidth}
          y={BAR_TOP}
          width={localWidth}
          height={BAR_HEIGHT}
          rx={4}
          className="fill-amber-500/80"
        />
      ) : null}

      <text
        x={VIEW_WIDTH / 2}
        y={BAR_TOP + BAR_HEIGHT + 20}
        textAnchor="middle"
        className="fill-foreground text-[12px] font-medium"
      >
        H = {formatNumber(totalLoss, 3)} m · ΣK = {formatNumber(totalK, 2)}
      </text>
    </svg>
  )
}
