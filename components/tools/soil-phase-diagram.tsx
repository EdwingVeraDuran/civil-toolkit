import type { SoilPhaseResult } from "@/lib/tools/soil-phase-relationships/calculate"
import { formatNumber } from "@/lib/units/format"
import { Measurement } from "@/lib/units/measurement"
import { getUnit } from "@/lib/units/units"

type SoilPhaseDiagramProps = {
  result: SoilPhaseResult
  volumeUnitId: string
  forceUnitId: string
  className?: string
}

const VIEW_WIDTH = 460
const VIEW_HEIGHT = 340
const BLOCK_X = 170
const BLOCK_WIDTH = 140
const BLOCK_TOP = 40
const LAYER_HEIGHT = 70
const BLOCK_BOTTOM = BLOCK_TOP + LAYER_HEIGHT * 3

function convertVolume(value: number, unitId: string): number {
  const unit = getUnit(unitId)
  if (!unit || unit.dimension !== "volume") return value
  return Measurement.from(value, "m3").to(unit).value
}

function convertForce(value: number, unitId: string): number {
  const unit = getUnit(unitId)
  if (!unit || unit.dimension !== "force") return value
  return Measurement.from(value, "kn").to(unit).value
}

function formatLabel(value: number): string {
  return formatNumber(value, 2)
}

export function SoilPhaseDiagram({
  result,
  volumeUnitId,
  forceUnitId,
  className,
}: SoilPhaseDiagramProps) {
  const volumeUnit = getUnit(volumeUnitId)
  const forceUnit = getUnit(forceUnitId)
  const volumeSymbol = volumeUnit?.symbol ?? "m³"
  const forceSymbol = forceUnit?.symbol ?? "kN"

  const volumeAir = convertVolume(result.phase.volumeAirM3, volumeUnitId)
  const volumeWater = convertVolume(result.phase.volumeWaterM3, volumeUnitId)
  const volumeSolids = convertVolume(result.phase.volumeSolidsM3, volumeUnitId)
  const volumeVoids = convertVolume(result.phase.volumeVoidsM3, volumeUnitId)
  const volumeTotal = convertVolume(result.phase.volumeTotalM3, volumeUnitId)

  const weightWater = convertForce(result.phase.weightWaterKN, forceUnitId)
  const weightSolids = convertForce(result.phase.weightSolidsKN, forceUnitId)
  const weightTotal = convertForce(result.phase.weightTotalKN, forceUnitId)

  const airY = BLOCK_TOP
  const waterY = BLOCK_TOP + LAYER_HEIGHT
  const solidsY = BLOCK_TOP + LAYER_HEIGHT * 2
  const centerX = BLOCK_X + BLOCK_WIDTH / 2

  const layers = [
    {
      key: "air",
      y: airY,
      name: "Aire",
      volumeLabel: `Va = ${formatLabel(volumeAir)} ${volumeSymbol}`,
      weightLabel: "Wa = 0",
      className: "fill-muted/15",
    },
    {
      key: "water",
      y: waterY,
      name: "Agua",
      volumeLabel: `Vw = ${formatLabel(volumeWater)} ${volumeSymbol}`,
      weightLabel: `Ww = ${formatLabel(weightWater)} ${forceSymbol}`,
      className: "fill-sky-500/15",
    },
    {
      key: "solids",
      y: solidsY,
      name: "Sólidos",
      volumeLabel: `Vs = ${formatLabel(volumeSolids)} ${volumeSymbol}`,
      weightLabel: `Ws = ${formatLabel(weightSolids)} ${forceSymbol}`,
      className: "fill-amber-600/20",
    },
  ]

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Diagrama de fases: Va = ${formatLabel(
        volumeAir
      )} ${volumeSymbol}, Vw = ${formatLabel(
        volumeWater
      )} ${volumeSymbol}, Vs = ${formatLabel(
        volumeSolids
      )} ${volumeSymbol}, Ww = ${formatLabel(weightWater)} ${forceSymbol}, Ws = ${formatLabel(
        weightSolids
      )} ${forceSymbol}, W = ${formatLabel(weightTotal)} ${forceSymbol}`}
      className={className}
    >
      <text
        x={BLOCK_X}
        y={28}
        className="fill-muted-foreground text-[11px] font-medium"
      >
        Volumen
      </text>
      <text
        x={BLOCK_X + BLOCK_WIDTH}
        y={28}
        textAnchor="end"
        className="fill-muted-foreground text-[11px] font-medium"
      >
        Peso
      </text>

      {layers.map((layer) => (
        <g key={layer.key}>
          <rect
            x={BLOCK_X}
            y={layer.y}
            width={BLOCK_WIDTH}
            height={LAYER_HEIGHT}
            className={`${layer.className} stroke-border`}
            strokeWidth={1.5}
          />
          <text
            x={centerX}
            y={layer.y + LAYER_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-[12px] font-medium"
          >
            {layer.name}
          </text>
          <text
            x={BLOCK_X - 12}
            y={layer.y + LAYER_HEIGHT / 2}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {layer.volumeLabel}
          </text>
          <text
            x={BLOCK_X + BLOCK_WIDTH + 12}
            y={layer.y + LAYER_HEIGHT / 2}
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px]"
          >
            {layer.weightLabel}
          </text>
        </g>
      ))}

      <g className="stroke-border" strokeWidth={1}>
        <line x1={BLOCK_X} y1={waterY} x2={BLOCK_X + BLOCK_WIDTH} y2={waterY} />
        <line
          x1={BLOCK_X}
          y1={solidsY}
          x2={BLOCK_X + BLOCK_WIDTH}
          y2={solidsY}
        />
      </g>

      <text
        x={BLOCK_X}
        y={BLOCK_BOTTOM + 28}
        className="fill-foreground text-[11px]"
      >
        Vv = {formatLabel(volumeVoids)} {volumeSymbol}
      </text>
      <text
        x={BLOCK_X}
        y={BLOCK_BOTTOM + 44}
        className="fill-foreground text-[11px]"
      >
        V = {formatLabel(volumeTotal)} {volumeSymbol}
      </text>
      <text
        x={BLOCK_X + BLOCK_WIDTH}
        y={BLOCK_BOTTOM + 28}
        textAnchor="end"
        className="fill-foreground text-[11px]"
      >
        W = {formatLabel(weightTotal)} {forceSymbol}
      </text>

      <text
        x={VIEW_WIDTH / 2}
        y={VIEW_HEIGHT - 8}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
      >
        Base: Vs = 1 m³ de sólidos · esquemático, no a escala
      </text>
    </svg>
  )
}
