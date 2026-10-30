import type { ZodType } from "zod"

import type { JsonObject } from "@/lib/types/calculation"

export type SavedResultSpec = {
  numbers?: readonly string[]
  strings?: readonly string[]
  booleans?: readonly string[]
  arrays?: readonly string[]
  records?: readonly string[]
}

export function isSavedRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Parsea los datos de entrada guardados con el schema de la herramienta.
 *
 * Los snapshots antiguos pueden tener números como texto; los schemas ya usan
 * `parseNumericInput`, por lo que se aceptan igualmente.
 */
export function parseSavedInput<T>(
  schema: ZodType<T>,
  inputs: JsonObject
): T | null {
  const parsed = schema.safeParse(inputs)
  return parsed.success ? parsed.data : null
}

function matchesSpec(value: JsonObject, spec: SavedResultSpec): boolean {
  if (
    spec.numbers?.some(
      (key) => typeof value[key] !== "number" || !Number.isFinite(value[key])
    )
  ) {
    return false
  }

  if (spec.strings?.some((key) => typeof value[key] !== "string")) {
    return false
  }

  if (spec.booleans?.some((key) => typeof value[key] !== "boolean")) {
    return false
  }

  if (spec.arrays?.some((key) => !Array.isArray(value[key]))) {
    return false
  }

  if (spec.records?.some((key) => !isSavedRecord(value[key]))) {
    return false
  }

  return true
}

/**
 * Lee un resultado guardado solo si contiene las claves mínimas esperadas.
 * No recalcula ni completa valores: los reportes usan el snapshot tal cual.
 */
export function readSavedResult<T>(
  value: unknown,
  spec: SavedResultSpec
): T | null {
  if (!isSavedRecord(value) || !matchesSpec(value, spec)) {
    return null
  }

  return value as unknown as T
}

export function readSavedRecord<T>(
  value: unknown,
  spec: SavedResultSpec
): T | null {
  if (!isSavedRecord(value) || !matchesSpec(value, spec)) {
    return null
  }

  return value as unknown as T
}

export function readSavedRecordArray<T>(
  value: unknown,
  spec: SavedResultSpec
): T[] | null {
  if (!Array.isArray(value)) {
    return null
  }

  const records = value.map((item) => readSavedRecord<T>(item, spec))

  if (records.some((record) => record === null)) {
    return null
  }

  return records as T[]
}
