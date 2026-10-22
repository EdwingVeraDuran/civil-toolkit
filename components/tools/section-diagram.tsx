type SectionDiagramProps = {
  width: number
  height: number
  className?: string
}

const VIEW_WIDTH = 320
const VIEW_HEIGHT = 260
const AREA_X = 56
const AREA_Y = 32
const AREA_WIDTH = 200
const AREA_HEIGHT = 160

export function SectionDiagram({ width, height, className }: SectionDiagramProps) {
  const scale = Math.min(AREA_WIDTH / width, AREA_HEIGHT / height)
  const rectWidth = width * scale
  const rectHeight = height * scale
  const rectX = AREA_X + (AREA_WIDTH - rectWidth) / 2
  const rectY = AREA_Y + (AREA_HEIGHT - rectHeight) / 2

  const bDimY = rectY + rectHeight + 26
  const hDimX = rectX + rectWidth + 26

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Sección transversal de ${width} por ${height} milímetros`}
      className={className}
    >
      <rect
        x={rectX}
        y={rectY}
        width={rectWidth}
        height={rectHeight}
        rx={3}
        className="fill-primary/10 stroke-primary"
        strokeWidth={2}
      />

      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line x1={rectX} y1={bDimY} x2={rectX + rectWidth} y2={bDimY} />
        <line x1={rectX} y1={bDimY - 5} x2={rectX} y2={bDimY + 5} />
        <line x1={rectX + rectWidth} y1={bDimY - 5} x2={rectX + rectWidth} y2={bDimY + 5} />
      </g>
      <text
        x={rectX + rectWidth / 2}
        y={bDimY + 20}
        textAnchor="middle"
        className="fill-muted-foreground text-[12px]"
      >
        b = {width} mm
      </text>

      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line x1={hDimX} y1={rectY} x2={hDimX} y2={rectY + rectHeight} />
        <line x1={hDimX - 5} y1={rectY} x2={hDimX + 5} y2={rectY} />
        <line x1={hDimX - 5} y1={rectY + rectHeight} x2={hDimX + 5} y2={rectY + rectHeight} />
      </g>
      <text
        x={hDimX}
        y={rectY + rectHeight / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground text-[12px]"
        transform={`rotate(-90 ${hDimX} ${rectY + rectHeight / 2})`}
      >
        h = {height} mm
      </text>
    </svg>
  )
}
