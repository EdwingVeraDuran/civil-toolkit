import type { ToolDefinition } from "@/lib/tools/types"
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
}
