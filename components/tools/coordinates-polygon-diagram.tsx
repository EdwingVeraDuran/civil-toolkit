type DiagramVertex = {
  x: number
  y: number
}

type CoordinatesPolygonDiagramProps = {
  vertices: DiagramVertex[]
  areaLabel: string
  className?: string
}

const WIDTH = 360
const HEIGHT = 300
const PADDING_X = 42
const PADDING_TOP = 36
const PADDING_BOTTOM = 56

export function CoordinatesPolygonDiagram({
  vertices,
  areaLabel,
  className,
}: CoordinatesPolygonDiagramProps) {
  if (vertices.length < 3) {
    return null
  }

  const xs = vertices.map((vertex) => vertex.x)
  const ys = vertices.map((vertex) => vertex.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const spanX = maxX - minX
  const spanY = maxY - minY
  const availableWidth = WIDTH - PADDING_X * 2
  const availableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const scale =
    spanX > 0 && spanY > 0
      ? Math.min(availableWidth / spanX, availableHeight / spanY)
      : 1
  const drawingWidth = spanX * scale
  const drawingHeight = spanY * scale
  const offsetX = (WIDTH - drawingWidth) / 2
  const offsetY = PADDING_TOP + (availableHeight - drawingHeight) / 2

  const points = vertices.map((vertex) => ({
    x: offsetX + (vertex.x - minX) * scale,
    y: offsetY + (maxY - vertex.y) * scale,
  }))
  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ")

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Polígono de ${vertices.length} vértices. ${areaLabel}`}
      className={className}
    >
      <title>Diagrama del polígono por coordenadas</title>
      <desc>
        Representación esquemática del polígono cerrado; el eje Y apunta hacia
        el norte.
      </desc>

      <polygon
        points={polygonPoints}
        className="fill-primary/10 stroke-primary"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {points.map((point, index) => (
        <g key={`${vertices[index].x}-${vertices[index].y}-${index}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r={3.5}
            className="fill-background stroke-primary"
            strokeWidth={2}
          />
          <text
            x={point.x + 6}
            y={point.y - 6}
            className="fill-foreground text-[10px] font-medium"
          >
            {index + 1}
          </text>
        </g>
      ))}

      <g transform={`translate(${WIDTH - 30} 28)`}>
        <line
          x1={0}
          y1={12}
          x2={0}
          y2={-8}
          className="stroke-muted-foreground"
          strokeWidth={1.5}
        />
        <path d="M 0 -14 L -4 -6 L 4 -6 Z" className="fill-muted-foreground" />
        <text
          x={0}
          y={-20}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px] font-medium"
        >
          N
        </text>
      </g>

      <text
        x={WIDTH / 2}
        y={HEIGHT - 16}
        textAnchor="middle"
        className="fill-muted-foreground text-[11px] font-medium"
      >
        {areaLabel}
      </text>
    </svg>
  )
}
