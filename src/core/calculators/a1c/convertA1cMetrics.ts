import type { CalculatorResult } from "../../types";

export type A1cMetricInput = "a1c" | "gmi" | "fructosamine" | "eag";
export type FructosamineA1cMethodId = "young" | "cohen";

export const DEFAULT_FRUCTOSAMINE_A1C_METHOD: FructosamineA1cMethodId = "cohen";

export const FRUCTOSAMINE_A1C_METHOD_TOOLTIP =
  "Cohen et al. (ADA 2003) is the preferred fructosamine ↔ A1c conversion method in this calculator.";

export interface FructosamineA1cMethod {
  id: FructosamineA1cMethodId;
  label: string;
  citation: string;
  a1cFromFructosamineFormula: string;
  a1cPercent: number;
  fructosamineUmolL: number;
}

export interface A1cMetrics {
  a1cPercent: number;
  gmiPercent: number;
  fructosamineUmolL: number;
  eagMgDl: number;
  activeFructosamineMethod: FructosamineA1cMethodId;
  fructosamineMethods: FructosamineA1cMethod[];
}

export interface ConvertA1cMetricsInput {
  metric: A1cMetricInput;
  value: number;
  fructosamineMethod?: FructosamineA1cMethodId;
}

const A1C_MIN = 4;
const A1C_MAX = 18;
const FRUCTOSAMINE_MIN = 150;
const FRUCTOSAMINE_MAX = 500;
const EAG_MIN = 50;
const EAG_MAX = 500;

const FRUCTOSAMINE_A1C_METHOD_DEFS = [
  {
    id: "cohen" as const,
    label: "Cohen et al.",
    citation: "Cohen et al., ADA 2003",
    a1cFromFructosamine: (fructosamineUmolL: number) =>
      0.017 * fructosamineUmolL + 1.61,
    fructosamineFromA1c: (a1cPercent: number) => (a1cPercent - 1.61) / 0.017,
    a1cFromFructosamineFormula: "A1c (%) = 0.017 × Fructosamine (µmol/L) + 1.61",
  },
  {
    id: "young" as const,
    label: "Young et al.",
    citation: "Young et al., MilMed 2025",
    a1cFromFructosamine: (fructosamineUmolL: number) =>
      0.0154 * fructosamineUmolL + 3.121,
    fructosamineFromA1c: (a1cPercent: number) => (a1cPercent - 3.121) / 0.0154,
    a1cFromFructosamineFormula: "A1c (%) = 0.0154 × Fructosamine (µmol/L) + 3.121",
  },
] as const;

export function getFructosamineA1cMethodMeta(id: FructosamineA1cMethodId) {
  return FRUCTOSAMINE_A1C_METHOD_DEFS.find((method) => method.id === id)!;
}

function a1cFromEag(eagMgDl: number): number {
  return (eagMgDl + 46.7) / 28.7;
}

function eagFromA1c(a1cPercent: number): number {
  return 28.7 * a1cPercent - 46.7;
}

function gmiFromMeanGlucose(meanGlucoseMgDl: number): number {
  return 3.31 + 0.02392 * meanGlucoseMgDl;
}

function meanGlucoseFromGmi(gmiPercent: number): number {
  return (gmiPercent - 3.31) / 0.02392;
}

function fructosamineMethodsFromA1c(a1cPercent: number): FructosamineA1cMethod[] {
  return FRUCTOSAMINE_A1C_METHOD_DEFS.map((method) => ({
    id: method.id,
    label: method.label,
    citation: method.citation,
    a1cFromFructosamineFormula: method.a1cFromFructosamineFormula,
    a1cPercent,
    fructosamineUmolL: method.fructosamineFromA1c(a1cPercent),
  }));
}

function fructosamineMethodsFromFructosamine(
  fructosamineUmolL: number,
): FructosamineA1cMethod[] {
  return FRUCTOSAMINE_A1C_METHOD_DEFS.map((method) => ({
    id: method.id,
    label: method.label,
    citation: method.citation,
    a1cFromFructosamineFormula: method.a1cFromFructosamineFormula,
    a1cPercent: method.a1cFromFructosamine(fructosamineUmolL),
    fructosamineUmolL,
  }));
}

function selectFructosamineMethod(
  methods: FructosamineA1cMethod[],
  preferredMethod: FructosamineA1cMethodId,
): FructosamineA1cMethod {
  return methods.find((method) => method.id === preferredMethod) ?? methods[0];
}

