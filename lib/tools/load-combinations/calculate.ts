import {
  calculateLoadCombinations as calculateNsr10LoadCombinations,
  getLoadCombinationEnvelope,
  LOAD_COMBINATION_REFERENCE,
  type LoadCombinationFactors,
  type LoadCombinationResult,
  type LoadTerm,
} from "@/lib/estructuras/nsr10-load-combinations"
import {
  type LoadCombinationsInput,
  type LoadUnit,
} from "@/lib/tools/load-combinations/schema"
import { formatNumber } from "@/lib/units/format"

const TERM_SYMBOLS: Record<LoadTerm, string> = {
  dead: "D",
  live: "L",
  wind: "W",
  seismic: "E",
}

export type LoadCombinationRow = LoadCombinationResult & {
  equation: string
}

export type LoadCombinationsResult = {
  combinations: LoadCombinationRow[]
  maximum: LoadCombinationRow
  minimum: LoadCombinationRow
  unit: LoadUnit
  reference: string
}

function buildEquation(
  factors: LoadCombinationFactors,
  termOrder: LoadTerm[]
): string {
  const terms = termOrder
    .filter((term) => factors[term] !== 0)
    .map((term) => `${formatNumber(factors[term], 1)}${TERM_SYMBOLS[term]}`)

  return terms.length > 0 ? terms.join(" + ") : "0"
}

export function calculateLoadCombinations(
  input: LoadCombinationsInput
): LoadCombinationsResult {
  const combinations = calculateNsr10LoadCombinations(
    {
      dead: input.deadLoad,
      live: input.liveLoad,
      wind: input.windLoad,
      seismic: input.seismicLoad,
    },
    {
      useHalfLive: input.useHalfLive,
      windWithoutDirectionalFactor: input.windWithoutDirectionalFactor,
      seismicAtServiceLevel: input.seismicAtServiceLevel,
    }
  ).map((row) => ({
    ...row,
    equation: buildEquation(row.factors, row.termOrder),
  }))

  const { maximum, minimum } = getLoadCombinationEnvelope(combinations)

  return {
    combinations,
    maximum,
    minimum,
    unit: input.unit,
    reference: LOAD_COMBINATION_REFERENCE,
  }
}
