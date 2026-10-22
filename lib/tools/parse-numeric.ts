export function parseNumericInput(input: unknown): unknown {
  if (typeof input !== "string") {
    return input
  }
  const normalized = input.replace(/\s/g, "").replace(",", ".")
  if (normalized === "") {
    return undefined
  }
  const parsed = Number(normalized)
  return Number.isNaN(parsed) ? input : parsed
}
