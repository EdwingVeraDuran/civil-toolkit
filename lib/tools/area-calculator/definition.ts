import type { ToolDefinition } from "@/lib/tools/types"
import {
  AREA_SHAPE_LABELS,
  areaCalculatorSchema,
  type AreaInput,
  type AreaShape,
} from "@/lib/tools/area-calculator/schema"
import { areaCalculatorInfo } from "@/lib/tools/catalog"
import { createValidator } from "@/lib/tools/validate"
import {
  calculateArea,
  type AreaResult,
} from "@/lib/tools/area-calculator/calculate"
import { formatNumber } from "@/lib/units/format"
import { getUnit } from "@/lib/units/units"

function formatLength(value: number, symbol: string): string {
  return `${formatNumber(value, 3)} ${symbol}`
}

function dimensionsSummary(input: AreaInput, lengthSymbol: string): string {
  switch (input.shape) {
    case "square":
      return `L = ${formatLength(input.side, lengthSymbol)}`
    case "rectangle":
    case "triangle":
    case "parallelogram":
      return `b = ${formatLength(
        input.base,
        lengthSymbol
      )}, h = ${formatLength(input.height, lengthSymbol)}`
    case "circle":
      return `${input.circleMeasure === "radius" ? "r" : "d"} = ${formatLength(
        input.circleSize,
        lengthSymbol
      )}`
    case "trapezoid":
      return `B = ${formatLength(
        input.baseMajor,
        lengthSymbol
      )}, b = ${formatLength(
        input.baseMinor,
        lengthSymbol
      )}, h = ${formatLength(input.height, lengthSymbol)}`
    case "rhombus":
      return `D = ${formatLength(
        input.diagonalMajor,
        lengthSymbol
      )}, d = ${formatLength(input.diagonalMinor, lengthSymbol)}`
    case "regular-polygon":
      return `n = ${input.sides}, l = ${formatLength(input.side, lengthSymbol)}`
  }
}

function shapeLabel(shape: AreaShape): string {
  return AREA_SHAPE_LABELS[shape]
}

function formatSummary(input: AreaInput, result: AreaResult): string {
  const lengthSymbol = getUnit(input.lengthUnit)?.symbol ?? "m"
  const areaSymbol = getUnit(result.areaUnitId)?.symbol ?? "m²"

  return `${shapeLabel(input.shape)}: ${formatNumber(
    result.area,
    3
  )} ${areaSymbol} (${dimensionsSummary(input, lengthSymbol)})`
}

export const areaCalculatorDefinition: ToolDefinition<AreaInput, AreaResult> = {
  info: areaCalculatorInfo,
  schema: areaCalculatorSchema,
  validate: createValidator(areaCalculatorSchema),
  calculate: calculateArea,
  toSnapshot: (input, result) => ({
    inputs: { ...input },
    result: { ...result },
    summary: formatSummary(input, result),
  }),
}
