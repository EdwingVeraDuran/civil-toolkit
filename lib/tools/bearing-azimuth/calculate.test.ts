import { describe, expect, it } from "vitest"

import {
  azimuthToBearing,
  bearingToAzimuth,
  calculateOrientation,
  decimalToDms,
  dmsToDecimal,
  formatBearingDecimal,
  formatBearingDms,
  formatDecimalDegrees,
  formatDms,
} from "@/lib/tools/bearing-azimuth/calculate"
import { bearingAzimuthDefinition } from "@/lib/tools/bearing-azimuth/definition"
import {
  orientationSchema,
  type BearingQuadrant,
} from "@/lib/tools/bearing-azimuth/schema"

function bearingDecimal(quadrant: BearingQuadrant, angle: number | string) {
  return orientationSchema.parse({
    mode: "bearing-to-azimuth",
    format: "decimal",
    quadrant,
    angle,
  })
}

function azimuthDecimal(angle: number | string) {
  return orientationSchema.parse({
    mode: "azimuth-to-bearing",
    format: "decimal",
    quadrant: "NE",
    angle,
  })
}

function bearingDms(
  quadrant: BearingQuadrant,
  degrees: number | string,
  minutes: number | string,
  seconds: number | string
) {
  return orientationSchema.parse({
    mode: "bearing-to-azimuth",
    format: "dms",
    quadrant,
    degrees,
    minutes,
    seconds,
  })
}

function expectInvalid(input: Record<string, unknown>, field: string) {
  const result = orientationSchema.safeParse(input)

  expect(result.success).toBe(false)
  if (!result.success) {
    expect(result.error.issues.some((issue) => issue.path[0] === field)).toBe(
      true
    )
  }
}

describe("bearingToAzimuth", () => {
  it("convierte los cuatro cuadrantes al azimut correspondiente", () => {
    expect(bearingToAzimuth("NE", 30)).toBeCloseTo(30, 12)
    expect(bearingToAzimuth("NW", 30)).toBeCloseTo(330, 12)
    expect(bearingToAzimuth("SE", 45)).toBeCloseTo(135, 12)
    expect(bearingToAzimuth("SW", 45)).toBeCloseTo(225, 12)
  })
})

describe("azimuthToBearing", () => {
  it("convierte azimuts de los cuatro cuadrantes a rumbo", () => {
    expect(azimuthToBearing(30)).toEqual({ quadrant: "NE", angleDeg: 30 })
    expect(azimuthToBearing(135)).toEqual({ quadrant: "SE", angleDeg: 45 })
    expect(azimuthToBearing(225)).toEqual({ quadrant: "SW", angleDeg: 45 })
    expect(azimuthToBearing(330)).toEqual({ quadrant: "NW", angleDeg: 30 })
  })

  it("resuelve los límites cardinales con una representación canónica", () => {
    expect(azimuthToBearing(0)).toEqual({ quadrant: "NE", angleDeg: 0 })
    expect(azimuthToBearing(90)).toEqual({ quadrant: "NE", angleDeg: 90 })
    expect(azimuthToBearing(180)).toEqual({ quadrant: "SE", angleDeg: 0 })
    expect(azimuthToBearing(270)).toEqual({ quadrant: "SW", angleDeg: 90 })
    expect(azimuthToBearing(360)).toEqual({ quadrant: "NE", angleDeg: 0 })
  })
})

describe("calculateOrientation", () => {
  it("conserva el rumbo de entrada y calcula el azimut", () => {
    const result = calculateOrientation(bearingDecimal("NW", 30))

    expect(result.azimuthDeg).toBeCloseTo(330, 12)
    expect(result.bearingQuadrant).toBe("NW")
    expect(result.bearingAngleDeg).toBeCloseTo(30, 12)
    expect(result.formula).toBe("NW: Az = 360° − θ")
  })

  it("calcula el rumbo desde un azimut", () => {
    const result = calculateOrientation(azimuthDecimal(225))

    expect(result.azimuthDeg).toBeCloseTo(225, 12)
    expect(result.bearingQuadrant).toBe("SW")
    expect(result.bearingAngleDeg).toBeCloseTo(45, 12)
    expect(result.formula).toBe("180° < Az ≤ 270°: rumbo SW, θ = Az − 180°")
  })

  it("procesa ángulos sexagesimales de entrada", () => {
    const result = calculateOrientation(bearingDms("NE", 30, 15, 20))

    expect(result.azimuthDeg).toBeCloseTo(30 + 15 / 60 + 20 / 3600, 12)
    expect(result.azimuthDms).toEqual({
      degrees: 30,
      minutes: 15,
      seconds: 20,
    })
  })

  it("normaliza el azimut 360° a 0°", () => {
    const result = calculateOrientation(azimuthDecimal(360))

    expect(result.azimuthDeg).toBe(0)
    expect(result.bearingQuadrant).toBe("NE")
    expect(result.bearingAngleDeg).toBe(0)
  })
})

