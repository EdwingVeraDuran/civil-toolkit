import { describe, expect, it } from "vitest"

import { calculateSoilPhaseRelationships } from "@/lib/tools/soil-phase-relationships/calculate"
import { soilPhaseRelationshipsDefinition } from "@/lib/tools/soil-phase-relationships/definition"
import type {
  EWInput,
  GammaSatInput,
  GammaWInput,
  NWInput,
  WSInput,
} from "@/lib/tools/soil-phase-relationships/schema"
import { Measurement } from "@/lib/units/measurement"

const BASE = {
  unitWeightUnit: "knm3",
  volumeUnit: "m3",
  forceUnit: "kn",
  specificGravity: 2.65,
  waterUnitWeight: 9.81,
} as const

const EXPECTED = {
  porosity: 0.65 / 1.65,
  saturation: (0.15 * 2.65) / 0.65,
  unitWeight: (2.65 * 9.81 * 1.15) / 1.65,
  dryUnitWeight: (2.65 * 9.81) / 1.65,
  saturatedUnitWeight: 19.62,
  submergedUnitWeight: 9.81,
}

function eWInput(overrides: Partial<EWInput> = {}): EWInput {
  return {
    ...BASE,
    mode: "e-w",
    voidRatio: 0.65,
    waterContent: 15,
    ...overrides,
  }
}

function nWInput(overrides: Partial<NWInput> = {}): NWInput {
  return {
    ...BASE,
    mode: "n-w",
    porosity: (0.65 / 1.65) * 100,
    waterContent: 15,
    ...overrides,
  }
}

function wSInput(overrides: Partial<WSInput> = {}): WSInput {
  return {
    ...BASE,
    mode: "w-s",
    waterContent: 15,
    saturation: ((0.15 * 2.65) / 0.65) * 100,
    ...overrides,
  }
}

function gammaWInput(overrides: Partial<GammaWInput> = {}): GammaWInput {
  return {
    ...BASE,
    mode: "gamma-w",
    unitWeight: EXPECTED.unitWeight,
    waterContent: 15,
    ...overrides,
  }
}

function gammaSatInput(overrides: Partial<GammaSatInput> = {}): GammaSatInput {
  return {
    ...BASE,
    mode: "gamma-sat",
    saturatedUnitWeight: 19.62,
    ...overrides,
  }
}

describe("calculateSoilPhaseRelationships", () => {
  it("calcula todas las relaciones desde e y w", () => {
    const result = calculateSoilPhaseRelationships(eWInput())

    expect(result.voidRatio).toBeCloseTo(0.65, 12)
    expect(result.porosity).toBeCloseTo(EXPECTED.porosity, 12)
    expect(result.saturation).toBeCloseTo(EXPECTED.saturation, 12)
    expect(result.unitWeight).toBeCloseTo(EXPECTED.unitWeight, 12)
    expect(result.dryUnitWeight).toBeCloseTo(EXPECTED.dryUnitWeight, 12)
    expect(result.saturatedUnitWeight).toBeCloseTo(
      EXPECTED.saturatedUnitWeight,
      12
    )
    expect(result.submergedUnitWeight).toBeCloseTo(
      EXPECTED.submergedUnitWeight,
      12
    )
  })

  it("calcula desde n y w y obtiene el mismo suelo", () => {
    const result = calculateSoilPhaseRelationships(nWInput())

    expect(result.voidRatio).toBeCloseTo(0.65, 12)
    expect(result.porosity).toBeCloseTo(EXPECTED.porosity, 12)
    expect(result.saturation).toBeCloseTo(EXPECTED.saturation, 12)
    expect(result.unitWeight).toBeCloseTo(EXPECTED.unitWeight, 12)
  })

  it("calcula desde w y S y obtiene el mismo suelo", () => {
    const result = calculateSoilPhaseRelationships(wSInput())

    expect(result.voidRatio).toBeCloseTo(0.65, 12)
    expect(result.porosity).toBeCloseTo(EXPECTED.porosity, 12)
    expect(result.saturation).toBeCloseTo(EXPECTED.saturation, 12)
    expect(result.unitWeight).toBeCloseTo(EXPECTED.unitWeight, 12)
  })

  it("calcula desde γ y w y obtiene el mismo suelo", () => {
    const result = calculateSoilPhaseRelationships(gammaWInput())

    expect(result.voidRatio).toBeCloseTo(0.65, 12)
    expect(result.porosity).toBeCloseTo(EXPECTED.porosity, 12)
    expect(result.saturation).toBeCloseTo(EXPECTED.saturation, 12)
    expect(result.unitWeight).toBeCloseTo(EXPECTED.unitWeight, 12)
  })

  it("calcula desde γsat y Gs con saturación total", () => {
    const result = calculateSoilPhaseRelationships(gammaSatInput())

    expect(result.voidRatio).toBeCloseTo(0.65, 12)
    expect(result.porosity).toBeCloseTo(EXPECTED.porosity, 12)
    expect(result.saturation).toBe(1)
    expect(result.waterContent).toBeCloseTo(0.65 / 2.65, 12)
    expect(result.unitWeight).toBeCloseTo(19.62, 12)
    expect(result.saturatedUnitWeight).toBeCloseTo(19.62, 12)
    expect(result.submergedUnitWeight).toBeCloseTo(9.81, 12)
  })

  it("calcula las fases normalizadas para Vs = 1 m³", () => {
    const result = calculateSoilPhaseRelationships(eWInput())

    expect(result.phase.volumeSolidsM3).toBe(1)
    expect(result.phase.volumeVoidsM3).toBeCloseTo(0.65, 12)
    expect(result.phase.volumeWaterM3).toBeCloseTo(0.15 * 2.65, 12)
    expect(result.phase.volumeAirM3).toBeCloseTo(0.65 - 0.15 * 2.65, 12)
    expect(result.phase.volumeTotalM3).toBeCloseTo(1.65, 12)
    expect(result.phase.weightSolidsKN).toBeCloseTo(2.65 * 9.81, 12)
    expect(result.phase.weightWaterKN).toBeCloseTo(0.15 * 2.65 * 9.81, 12)
    expect(result.phase.weightTotalKN).toBeCloseTo(2.65 * 9.81 * 1.15, 12)
  })

  it("admite un suelo seco con S = 0", () => {
    const result = calculateSoilPhaseRelationships(eWInput({ waterContent: 0 }))

    expect(result.saturation).toBe(0)
    expect(result.waterContent).toBe(0)
    expect(result.unitWeight).toBeCloseTo(result.dryUnitWeight, 12)
    expect(result.phase.volumeWaterM3).toBe(0)
    expect(result.phase.weightWaterKN).toBe(0)
  })

  it("convierte γ y γw desde lb/ft³", () => {
    const waterUnitWeight = Measurement.from(9.81, "knm3").to("pcf").value
    const unitWeight = Measurement.from(EXPECTED.unitWeight, "knm3").to(
      "pcf"
    ).value

    const result = calculateSoilPhaseRelationships(
      gammaWInput({
        unitWeightUnit: "pcf",
        waterUnitWeight,
        unitWeight,
      })
    )

    expect(result.voidRatio).toBeCloseTo(0.65, 9)
    expect(result.unitWeight).toBeCloseTo(EXPECTED.unitWeight, 9)
  })

  it("rechaza una saturación calculada mayor que 100 %", () => {
    expect(() =>
      calculateSoilPhaseRelationships(
        eWInput({ voidRatio: 0.3, waterContent: 20 })
      )
    ).toThrow("supera 100")
  })

  it("rechaza γsat fuera del intervalo físico", () => {
    expect(() =>
      calculateSoilPhaseRelationships(gammaSatInput({ saturatedUnitWeight: 9 }))
    ).toThrow("γw < γsat < Gs · γw")
  })
})

