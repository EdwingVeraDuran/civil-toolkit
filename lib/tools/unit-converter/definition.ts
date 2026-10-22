import type { ToolDefinition } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"
import { unitConverterInfo } from "@/lib/tools/catalog"
import { createValidator } from "@/lib/tools/validate"
import {
  unitConversionSchema,
  type UnitConversionInput,
} from "@/lib/tools/unit-converter/schema"
import {
  calculateConversion,
  type UnitConversionResult,
} from "@/lib/tools/unit-converter/calculate"

export const unitConverterDefinition: ToolDefinition<UnitConversionInput, UnitConversionResult> = {
  info: unitConverterInfo,
  schema: unitConversionSchema,
  validate: createValidator(unitConversionSchema),
  calculate: calculateConversion,
  toSnapshot: (input, result) => ({
    inputs: {
      value: input.value,
      fromUnitId: input.fromUnitId,
      toUnitId: input.toUnitId,
    },
    result: {
      value: result.to.value,
      fromUnitId: result.from.unit.id,
      toUnitId: result.to.unit.id,
      fromSymbol: result.from.unit.symbol,
      toSymbol: result.to.unit.symbol,
      rows: result.rows.map((row) => ({
        unitId: row.unit.id,
        symbol: row.unit.symbol,
        name: row.unit.name,
        value: row.measurement.value,
      })),
    },
    summary: `${formatNumber(input.value)} ${result.from.unit.symbol} → ${formatNumber(result.to.value)} ${result.to.unit.symbol}`,
  }),
}
