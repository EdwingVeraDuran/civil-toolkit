import { describe, expect, it } from "vitest"

import {
  calculateLoadCombinations,
  type LoadCombinationRow,
} from "@/lib/tools/load-combinations/calculate"
import { loadCombinationsDefinition } from "@/lib/tools/load-combinations/definition"
import {
  loadCombinationsSchema,
  type LoadCombinationsInput,
} from "@/lib/tools/load-combinations/schema"

function parseInput(
  overrides: Record<string, unknown> = {}
): LoadCombinationsInput {
  return loadCombinationsSchema.parse({
    deadLoad: "10",
    liveLoad: "4",
    windLoad: "2",
    seismicLoad: "3",
    unit: "kn",
    useHalfLive: false,
    windWithoutDirectionalFactor: false,
    seismicAtServiceLevel: false,
    ...overrides,
  })
}

function byKey(rows: LoadCombinationRow[], key: string): LoadCombinationRow {
  const row = rows.find((item) => item.key === key)

  if (!row) {
    throw new Error(`No se encontró la combinación ${key}`)
  }

  return row
}

describe("cálculo de combinaciones de carga", () => {
  it("acepta coma decimal en las solicitaciones", () => {
    const input = parseInput({
      deadLoad: "10,5",
      liveLoad: "4,25",
      windLoad: "-2,5",
      seismicLoad: "3,75",
    })

    expect(input.deadLoad).toBe(10.5)
    expect(input.liveLoad).toBe(4.25)
    expect(input.windLoad).toBe(-2.5)
    expect(input.seismicLoad).toBe(3.75)
  })

  it("construye las ecuaciones con los factores aplicados", () => {
    const result = calculateLoadCombinations(parseInput())

    expect(byKey(result.combinations, "B.2.4-1").equation).toBe("1,4D")
    expect(byKey(result.combinations, "B.2.4-2").equation).toBe("1,2D + 1,6L")
    expect(byKey(result.combinations, "B.2.4-3-L").equation).toBe("1,2D + 1,0L")
    expect(byKey(result.combinations, "B.2.4-3-W").equation).toBe("1,2D + 0,8W")
    expect(byKey(result.combinations, "B.2.4-4").equation).toBe(
      "1,2D + 1,6W + 1,0L"
    )
    expect(byKey(result.combinations, "B.2.4-5").equation).toBe(
      "1,2D + 1,0E + 1,0L"
    )
    expect(byKey(result.combinations, "B.2.4-6").equation).toBe("0,9D + 1,6W")
    expect(byKey(result.combinations, "B.2.4-7").equation).toBe("0,9D + 1,0E")
  })

  it("actualiza las ecuaciones al activar las opciones normativas", () => {
    const result = calculateLoadCombinations(
      parseInput({
        useHalfLive: true,
        windWithoutDirectionalFactor: true,
        seismicAtServiceLevel: true,
      })
    )

    expect(byKey(result.combinations, "B.2.4-2").equation).toBe("1,2D + 1,6L")
    expect(byKey(result.combinations, "B.2.4-3-L").equation).toBe("1,2D + 0,5L")
    expect(byKey(result.combinations, "B.2.4-3-W").equation).toBe("1,2D + 0,8W")
    expect(byKey(result.combinations, "B.2.4-4").equation).toBe(
      "1,2D + 1,3W + 0,5L"
    )
    expect(byKey(result.combinations, "B.2.4-5").equation).toBe(
      "1,2D + 1,4E + 0,5L"
    )
    expect(byKey(result.combinations, "B.2.4-6").equation).toBe("0,9D + 1,3W")
    expect(byKey(result.combinations, "B.2.4-7").equation).toBe("0,9D + 1,4E")
  })

  it("identifica los valores máximo y mínimo", () => {
    const result = calculateLoadCombinations(parseInput())

    expect(result.maximum.key).toBe("B.2.4-4")
    expect(result.maximum.value).toBeCloseTo(19.2, 12)
    expect(result.minimum.key).toBe("B.2.4-7")
    expect(result.minimum.value).toBeCloseTo(12, 12)
  })

  it("conserva la unidad seleccionada", () => {
    const result = calculateLoadCombinations(parseInput({ unit: "knm2" }))

    expect(result.unit).toBe("knm2")
    expect(result.reference).toContain("B.2.4.2")
  })

  it("genera el resumen del cálculo guardado", () => {
    const input = parseInput()
    const result = calculateLoadCombinations(input)
    const snapshot = loadCombinationsDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "Combinaciones NSR-10: máx. B.2.4-4 = 19,200 kN; mín. B.2.4-7 = 12,000 kN"
    )
    expect(snapshot.inputs).toMatchObject({
      deadLoad: 10,
      liveLoad: 4,
      windLoad: 2,
      seismicLoad: 3,
      unit: "kn",
    })
    expect(snapshot.result).toHaveProperty("combinations")
  })

  it("reporta errores de validación en los campos", () => {
    const invalidNumber = loadCombinationsDefinition.validate({
      deadLoad: "abc",
      liveLoad: 4,
      windLoad: 2,
      seismicLoad: 3,
      unit: "kn",
      useHalfLive: false,
      windWithoutDirectionalFactor: false,
      seismicAtServiceLevel: false,
    })

    expect(invalidNumber.valid).toBe(false)
    if (!invalidNumber.valid) {
      expect(
        invalidNumber.errors.some((error) => error.field === "deadLoad")
      ).toBe(true)
    }

    const invalidUnit = loadCombinationsDefinition.validate({
      deadLoad: 10,
      liveLoad: 4,
      windLoad: 2,
      seismicLoad: 3,
      unit: "no-existe",
      useHalfLive: false,
      windWithoutDirectionalFactor: false,
      seismicAtServiceLevel: false,
    })

    expect(invalidUnit.valid).toBe(false)
    if (!invalidUnit.valid) {
      expect(invalidUnit.errors.some((error) => error.field === "unit")).toBe(
        true
      )
    }
  })
})
