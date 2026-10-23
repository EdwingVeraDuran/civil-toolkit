"use client"

import { useRef, useState } from "react"
import { Plus, Trash2 } from "lucide-react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import { FlowCurveChart } from "@/components/tools/flow-curve-chart"
import { PlasticityChart } from "@/components/tools/plasticity-chart"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ATTERBERG_REFERENCES,
  PLASTIC_LIMIT_RANGE_LIMIT,
} from "@/lib/suelos/atterberg"
import type { AtterbergLimitsResult } from "@/lib/tools/atterberg-limits/calculate"
import { atterbergLimitsDefinition } from "@/lib/tools/atterberg-limits/definition"
import {
  MAX_LIQUID_LIMIT_POINTS,
  MAX_PLASTIC_LIMIT_POINTS,
  MIN_LIQUID_LIMIT_POINTS,
  MIN_PLASTIC_LIMIT_POINTS,
} from "@/lib/tools/atterberg-limits/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber } from "@/lib/units/format"

type LiquidLimitRow = {
  id: number
  blowsInput: string
  moistureInput: string
}

type PlasticLimitRow = {
  id: number
  moistureInput: string
}

type FormState = {
  liquidLimitRows: LiquidLimitRow[]
  plasticLimitRows: PlasticLimitRow[]
}

function numberToInput(value: number): string {
  return String(value).replace(".", ",")
}

function readNumberString(value: unknown, fallback: string): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return numberToInput(value)
  }
  if (typeof value === "string") {
    return value.trim() === "" ? fallback : value
  }
  return fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function defaultLiquidLimitRows(): LiquidLimitRow[] {
  return [
    { id: 0, blowsInput: "16", moistureInput: "52" },
    { id: 1, blowsInput: "22", moistureInput: "48,5" },
    { id: 2, blowsInput: "28", moistureInput: "46" },
    { id: 3, blowsInput: "34", moistureInput: "43,5" },
  ]
}

function defaultPlasticLimitRows(): PlasticLimitRow[] {
  return [
    { id: 0, moistureInput: "20" },
    { id: 1, moistureInput: "20,5" },
  ]
}

function readLiquidLimitRows(value: unknown): LiquidLimitRow[] {
  if (!Array.isArray(value)) return defaultLiquidLimitRows()

  const rows = value.flatMap((entry, index) => {
    if (!isRecord(entry)) return []

    return [
      {
        id: index,
        blowsInput: readNumberString(entry.blows, ""),
        moistureInput: readNumberString(entry.moisture, ""),
      },
    ]
  })

  return rows.length > 0 ? rows : defaultLiquidLimitRows()
}

function readPlasticLimitRows(value: unknown): PlasticLimitRow[] {
  if (!Array.isArray(value)) return defaultPlasticLimitRows()

  const rows = value.flatMap((entry, index) => {
    if (typeof entry === "number" && Number.isFinite(entry)) {
      return [{ id: index, moistureInput: numberToInput(entry) }]
    }

    if (typeof entry === "string") {
      return [
        {
          id: index,
          moistureInput: entry.trim() === "" ? "" : entry,
        },
      ]
    }

    if (isRecord(entry)) {
      return [
        {
          id: index,
          moistureInput: readNumberString(entry.moisture, ""),
        },
      ]
    }

    return []
  })

  return rows.length > 0 ? rows : defaultPlasticLimitRows()
}

function hydrateForm(initialInput?: Record<string, unknown>): FormState | null {
  if (!initialInput) return null

  return {
    liquidLimitRows: readLiquidLimitRows(initialInput.liquidLimitPoints),
    plasticLimitRows: readPlasticLimitRows(initialInput.plasticLimitValues),
  }
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
      <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium tabular-nums">{value}</dd>
    </div>
  )
}

