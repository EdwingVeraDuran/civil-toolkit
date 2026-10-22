import { describe, expect, it } from "vitest"

import { calculateBeamSizing } from "@/lib/tools/beam-sizing/calculate"
import { beamSizingDefinition } from "@/lib/tools/beam-sizing/definition"

const base = {
  elementType: "viga" as const,
  supportCondition: "simple" as const,
  capacity: "DES" as const,
  fy: 420,
  lightweight: false,
  concreteDensity: 2400,
  fragilePartitions: false,
}

describe("calculateBeamSizing", () => {
  it("viga simplemente apoyada de 6 m, fy 420: h_min 375 y b 200 (DMI, b = h/2)", () => {
    const result = calculateBeamSizing({ ...base, span: 6, capacity: "DMI" })

    expect(result.hMinExact).toBeCloseTo(375, 6)
    expect(result.h).toBe(400)
    expect(result.b).toBe(200)
  })

  it("aplica el ajuste por fy 240 MPa", () => {
    const result = calculateBeamSizing({ ...base, span: 6, fy: 240 })

    expect(result.hMinExact).toBeCloseTo(278.571, 2)
    expect(result.h).toBe(300)
  })

  it("voladizo de 2 m con DMI: h 250 y b 150", () => {
    const result = calculateBeamSizing({
      ...base,
      supportCondition: "voladizo",
      span: 2,
      capacity: "DMI",
    })

    expect(result.h).toBe(250)
    expect(result.b).toBe(150)
  })

  it("DES impone un ancho mínimo de 250 mm", () => {
    const result = calculateBeamSizing({ ...base, supportCondition: "voladizo", span: 2 })

    expect(result.h).toBe(250)
    expect(result.bMin).toBe(250)
    expect(result.b).toBe(250)
  })

  it("losa maciza simplemente apoyada de 6 m: h 300", () => {
    const result = calculateBeamSizing({
      ...base,
      elementType: "losa-maciza",
      span: 6,
      capacity: "DMI",
    })

    expect(result.h).toBe(300)
  })

  it("usa la tabla recomendada con particiones frágiles", () => {
    const result = calculateBeamSizing({ ...base, span: 6, fragilePartitions: true })

    expect(result.usedRecommendedTable).toBe(true)
    expect(result.h).toBe(550)
  })

  it("aplica la corrección por concreto liviano", () => {
    const result = calculateBeamSizing({
      ...base,
      span: 6,
      lightweight: true,
      concreteDensity: 1800,
    })

    expect(result.hMinExact).toBeCloseTo(375 * 1.11, 3)
  })
})

describe("beamSizingDefinition", () => {
  it("acepta entradas válidas", () => {
    expect(
      beamSizingDefinition.validate({ ...base, span: "6", fy: "420", concreteDensity: "2400" }),
    ).toEqual({ valid: true })
  })

  it("rechaza una luz no positiva", () => {
    const result = beamSizingDefinition.validate({ ...base, span: "0" })
    expect(result.valid).toBe(false)
  })

  it("exige densidad en rango para concreto liviano", () => {
    const result = beamSizingDefinition.validate({
      ...base,
      span: "6",
      lightweight: true,
      concreteDensity: "2400",
    })
    expect(result.valid).toBe(false)
  })
})
