"use client"

import { useState } from "react"

import { SaveCalculationButton } from "@/components/calculations/save-calculation-button"
import { UpdateCalculationButton } from "@/components/calculations/update-calculation-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AIU_LABOR_REFERENCES,
  ARL_RISK_CLASSES,
  DEFAULT_AIU_PERCENTAGES,
  DEFAULT_LABOR_RATES,
} from "@/lib/administrativo/colombia-labor"
import {
  calculateAiu,
  calculateLaborCost,
  type AiuResult,
  type LaborConcept,
  type LaborConceptGroup,
  type LaborResult,
} from "@/lib/tools/aiu-labor-cost/calculate"
import { aiuLaborCostDefinition } from "@/lib/tools/aiu-labor-cost/definition"
import {
  DEFAULT_DIRECT_COST,
  DEFAULT_MONTHLY_HOURS,
  DEFAULT_MONTHLY_SALARY,
  DEFAULT_TRANSPORT_ALLOWANCE,
  aiuLaborCostSchema,
  aiuSchema,
  laborSchema,
} from "@/lib/tools/aiu-labor-cost/schema"
import type { ToolComponentProps } from "@/lib/tools/types"
import { formatNumber, LOCALE } from "@/lib/units/format"

const GROUP_LABELS: Record<LaborConceptGroup, string> = {
  earnings: "Salario y auxilio",
  benefits: "Prestaciones sociales",
  contributions: "Aportes patronales y parafiscales",
}

const ARL_HINT = ARL_RISK_CLASSES.map(
  (item) => `${item.id}: ${formatNumber(item.ratePercent, 3)} %`
).join(" · ")

