import type { DimensionId, Unit } from "@/lib/units/types"
import { getUnit, isUnitId, type UnitId } from "@/lib/units/units"
import { DEFAULT_DECIMALS, formatNumber } from "@/lib/units/format"

export type MeasurementData = {
  value: number
  unitId: UnitId
}

const EPSILON = 1e-9

export class Measurement {
  readonly value: number
  readonly unit: Unit

  constructor(value: number, unit: Unit) {
    if (!Number.isFinite(value)) {
      throw new Error("El valor de una medida debe ser un número finito")
    }
    this.value = value
    this.unit = unit
  }

  get dimension(): DimensionId {
    return this.unit.dimension
  }

  toBase(): number {
    return this.value * this.unit.factor + (this.unit.offset ?? 0)
  }

  static fromBase(value: number, unit: Unit): Measurement {
    return new Measurement((value - (unit.offset ?? 0)) / unit.factor, unit)
  }

  static from(value: number, unit: Unit | UnitId): Measurement {
    const resolved = typeof unit === "string" ? getUnit(unit) : unit
    if (!resolved) {
      throw new Error(`Unidad desconocida: ${String(unit)}`)
    }
    return new Measurement(value, resolved)
  }

  to(target: Unit | UnitId): Measurement {
    const resolved = typeof target === "string" ? getUnit(target) : target
    if (!resolved) {
      throw new Error(`Unidad desconocida: ${String(target)}`)
    }
    this.assertSameDimension(resolved)
    return Measurement.fromBase(this.toBase(), resolved)
  }

  add(other: Measurement): Measurement {
    this.assertSameDimension(other.unit)
    return new Measurement(this.value + other.to(this.unit).value, this.unit)
  }

  subtract(other: Measurement): Measurement {
    this.assertSameDimension(other.unit)
    return new Measurement(this.value - other.to(this.unit).value, this.unit)
  }

  multiply(scalar: number): Measurement {
    return new Measurement(this.value * scalar, this.unit)
  }

  divide(scalar: number): Measurement {
    if (scalar === 0) {
      throw new Error("No se puede dividir una medida entre cero")
    }
    return new Measurement(this.value / scalar, this.unit)
  }

  equals(other: Measurement): boolean {
    if (other.dimension !== this.dimension) {
      return false
    }
    const a = this.toBase()
    const b = other.toBase()
    return Math.abs(a - b) <= EPSILON * Math.max(1, Math.abs(a), Math.abs(b))
  }

  format(decimals: number = DEFAULT_DECIMALS): string {
    return `${formatNumber(this.value, decimals)} ${this.unit.symbol}`
  }

  toJSON(): MeasurementData {
    return { value: this.value, unitId: this.unit.id as UnitId }
  }

  static fromJSON(data: MeasurementData): Measurement {
    if (!isUnitId(data.unitId)) {
      throw new Error(`Unidad desconocida: ${String(data.unitId)}`)
    }
    return Measurement.from(data.value, data.unitId)
  }

  private assertSameDimension(other: Unit): void {
    if (other.dimension !== this.unit.dimension) {
      throw new Error(
        `No se puede convertir ${this.unit.symbol} a ${other.symbol}: dimensiones distintas`,
      )
    }
  }
}
