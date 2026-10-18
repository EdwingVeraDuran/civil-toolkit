import { describe, expect, it } from "vitest"

import { calculateConversion } from "@/lib/tools/unit-converter/calculate"
import { unitConverterDefinition } from "@/lib/tools/unit-converter/definition"

describe("calculateConversion", () => {
  it("convierte y devuelve equivalencias de toda la dimensión", () => {
    const result = calculateConversion({ value: 1, fromUnitId: "m", toUnitId: "ft" })

    expect(result.to.value).toBeCloseTo(3.280839895, 6)
    expect(result.rows.some((row) => row.unit.id === "in")).toBe(true)
    expect(result.rows).toHaveLength(
      new Set(result.rows.map((row) => row.unit.id)).size,
    )
  })

  it("lanza un error si las dimensiones no coinciden", () => {
    expect(() => calculateConversion({ value: 1, fromUnitId: "m", toUnitId: "kg" })).toThrow()
  })
})

describe("unitConverterDefinition", () => {
  it("acepta valores numéricos y con coma decimal", () => {
    expect(unitConverterDefinition.validate({ value: "2,5", fromUnitId: "m", toUnitId: "cm" }))
      .toEqual({ valid: true })
    expect(unitConverterDefinition.validate({ value: "10", fromUnitId: "m", toUnitId: "ft" }))
      .toEqual({ valid: true })
  })

  it("rechaza valores no numéricos con un error en el campo value", () => {
    const result = unitConverterDefinition.validate({
      value: "abc",
      fromUnitId: "m",
      toUnitId: "ft",
    })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "value")).toBe(true)
    }
  })

  it("rechaza unidades de dimensiones distintas", () => {
    const result = unitConverterDefinition.validate({
      value: 1,
      fromUnitId: "m",
      toUnitId: "kg",
    })
    expect(result.valid).toBe(false)
  })

  it("expone la misma info que el catálogo", () => {
    expect(unitConverterDefinition.info.id).toBe("unit-converter")
    expect(unitConverterDefinition.info.category).toBe("general")
  })
})
