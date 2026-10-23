export const LOAD_COMBINATION_REFERENCE =
  "NSR-10, B.2.4.2 — Tabla B.2-3 (combinaciones mayoradas, método de resistencia)"

export const LOAD_COMBINATION_REFERENCES = {
  applicability: "NSR-10, B.2.4.1 — Aplicabilidad del método de resistencia",
  seismic: "NSR-10, B.2.4.2.1 — E = Fs/R y diseño al nivel de resistencia",
  halfLive: "NSR-10, B.2.4.2.2 — Reducción de L a 0.5L",
  liveLoadUnreduced: "NSR-10, B.4.5.1 — Carga viva sin reducir L0",
  wind: "NSR-10, B.2.4.2.3 — Uso de 1.3W",
  seismicService: "NSR-10, B.2.4.2.4 — Uso de 1.4E",
  lateralEarth: "NSR-10, B.2.4.2.5 — Factor de carga de H",
  impact: "NSR-10, B.2.4.2.6 — Impacto incluido en L",
  temperature:
    "NSR-10, B.2.4.2.7 — Asentamientos, retracción, flujo plástico y temperatura",
  nomenclature: "NSR-10, B.2.2 — Nomenclatura de cargas",
} as const

export const LOAD_COMBINATION_EQUATIONS = {
  "B.2.4-1": "1.4(D + F)",
  "B.2.4-2": "1.2(D + F + T) + 1.6(L + H) + 0.5(Lr ó G ó Le)",
  "B.2.4-3": "1.2D + 1.6(Lr ó G ó Le) + (L ó 0.8W)",
  "B.2.4-4": "1.2D + 1.6W + 1.0L + 0.5(Lr ó G ó Le)",
  "B.2.4-5": "1.2D + 1.0E + 1.0L",
  "B.2.4-6": "0.9D + 1.6W + 1.6H",
  "B.2.4-7": "0.9D + 1.0E + 1.6H",
} as const

export type LoadCombinationCode = keyof typeof LOAD_COMBINATION_EQUATIONS

export const LOAD_TERMS = ["dead", "live", "wind", "seismic"] as const

export type LoadTerm = (typeof LOAD_TERMS)[number]

export type LoadCombinationFactors = Record<LoadTerm, number>

export type LoadCombinationValues = LoadCombinationFactors

export type LoadCombinationOptions = {
  useHalfLive: boolean
  windWithoutDirectionalFactor: boolean
  seismicAtServiceLevel: boolean
}

export const DEFAULT_LOAD_COMBINATION_OPTIONS: LoadCombinationOptions = {
  useHalfLive: false,
  windWithoutDirectionalFactor: false,
  seismicAtServiceLevel: false,
}

export type LoadCombinationDefinition = {
  key: string
  code: LoadCombinationCode
  label: string
  variantLabel?: string
  officialEquation: string
  citation: string
  termOrder: LoadTerm[]
  factors: (options: LoadCombinationOptions) => LoadCombinationFactors
}

export type LoadCombinationResult = {
  key: string
  code: LoadCombinationCode
  label: string
  variantLabel?: string
  officialEquation: string
  citation: string
  termOrder: LoadTerm[]
  factors: LoadCombinationFactors
  value: number
}

function citationFor(code: LoadCombinationCode): string {
  return `NSR-10, B.2.4.2 — Tabla B.2-3, ecuación ${code}`
}

function defineCombination(
  key: string,
  code: LoadCombinationCode,
  label: string,
  variantLabel: string | undefined,
  termOrder: LoadTerm[],
  factors: (options: LoadCombinationOptions) => LoadCombinationFactors
): LoadCombinationDefinition {
  return {
    key,
    code,
    label,
    variantLabel,
    officialEquation: LOAD_COMBINATION_EQUATIONS[code],
    citation: citationFor(code),
    termOrder,
    factors,
  }
}

export const LOAD_COMBINATION_DEFINITIONS: LoadCombinationDefinition[] = [
  defineCombination(
    "B.2.4-1",
    "B.2.4-1",
    "B.2.4-1",
    undefined,
    ["dead"],
    () => ({ dead: 1.4, live: 0, wind: 0, seismic: 0 })
  ),
  defineCombination(
    "B.2.4-2",
    "B.2.4-2",
    "B.2.4-2",
    undefined,
    ["dead", "live"],
    () => ({ dead: 1.2, live: 1.6, wind: 0, seismic: 0 })
  ),
  defineCombination(
    "B.2.4-3-L",
    "B.2.4-3",
    "B.2.4-3 (L)",
    "L",
    ["dead", "live"],
    (options) => ({
      dead: 1.2,
      live: options.useHalfLive ? 0.5 : 1,
      wind: 0,
      seismic: 0,
    })
  ),
  defineCombination(
    "B.2.4-3-W",
    "B.2.4-3",
    "B.2.4-3 (0,8W)",
    "0,8W",
    ["dead", "wind"],
    () => ({ dead: 1.2, live: 0, wind: 0.8, seismic: 0 })
  ),
  defineCombination(
    "B.2.4-4",
    "B.2.4-4",
    "B.2.4-4",
    undefined,
    ["dead", "wind", "live"],
    (options) => ({
      dead: 1.2,
      live: options.useHalfLive ? 0.5 : 1,
      wind: options.windWithoutDirectionalFactor ? 1.3 : 1.6,
      seismic: 0,
    })
  ),
  defineCombination(
    "B.2.4-5",
    "B.2.4-5",
    "B.2.4-5",
    undefined,
    ["dead", "seismic", "live"],
    (options) => ({
      dead: 1.2,
      live: options.useHalfLive ? 0.5 : 1,
      wind: 0,
      seismic: options.seismicAtServiceLevel ? 1.4 : 1,
    })
  ),
  defineCombination(
    "B.2.4-6",
    "B.2.4-6",
    "B.2.4-6",
    undefined,
    ["dead", "wind"],
    (options) => ({
      dead: 0.9,
      live: 0,
      wind: options.windWithoutDirectionalFactor ? 1.3 : 1.6,
      seismic: 0,
    })
  ),
  defineCombination(
    "B.2.4-7",
    "B.2.4-7",
    "B.2.4-7",
    undefined,
    ["dead", "seismic"],
    (options) => ({
      dead: 0.9,
      live: 0,
      wind: 0,
      seismic: options.seismicAtServiceLevel ? 1.4 : 1,
    })
  ),
]

export function calculateLoadCombinations(
  values: LoadCombinationValues,
  options: LoadCombinationOptions = DEFAULT_LOAD_COMBINATION_OPTIONS
): LoadCombinationResult[] {
  return LOAD_COMBINATION_DEFINITIONS.map((definition) => {
    const factors = definition.factors(options)
    const value = LOAD_TERMS.reduce(
      (sum, term) => sum + factors[term] * values[term],
      0
    )

    return {
      key: definition.key,
      code: definition.code,
      label: definition.label,
      variantLabel: definition.variantLabel,
      officialEquation: definition.officialEquation,
      citation: definition.citation,
      termOrder: definition.termOrder,
      factors,
      value,
    }
  })
}

export function getLoadCombinationEnvelope<T extends LoadCombinationResult>(
  results: T[]
): {
  maximum: T
  minimum: T
} {
  if (results.length === 0) {
    throw new Error("No hay combinaciones para evaluar")
  }

  let maximum = results[0]
  let minimum = results[0]

  for (const result of results.slice(1)) {
    if (result.value > maximum.value) maximum = result
    if (result.value < minimum.value) minimum = result
  }

  return { maximum, minimum }
}
