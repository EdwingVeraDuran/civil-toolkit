import { describe, expect, it } from "vitest"

import {
  fyFactor,
  lightweightFactor,
  minimumWidth,
  roundUpToStep,
  thicknessFactor,
} from "@/lib/estructuras/nsr10"

describe("thicknessFactor", () => {
  it("devuelve los factores de la Tabla C.9.5(a)", () => {
    expect(thicknessFactor("viga", "simple", false)).toBe(16)
    expect(thicknessFactor("viga", "un-extremo-continuo", false)).toBe(18.5)
    expect(thicknessFactor("viga", "ambos-continuos", false)).toBe(21)
    expect(thicknessFactor("viga", "voladizo", false)).toBe(8)
    expect(thicknessFactor("losa-maciza", "simple", false)).toBe(20)
    expect(thicknessFactor("losa-maciza", "un-extremo-continuo", false)).toBe(24)
    expect(thicknessFactor("losa-maciza", "ambos-continuos", false)).toBe(28)
    expect(thicknessFactor("losa-maciza", "voladizo", false)).toBe(10)
  })

  it("usa la Tabla CR.9.5 cuando hay particiones frágiles", () => {
    expect(thicknessFactor("viga", "voladizo", true)).toBe(5)
    expect(thicknessFactor("losa-nervada", "simple", true)).toBe(11)
    expect(thicknessFactor("losa-maciza", "ambos-continuos", true)).toBe(19)
  })
})

describe("fyFactor", () => {
  it("no ajusta para fy = 420 MPa", () => {
    expect(fyFactor(420)).toBe(1)
  })

  it("aplica (0.4 + fy/700) para otros fy", () => {
    expect(fyFactor(240)).toBeCloseTo(0.742857, 6)
  })
})

describe("lightweightFactor", () => {
  it("aplica (1.65 − 0.0003·wc)", () => {
    expect(lightweightFactor(1800)).toBeCloseTo(1.11, 6)
  })

  it("no baja de 1.09", () => {
    expect(lightweightFactor(1840)).toBeCloseTo(1.098, 6)
    expect(lightweightFactor(2000)).toBe(1.09)
  })
})

describe("roundUpToStep", () => {
  it("redondea hacia arriba a múltiplos de 50", () => {
    expect(roundUpToStep(375)).toBe(400)
    expect(roundUpToStep(278.57)).toBe(300)
    expect(roundUpToStep(250)).toBe(250)
    expect(roundUpToStep(201)).toBe(250)
  })
})

describe("minimumWidth", () => {
  it("DES exige máx(0.3h, 250 mm)", () => {
    expect(minimumWidth("DES", 400).value).toBe(250)
    expect(minimumWidth("DES", 1000).value).toBe(300)
  })

  it("DMO exige 200 mm", () => {
    expect(minimumWidth("DMO", 400).value).toBe(200)
  })

  it("DMI no exige mínimo especial", () => {
    expect(minimumWidth("DMI", 400).value).toBe(0)
  })
})
