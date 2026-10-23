import { describe, expect, it } from "vitest"

import {
  REBAR_REFERENCES,
  REBAR_SIZES,
  REBAR_SIZES_BY_SYSTEM,
  getRebarSize,
  isRebarId,
  metersPerTon,
  rebarDisplayName,
} from "@/lib/estructuras/nsr10-rebar"

describe("tablas de varillas NSR-10 C.3.5.3", () => {
  it("incluye las 14 varillas métricas y las 12 varillas en pulgadas", () => {
    expect(REBAR_SIZES).toHaveLength(26)
    expect(REBAR_SIZES_BY_SYSTEM.metric).toHaveLength(14)
    expect(REBAR_SIZES_BY_SYSTEM.imperial).toHaveLength(12)
  })

  it("coincide con las 26 filas de las Tablas C.3.5.3-1 y C.3.5.3-2", () => {
    const expected: Array<[string, number, number, number, number]> = [
      ["6M", 6, 28.3, 18.85, 0.222],
      ["8M", 8, 50.3, 25.14, 0.394],
      ["10M", 10, 78.5, 31.42, 0.616],
      ["12M", 12, 113.1, 37.7, 0.887],
      ["16M", 16, 201.1, 50.27, 1.577],
      ["18M", 18, 254.5, 56.55, 1.996],
      ["20M", 20, 314.2, 62.83, 2.465],
      ["22M", 22, 380.1, 69.12, 2.982],
      ["25M", 25, 490.9, 78.54, 3.851],
      ["30M", 30, 706.9, 94.25, 5.544],
      ["32M", 32, 804.2, 100.53, 6.309],
      ["36M", 36, 1017.9, 113.1, 7.985],
      ["45M", 45, 1590.4, 141.37, 12.477],
      ["55M", 55, 2375.8, 172.79, 18.638],
      ["no-2", 6.4, 32, 20, 0.25],
      ["no-3", 9.5, 71, 30, 0.56],
      ["no-4", 12.7, 129, 40, 0.994],
      ["no-5", 15.9, 199, 50, 1.552],
      ["no-6", 19.1, 284, 60, 2.235],
      ["no-7", 22.2, 387, 70, 3.042],
      ["no-8", 25.4, 510, 80, 3.973],
      ["no-9", 28.7, 645, 90, 5.06],
      ["no-10", 32.3, 819, 101.3, 6.404],
      ["no-11", 35.8, 1006, 112.5, 7.907],
      ["no-14", 43, 1452, 135.1, 11.38],
      ["no-18", 57.3, 2581, 180.1, 20.24],
    ]

    expect(REBAR_SIZES).toHaveLength(expected.length)

    for (const [id, diameterMm, areaMm2, perimeterMm, massKgPerM] of expected) {
      expect(getRebarSize(id)).toMatchObject({
        diameterMm,
        areaMm2,
        perimeterMm,
        massKgPerM,
      })
    }
  })

  it("conserva los valores de la Tabla C.3.5.3-1", () => {
    expect(getRebarSize("6M")).toMatchObject({
      diameterMm: 6,
      areaMm2: 28.3,
      perimeterMm: 18.85,
      massKgPerM: 0.222,
    })
    expect(getRebarSize("12M")).toMatchObject({
      diameterMm: 12,
      areaMm2: 113.1,
      perimeterMm: 37.7,
      massKgPerM: 0.887,
    })
    expect(getRebarSize("25M")).toMatchObject({
      diameterMm: 25,
      areaMm2: 490.9,
      perimeterMm: 78.54,
      massKgPerM: 3.851,
    })
    expect(getRebarSize("55M")).toMatchObject({
      diameterMm: 55,
      areaMm2: 2375.8,
      perimeterMm: 172.79,
      massKgPerM: 18.638,
    })
  })

  it("conserva los valores de la Tabla C.3.5.3-2", () => {
    expect(getRebarSize("no-2")).toMatchObject({
      diameterMm: 6.4,
      areaMm2: 32,
      perimeterMm: 20,
      massKgPerM: 0.25,
    })
    expect(getRebarSize("no-4")).toMatchObject({
      designation: "No. 4",
      referenceInches: '1/2"',
      diameterMm: 12.7,
      areaMm2: 129,
      perimeterMm: 40,
      massKgPerM: 0.994,
    })
    expect(getRebarSize("no-11")).toMatchObject({
      diameterMm: 35.8,
      areaMm2: 1006,
      perimeterMm: 112.5,
      massKgPerM: 7.907,
    })
    expect(getRebarSize("no-18")).toMatchObject({
      diameterMm: 57.3,
      areaMm2: 2581,
      perimeterMm: 180.1,
      massKgPerM: 20.24,
    })
  })

  it("calcula los metros por tonelada como 1000 / masa", () => {
    const bar = getRebarSize("no-4")

    expect(bar).toBeDefined()
    if (!bar) return

    expect(metersPerTon(bar)).toBeCloseTo(1006.036, 3)
  })

  it("identifica y presenta las designaciones", () => {
    expect(isRebarId("no-4")).toBe(true)
    expect(isRebarId("No. 4")).toBe(false)
    expect(isRebarId("99M")).toBe(false)

    const bar = getRebarSize("no-4")
    expect(bar).toBeDefined()
    if (!bar) return

    expect(rebarDisplayName(bar)).toBe('No. 4 (1/2")')
    expect(rebarDisplayName(getRebarSize("12M")!)).toBe("12M")
  })

  it("cita las tablas y la NTC 2289", () => {
    expect(REBAR_REFERENCES.metricTable).toContain("C.3.5.3-1")
    expect(REBAR_REFERENCES.imperialTable).toContain("C.3.5.3-2")
    expect(REBAR_REFERENCES.ntc2289).toContain("NTC 2289")
  })
})
