import { formatNumber } from "@/lib/units/format"

type BearingCompassDiagramProps = {
  azimuthDeg: number
  className?: string
}

const SIZE = 320
const CENTER = SIZE / 2
const RING_RADIUS = 112
const LINE_RADIUS = 92
const CARDINAL_RADIUS = 132

function normalizeAzimuth(value: number): number {
  const normalized = value % 360
  return normalized === 0 ? 0 : normalized + (normalized < 0 ? 360 : 0)
}

function cardinalPoint(angleDeg: number, radius: number) {
  const radians = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.sin(radians),
    y: CENTER - radius * Math.cos(radians),
  }
}

export function BearingCompassDiagram({
  azimuthDeg,
  className,
}: BearingCompassDiagramProps) {
  const azimuth = normalizeAzimuth(azimuthDeg)
  const endpoint = cardinalPoint(azimuth, LINE_RADIUS)
  const north = cardinalPoint(0, CARDINAL_RADIUS)
  const east = cardinalPoint(90, CARDINAL_RADIUS)
  const south = cardinalPoint(180, CARDINAL_RADIUS)
  const west = cardinalPoint(270, CARDINAL_RADIUS)

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`Brújula con la línea orientada a un azimut de ${formatNumber(
        azimuth,
        2
      )}°`}
      className={className}
    >
      <title>Diagrama de orientación de la línea</title>

      <circle
        cx={CENTER}
        cy={CENTER}
        r={RING_RADIUS}
        className="fill-muted stroke-border"
        fillOpacity={0.35}
        strokeWidth={1.5}
      />

      <line
        x1={CENTER - RING_RADIUS}
        y1={CENTER}
        x2={CENTER + RING_RADIUS}
        y2={CENTER}
        className="stroke-border"
        strokeDasharray="3 5"
      />
      <line
        x1={CENTER}
        y1={CENTER - RING_RADIUS}
        x2={CENTER}
        y2={CENTER + RING_RADIUS}
        className="stroke-border"
        strokeDasharray="3 5"
      />

      <line
        x1={CENTER}
        y1={CENTER}
        x2={endpoint.x}
        y2={endpoint.y}
        className="stroke-primary"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={endpoint.x} cy={endpoint.y} r={5} className="fill-primary" />
      <circle cx={CENTER} cy={CENTER} r={4} className="fill-foreground" />

      <text
        x={north.x}
        y={north.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-primary font-semibold"
        fontSize={14}
      >
        N
      </text>
      <text
        x={east.x}
        y={east.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground"
        fontSize={12}
      >
        E
      </text>
      <text
        x={south.x}
        y={south.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground"
        fontSize={12}
      >
        S
      </text>
      <text
        x={west.x}
        y={west.y}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground"
        fontSize={12}
      >
        W
      </text>

      <text
        x={CENTER}
        y={SIZE - 14}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={12}
      >
        Az = {formatNumber(azimuth, 2)}°
      </text>
    </svg>
  )
}
