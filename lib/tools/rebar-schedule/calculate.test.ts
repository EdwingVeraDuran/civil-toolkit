import { describe, expect, it } from "vitest"

import {
  calculateRebarSchedule,
  type RebarScheduleResult,
} from "@/lib/tools/rebar-schedule/calculate"
import { rebarScheduleDefinition } from "@/lib/tools/rebar-schedule/definition"
import {
  rebarScheduleSchema,
  type RebarScheduleInput,
} from "@/lib/tools/rebar-schedule/schema"

function parseInput(
  overrides: Record<string, unknown> = {}
): RebarScheduleInput {
  return rebarScheduleSchema.parse({
    rows: [
      { mark: "V-1", barId: "no-4", quantity: "4", length: "6" },
      { mark: "V-1", barId: "no-3", quantity: "20", length: "1,6" },
    ],
    wastePercent: "0",
    concreteVolume: "",
    concreteArea: "",
    sectionEnabled: false,
    sectionWidth: "300",
    sectionEffectiveDepth: "450",
    sectionBarId: "no-4",
    sectionBarCount: "3",
    ...overrides,
  })
}

function fieldErrors(
  result: ReturnType<typeof rebarScheduleDefinition.validate>
) {
  if (result.valid) return []
  return result.errors.map((error) => error.field)
}

describe("cálculo del despiece de acero", () => {
  it("calcula longitudes y pesos por fila con la tabla NSR-10", () => {
    const result = calculateRebarSchedule(parseInput())

    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toMatchObject({
      barId: "no-4",
      quantity: 4,
      lengthM: 6,
      totalLengthM: 24,
      massKgPerM: 0.994,
    })
    expect(result.rows[0].weightKg).toBeCloseTo(23.856, 12)
    expect(result.rows[1]).toMatchObject({
      barId: "no-3",
      quantity: 20,
      lengthM: 1.6,
      totalLengthM: 32,
      massKgPerM: 0.56,
    })
    expect(result.rows[1].weightKg).toBeCloseTo(17.92, 12)
    expect(result.totalBars).toBe(24)
    expect(result.totalLengthM).toBeCloseTo(56, 12)
    expect(result.netWeightKg).toBeCloseTo(41.776, 12)
    expect(result.totalWeightKg).toBeCloseTo(41.776, 12)
    expect(result.totalWeightT).toBeCloseTo(0.041776, 12)
  })

  it("agrupa por designación de varilla y calcula la participación", () => {
    const result = calculateRebarSchedule(parseInput())

    expect(result.groups).toHaveLength(2)
    expect(result.groups[0]).toMatchObject({
      barId: "no-4",
      quantity: 4,
      totalLengthM: 24,
    })
    expect(result.groups[0].weightKg).toBeCloseTo(23.856, 12)
    expect(result.groups[1]).toMatchObject({
      barId: "no-3",
      quantity: 20,
      totalLengthM: 32,
    })
    expect(
      result.groups.reduce((total, group) => total + group.percentOfWeight, 0)
    ).toBeCloseTo(100, 10)
  })

  it("aplica el desperdicio global y calcula kg/m³ y kg/m²", () => {
    const result = calculateRebarSchedule(
      parseInput({
        wastePercent: "5",
        concreteVolume: "2",
        concreteArea: "20",
      })
    )

    expect(result.wasteWeightKg).toBeCloseTo(2.0888, 12)
    expect(result.totalWeightKg).toBeCloseTo(43.8648, 12)
    expect(result.weightPerVolumeKgM3).toBeCloseTo(21.9324, 12)
    expect(result.weightPerAreaKgM2).toBeCloseTo(2.19324, 12)
  })

  it("omite los indicadores de obra si no se ingresa volumen o área", () => {
    const result = calculateRebarSchedule(parseInput())

    expect(result.concreteVolumeM3).toBeNull()
    expect(result.concreteAreaM2).toBeNull()
    expect(result.weightPerVolumeKgM3).toBeNull()
    expect(result.weightPerAreaKgM2).toBeNull()
  })

  it("calcula As y ρ de la sección cuando está activa", () => {
    const result = calculateRebarSchedule(
      parseInput({
        sectionEnabled: true,
        sectionWidth: "300",
        sectionEffectiveDepth: "450",
        sectionBarId: "no-4",
        sectionBarCount: "3",
      })
    )

    expect(result.section).not.toBeNull()
    expect(result.section).toMatchObject({
      barId: "no-4",
      barCount: 3,
      areaPerBarMm2: 129,
      totalAreaMm2: 387,
      totalAreaCm2: 3.87,
    })
    expect(result.section?.ratio).toBeCloseTo(387 / 135000, 12)
    expect(result.section?.ratioPercent).toBeCloseTo((387 / 135000) * 100, 12)
  })

  it("no calcula la sección cuando está desactivada", () => {
    const result = calculateRebarSchedule(parseInput({ sectionEnabled: false }))

    expect(result.section).toBeNull()
  })

  it("genera el resumen y el snapshot del cálculo guardado", () => {
    const input = parseInput({ wastePercent: "5", concreteVolume: "2" })
    const result = calculateRebarSchedule(input)
    const snapshot = rebarScheduleDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe(
      "Despiece de acero: 24 barras · 56,00 m · 43,86 kg (incl. 5,00 % desperdicio) · 21,9 kg/m³"
    )
    expect(snapshot.inputs).toMatchObject({
      rows: [
        { mark: "V-1", barId: "no-4", quantity: 4, length: 6 },
        { mark: "V-1", barId: "no-3", quantity: 20, length: 1.6 },
      ],
      wastePercent: 5,
      concreteVolume: 2,
      sectionEnabled: false,
    })
    expect(snapshot.result).toHaveProperty("groups")
    expect(snapshot.result).toHaveProperty("netWeightKg", 41.776)
  })

  it("convierte a números los campos opcionales vacíos", () => {
    const input = parseInput()

    expect(input.concreteVolume).toBeUndefined()
    expect(input.concreteArea).toBeUndefined()
  })
})

