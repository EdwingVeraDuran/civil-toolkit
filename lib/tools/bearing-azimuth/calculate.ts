import type {
  BearingQuadrant,
  OrientationInput,
  OrientationMode,
} from "@/lib/tools/bearing-azimuth/schema"
import { formatNumber, LOCALE } from "@/lib/units/format"

export type DmsParts = {
  degrees: number
  minutes: number
  seconds: number
}

export type BearingOrientation = {
  quadrant: BearingQuadrant
  angleDeg: number
}

export type OrientationResult = {
  mode: OrientationMode
  azimuthDeg: number
  bearingQuadrant: BearingQuadrant
  bearingAngleDeg: number
  azimuthDms: DmsParts
  bearingDms: DmsParts
  formula: string
}

const FULL_CIRCLE = 360
const RIGHT_ANGLE = 90
const SECONDS_DECIMALS = 2

const QUADRANT_LETTERS: Record<
  BearingQuadrant,
  { first: "N" | "S"; second: "E" | "W" }
> = {
  NE: { first: "N", second: "E" },
  NW: { first: "N", second: "W" },
  SE: { first: "S", second: "E" },
  SW: { first: "S", second: "W" },
}

export function normalizeAzimuth(value: number): number {
  const normalized = value % FULL_CIRCLE
  return normalized === 0 ? 0 : normalized + (normalized < 0 ? FULL_CIRCLE : 0)
}

export function dmsToDecimal({ degrees, minutes, seconds }: DmsParts): number {
  return degrees + minutes / 60 + seconds / 3600
}

export function decimalToDms(
  angleDeg: number,
  secondDecimals: number = SECONDS_DECIMALS
): DmsParts {
  const normalized = normalizeAzimuth(angleDeg)
  const scale = 10 ** secondDecimals
  const fullCircleUnits = FULL_CIRCLE * 3600 * scale
  let totalUnits = Math.round(normalized * 3600 * scale)

  if (totalUnits >= fullCircleUnits) {
    totalUnits = 0
  }

  const degreeUnits = 3600 * scale
  const minuteUnits = 60 * scale
  const degrees = Math.floor(totalUnits / degreeUnits)
  const remainder = totalUnits - degrees * degreeUnits
  const minutes = Math.floor(remainder / minuteUnits)
  const seconds = (remainder - minutes * minuteUnits) / scale

  return { degrees, minutes, seconds }
}

export function bearingToAzimuth(
  quadrant: BearingQuadrant,
  angleDeg: number
): number {
  switch (quadrant) {
    case "NE":
      return normalizeAzimuth(angleDeg)
    case "NW":
      return normalizeAzimuth(FULL_CIRCLE - angleDeg)
    case "SE":
      return normalizeAzimuth(180 - angleDeg)
    case "SW":
      return normalizeAzimuth(180 + angleDeg)
  }
}

export function azimuthToBearing(azimuthDeg: number): BearingOrientation {
  const azimuth = normalizeAzimuth(azimuthDeg)

  if (azimuth <= RIGHT_ANGLE) {
    return { quadrant: "NE", angleDeg: azimuth }
  }

  if (azimuth <= 180) {
    return { quadrant: "SE", angleDeg: 180 - azimuth }
  }

  if (azimuth <= 270) {
    return { quadrant: "SW", angleDeg: azimuth - 180 }
  }

  return { quadrant: "NW", angleDeg: FULL_CIRCLE - azimuth }
}

function formulaForBearing(quadrant: BearingQuadrant): string {
  switch (quadrant) {
    case "NE":
      return "NE: Az = θ"
    case "NW":
      return "NW: Az = 360° − θ"
    case "SE":
      return "SE: Az = 180° − θ"
    case "SW":
      return "SW: Az = 180° + θ"
  }
}

function formulaForAzimuth(azimuthDeg: number): string {
  if (azimuthDeg <= RIGHT_ANGLE) {
    return "0° ≤ Az ≤ 90°: rumbo NE, θ = Az"
  }
  if (azimuthDeg <= 180) {
    return "90° < Az ≤ 180°: rumbo SE, θ = 180° − Az"
  }
  if (azimuthDeg <= 270) {
    return "180° < Az ≤ 270°: rumbo SW, θ = Az − 180°"
  }
  return "270° < Az < 360°: rumbo NW, θ = 360° − Az"
}

export function calculateOrientation(
  input: OrientationInput
): OrientationResult {
  const angleDeg =
    input.format === "decimal"
      ? input.angle
      : dmsToDecimal({
          degrees: input.degrees,
          minutes: input.minutes,
          seconds: input.seconds,
        })

  if (input.mode === "bearing-to-azimuth") {
    const azimuthDeg = bearingToAzimuth(input.quadrant, angleDeg)

    return {
      mode: input.mode,
      azimuthDeg,
      bearingQuadrant: input.quadrant,
      bearingAngleDeg: angleDeg,
      azimuthDms: decimalToDms(azimuthDeg),
      bearingDms: decimalToDms(angleDeg),
      formula: formulaForBearing(input.quadrant),
    }
  }

  const azimuthDeg = normalizeAzimuth(angleDeg)
  const bearing = azimuthToBearing(azimuthDeg)

  return {
    mode: input.mode,
    azimuthDeg,
    bearingQuadrant: bearing.quadrant,
    bearingAngleDeg: bearing.angleDeg,
    azimuthDms: decimalToDms(azimuthDeg),
    bearingDms: decimalToDms(bearing.angleDeg),
    formula: formulaForAzimuth(azimuthDeg),
  }
}

export function formatDecimalDegrees(
  angleDeg: number,
  decimals: number = 6
): string {
  const rounded = Number(angleDeg.toFixed(decimals))
  const normalized = rounded >= FULL_CIRCLE ? 0 : rounded
  return `${formatNumber(normalized, decimals)}°`
}

export function formatDms(parts: DmsParts): string {
  const seconds = parts.seconds.toLocaleString(LOCALE, {
    maximumFractionDigits: SECONDS_DECIMALS,
  })
  return `${formatNumber(parts.degrees, 0)}° ${formatNumber(
    parts.minutes,
    0
  )}′ ${seconds}″`
}

export function formatBearingDecimal(
  quadrant: BearingQuadrant,
  angleDeg: number,
  decimals: number = 6
): string {
  const letters = QUADRANT_LETTERS[quadrant]
  return `${letters.first} ${formatDecimalDegrees(
    angleDeg,
    decimals
  )} ${letters.second}`
}

export function formatBearingDms(
  quadrant: BearingQuadrant,
  parts: DmsParts
): string {
  const letters = QUADRANT_LETTERS[quadrant]
  return `${letters.first} ${formatDms(parts)} ${letters.second}`
}
