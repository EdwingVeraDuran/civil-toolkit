import { describe, expect, it } from "vitest"

import { Measurement } from "@/lib/units/measurement"
import type { UnitId } from "@/lib/units/units"

type Case = {
  from: number
  fromUnit: UnitId
  toUnit: UnitId
  expected: number
}

const cases: Record<string, Case[]> = {
  longitud: [
    { from: 1, fromUnit: "in", toUnit: "cm", expected: 2.54 },
    { from: 1, fromUnit: "ft", toUnit: "m", expected: 0.3048 },
    { from: 1, fromUnit: "mi", toUnit: "km", expected: 1.609344 },
  ],
  area: [
    { from: 1, fromUnit: "acre", toUnit: "m2", expected: 4046.8564224 },
    { from: 1, fromUnit: "ft2", toUnit: "m2", expected: 0.09290304 },
    { from: 1, fromUnit: "ha", toUnit: "m2", expected: 10000 },
  ],
  volumen: [
    { from: 1, fromUnit: "gal", toUnit: "l", expected: 3.785411784 },
    { from: 1, fromUnit: "ft3", toUnit: "l", expected: 28.316846592 },
    { from: 1, fromUnit: "m3", toUnit: "l", expected: 1000 },
  ],
  masa: [
    { from: 1, fromUnit: "lb", toUnit: "kg", expected: 0.45359237 },
    { from: 1, fromUnit: "t", toUnit: "kg", expected: 1000 },
  ],
  fuerza: [
    { from: 1, fromUnit: "lbf", toUnit: "n", expected: 4.4482216152605 },
    { from: 1, fromUnit: "kip", toUnit: "kn", expected: 4.4482216152605 },
    { from: 1, fromUnit: "kgf", toUnit: "n", expected: 9.80665 },
  ],
  presion: [
    { from: 1, fromUnit: "psi", toUnit: "pa", expected: 6894.757293168 },
    { from: 1, fromUnit: "mpa", toUnit: "kpa", expected: 1000 },
    { from: 1, fromUnit: "bar", toUnit: "pa", expected: 100000 },
  ],
  "peso unitario": [
    { from: 1, fromUnit: "tfm3", toUnit: "knm3", expected: 9.80665 },
    { from: 1, fromUnit: "pcf", toUnit: "knm3", expected: 0.1570874638462462 },
    { from: 1, fromUnit: "knm3", toUnit: "mnm3", expected: 0.001 },
  ],
  angulo: [
    { from: 180, fromUnit: "deg", toUnit: "rad", expected: Math.PI },
    { from: 200, fromUnit: "grad", toUnit: "deg", expected: 180 },
  ],
}

describe("conversiones conocidas", () => {
  for (const dimension of Object.keys(cases)) {
    describe(dimension, () => {
      it.each(cases[dimension])(
        "$from $fromUnit → $toUnit",
        ({ from, fromUnit, toUnit, expected }) => {
          expect(Measurement.from(from, fromUnit).to(toUnit).value).toBeCloseTo(expected, 6)
        },
      )
    })
  }
})