export function AtterbergLimits({
  initialInput,
  editMode,
}: ToolComponentProps) {
  const hydrated = hydrateForm(initialInput)
  const [liquidLimitRows, setLiquidLimitRows] = useState<LiquidLimitRow[]>(
    () => hydrated?.liquidLimitRows ?? defaultLiquidLimitRows()
  )
  const [plasticLimitRows, setPlasticLimitRows] = useState<PlasticLimitRow[]>(
    () => hydrated?.plasticLimitRows ?? defaultPlasticLimitRows()
  )
  const nextLiquidLimitId = useRef(1000)
  const nextPlasticLimitId = useRef(1000)

  const rawInput = {
    liquidLimitPoints: liquidLimitRows.map((row) => ({
      blows: row.blowsInput,
      moisture: row.moistureInput,
    })),
    plasticLimitValues: plasticLimitRows.map((row) => row.moistureInput),
  }

  const validation = atterbergLimitsDefinition.validate(rawInput)
  const fieldError = (field: string) =>
    validation.valid
      ? undefined
      : validation.errors.find((error) => error.field === field)?.message

  const parsedInput = validation.valid
    ? atterbergLimitsDefinition.schema.parse(rawInput)
    : null
  const result: AtterbergLimitsResult | null = parsedInput
    ? atterbergLimitsDefinition.calculate(parsedInput)
    : null
  const snapshot =
    parsedInput && result
      ? atterbergLimitsDefinition.toSnapshot(parsedInput, result)
      : null

  const updateLiquidLimitRow = (
    id: number,
    field: "blowsInput" | "moistureInput",
    value: string
  ) => {
    setLiquidLimitRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const updatePlasticLimitRow = (id: number, value: string) => {
    setPlasticLimitRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, moistureInput: value } : row
      )
    )
  }

  const addLiquidLimitRow = () => {
    if (liquidLimitRows.length >= MAX_LIQUID_LIMIT_POINTS) return

    const id = nextLiquidLimitId.current
    nextLiquidLimitId.current += 1
    setLiquidLimitRows((current) => [
      ...current,
      { id, blowsInput: "", moistureInput: "" },
    ])
  }

  const addPlasticLimitRow = () => {
    if (plasticLimitRows.length >= MAX_PLASTIC_LIMIT_POINTS) return

    const id = nextPlasticLimitId.current
    nextPlasticLimitId.current += 1
    setPlasticLimitRows((current) => [...current, { id, moistureInput: "" }])
  }

  const removeLiquidLimitRow = (id: number) => {
    setLiquidLimitRows((current) =>
      current.length <= MIN_LIQUID_LIMIT_POINTS
        ? current
        : current.filter((row) => row.id !== id)
    )
  }

  const removePlasticLimitRow = (id: number) => {
    setPlasticLimitRows((current) =>
      current.length <= MIN_PLASTIC_LIMIT_POINTS
        ? current
        : current.filter((row) => row.id !== id)
    )
  }

  const liquidLimitRowsError = fieldError("liquidLimitPoints")
  const plasticLimitRowsError = fieldError("plasticLimitValues")

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Límite líquido (método multipunto)</CardTitle>
          <CardDescription>
            Ajusta por mínimos cuadrados el contenido de agua contra log10(N).
            El límite líquido se lee en la recta ajustada para 25 golpes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40 text-right">
                  N.º de golpes, N
                </TableHead>
                <TableHead className="text-right">
                  Contenido de agua, w (%)
                </TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liquidLimitRows.map((row, index) => {
                const blowsError = fieldError(
                  `liquidLimitPoints.${index}.blows`
                )
                const moistureError = fieldError(
                  `liquidLimitPoints.${index}.moisture`
                )

                return (
                  <TableRow key={row.id}>
                    <TableCell className="align-top whitespace-normal">
                      <Input
                        value={row.blowsInput}
                        inputMode="numeric"
                        autoComplete="off"
                        className="text-right"
                        placeholder="Ej. 30"
                        aria-label={`Número de golpes del punto ${index + 1}`}
                        aria-invalid={blowsError ? true : undefined}
                        onChange={(event) =>
                          updateLiquidLimitRow(
                            row.id,
                            "blowsInput",
                            event.target.value
                          )
                        }
                      />
                      {blowsError ? (
                        <p className="mt-1 text-xs text-destructive">
                          {blowsError}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <Input
                        value={row.moistureInput}
                        inputMode="decimal"
                        autoComplete="off"
                        className="text-right"
                        placeholder="Ej. 45"
                        aria-label={`Contenido de agua del punto ${index + 1}`}
                        aria-invalid={moistureError ? true : undefined}
                        onChange={(event) =>
                          updateLiquidLimitRow(
                            row.id,
                            "moistureInput",
                            event.target.value
                          )
                        }
                      />
                      {moistureError ? (
                        <p className="mt-1 text-xs text-destructive">
                          {moistureError}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={
                          liquidLimitRows.length <= MIN_LIQUID_LIMIT_POINTS
                        }
                        aria-label={`Eliminar punto ${index + 1}`}
                        title="Eliminar punto"
                        onClick={() => removeLiquidLimitRow(row.id)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Mínimo {MIN_LIQUID_LIMIT_POINTS} y máximo{" "}
              {MAX_LIQUID_LIMIT_POINTS} puntos. Se recomienda usar golpes entre
              10 y 40 y cubrir ambos lados de 25.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={liquidLimitRows.length >= MAX_LIQUID_LIMIT_POINTS}
              onClick={addLiquidLimitRow}
            >
              <Plus />
              Agregar punto
            </Button>
          </div>

          {liquidLimitRowsError ? (
            <p className="text-sm text-destructive">{liquidLimitRowsError}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Límite plástico</CardTitle>
          <CardDescription>
            Promedia las determinaciones de humedad del límite plástico. Se
            requieren al menos dos determinaciones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Determinación</TableHead>
                <TableHead className="text-right">
                  Contenido de agua, w (%)
                </TableHead>
                <TableHead className="w-12 text-right">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plasticLimitRows.map((row, index) => {
                const moistureError = fieldError(`plasticLimitValues.${index}`)

                return (
                  <TableRow key={row.id}>
                    <TableCell className="align-top text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <Input
                        value={row.moistureInput}
                        inputMode="decimal"
                        autoComplete="off"
                        className="text-right"
                        placeholder="Ej. 20,5"
                        aria-label={`Contenido de agua de la determinación ${
                          index + 1
                        }`}
                        aria-invalid={moistureError ? true : undefined}
                        onChange={(event) =>
                          updatePlasticLimitRow(row.id, event.target.value)
                        }
                      />
                      {moistureError ? (
                        <p className="mt-1 text-xs text-destructive">
                          {moistureError}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        disabled={
                          plasticLimitRows.length <= MIN_PLASTIC_LIMIT_POINTS
                        }
                        aria-label={`Eliminar determinación ${index + 1}`}
                        title="Eliminar determinación"
                        onClick={() => removePlasticLimitRow(row.id)}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Mínimo {MIN_PLASTIC_LIMIT_POINTS} y máximo{" "}
              {MAX_PLASTIC_LIMIT_POINTS} determinaciones. Si el rango supera{" "}
              {formatNumber(PLASTIC_LIMIT_RANGE_LIMIT, 1)} puntos porcentuales,
              repite el ensayo.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={plasticLimitRows.length >= MAX_PLASTIC_LIMIT_POINTS}
              onClick={addPlasticLimitRow}
            >
              <Plus />
              Agregar determinación
            </Button>
          </div>

          {plasticLimitRowsError ? (
            <p className="text-sm text-destructive">{plasticLimitRowsError}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados y clasificación</CardTitle>
          <CardDescription>
            {result
              ? "LL y LP se reportan redondeados al entero; el IP y la clasificación usan esos valores reportados."
              : "Completa los datos y corrige los errores para calcular."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultTile
                  label="Límite líquido, LL"
                  value={`${formatNumber(result.liquidLimit, 2)} %`}
                  hint={`Reporte: ${result.liquidLimitRounded} %`}
                />
                <ResultTile
                  label="Límite plástico, LP"
                  value={`${formatNumber(result.plasticLimit, 2)} %`}
                  hint={`Reporte: ${result.plasticLimitRounded} %`}
                />
                <ResultTile
                  label="Índice de plasticidad, IP"
                  value={
                    result.nonPlastic
                      ? "NP"
                      : `${formatNumber(result.plasticityIndex, 2)} %`
                  }
                  hint={
                    result.nonPlastic
                      ? "LP ≥ LL; no plástico"
                      : `Reporte: ${result.plasticityIndexRounded} %`
                  }
                />
                <ResultTile
                  label="Clasificación SUCS"
                  value={result.classification.symbol}
                  hint={result.classification.name}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {result.classification.description}
              </p>

              <dl className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-5">
                <Detail
                  label="Ecuación de la recta"
                  value={result.regression.equation}
                />
                <Detail
                  label="Coeficiente de determinación, R²"
                  value={formatNumber(result.regression.rSquared, 4)}
                />
                <Detail
                  label="Índice de flujo, IF"
                  value={`${formatNumber(result.regression.flowIndex, 2)} % / ciclo`}
                />
                <Detail
                  label="Puntos del ajuste"
                  value={String(result.regression.pointCount)}
                />
                <Detail
                  label="Rango del LP"
                  value={`${formatNumber(
                    result.plasticLimitSummary.range,
                    2
                  )} puntos`}
                />
              </dl>

              {result.warnings.length > 0 ? (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                  <p className="text-sm font-medium">Advertencias del ensayo</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {result.warnings.map((warning, index) => (
                      <li key={`${warning}-${index}`}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="grid gap-8 xl:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Curva de fluidez</p>
                    <p className="text-xs text-muted-foreground">
                      Contenido de agua contra el logaritmo del número de
                      golpes. La línea es el ajuste de mínimos cuadrados.
                    </p>
                  </div>
                  <FlowCurveChart
                    points={result.flowCurvePoints}
                    regression={result.regression}
                    liquidLimit={result.liquidLimit}
                    className="mx-auto w-full max-w-xl"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Carta de plasticidad</p>
                    <p className="text-xs text-muted-foreground">
                      Punto (LL, IP) con las líneas A y U de Casagrande. La
                      escala se amplía si LL &gt; 110 % o IP &gt; 60 %.
                    </p>
                  </div>
                  <PlasticityChart
                    liquidLimit={result.liquidLimitRounded}
                    plasticityIndex={result.plasticityIndexRounded}
                    classification={result.classification}
                    className="mx-auto w-full max-w-xl"
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Completa los datos y corrige los errores para calcular.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referencias y notas</CardTitle>
          <CardDescription>
            Criterios del ensayo, regresión y clasificación SUCS.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>{ATTERBERG_REFERENCES.limits}.</li>
            <li>{ATTERBERG_REFERENCES.classification}.</li>
            <li>{ATTERBERG_REFERENCES.chart}.</li>
            <li>{ATTERBERG_REFERENCES.index}.</li>
            <li>{ATTERBERG_REFERENCES.plasticLimitPrecision}.</li>
          </ul>

          <div className="space-y-2">
            <p>
              El ensayo se realiza sobre la fracción que pasa el tamiz de 425 µm
              (No. 40). LL y LP se reportan redondeados al entero más próximo;
              la herramienta muestra el valor calculado y el reportado.
            </p>
            <p>
              Si LP ≥ LL se reporta NP y no se calcula IP. La clasificación SUCS
              se asigna con el LL y el IP reportados.
            </p>
            <p>
              La carta no distingue ML de OL ni MH de OH; para la clasificación
              completa se requiere granulometría, contenido orgánico, color y
              olor. No se incluye clasificación AASHTO.
            </p>
            <p>
              La regresión usa x = log10(N), y = w; LL = a + b·log10(25) e IF =
              −b. Un R² bajo o una pendiente no negativa indican que conviene
              revisar el ensayo.
            </p>
            <p>
              Los resultados son orientativos. Verifica el ensayo y la normativa
              aplicable antes de usarlos en diseño.
            </p>
          </div>
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
            toolId={atterbergLimitsDefinition.info.id}
            toolName={atterbergLimitsDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