describe("validación del despiece de acero", () => {
  it("rechaza un despiece sin filas", () => {
    const errors = fieldErrors(
      rebarScheduleDefinition.validate({
        rows: [],
        wastePercent: "0",
        concreteVolume: "",
        concreteArea: "",
        sectionEnabled: false,
        sectionWidth: "300",
        sectionEffectiveDepth: "450",
        sectionBarId: "no-4",
        sectionBarCount: "3",
      })
    )

    expect(errors).toContain("rows")
  })

  it("reporta errores por fila y por campo", () => {
    const input = parseInput()
    const errors = fieldErrors(
      rebarScheduleDefinition.validate({
        ...input,
        rows: [
          { mark: "V-1", barId: "no-existe", quantity: "0", length: "-1" },
        ],
        wastePercent: "101",
        concreteVolume: "0",
        sectionWidth: "0",
        sectionBarId: "no-existe",
        sectionBarCount: "1,5",
      })
    )

    expect(errors).toContain("rows.0.barId")
    expect(errors).toContain("rows.0.quantity")
    expect(errors).toContain("rows.0.length")
    expect(errors).toContain("wastePercent")
    expect(errors).toContain("concreteVolume")
    expect(errors).toContain("sectionWidth")
    expect(errors).toContain("sectionBarId")
    expect(errors).toContain("sectionBarCount")
  })

  it("acepta coma decimal en cantidades, longitudes y sección", () => {
    const input = parseInput({
      rows: [{ mark: "L-1", barId: "12M", quantity: "10", length: "3,75" }],
      sectionEnabled: true,
      sectionWidth: "250,5",
      sectionEffectiveDepth: "400,5",
      sectionBarCount: "2",
    })

    expect(input.rows[0].length).toBe(3.75)
    expect(input.sectionWidth).toBe(250.5)
    expect(input.sectionEffectiveDepth).toBe(400.5)
  })

  it("produce un resultado serializable", () => {
    const input = parseInput()
    const result: RebarScheduleResult = calculateRebarSchedule(input)

    expect(() => JSON.stringify(result)).not.toThrow()
    expect(JSON.parse(JSON.stringify(result)).totalBars).toBe(24)
  })
})