function metricsFromA1c(
  a1cPercent: number,
  preferredMethod: FructosamineA1cMethodId,
): A1cMetrics {
  const fructosamineMethods = fructosamineMethodsFromA1c(a1cPercent);
  const active = selectFructosamineMethod(fructosamineMethods, preferredMethod);
  const eagMgDl = eagFromA1c(a1cPercent);
  return {
    a1cPercent,
    eagMgDl,
    gmiPercent: gmiFromMeanGlucose(eagMgDl),
    fructosamineUmolL: active.fructosamineUmolL,
    activeFructosamineMethod: active.id,
    fructosamineMethods,
  };
}

function metricsFromFructosamine(
  fructosamineUmolL: number,
  preferredMethod: FructosamineA1cMethodId,
): A1cMetrics {
  const fructosamineMethods = fructosamineMethodsFromFructosamine(fructosamineUmolL);
  const active = selectFructosamineMethod(fructosamineMethods, preferredMethod);
  const eagMgDl = eagFromA1c(active.a1cPercent);
  return {
    a1cPercent: active.a1cPercent,
    eagMgDl,
    gmiPercent: gmiFromMeanGlucose(eagMgDl),
    fructosamineUmolL,
    activeFructosamineMethod: active.id,
    fructosamineMethods,
  };
}

function validateA1c(a1cPercent: number): void {
  if (a1cPercent < A1C_MIN || a1cPercent > A1C_MAX) {
    throw new Error(`Derived A1c falls outside ${A1C_MIN}–${A1C_MAX}% — check input.`);
  }
}

function validateFructosamine(fructosamineUmolL: number): void {
  if (fructosamineUmolL < FRUCTOSAMINE_MIN || fructosamineUmolL > FRUCTOSAMINE_MAX) {
    throw new Error(
      `Derived fructosamine falls outside ${FRUCTOSAMINE_MIN}–${FRUCTOSAMINE_MAX} µmol/L — check input.`,
    );
  }
}

function validateMetrics(metrics: A1cMetrics): void {
  if (
    metrics.a1cPercent < A1C_MIN ||
    metrics.a1cPercent > A1C_MAX ||
    metrics.gmiPercent < A1C_MIN ||
    metrics.gmiPercent > A1C_MAX
  ) {
    throw new Error(`Derived A1c/GMI falls outside ${A1C_MIN}–${A1C_MAX}% — check input.`);
  }

  for (const method of metrics.fructosamineMethods) {
    validateA1c(method.a1cPercent);
    validateFructosamine(method.fructosamineUmolL);
  }

  if (metrics.eagMgDl < EAG_MIN || metrics.eagMgDl > EAG_MAX) {
    throw new Error(`Derived eAG falls outside ${EAG_MIN}–${EAG_MAX} mg/dL — check input.`);
  }
}

export function convertA1cMetrics(
  input: ConvertA1cMetricsInput,
): CalculatorResult<A1cMetrics> {
  const { metric, value } = input;
  const fructosamineMethod = input.fructosamineMethod ?? DEFAULT_FRUCTOSAMINE_A1C_METHOD;
  const activeMethod = getFructosamineA1cMethodMeta(fructosamineMethod);

  if (value <= 0) {
    throw new Error("Enter a value greater than zero.");
  }

  let metrics: A1cMetrics;

  switch (metric) {
    case "a1c":
      if (value < A1C_MIN || value > A1C_MAX) {
        throw new Error(`A1c should be between ${A1C_MIN} and ${A1C_MAX}%.`);
      }
      metrics = metricsFromA1c(value, fructosamineMethod);
      break;
    case "eag":
      if (value < EAG_MIN || value > EAG_MAX) {
        throw new Error(`eAG should be between ${EAG_MIN} and ${EAG_MAX} mg/dL.`);
      }
      metrics = metricsFromA1c(a1cFromEag(value), fructosamineMethod);
      break;
    case "gmi":
      if (value < A1C_MIN || value > A1C_MAX) {
        throw new Error(`GMI should be between ${A1C_MIN} and ${A1C_MAX}%.`);
      }
      metrics = metricsFromA1c(a1cFromEag(meanGlucoseFromGmi(value)), fructosamineMethod);
      break;
    case "fructosamine":
      if (value < FRUCTOSAMINE_MIN || value > FRUCTOSAMINE_MAX) {
        throw new Error(
          `Fructosamine should be between ${FRUCTOSAMINE_MIN} and ${FRUCTOSAMINE_MAX} µmol/L.`,
        );
      }
      metrics = metricsFromFructosamine(value, fructosamineMethod);
      break;
  }

  validateMetrics(metrics);

  return {
    value: metrics,
    interpretation: `Derived using ${activeMethod.citation} for fructosamine ↔ A1c conversion.`,
  };
}

export function formatA1cPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatGmiPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatFructosamine(value: number): string {
  return `${Math.round(value)} µmol/L`;
}

export function formatEagMgDl(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)} mg/dL`;
}
