import { describe, expect, it } from "vitest"

import {
  DEFAULT_LOAD_COMBINATION_OPTIONS,
  LOAD_COMBINATION_DEFINITIONS,
  LOAD_COMBINATION_EQUATIONS,
  LOAD_COMBINATION_REFERENCE,
  calculateLoadCombinations,
  getLoadCombinationEnvelope,
  type LoadCombinationOptions,
  type LoadCombinationResult,
  type LoadCombinationValues,
} from "@/lib/estructuras/nsr10-load-combinations"

function options(
  overrides: Partial<LoadCombinationOptions> = {}
): LoadCombinationOptions {
  return { ...DEFAULT_LOAD_COMBINATION_OPTIONS, ...overrides }
}

function evaluate(
  values: Partial<LoadCombinationValues> = {},
  overrides: Partial<LoadCombinationOptions> = {}
): LoadCombinationResult[] {
  return calculateLoadCombinations(
    { dead: 10, live: 4, wind: 2, seismic: 3, ...values },
    options(overrides)
  )
}

function byKey(
  results: LoadCombinationResult[],
  key: string
): LoadCombinationResult {
  const result = results.find((row) => row.key === key)

  if (!result) {
    throw new Error(`No se encontró la combinación ${key}`)
  }

  return result
}

describe("combinaciones de carga NSR-10 B.2.4.2", () => {
  it("aplica los factores base de las siete ecuaciones", () => {
    const results = evaluate()

    expect(byKey(results, "B.2.4-1").value).toBeCloseTo(14, 12)
    expect(byKey(results, "B.2.4-2").value).toBeCloseTo(18.4, 12)
    expect(byKey(results, "B.2.4-3-L").value).toBeCloseTo(16, 12)
    expect(byKey(results, "B.2.4-3-W").value).toBeCloseTo(13.6, 12)
    expect(byKey(results, "B.2.4-4").value).toBeCloseTo(19.2, 12)
    expect(byKey(results, "B.2.4-5").value).toBeCloseTo(19, 12)
    expect(byKey(results, "B.2.4-6").value).toBeCloseTo(12.2, 12)
    expect(byKey(results, "B.2.4-7").value).toBeCloseTo(12, 12)
  })

  it("conserva los factores normativos de cada combinación", () => {
    const results = evaluate()

    expect(byKey(results, "B.2.4-1").factors).toEqual({
      dead: 1.4,
      live: 0,
      wind: 0,
      seismic: 0,
    })
    expect(byKey(results, "B.2.4-2").factors).toEqual({
      dead: 1.2,
      live: 1.6,
      wind: 0,
      seismic: 0,
    })
    expect(byKey(results, "B.2.4-3-L").factors).toEqual({
      dead: 1.2,
      live: 1,
      wind: 0,
      seismic: 0,
    })
    expect(byKey(results, "B.2.4-3-W").factors).toEqual({
      dead: 1.2,
      live: 0,
      wind: 0.8,
      seismic: 0,
    })
    expect(byKey(results, "B.2.4-4").factors).toEqual({
      dead: 1.2,
      live: 1,
      wind: 1.6,
      seismic: 0,
    })
    expect(byKey(results, "B.2.4-5").factors).toEqual({
      dead: 1.2,
      live: 1,
      wind: 0,
      seismic: 1,
    })
    expect(byKey(results, "B.2.4-6").factors).toEqual({
      dead: 0.9,
      live: 0,
      wind: 1.6,
      seismic: 0,
    })
    expect(byKey(results, "B.2.4-7").factors).toEqual({
      dead: 0.9,
      live: 0,
      wind: 0,
      seismic: 1,
    })
  })

  it("aplica 0.5L solo en B.2.4-3(L), B.2.4-4 y B.2.4-5", () => {
    const base = evaluate()
    const reduced = evaluate({}, { useHalfLive: true })
    const changedKeys = new Set(["B.2.4-3-L", "B.2.4-4", "B.2.4-5"])

    for (const row of base) {
      const reducedRow = byKey(reduced, row.key)

      if (changedKeys.has(row.key)) {
        expect(reducedRow.value).not.toBeCloseTo(row.value, 12)
      } else {
        expect(reducedRow.value).toBeCloseTo(row.value, 12)
      }
    }

    expect(byKey(reduced, "B.2.4-2").factors.live).toBe(1.6)
    expect(byKey(reduced, "B.2.4-3-L").factors.live).toBe(0.5)
    expect(byKey(reduced, "B.2.4-4").factors.live).toBe(0.5)
    expect(byKey(reduced, "B.2.4-5").factors.live).toBe(0.5)
  })

  it("aplica 1.3W solo en B.2.4-4 y B.2.4-6", () => {
    const base = evaluate()
    const reduced = evaluate({}, { windWithoutDirectionalFactor: true })
    const changedKeys = new Set(["B.2.4-4", "B.2.4-6"])

    for (const row of base) {
      const reducedRow = byKey(reduced, row.key)

      if (changedKeys.has(row.key)) {
        expect(reducedRow.value).not.toBeCloseTo(row.value, 12)
      } else {
        expect(reducedRow.value).toBeCloseTo(row.value, 12)
      }
    }

    expect(byKey(reduced, "B.2.4-3-W").factors.wind).toBe(0.8)
    expect(byKey(reduced, "B.2.4-4").factors.wind).toBe(1.3)
    expect(byKey(reduced, "B.2.4-6").factors.wind).toBe(1.3)
  })

  it("aplica 1.4E solo en B.2.4-5 y B.2.4-7", () => {
    const base = evaluate()
    const reduced = evaluate({}, { seismicAtServiceLevel: true })
    const changedKeys = new Set(["B.2.4-5", "B.2.4-7"])

    for (const row of base) {
      const reducedRow = byKey(reduced, row.key)

      if (changedKeys.has(row.key)) {
        expect(reducedRow.value).not.toBeCloseTo(row.value, 12)
      } else {
        expect(reducedRow.value).toBeCloseTo(row.value, 12)
      }
    }

    expect(byKey(reduced, "B.2.4-5").factors.seismic).toBe(1.4)
    expect(byKey(reduced, "B.2.4-7").factors.seismic).toBe(1.4)
  })

  it("combina las tres opciones sin alterar las demás combinaciones", () => {
    const results = evaluate(
      {},
      {
        useHalfLive: true,
        windWithoutDirectionalFactor: true,
        seismicAtServiceLevel: true,
      }
    )

    expect(byKey(results, "B.2.4-1").value).toBeCloseTo(14, 12)
    expect(byKey(results, "B.2.4-2").value).toBeCloseTo(18.4, 12)
    expect(byKey(results, "B.2.4-3-L").value).toBeCloseTo(14, 12)
    expect(byKey(results, "B.2.4-3-W").value).toBeCloseTo(13.6, 12)
    expect(byKey(results, "B.2.4-4").value).toBeCloseTo(16.6, 12)
    expect(byKey(results, "B.2.4-5").value).toBeCloseTo(18.2, 12)
    expect(byKey(results, "B.2.4-6").value).toBeCloseTo(11.6, 12)
    expect(byKey(results, "B.2.4-7").value).toBeCloseTo(13.2, 12)
  })

  it("obtiene la envolvente con valores positivos", () => {
    const results = evaluate()
    const { maximum, minimum } = getLoadCombinationEnvelope(results)

    expect(maximum.key).toBe("B.2.4-4")
    expect(maximum.value).toBeCloseTo(19.2, 12)
    expect(minimum.key).toBe("B.2.4-7")
    expect(minimum.value).toBeCloseTo(12, 12)
  })

  it("obtiene la envolvente cuando W y E son negativos", () => {
    const results = evaluate({ wind: -2, seismic: -3 })
    const { maximum, minimum } = getLoadCombinationEnvelope(results)

    expect(maximum.key).toBe("B.2.4-2")
    expect(maximum.value).toBeCloseTo(18.4, 12)
    expect(minimum.key).toBe("B.2.4-6")
    expect(minimum.value).toBeCloseTo(5.8, 12)
  })

  it("documenta las ecuaciones completas y las citas normativas", () => {
    expect(LOAD_COMBINATION_REFERENCE).toContain("B.2.4.2")
    expect(LOAD_COMBINATION_REFERENCE).toContain("Tabla B.2-3")
    expect(LOAD_COMBINATION_EQUATIONS["B.2.4-3"]).toContain("L ó 0.8W")
    expect(LOAD_COMBINATION_EQUATIONS["B.2.4-6"]).toContain("1.6H")
    expect(LOAD_COMBINATION_EQUATIONS["B.2.4-7"]).toContain("1.0E")

    for (const definition of LOAD_COMBINATION_DEFINITIONS) {
      expect(definition.citation).toContain("B.2.4.2")
      expect(definition.citation).toContain(definition.code)
    }
  })
})
