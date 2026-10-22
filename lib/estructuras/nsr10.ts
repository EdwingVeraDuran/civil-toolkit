export const ELEMENT_TYPES = ["viga", "losa-nervada", "losa-maciza"] as const

export type ElementType = (typeof ELEMENT_TYPES)[number]

export const ELEMENT_TYPE_LABELS: Record<ElementType, string> = {
  viga: "Viga",
  "losa-nervada": "Losa nervada (una dirección)",
  "losa-maciza": "Losa maciza (una dirección)",
}

export const SUPPORT_CONDITIONS = [
  "simple",
  "un-extremo-continuo",
  "ambos-continuos",
  "voladizo",
] as const

export type SupportCondition = (typeof SUPPORT_CONDITIONS)[number]

export const SUPPORT_CONDITION_LABELS: Record<SupportCondition, string> = {
  simple: "Simplemente apoyada",
  "un-extremo-continuo": "Un extremo continuo",
  "ambos-continuos": "Ambos extremos continuos",
  voladizo: "En voladizo",
}

export const DISSIPATION_CAPACITIES = ["DES", "DMO", "DMI"] as const

export type DissipationCapacity = (typeof DISSIPATION_CAPACITIES)[number]

export const DISSIPATION_CAPACITY_LABELS: Record<DissipationCapacity, string> = {
  DES: "Especial (DES)",
  DMO: "Moderada (DMO)",
  DMI: "Mínima (DMI)",
}

export type ThicknessFactorTable = Record<ElementType, Record<SupportCondition, number>>

export const MIN_THICKNESS_FACTORS: ThicknessFactorTable = {
  viga: { simple: 16, "un-extremo-continuo": 18.5, "ambos-continuos": 21, voladizo: 8 },
  "losa-nervada": { simple: 16, "un-extremo-continuo": 18.5, "ambos-continuos": 21, voladizo: 8 },
  "losa-maciza": { simple: 20, "un-extremo-continuo": 24, "ambos-continuos": 28, voladizo: 10 },
}

export const RECOMMENDED_MIN_THICKNESS_FACTORS: ThicknessFactorTable = {
  viga: { simple: 11, "un-extremo-continuo": 12, "ambos-continuos": 14, voladizo: 5 },
  "losa-nervada": { simple: 11, "un-extremo-continuo": 12, "ambos-continuos": 14, voladizo: 5 },
  "losa-maciza": { simple: 14, "un-extremo-continuo": 16, "ambos-continuos": 19, voladizo: 7 },
}

export const DEFAULT_FY = 420
export const FY_FACTOR_BASE = 420

export const LIGHTWEIGHT_DENSITY_MIN = 1440
export const LIGHTWEIGHT_DENSITY_MAX = 1840
export const LIGHTWEIGHT_FACTOR_MIN = 1.09
export const NORMAL_CONCRETE_DENSITY = 2400
export const DEFAULT_LIGHTWEIGHT_DENSITY = 1800

export const ROUNDING_STEP = 50

export const NSR10_REFERENCES = {
  thicknessTable:
    "NSR-10, Tabla C.9.5(a) — Alturas o espesores mínimos de vigas no preesforzadas o losas reforzadas en una dirección",
  thicknessTableRecommended:
    "NSR-10, Tabla CR.9.5 — Alturas mínimas recomendadas para elementos que soportan o están unidos a divisiones susceptibles de dañarse",
  deflections:
    "NSR-10, C.9.5.2.1 — Deben calcularse las deflexiones si el elemento soporta o está unido a tabiques o divisiones susceptibles de dañarse",
  fyAdjustment:
    "NSR-10, Tabla C.9.5(a), nota (b) — Ajuste para fy distinto de 420 MPa: (0.4 + fy/700)",
  lightweightAdjustment:
    "NSR-10, Tabla C.9.5(a), nota (a) — Ajuste para concreto liviano: (1.65 − 0.0003·wc) ≥ 1.09",
  desWidth: "NSR-10, C.21.5.1.3 — bw ≥ máx(0.3h, 250 mm)",
  desSpan: "NSR-10, C.21.5.1.1 — Luz libre ≥ 4h",
  dmoWidth: "NSR-10, C.21.3.4 — bw ≥ 200 mm",
  dmiWidth: "NSR-10, C.21.2 — Sin ancho mínimo especial",
} as const

export function thicknessFactor(
  elementType: ElementType,
  supportCondition: SupportCondition,
  fragilePartitions: boolean,
): number {
  const table = fragilePartitions ? RECOMMENDED_MIN_THICKNESS_FACTORS : MIN_THICKNESS_FACTORS
  return table[elementType][supportCondition]
}

export function fyFactor(fy: number): number {
  if (fy === FY_FACTOR_BASE) {
    return 1
  }
  return 0.4 + fy / 700
}

export function lightweightFactor(density: number): number {
  return Math.max(1.65 - 0.0003 * density, LIGHTWEIGHT_FACTOR_MIN)
}

export function roundUpToStep(value: number, step: number = ROUNDING_STEP): number {
  return Math.ceil(value / step) * step
}

export function minimumWidth(
  capacity: DissipationCapacity,
  h: number,
): { value: number; reference: string } {
  switch (capacity) {
    case "DES":
      return { value: Math.max(0.3 * h, 250), reference: NSR10_REFERENCES.desWidth }
    case "DMO":
      return { value: 200, reference: NSR10_REFERENCES.dmoWidth }
    case "DMI":
      return { value: 0, reference: NSR10_REFERENCES.dmiWidth }
  }
}
