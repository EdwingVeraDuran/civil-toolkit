import type { DimensionId, Unit } from "@/lib/units/types"

export const UNITS = {
  // Longitud (base: metro)
  m: { id: "m", symbol: "m", name: "Metro", dimension: "length", factor: 1 },
  km: { id: "km", symbol: "km", name: "Kilómetro", dimension: "length", factor: 1000 },
  cm: { id: "cm", symbol: "cm", name: "Centímetro", dimension: "length", factor: 0.01 },
  mm: { id: "mm", symbol: "mm", name: "Milímetro", dimension: "length", factor: 0.001 },
  in: { id: "in", symbol: "in", name: "Pulgada", dimension: "length", factor: 0.0254 },
  ft: { id: "ft", symbol: "ft", name: "Pie", dimension: "length", factor: 0.3048 },
  yd: { id: "yd", symbol: "yd", name: "Yarda", dimension: "length", factor: 0.9144 },
  mi: { id: "mi", symbol: "mi", name: "Milla", dimension: "length", factor: 1609.344 },

  // Área (base: metro cuadrado)
  m2: { id: "m2", symbol: "m²", name: "Metro cuadrado", dimension: "area", factor: 1 },
  km2: { id: "km2", symbol: "km²", name: "Kilómetro cuadrado", dimension: "area", factor: 1e6 },
  cm2: { id: "cm2", symbol: "cm²", name: "Centímetro cuadrado", dimension: "area", factor: 1e-4 },
  mm2: { id: "mm2", symbol: "mm²", name: "Milímetro cuadrado", dimension: "area", factor: 1e-6 },
  ha: { id: "ha", symbol: "ha", name: "Hectárea", dimension: "area", factor: 10000 },
  in2: { id: "in2", symbol: "in²", name: "Pulgada cuadrada", dimension: "area", factor: 0.00064516 },
  ft2: { id: "ft2", symbol: "ft²", name: "Pie cuadrado", dimension: "area", factor: 0.09290304 },
  yd2: { id: "yd2", symbol: "yd²", name: "Yarda cuadrada", dimension: "area", factor: 0.83612736 },
  acre: { id: "acre", symbol: "acre", name: "Acre", dimension: "area", factor: 4046.8564224 },

  // Volumen (base: metro cúbico)
  m3: { id: "m3", symbol: "m³", name: "Metro cúbico", dimension: "volume", factor: 1 },
  l: { id: "l", symbol: "L", name: "Litro", dimension: "volume", factor: 0.001 },
  ml: { id: "ml", symbol: "mL", name: "Mililitro", dimension: "volume", factor: 1e-6 },
  cm3: { id: "cm3", symbol: "cm³", name: "Centímetro cúbico", dimension: "volume", factor: 1e-6 },
  in3: { id: "in3", symbol: "in³", name: "Pulgada cúbica", dimension: "volume", factor: 1.6387064e-5 },
  ft3: { id: "ft3", symbol: "ft³", name: "Pie cúbico", dimension: "volume", factor: 0.028316846592 },
  yd3: { id: "yd3", symbol: "yd³", name: "Yarda cúbica", dimension: "volume", factor: 0.764554857984 },
  gal: { id: "gal", symbol: "gal", name: "Galón (US)", dimension: "volume", factor: 0.003785411784 },

  // Masa (base: kilogramo)
  kg: { id: "kg", symbol: "kg", name: "Kilogramo", dimension: "mass", factor: 1 },
  g: { id: "g", symbol: "g", name: "Gramo", dimension: "mass", factor: 0.001 },
  mg: { id: "mg", symbol: "mg", name: "Miligramo", dimension: "mass", factor: 1e-6 },
  t: { id: "t", symbol: "t", name: "Tonelada métrica", dimension: "mass", factor: 1000 },
  lb: { id: "lb", symbol: "lb", name: "Libra", dimension: "mass", factor: 0.45359237 },
  oz: { id: "oz", symbol: "oz", name: "Onza", dimension: "mass", factor: 0.028349523125 },
  ton: { id: "ton", symbol: "ton", name: "Tonelada (US)", dimension: "mass", factor: 907.18474 },

  // Fuerza (base: newton)
  n: { id: "n", symbol: "N", name: "Newton", dimension: "force", factor: 1 },
  kn: { id: "kn", symbol: "kN", name: "Kilonewton", dimension: "force", factor: 1000 },
  mn: { id: "mn", symbol: "MN", name: "Meganewton", dimension: "force", factor: 1e6 },
  kgf: { id: "kgf", symbol: "kgf", name: "Kilogramo-fuerza", dimension: "force", factor: 9.80665 },
  lbf: { id: "lbf", symbol: "lbf", name: "Libra-fuerza", dimension: "force", factor: 4.4482216152605 },
  kip: { id: "kip", symbol: "kip", name: "Kip", dimension: "force", factor: 4448.2216152605 },

  // Presión / Esfuerzo (base: pascal)
  pa: { id: "pa", symbol: "Pa", name: "Pascal", dimension: "pressure", factor: 1 },
  kpa: { id: "kpa", symbol: "kPa", name: "Kilopascal", dimension: "pressure", factor: 1000 },
  mpa: { id: "mpa", symbol: "MPa", name: "Megapascal", dimension: "pressure", factor: 1e6 },
  gpa: { id: "gpa", symbol: "GPa", name: "Gigapascal", dimension: "pressure", factor: 1e9 },
  bar: { id: "bar", symbol: "bar", name: "Bar", dimension: "pressure", factor: 1e5 },
  atm: { id: "atm", symbol: "atm", name: "Atmósfera", dimension: "pressure", factor: 101325 },
  psi: { id: "psi", symbol: "psi", name: "Libra por pulgada²", dimension: "pressure", factor: 6894.757293168 },
  ksi: { id: "ksi", symbol: "ksi", name: "Kilolibra por pulgada²", dimension: "pressure", factor: 6894757.293168 },
  psf: { id: "psf", symbol: "psf", name: "Libra por pie²", dimension: "pressure", factor: 47.88025898033584 },
  ksf: { id: "ksf", symbol: "ksf", name: "Kilolibra por pie²", dimension: "pressure", factor: 47880.25898033584 },

  // Ángulo (base: radián)
  rad: { id: "rad", symbol: "rad", name: "Radián", dimension: "angle", factor: 1 },
  deg: { id: "deg", symbol: "°", name: "Grado sexagesimal", dimension: "angle", factor: Math.PI / 180 },
  grad: { id: "grad", symbol: "grad", name: "Grado centesimal", dimension: "angle", factor: Math.PI / 200 },

  // Temperatura (base: kelvin)
  k: { id: "k", symbol: "K", name: "Kelvin", dimension: "temperature", factor: 1, offset: 0 },
  c: { id: "c", symbol: "°C", name: "Celsius", dimension: "temperature", factor: 1, offset: 273.15 },
  f: { id: "f", symbol: "°F", name: "Fahrenheit", dimension: "temperature", factor: 5 / 9, offset: 255.37222222222223 },
  r: { id: "r", symbol: "°R", name: "Rankine", dimension: "temperature", factor: 5 / 9, offset: 0 },
} as const satisfies Record<string, Unit>

export type UnitId = keyof typeof UNITS

export function getUnit(id: string): Unit | undefined {
  return (UNITS as Record<string, Unit>)[id]
}

export function isUnitId(id: string): id is UnitId {
  return id in UNITS
}

export function unitsByDimension(dimension: DimensionId): Unit[] {
  return Object.values(UNITS).filter((unit) => unit.dimension === dimension)
}
