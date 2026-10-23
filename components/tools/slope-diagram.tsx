type SlopeDiagramProps = {
  run: number
  rise: number
  runLabel: string
  riseLabel: string
  slopeLengthLabel: string
  angleLabel: string
  className?: string
}

const VIEW_WIDTH = 400
const VIEW_HEIGHT = 240
const ORIGIN_X = 120
const ORIGIN_Y = 110
const MAX_WIDTH = 200
const MAX_HEIGHT = 72
const ANGLE_RADIUS = 32
const ANGLE_LABEL_GAP = 12
const HYPOTENUSE_LABEL_OFFSET = 14

export function SlopeDiagram({
  run,
  rise,
  runLabel,
  riseLabel,
  slopeLengthLabel,
  angleLabel,
  className,
}: SlopeDiagramProps) {
  const safeRun = run > 0 ? run : 1
  const absRise = Math.abs(rise)
  const scale =
    absRise > 0
      ? Math.min(MAX_WIDTH / safeRun, MAX_HEIGHT / absRise)
      : MAX_WIDTH / safeRun
  const width = Math.max(safeRun * scale, 2)
  const height = absRise * scale

  const baselineY = ORIGIN_Y
  const endX = ORIGIN_X + width
  const topY = rise >= 0 ? baselineY - height : baselineY + height
  const bottomY = Math.max(baselineY, topY)
  const dimensionY = bottomY + 24
  const markerSize = Math.min(10, width * 0.35)

  const midX = ORIGIN_X + width / 2
  const midY = (baselineY + topY) / 2

  const angle = Math.atan2(rise, safeRun)
  const sweepFlag = rise >= 0 ? 0 : 1

  // Ángulo exterior: se dibuja entre la prolongación izquierda del cateto
  // horizontal y la prolongación de la hipotenusa hacia atrás.
  const angleArcStartX = ORIGIN_X - ANGLE_RADIUS
  const angleArcEndX = ORIGIN_X - ANGLE_RADIUS * Math.cos(angle)
  const angleArcEndY = baselineY + ANGLE_RADIUS * Math.sin(angle)
  const angleGuideStartX = angleArcStartX
  const angleGuideEndX = ORIGIN_X - (ANGLE_RADIUS + 6) * Math.cos(angle)
  const angleGuideEndY = baselineY + (ANGLE_RADIUS + 6) * Math.sin(angle)
  const angleLabelX = ORIGIN_X - ANGLE_RADIUS - ANGLE_LABEL_GAP
  const angleLabelY = baselineY + (rise > 0 ? 10 : rise < 0 ? -10 : 0)

  // La etiqueta de la hipotenusa se alinea con la pendiente y se separa
  // hacia afuera del triángulo para que no quede tapada por el relleno.
  const lineAngle = Math.atan2(topY - baselineY, width)
  const lineRotationDeg = (lineAngle * 180) / Math.PI
  const lineLength = Math.hypot(width, height)
  const hypotenuseNormalX = lineLength === 0 ? 0 : -height / lineLength
  const hypotenuseNormalY =
    lineLength === 0 ? -1 : (-Math.sign(rise || 1) * width) / lineLength
  const hypotenuseLabelX = midX + hypotenuseNormalX * HYPOTENUSE_LABEL_OFFSET
  const hypotenuseLabelY = midY + hypotenuseNormalY * HYPOTENUSE_LABEL_OFFSET

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Triángulo de pendiente: ${runLabel}, ${riseLabel}, ${angleLabel}`}
      className={className}
    >
      <path
        d={`M ${ORIGIN_X} ${baselineY} L ${endX} ${baselineY} L ${endX} ${topY} Z`}
        className="fill-primary/10 stroke-primary"
        strokeWidth={2}
      />

      {height > 0 ? (
        <path
          d={
            rise >= 0
              ? `M ${endX - markerSize} ${baselineY} L ${endX - markerSize} ${baselineY - markerSize} L ${endX} ${baselineY - markerSize}`
              : `M ${endX - markerSize} ${baselineY} L ${endX - markerSize} ${baselineY + markerSize} L ${endX} ${baselineY + markerSize}`
          }
          className="fill-none stroke-muted-foreground"
          strokeWidth={1}
        />
      ) : null}

      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line x1={ORIGIN_X} y1={dimensionY} x2={endX} y2={dimensionY} />
        <line
          x1={ORIGIN_X}
          y1={dimensionY - 5}
          x2={ORIGIN_X}
          y2={dimensionY + 5}
        />
        <line x1={endX} y1={dimensionY - 5} x2={endX} y2={dimensionY + 5} />
      </g>
      <text
        x={midX}
        y={dimensionY + 18}
        textAnchor="middle"
        className="fill-muted-foreground text-[12px]"
      >
        {runLabel}
      </text>

      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line x1={endX + 22} y1={baselineY} x2={endX + 22} y2={topY} />
        <line x1={endX + 17} y1={baselineY} x2={endX + 27} y2={baselineY} />
        <line x1={endX + 17} y1={topY} x2={endX + 27} y2={topY} />
      </g>
      <text
        x={endX + 42}
        y={midY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground text-[12px]"
        transform={`rotate(-90 ${endX + 42} ${midY})`}
      >
        {riseLabel}
      </text>

      <g className="stroke-muted-foreground" strokeWidth={1}>
        <line
          x1={angleGuideStartX}
          y1={baselineY}
          x2={ORIGIN_X}
          y2={baselineY}
          strokeDasharray="3 3"
        />
        <line
          x1={ORIGIN_X}
          y1={baselineY}
          x2={angleGuideEndX}
          y2={angleGuideEndY}
          strokeDasharray="3 3"
        />
      </g>
      <path
        d={`M ${angleArcStartX} ${baselineY} A ${ANGLE_RADIUS} ${ANGLE_RADIUS} 0 0 ${sweepFlag} ${angleArcEndX} ${angleArcEndY}`}
        className="fill-none stroke-muted-foreground"
        strokeWidth={1}
      />
      <text
        x={angleLabelX}
        y={angleLabelY}
        textAnchor="end"
        dominantBaseline="middle"
        className="fill-muted-foreground text-[11px]"
      >
        {angleLabel}
      </text>

      <text
        x={hypotenuseLabelX}
        y={hypotenuseLabelY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-muted-foreground text-[11px]"
        transform={`rotate(${lineRotationDeg} ${hypotenuseLabelX} ${hypotenuseLabelY})`}
      >
        {slopeLengthLabel}
      </text>
    </svg>
  )
}
