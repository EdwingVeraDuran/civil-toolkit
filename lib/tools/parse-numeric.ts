export function parseNumericInput(input: unknown): unknown {
  if (typeof input !== "string") {
    return input
  }

  const normalized = input.replace(/\s/g, "")
  if (normalized === "") {
    return undefined
  }

  const commaIndex = normalized.lastIndexOf(",")
  const dotIndex = normalized.lastIndexOf(".")
  let candidate = normalized

  if (commaIndex !== -1 && dotIndex !== -1) {
    candidate =
      commaIndex > dotIndex
        ? normalized.replace(/\./g, "").replace(/,/g, ".")
        : normalized.replace(/,/g, "")
  } else if (commaIndex !== -1) {
    const commaCount = normalized.split(",").length - 1
    candidate =
      commaCount > 1
        ? normalized.replace(/,/g, "")
        : normalized.replace(",", ".")
  } else if (dotIndex !== -1) {
    const dotCount = normalized.split(".").length - 1
    candidate = dotCount > 1 ? normalized.replace(/\./g, "") : normalized
  }

  const parsed = Number(candidate)
  return Number.isNaN(parsed) ? input : parsed
}
