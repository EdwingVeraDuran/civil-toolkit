import { describe, expect, it } from "vitest"

import {
  calculateSlope,
  slopeToGrade,
} from "@/lib/tools/slope-calculator/calculate"
import { slopeCalculatorDefinition } from "@/lib/tools/slope-calculator/definition"

const riseRun = {
  mode: "rise-run" as const,
  run: 10,
  runUnit: "m",
  rise: 1,
  riseUnit: "m",
}

describe("calculateSlope", () => {
  it("calcula 1 m de desnivel en 10 m: 10 %, 5,71° y relación 1:10", () => {
    const result = calculateSlope(riseRun)

    expect(result.percent).toBeCloseTo(10, 10)
    expect(result.permille).toBeCloseTo(100, 10)
    expect(result.angleDeg).toBeCloseTo(5.710593137, 6)
    expect(result.slopeLengthM).toBeCloseTo(Math.hypot(10, 1), 10)
    expect(result.ratio).toBeCloseTo(10, 10)
    expect(result.cmPerM).toBeCloseTo(10, 10)
    expect(result.mmPerM).toBeCloseTo(100, 10)
    expect(result.direction).toBe("ascendente")
  })

  it("calcula 45° a partir de 10 m de desnivel y 10 m de distancia", () => {
    const result = calculateSlope({ ...riseRun, rise: 10 })

    expect(result.percent).toBeCloseTo(100, 10)
    expect(result.angleDeg).toBeCloseTo(45, 10)
    expect(result.ratio).toBeCloseTo(1, 10)
    expect(result.slopeLengthM).toBeCloseTo(Math.hypot(10, 10), 10)
  })

  it("conserva el signo y el sentido descendente", () => {
    const result = calculateSlope({ ...riseRun, rise: -1 })

    expect(result.percent).toBeCloseTo(-10, 10)
    expect(result.angleDeg).toBeCloseTo(-5.710593137, 6)
    expect(result.ratio).toBeCloseTo(10, 10)
    expect(result.direction).toBe("descendente")
  })

  it("devuelve pendiente cero y relación nula para un terreno plano", () => {
    const result = calculateSlope({ ...riseRun, rise: 0 })

    expect(result.percent).toBe(0)
    expect(result.angleDeg).toBe(0)
    expect(result.ratio).toBeNull()
    expect(result.slopeLengthM).toBe(10)
    expect(result.direction).toBe("plano")
  })

  it("convierte las longitudes de entrada a metros", () => {
    const result = calculateSlope({
      mode: "rise-run",
      run: 1000,
      runUnit: "cm",
      rise: 100,
      riseUnit: "cm",
    })

    expect(result.runM).toBeCloseTo(10, 10)
    expect(result.riseM).toBeCloseTo(1, 10)
    expect(result.percent).toBeCloseTo(10, 10)
  })

  it("calcula el desnivel desde un porcentaje", () => {
    const result = calculateSlope({
      mode: "slope-run",
      run: 50,
      runUnit: "m",
      slopeValue: 2,
      slopeFormat: "percent",
      direction: "ascending",
    })

    expect(result.riseM).toBeCloseTo(1, 10)
    expect(result.percent).toBeCloseTo(2, 10)
    expect(result.slopeLengthM).toBeCloseTo(Math.hypot(50, 1), 10)
  })

  it("calcula el desnivel desde por mil", () => {
    const result = calculateSlope({
      mode: "slope-run",
      run: 50,
      runUnit: "m",
      slopeValue: 20,
      slopeFormat: "permille",
      direction: "ascending",
    })

    expect(result.riseM).toBeCloseTo(1, 10)
    expect(result.percent).toBeCloseTo(2, 10)
  })

  it("calcula el desnivel desde una relación 1:n y respeta el sentido", () => {
    const ascending = calculateSlope({
      mode: "slope-run",
      run: 50,
      runUnit: "m",
      slopeValue: 50,
      slopeFormat: "ratio",
      direction: "ascending",
    })
    const descending = calculateSlope({
      mode: "slope-run",
      run: 50,
      runUnit: "m",
      slopeValue: 50,
      slopeFormat: "ratio",
      direction: "descending",
    })

    expect(ascending.riseM).toBeCloseTo(1, 10)
    expect(ascending.percent).toBeCloseTo(2, 10)
    expect(descending.riseM).toBeCloseTo(-1, 10)
    expect(descending.percent).toBeCloseTo(-2, 10)
    expect(descending.direction).toBe("descendente")
  })

  it("calcula el desnivel desde un ángulo", () => {
    const result = calculateSlope({
      mode: "slope-run",
      run: 10,
      runUnit: "m",
      slopeValue: 45,
      slopeFormat: "angle",
      direction: "ascending",
    })

    expect(result.riseM).toBeCloseTo(10, 10)
    expect(result.percent).toBeCloseTo(100, 10)
  })

  it("calcula la pendiente a partir de dos cotas", () => {
    const result = calculateSlope({
      mode: "elevations",
      run: 10,
      runUnit: "m",
      startElevation: 100,
      endElevation: 101,
      elevationUnit: "m",
    })

    expect(result.riseM).toBeCloseTo(1, 10)
    expect(result.percent).toBeCloseTo(10, 10)
    expect(result.direction).toBe("ascendente")
  })
})