describe("conversión sexagesimal", () => {
  it("convierte de grados, minutos y segundos a grados decimales", () => {
    expect(dmsToDecimal({ degrees: 30, minutes: 15, seconds: 20 })).toBeCloseTo(
      30.2555555556,
      9
    )
  })

  it("redondea los segundos y propaga el acarreo", () => {
    const angle = 30 + 15 / 60 + 59.999 / 3600

    expect(decimalToDms(angle)).toEqual({
      degrees: 30,
      minutes: 16,
      seconds: 0,
    })
  })

  it("convierte 359,999999° a 0° al redondear a dos decimales de segundo", () => {
    expect(decimalToDms(359.999999)).toEqual({
      degrees: 0,
      minutes: 0,
      seconds: 0,
    })
  })
})

describe("formatos de salida", () => {
  it("formatea grados decimales, sexagesimales y rumbos", () => {
    expect(formatDecimalDegrees(30.5)).toBe("30,500000°")
    expect(formatDms({ degrees: 30, minutes: 15, seconds: 20 })).toBe(
      "30° 15′ 20″"
    )
    expect(formatBearingDecimal("NW", 30.5)).toBe("N 30,500000° W")
    expect(
      formatBearingDms("NE", { degrees: 30, minutes: 15, seconds: 20 })
    ).toBe("N 30° 15′ 20″ E")
  })
})

describe("validación", () => {
  it("acepta el límite superior del rumbo y rechaza valores mayores", () => {
    expect(() => bearingDecimal("NE", 90)).not.toThrow()

    expectInvalid(
      {
        mode: "bearing-to-azimuth",
        format: "decimal",
        quadrant: "NE",
        angle: 90.0001,
      },
      "angle"
    )
  })

  it("acepta el azimut 360° y rechaza valores fuera de rango", () => {
    expect(() => azimuthDecimal(360)).not.toThrow()

    expectInvalid(
      {
        mode: "azimuth-to-bearing",
        format: "decimal",
        quadrant: "NE",
        angle: 360.1,
      },
      "angle"
    )
    expectInvalid(
      {
        mode: "azimuth-to-bearing",
        format: "decimal",
        quadrant: "NE",
        angle: -1,
      },
      "angle"
    )
  })

  it("valida minutos y segundos sexagesimales", () => {
    expectInvalid(
      {
        mode: "bearing-to-azimuth",
        format: "dms",
        quadrant: "NE",
        degrees: 30,
        minutes: 60,
        seconds: 0,
      },
      "minutes"
    )
    expectInvalid(
      {
        mode: "bearing-to-azimuth",
        format: "dms",
        quadrant: "NE",
        degrees: 30,
        minutes: 0,
        seconds: 60,
      },
      "seconds"
    )
  })

  it("rechaza un rumbo sexagesimal mayor que 90°", () => {
    expectInvalid(
      {
        mode: "bearing-to-azimuth",
        format: "dms",
        quadrant: "NE",
        degrees: 90,
        minutes: 0,
        seconds: 1,
      },
      "degrees"
    )
  })

  it("acepta 360°00′00″ como azimut", () => {
    expect(() =>
      orientationSchema.parse({
        mode: "azimuth-to-bearing",
        format: "dms",
        quadrant: "NE",
        degrees: 360,
        minutes: 0,
        seconds: 0,
      })
    ).not.toThrow()
  })

  it("rechaza grados no enteros", () => {
    expectInvalid(
      {
        mode: "bearing-to-azimuth",
        format: "dms",
        quadrant: "NE",
        degrees: 30.5,
        minutes: 0,
        seconds: 0,
      },
      "degrees"
    )
  })

  it("acepta coma decimal", () => {
    const parsed = bearingDecimal("NE", "30,5")

    expect(parsed.format).toBe("decimal")
    if (parsed.format === "decimal") {
      expect(parsed.angle).toBe(30.5)
    }
  })
})

describe("definición", () => {
  it("genera el resumen del cálculo guardado", () => {
    const input = bearingDms("NE", 30, 15, 20)
    const result = calculateOrientation(input)
    const snapshot = bearingAzimuthDefinition.toSnapshot(input, result)

    expect(snapshot.summary).toBe("Rumbo N 30° 15′ 20″ E ↔ azimut 30° 15′ 20″")
  })
})