type FormState = {
  directCost: string
  administrationPercent: string
  contingencyPercent: string
  profitPercent: string
  monthlySalary: string
  transportAllowance: string
  monthlyHours: string
  severancePercent: string
  severanceInterestAnnualPercent: string
  serviceBonusPercent: string
  vacationPercent: string
  healthPercent: string
  pensionPercent: string
  arlPercent: string
  senaPercent: string
  icbfPercent: string
  familyCompensationPercent: string
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

function defaultFormState(): FormState {
  return {
    directCost: String(DEFAULT_DIRECT_COST),
    administrationPercent: numberToInput(
      DEFAULT_AIU_PERCENTAGES.administration
    ),
    contingencyPercent: numberToInput(DEFAULT_AIU_PERCENTAGES.contingency),
    profitPercent: numberToInput(DEFAULT_AIU_PERCENTAGES.profit),
    monthlySalary: String(DEFAULT_MONTHLY_SALARY),
    transportAllowance: String(DEFAULT_TRANSPORT_ALLOWANCE),
    monthlyHours: String(DEFAULT_MONTHLY_HOURS),
    severancePercent: numberToInput(DEFAULT_LABOR_RATES.severance),
    severanceInterestAnnualPercent: numberToInput(
      DEFAULT_LABOR_RATES.severanceInterestAnnual
    ),
    serviceBonusPercent: numberToInput(DEFAULT_LABOR_RATES.serviceBonus),
    vacationPercent: numberToInput(DEFAULT_LABOR_RATES.vacation),
    healthPercent: numberToInput(DEFAULT_LABOR_RATES.health),
    pensionPercent: numberToInput(DEFAULT_LABOR_RATES.pension),
    arlPercent: numberToInput(DEFAULT_LABOR_RATES.arl),
    senaPercent: numberToInput(DEFAULT_LABOR_RATES.sena),
    icbfPercent: numberToInput(DEFAULT_LABOR_RATES.icbf),
    familyCompensationPercent: numberToInput(
      DEFAULT_LABOR_RATES.familyCompensation
    ),
  }
}

function hydrateForm(initialInput?: Record<string, unknown>): FormState | null {
  if (!initialInput) return null

  const defaults = defaultFormState()

  return {
    directCost: readNumberString(initialInput.directCost, defaults.directCost),
    administrationPercent: readNumberString(
      initialInput.administrationPercent,
      defaults.administrationPercent
    ),
    contingencyPercent: readNumberString(
      initialInput.contingencyPercent,
      defaults.contingencyPercent
    ),
    profitPercent: readNumberString(
      initialInput.profitPercent,
      defaults.profitPercent
    ),
    monthlySalary: readNumberString(
      initialInput.monthlySalary,
      defaults.monthlySalary
    ),
    transportAllowance: readNumberString(
      initialInput.transportAllowance,
      defaults.transportAllowance
    ),
    monthlyHours: readNumberString(
      initialInput.monthlyHours,
      defaults.monthlyHours
    ),
    severancePercent: readNumberString(
      initialInput.severancePercent,
      defaults.severancePercent
    ),
    severanceInterestAnnualPercent: readNumberString(
      initialInput.severanceInterestAnnualPercent,
      defaults.severanceInterestAnnualPercent
    ),
    serviceBonusPercent: readNumberString(
      initialInput.serviceBonusPercent,
      defaults.serviceBonusPercent
    ),
    vacationPercent: readNumberString(
      initialInput.vacationPercent,
      defaults.vacationPercent
    ),
    healthPercent: readNumberString(
      initialInput.healthPercent,
      defaults.healthPercent
    ),
    pensionPercent: readNumberString(
      initialInput.pensionPercent,
      defaults.pensionPercent
    ),
    arlPercent: readNumberString(initialInput.arlPercent, defaults.arlPercent),
    senaPercent: readNumberString(
      initialInput.senaPercent,
      defaults.senaPercent
    ),
    icbfPercent: readNumberString(
      initialInput.icbfPercent,
      defaults.icbfPercent
    ),
    familyCompensationPercent: readNumberString(
      initialInput.familyCompensationPercent,
      defaults.familyCompensationPercent
    ),
  }
}

function formatCop(value: number): string {
  if (!Number.isFinite(value)) return "—"

  return `$ ${value.toLocaleString(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function NumberField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
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

function AiuBreakdownTable({ aiu }: { aiu: AiuResult }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Concepto</TableHead>
          <TableHead className="text-right">% sobre CD</TableHead>
          <TableHead className="text-right">Valor (COP)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Administración</TableCell>
          <TableCell className="text-right tabular-nums">
            {formatNumber(aiu.administrationPercent, 2)} %
          </TableCell>
          <TableCell className="text-right tabular-nums">
            {formatCop(aiu.administrationValue)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Imprevistos</TableCell>
          <TableCell className="text-right tabular-nums">
            {formatNumber(aiu.contingencyPercent, 2)} %
          </TableCell>
          <TableCell className="text-right tabular-nums">
            {formatCop(aiu.contingencyValue)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Utilidad</TableCell>
          <TableCell className="text-right tabular-nums">
            {formatNumber(aiu.profitPercent, 2)} %
          </TableCell>
          <TableCell className="text-right tabular-nums">
            {formatCop(aiu.profitValue)}
          </TableCell>
        </TableRow>
        <TableRow className="bg-muted/30 font-medium">
          <TableCell>AIU total</TableCell>
          <TableCell className="text-right tabular-nums">
            {formatNumber(aiu.totalPercent, 2)} %
          </TableCell>
          <TableCell className="text-right tabular-nums">
            {formatCop(aiu.totalValue)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Presupuesto total</TableCell>
          <TableCell className="text-right text-muted-foreground">—</TableCell>
          <TableCell className="text-right font-semibold tabular-nums">
            {formatCop(aiu.totalBudget)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

function LaborBreakdownTable({ labor }: { labor: LaborResult }) {
  const renderGroup = (group: LaborConceptGroup) => {
    const concepts = labor.concepts.filter((concept) => concept.group === group)

    return (
      <>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableCell
            colSpan={4}
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            {GROUP_LABELS[group]}
          </TableCell>
        </TableRow>
        {concepts.map((concept) => (
          <LaborConceptRow key={concept.key} concept={concept} />
        ))}
      </>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Concepto</TableHead>
          <TableHead className="text-right">Base (COP)</TableHead>
          <TableHead className="text-right">%</TableHead>
          <TableHead className="text-right">Valor mensual (COP)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {renderGroup("earnings")}
        {renderGroup("benefits")}
        <TableRow className="font-medium">
          <TableCell>Total prestaciones sociales</TableCell>
          <TableCell />
          <TableCell />
          <TableCell className="text-right tabular-nums">
            {formatCop(labor.totalBenefits)}
          </TableCell>
        </TableRow>
        {renderGroup("contributions")}
        <TableRow className="font-medium">
          <TableCell>Total aportes y parafiscales</TableCell>
          <TableCell />
          <TableCell />
          <TableCell className="text-right tabular-nums">
            {formatCop(labor.totalContributions)}
          </TableCell>
        </TableRow>
        <TableRow className="bg-muted/60 font-semibold">
          <TableCell>Costo mensual total</TableCell>
          <TableCell />
          <TableCell />
          <TableCell className="text-right tabular-nums">
            {formatCop(labor.monthlyCost)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

function LaborConceptRow({ concept }: { concept: LaborConcept }) {
  return (
    <TableRow>
      <TableCell className="align-top whitespace-normal">
        <span className="font-medium">{concept.label}</span>
        {concept.note ? (
          <p className="text-xs text-muted-foreground">{concept.note}</p>
        ) : null}
      </TableCell>
      <TableCell className="text-right align-top tabular-nums">
        {concept.base !== null ? formatCop(concept.base) : "—"}
      </TableCell>
      <TableCell className="text-right align-top tabular-nums">
        {concept.percent !== null
          ? `${formatNumber(concept.percent, 2)} %${
              concept.percentSuffix ? ` ${concept.percentSuffix}` : ""
            }`
          : "—"}
      </TableCell>
      <TableCell className="text-right align-top font-medium tabular-nums">
        {formatCop(concept.value)}
      </TableCell>
    </TableRow>
  )
}

export function AiuLaborCost({ initialInput, editMode }: ToolComponentProps) {
  const [form, setForm] = useState<FormState>(() => {
    return hydrateForm(initialInput) ?? defaultFormState()
  })

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validation = aiuLaborCostDefinition.validate(form)
  const aiuValidation = aiuSchema.safeParse(form)
  const laborValidation = laborSchema.safeParse(form)
  const aiuResult = aiuValidation.success
    ? calculateAiu(aiuValidation.data)
    : null
  const laborResult = laborValidation.success
    ? calculateLaborCost(laborValidation.data)
    : null
  const parsedInput =
    aiuValidation.success && laborValidation.success
      ? aiuLaborCostSchema.parse(form)
      : null
  const snapshot =
    parsedInput && aiuResult && laborResult
      ? aiuLaborCostDefinition.toSnapshot(parsedInput, {
          aiu: aiuResult,
          labor: laborResult,
        })
      : null

  const fieldError = (field: string) => {
    if (validation.valid) return undefined
    return validation.errors.find((error) => error.field === field)?.message
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AIU del presupuesto</CardTitle>
          <CardDescription>
            Administración, imprevistos y utilidad sobre los costos directos.
            Los porcentajes no se aplican en cascada ni incluyen impuestos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NumberField
              id="aiu-direct-cost"
              label="Costos directos (COP)"
              value={form.directCost}
              onChange={(value) => update("directCost", value)}
              error={fieldError("directCost")}
            />
            <NumberField
              id="aiu-administration"
              label="Administración (%)"
              value={form.administrationPercent}
              onChange={(value) => update("administrationPercent", value)}
              error={fieldError("administrationPercent")}
            />
            <NumberField
              id="aiu-contingency"
              label="Imprevistos (%)"
              value={form.contingencyPercent}
              onChange={(value) => update("contingencyPercent", value)}
              error={fieldError("contingencyPercent")}
            />
            <NumberField
              id="aiu-profit"
              label="Utilidad (%)"
              value={form.profitPercent}
              onChange={(value) => update("profitPercent", value)}
              error={fieldError("profitPercent")}
            />
          </div>

          {aiuResult ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultTile
                  label="Costos directos"
                  value={formatCop(aiuResult.directCost)}
                />
                <ResultTile
                  label="AIU total"
                  value={formatCop(aiuResult.totalValue)}
                  hint={`${formatNumber(aiuResult.totalPercent, 2)} % sobre CD`}
                />
                <ResultTile
                  label="Presupuesto total"
                  value={formatCop(aiuResult.totalBudget)}
                  hint={`AIU = ${formatNumber(
                    aiuResult.aiuShareOfTotalPercent,
                    2
                  )} % del total`}
                />
                <ResultTile
                  label="Utilidad"
                  value={formatCop(aiuResult.profitValue)}
                  hint={`${formatNumber(aiuResult.profitPercent, 2)} % sobre CD`}
                />
              </div>
              <AiuBreakdownTable aiu={aiuResult} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Completa los datos del AIU para calcular.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Costo real del trabajador</CardTitle>
          <CardDescription>
            Provisión mensual con prestaciones, aportes patronales y
            parafiscales. Ajusta las tasas según exenciones y clase de riesgo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Datos del trabajador</h3>
              <p className="text-xs text-muted-foreground">
                Ingresa el salario y el auxilio de transporte mensual. Las horas
                se usan para estimar el costo por hora.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField
                id="labor-salary"
                label="Salario mensual (COP)"
                value={form.monthlySalary}
                onChange={(value) => update("monthlySalary", value)}
                error={fieldError("monthlySalary")}
              />
              <NumberField
                id="labor-transport"
                label="Auxilio de transporte (COP)"
                value={form.transportAllowance}
                onChange={(value) => update("transportAllowance", value)}
                error={fieldError("transportAllowance")}
                hint="Usa 0 si no aplica."
              />
              <NumberField
                id="labor-hours"
                label="Horas laborales al mes"
                value={form.monthlyHours}
                onChange={(value) => update("monthlyHours", value)}
                error={fieldError("monthlyHours")}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Prestaciones sociales</h3>
              <p className="text-xs text-muted-foreground">
                Provisión mensual equivalente. Cesantías y prima usan salario +
                auxilio; vacaciones usan solo el salario.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <NumberField
                id="labor-severance"
                label="Cesantías (%)"
                value={form.severancePercent}
                onChange={(value) => update("severancePercent", value)}
                error={fieldError("severancePercent")}
              />
              <NumberField
                id="labor-severance-interest"
                label="Intereses sobre cesantías (% anual)"
                value={form.severanceInterestAnnualPercent}
                onChange={(value) =>
                  update("severanceInterestAnnualPercent", value)
                }
                error={fieldError("severanceInterestAnnualPercent")}
              />
              <NumberField
                id="labor-service-bonus"
                label="Prima de servicios (%)"
                value={form.serviceBonusPercent}
                onChange={(value) => update("serviceBonusPercent", value)}
                error={fieldError("serviceBonusPercent")}
              />
              <NumberField
                id="labor-vacation"
                label="Vacaciones (%)"
                value={form.vacationPercent}
                onChange={(value) => update("vacationPercent", value)}
                error={fieldError("vacationPercent")}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">
                Aportes patronales y parafiscales
              </h3>
              <p className="text-xs text-muted-foreground">
                Salud, pensión y ARL son aportes patronales; SENA, ICBF y caja
                de compensación son parafiscales.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberField
                id="labor-health"
                label="Salud (%)"
                value={form.healthPercent}
                onChange={(value) => update("healthPercent", value)}
                error={fieldError("healthPercent")}
                hint="Aporte patronal. Puede estar exento para salarios inferiores a 10 SMMLV."
              />
              <NumberField
                id="labor-pension"
                label="Pensión (%)"
                value={form.pensionPercent}
                onChange={(value) => update("pensionPercent", value)}
                error={fieldError("pensionPercent")}
                hint="Aporte patronal."
              />
              <NumberField
                id="labor-arl"
                label="ARL (%)"
                value={form.arlPercent}
                onChange={(value) => update("arlPercent", value)}
                error={fieldError("arlPercent")}
                hint={ARL_HINT}
              />
              <NumberField
                id="labor-sena"
                label="SENA (%)"
                value={form.senaPercent}
                onChange={(value) => update("senaPercent", value)}
                error={fieldError("senaPercent")}
                hint="Parafiscal. Puede estar exento; usa 0 si aplica."
              />
              <NumberField
                id="labor-icbf"
                label="ICBF (%)"
                value={form.icbfPercent}
                onChange={(value) => update("icbfPercent", value)}
                error={fieldError("icbfPercent")}
                hint="Parafiscal. Puede estar exento; usa 0 si aplica."
              />
              <NumberField
                id="labor-family-compensation"
                label="Caja de compensación (%)"
                value={form.familyCompensationPercent}
                onChange={(value) => update("familyCompensationPercent", value)}
                error={fieldError("familyCompensationPercent")}
                hint="Parafiscal."
              />
            </div>
            <p className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
              Salud, SENA e ICBF pueden estar exentos para trabajadores con
              salario inferior a 10 SMMLV. Si aplica, ajusta esas tasas a 0. La
              ARL depende de la clase de riesgo; las tarifas de referencia están
              en el campo ARL.
            </p>
          </div>

          {laborResult ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <ResultTile
                  label="Costo mensual total"
                  value={formatCop(laborResult.monthlyCost)}
                  hint="Incluye salario, auxilio, prestaciones y aportes"
                />
                <ResultTile
                  label="Costo anual"
                  value={formatCop(laborResult.annualCost)}
                  hint="12 meses"
                />
                <ResultTile
                  label="Costo por día"
                  value={formatCop(laborResult.dailyCost)}
                  hint="30 días"
                />
                <ResultTile
                  label="Costo por hora"
                  value={formatCop(laborResult.hourlyCost)}
                  hint={`${formatNumber(laborResult.monthlyHours, 0)} h/mes`}
                />
                <ResultTile
                  label="Prestaciones"
                  value={formatCop(laborResult.totalBenefits)}
                  hint={`${formatNumber(
                    laborResult.benefitsPercentOfSalary,
                    2
                  )} % del salario`}
                />
                <ResultTile
                  label="Aportes y parafiscales"
                  value={formatCop(laborResult.totalContributions)}
                  hint={`${formatNumber(
                    laborResult.contributionsPercentOfSalary,
                    2
                  )} % del salario`}
                />
                <ResultTile
                  label="Factor sobre salario"
                  value={formatNumber(laborResult.costFactor, 3)}
                  hint="Costo mensual / salario"
                />
                <ResultTile
                  label="Costo adicional al salario"
                  value={formatCop(laborResult.totalAdditionalCost)}
                  hint={`${formatNumber(
                    laborResult.totalAdditionalPercentOfSalary,
                    2
                  )} % del salario`}
                />
              </div>
              <LaborBreakdownTable labor={laborResult} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Completa los datos laborales para calcular.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Referencias y notas</CardTitle>
          <CardDescription>
            Valores orientativos de AIU y provisión laboral en Colombia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <ul className="list-disc space-y-1 pl-5">
            <li>{AIU_LABOR_REFERENCES.aiu}.</li>
            <li>{AIU_LABOR_REFERENCES.labor}.</li>
            <li>{AIU_LABOR_REFERENCES.socialSecurity}.</li>
            <li>{AIU_LABOR_REFERENCES.parafiscales}.</li>
            <li>{AIU_LABOR_REFERENCES.exemptions}.</li>
            <li>{AIU_LABOR_REFERENCES.transportAllowance}.</li>
            <li>{AIU_LABOR_REFERENCES.vacations}.</li>
            <li>{AIU_LABOR_REFERENCES.risk}.</li>
          </ul>

          <Separator />

          <div className="space-y-2">
            <p>
              El AIU no es un impuesto: sus porcentajes son parámetros del
              presupuesto o del contrato. La herramienta los aplica sobre los
              costos directos, sin cascada, y no incluye IVA, retenciones ni
              contribuciones especiales.
            </p>
            <p>
              Las prestaciones se calculan como provisiones mensuales
              equivalentes. El auxilio de transporte se incluye en cesantías y
              prima, pero no en vacaciones, salud, pensión, ARL ni parafiscales.
            </p>
            <p>
              Los aportes del trabajador (4 % de salud y 4 % de pensión) no se
              suman al costo del empleador porque se descuentan del salario. No
              se incluyen horas extras, recargos, comisiones, bonificaciones,
              dotación, capacitación ni exámenes médicos.
            </p>
            <p>
              Verifica la normativa vigente, el contrato y la clase de riesgo
              antes de usar estos valores. Esta herramienta es una referencia
              orientativa y no sustituye una liquidación laboral o contractual.
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
            toolId={aiuLaborCostDefinition.info.id}
            toolName={aiuLaborCostDefinition.info.name}
            snapshot={snapshot}
          />
        )}
      </div>
    </div>
  )
}
