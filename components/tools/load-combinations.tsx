"use client"

import { useState } from "react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LOAD_COMBINATION_EQUATIONS,
  LOAD_COMBINATION_REFERENCE,
  LOAD_COMBINATION_REFERENCES,
} from "@/lib/estructuras/nsr10-load-combinations"
import { loadCombinationsDefinition } from "@/lib/tools/load-combinations/definition"
import { evaluateTool } from "@/lib/tools/evaluate"
import {
  DEFAULT_LOAD_UNIT,
  LOAD_UNIT_LABELS,
  LOAD_UNITS,
  isLoadUnit,
  type LoadUnit,
} from "@/lib/tools/load-combinations/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"

const UNIT_ITEMS = LOAD_UNITS.map((value) => ({
  value,
  label: LOAD_UNIT_LABELS[value],
}))

function readNumberString(value: unknown, fallback: string): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (typeof value === "string") return value
  return fallback
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback
}

function hydrateLoadCombinationsInput(initialInput?: Record<string, unknown>) {
  if (!initialInput) return null

  return {
    deadInput: readNumberString(initialInput.deadLoad, "18"),
    liveInput: readNumberString(initialInput.liveLoad, "8"),
    windInput: readNumberString(initialInput.windLoad, "0"),
    seismicInput: readNumberString(initialInput.seismicLoad, "0"),
    unit: isLoadUnit(initialInput.unit) ? initialInput.unit : DEFAULT_LOAD_UNIT,
    useHalfLive: readBoolean(initialInput.useHalfLive, false),
    windWithoutDirectionalFactor: readBoolean(
      initialInput.windWithoutDirectionalFactor,
      false
    ),
    seismicAtServiceLevel: readBoolean(
      initialInput.seismicAtServiceLevel,
      false
    ),
  }
}