describe("slopeToGrade", () => {
  it("convierte porcentaje, por mil, ángulo y relación a pendiente", () => {
    expect(slopeToGrade(2, "percent")).toBeCloseTo(0.02, 10)
    expect(slopeToGrade(20, "permille")).toBeCloseTo(0.02, 10)
    expect(slopeToGrade(45, "angle")).toBeCloseTo(1, 10)
    expect(slopeToGrade(50, "ratio")).toBeCloseTo(0.02, 10)
    expect(slopeToGrade(50, "ratio", "descending")).toBeCloseTo(-0.02, 10)
  })
})

describe("slopeCalculatorDefinition", () => {
  it("acepta entradas válidas con coma decimal", () => {
    const result = slopeCalculatorDefinition.validate({
      mode: "rise-run",
      run: "10,5",
      runUnit: "m",
      rise: "1,5",
      riseUnit: "m",
    })

    expect(result).toEqual({ valid: true })
  })

  it("rechaza una distancia horizontal de cero", () => {
    const result = slopeCalculatorDefinition.validate({
      ...riseRun,
      run: "0",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "run")).toBe(true)
    }
  })

  it("rechaza un ángulo de 90°", () => {
    const result = slopeCalculatorDefinition.validate({
      mode: "slope-run",
      run: "10",
      runUnit: "m",
      slopeValue: "90",
      slopeFormat: "angle",
      direction: "ascending",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "slopeValue")).toBe(
        true
      )
    }
  })

  it("rechaza una relación 1:n con n igual a cero", () => {
    const result = slopeCalculatorDefinition.validate({
      mode: "slope-run",
      run: "10",
      runUnit: "m",
      slopeValue: "0",
      slopeFormat: "ratio",
      direction: "ascending",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "slopeValue")).toBe(
        true
      )
    }
  })

  it("rechaza una unidad que no sea de longitud", () => {
    const result = slopeCalculatorDefinition.validate({
      ...riseRun,
      runUnit: "kg",
    })

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.errors.some((error) => error.field === "runUnit")).toBe(
        true
      )
    }
  })

  it("genera un snapshot JSON plano con el resumen", () => {
    const input = riseRun
    const result = calculateSlope(input)
    const snapshot = slopeCalculatorDefinition.toSnapshot(input, result)

    expect(snapshot.inputs).toEqual(input)
    expect(snapshot.result.percent).toBeCloseTo(10, 10)
    expect(snapshot.summary).toBe("Pendiente 10,00 % (5,71°) ascendente")
    expect(() => JSON.stringify(snapshot)).not.toThrow()
  })

  it("resume un terreno plano", () => {
    const input = { ...riseRun, rise: 0 }
    const result = calculateSlope(input)
    const snapshot = slopeCalculatorDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe("Plano (0,00 %)")
  })
})