describe("soilPhaseRelationshipsDefinition", () => {
  it("valida entradas con coma decimal", () => {
    const validation = soilPhaseRelationshipsDefinition.validate({
      ...eWInput(),
      voidRatio: "0,65",
      waterContent: "15",
    })

    expect(validation).toEqual({ valid: true })
  })

  it("reporta una saturación mayor que 100 % en el contenido de agua", () => {
    const validation = soilPhaseRelationshipsDefinition.validate(
      eWInput({ voidRatio: 0.3, waterContent: 20 })
    )

    expect(validation.valid).toBe(false)
    if (validation.valid) return
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ field: "waterContent" })
    )
  })

  it("rechaza n = 100 %", () => {
    const validation = soilPhaseRelationshipsDefinition.validate(
      nWInput({ porosity: 100 })
    )

    expect(validation.valid).toBe(false)
    if (validation.valid) return
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ field: "porosity" })
    )
  })

  it("rechaza S = 0 cuando es dato de entrada", () => {
    const validation = soilPhaseRelationshipsDefinition.validate(
      wSInput({ saturation: 0 })
    )

    expect(validation.valid).toBe(false)
    if (validation.valid) return
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ field: "saturation" })
    )
  })

  it("rechaza γ que produce e menor o igual que cero", () => {
    const validation = soilPhaseRelationshipsDefinition.validate(
      gammaWInput({ unitWeight: 30 })
    )

    expect(validation.valid).toBe(false)
    if (validation.valid) return
    expect(validation.errors).toContainEqual(
      expect.objectContaining({ field: "unitWeight" })
    )
  })

  it("rechaza γsat fuera del intervalo físico", () => {
    const belowWater = soilPhaseRelationshipsDefinition.validate(
      gammaSatInput({ saturatedUnitWeight: 9 })
    )
    const aboveSolids = soilPhaseRelationshipsDefinition.validate(
      gammaSatInput({ saturatedUnitWeight: 30 })
    )

    expect(belowWater.valid).toBe(false)
    expect(aboveSolids.valid).toBe(false)
    if (!belowWater.valid) {
      expect(belowWater.errors).toContainEqual(
        expect.objectContaining({ field: "saturatedUnitWeight" })
      )
    }
    if (!aboveSolids.valid) {
      expect(aboveSolids.errors).toContainEqual(
        expect.objectContaining({ field: "saturatedUnitWeight" })
      )
    }
  })

  it("genera el resumen del cálculo", () => {
    const input = soilPhaseRelationshipsDefinition.schema.parse(eWInput())
    const result = soilPhaseRelationshipsDefinition.calculate(input)
    const snapshot = soilPhaseRelationshipsDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "Relaciones de fase: e = 0,650; n = 39,39 %; S = 61,15 %; γ = 18,119 kN/m³; w = 15,00 %"
    )
  })
})