function LoadField({
  id,
  label,
  symbol,
  unit,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  symbol: string
  unit: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {symbol} — {label} ({unit})
      </Label>
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function CheckboxOption({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        className="mt-0.5"
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function ResultTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function LoadCombinations({
  initialInput,
  editMode,
}: ToolComponentProps) {
  const hydrated = hydrateLoadCombinationsInput(initialInput)
  const [deadInput, setDeadInput] = useState(hydrated?.deadInput ?? "18")
  const [liveInput, setLiveInput] = useState(hydrated?.liveInput ?? "8")
  const [windInput, setWindInput] = useState(hydrated?.windInput ?? "0")
  const [seismicInput, setSeismicInput] = useState(
    hydrated?.seismicInput ?? "0"
  )
  const [unit, setUnit] = useState<LoadUnit>(
    hydrated?.unit ?? DEFAULT_LOAD_UNIT
  )
  const [useHalfLive, setUseHalfLive] = useState(hydrated?.useHalfLive ?? false)
  const [windWithoutDirectionalFactor, setWindWithoutDirectionalFactor] =
    useState(hydrated?.windWithoutDirectionalFactor ?? false)
  const [seismicAtServiceLevel, setSeismicAtServiceLevel] = useState(
    hydrated?.seismicAtServiceLevel ?? false
  )

  const rawInput = {
    deadLoad: deadInput,
    liveLoad: liveInput,
    windLoad: windInput,
    seismicLoad: seismicInput,
    unit,
    useHalfLive,
    windWithoutDirectionalFactor,
    seismicAtServiceLevel,
  }

  const { validation, result, snapshot } = evaluateTool(
    loadCombinationsDefinition,
    rawInput
  )
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const unitSymbol = LOAD_UNIT_LABELS[unit]
  const deadError = fieldError("deadLoad")
  const liveError = fieldError("liveLoad")
  const windError = fieldError("windLoad")
  const seismicError = fieldError("seismicLoad")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Solicitaciones nominales</CardTitle>
          <CardDescription>
            Ingresa D, L, W y E en la misma unidad. Los factores de mayoración
            son adimensionales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <LoadField
              id="dead-load"
              symbol="D"
              label="Carga muerta"
              unit={unitSymbol}
              value={deadInput}
              error={deadError}
              onChange={setDeadInput}
            />
            <LoadField
              id="live-load"
              symbol="L"
              label="Carga viva"
              unit={unitSymbol}
              value={liveInput}
              error={liveError}
              onChange={setLiveInput}
            />
            <LoadField
              id="wind-load"
              symbol="W"
              label="Viento"
              unit={unitSymbol}
              value={windInput}
              error={windError}
              onChange={setWindInput}
            />
            <LoadField
              id="seismic-load"
              symbol="E"
              label="Sismo"
              unit={unitSymbol}
              value={seismicInput}
              error={seismicError}
              onChange={setSeismicInput}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-start">
            <div className="space-y-2">
              <Label htmlFor="load-unit">Unidad de las solicitaciones</Label>
              <Select
                items={UNIT_ITEMS}
                value={unit}
                onValueChange={(next) => {
                  if (isLoadUnit(next)) setUnit(next)
                }}
              >
                <SelectTrigger id="load-unit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground sm:pt-7">
              La unidad solo etiqueta las entradas y los resultados; no se
              convierten valores. Usa la misma unidad para D, L, W y E.
            </p>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Opciones normativas</p>
              <p className="text-xs text-muted-foreground">
                Actívalas solo si se cumple la condición indicada.
              </p>
            </div>
            <CheckboxOption
              id="use-half-live"
              label="Aplicar 0,5L (B.2.4.2.2)"
              description="Solo si L0 ≤ 4,8 kN/m² y el área no es estacionamiento, lugar de reunión pública ni tiene L0 > 4,8 kN/m². L0 es la carga viva sin reducir. Afecta B.2.4-3, B.2.4-4 y B.2.4-5; no cambia el 1,6L de B.2.4-2."
              checked={useHalfLive}
              onCheckedChange={setUseHalfLive}
            />
            <CheckboxOption
              id="wind-no-directional-factor"
              label="Aplicar 1,3W (B.2.4.2.3)"
              description="Solo si las cargas de viento de B.6 no se reducen por el factor de direccionalidad. Afecta B.2.4-4 y B.2.4-6; no cambia el 0,8W de B.2.4-3."
              checked={windWithoutDirectionalFactor}
              onCheckedChange={setWindWithoutDirectionalFactor}
            />
            <CheckboxOption
              id="seismic-service-level"
              label="Aplicar 1,4E (B.2.4.2.4)"
              description="Solo si los efectos sísmicos E se basan en los niveles de servicio de las fuerzas sísmicas. Afecta B.2.4-5 y B.2.4-7."
              checked={seismicAtServiceLevel}
              onCheckedChange={setSeismicAtServiceLevel}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Combinaciones de diseño</CardTitle>
          <CardDescription>
            {result
              ? "Método de resistencia — NSR-10 B.2.4.2. B.2.4-3 se evalúa con L y con 0,8W."
              : "Completa las solicitaciones para calcular las combinaciones."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultTile
                  label="Mayor valor"
                  value={`${formatNumber(result.maximum.value, 3)} ${unitSymbol}`}
                  hint={result.maximum.label}
                />
                <ResultTile
                  label="Menor valor"
                  value={`${formatNumber(result.minimum.value, 3)} ${unitSymbol}`}
                  hint={
                    result.minimum.value < 0
                      ? `${result.minimum.label} · valor negativo`
                      : result.minimum.label
                  }
                />
                <ResultTile
                  label="Casos evaluados"
                  value={String(result.combinations.length)}
                  hint="B.2.4-3 con dos alternativas"
                />
                <ResultTile
                  label="Unidad"
                  value={unitSymbol}
                  hint="Factores adimensionales"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Combinación</TableHead>
                    <TableHead>Ecuación aplicada</TableHead>
                    <TableHead className="text-right">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.combinations.map((row) => {
                    const isMaximum = row.key === result.maximum.key
                    const isMinimum = row.key === result.minimum.key
                    const hasNegativeMinimum = isMinimum && row.value < 0

                    return (
                      <TableRow
                        key={row.key}
                        className={
                          isMaximum
                            ? "bg-primary/5"
                            : hasNegativeMinimum
                              ? "bg-destructive/5"
                              : isMinimum
                                ? "bg-muted/30"
                                : undefined
                        }
                      >
                        <TableCell className="align-top">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-medium tabular-nums">
                              {row.code}
                            </span>
                            {row.variantLabel ? (
                              <Badge variant="outline">
                                {row.variantLabel}
                              </Badge>
                            ) : null}
                            {isMaximum ? <Badge>Máx.</Badge> : null}
                            {isMinimum ? (
                              <Badge
                                variant={
                                  hasNegativeMinimum ? "destructive" : "outline"
                                }
                              >
                                Mín.
                              </Badge>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <span className="font-mono text-xs sm:text-sm">
                            {row.equation}
                          </span>
                        </TableCell>
                        <TableCell className="text-right align-top font-medium tabular-nums">
                          {formatNumber(row.value, 3)} {unitSymbol}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <p className="text-xs text-muted-foreground">
                La fila Máx. corresponde al mayor valor algebraico y la fila
                Mín. al menor. Para W o E reversibles, evalúa ambos sentidos.
              </p>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">—</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referencias y notas</CardTitle>
          <CardDescription>
            Combinaciones mayoradas del método de resistencia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Esta herramienta aplica los factores de mayoración; no calcula las
            cargas D, L, W ni E ni los coeficientes de reducción de resistencia
            φ.
          </p>

          <div className="space-y-2">
            <p className="font-medium text-foreground">
              Ecuaciones completas de B.2.4.2
            </p>
            <ul className="space-y-1 text-xs">
              {Object.entries(LOAD_COMBINATION_EQUATIONS).map(
                ([code, equation]) => (
                  <li key={code}>
                    <span className="font-medium text-foreground">{code}</span>
                    {" — "}
                    <span className="font-mono">{equation}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          <p>
            En esta versión se toman F = T = H = Lr = G = Le = 0. Si el proyecto
            incluye empujes de tierra, fluidos, temperatura, carga viva de
            cubierta, granizo o empozamiento, agrega sus términos según B.2.4.2
            antes de usar estas combinaciones.
          </p>

          <ul className="list-disc space-y-1 pl-5 text-xs">
            <li>{LOAD_COMBINATION_REFERENCE}.</li>
            <li>{LOAD_COMBINATION_REFERENCES.applicability}.</li>
            <li>{LOAD_COMBINATION_REFERENCES.seismic}.</li>
            <li>
              {LOAD_COMBINATION_REFERENCES.halfLive}: la reducción no aplica a
              estacionamientos, lugares de reunión pública ni áreas con L0 mayor
              que 4,8 kN/m².
            </li>
            <li>{LOAD_COMBINATION_REFERENCES.liveLoadUnreduced}.</li>
            <li>
              {LOAD_COMBINATION_REFERENCES.wind}: solo cuando el viento de B.6
              no se reduce por direccionalidad.
            </li>
            <li>
              {LOAD_COMBINATION_REFERENCES.seismicService}: solo cuando E se
              basa en los niveles de servicio de las fuerzas sísmicas.
            </li>
            <li>{LOAD_COMBINATION_REFERENCES.lateralEarth}.</li>
            <li>{LOAD_COMBINATION_REFERENCES.impact}.</li>
            <li>{LOAD_COMBINATION_REFERENCES.temperature}.</li>
            <li>{LOAD_COMBINATION_REFERENCES.nomenclature}.</li>
          </ul>

          <p>
            Los valores pueden ser positivos o negativos; esto es útil cuando se
            combinan solicitaciones como momentos, cortantes o axiales. Para W y
            E reversibles, evalúa ambos sentidos. La combinación con el mayor
            valor no necesariamente cubre todos los estados límite; verifica
            también el menor valor y los signos de las solicitaciones.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        {editMode ? (
          <UpdateCalculationButton
            calculationId={editMode.calculationId}
            title={editMode.title}
            projectId={editMode.projectId}
            snapshot={snapshot}
          />
        ) : (
          <SaveCalculationButton
            toolId={loadCombinationsDefinition.info.id}
            toolName={loadCombinationsDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
