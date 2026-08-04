import { useMemo, useState } from "react";
import { calculateTw3BoneAge } from "@core/calculators/tw3/calculateTw3BoneAge";
import { getTw3SmsScores } from "../data/tw3/smsScores";
import { getTw3SmsToBoneAgeChart } from "../data/tw3/smsToBoneAge";
import { CalculatorShell } from "../components/FormFields";
import Tw3BoneAgeSection from "../components/Tw3BoneAgeSection";
import AdultHeightPredictionSection from "../components/AdultHeightPredictionSection";
import GrowthChartSection from "../components/GrowthChartSection";
import ShowWorkSection from "../components/ShowWorkSection";
import type { Tw3LandmarkId, Tw3MaturityRating } from "@core/calculators/tw3/types";
import type { Sex } from "@core/types";
import {
  getPredictionForMethod,
  type AdultHeightPredictions,
  type AphMode,
  type HeightPredictionMethod,
  type ParentalInputMode,
  type Tw3MenarchalStatus,
} from "../hooks/useAdultHeightPredictions";

type WorkflowStep = "tw3" | "prediction" | "chart" | "show-work";

export default function GrowthWorkflowPage() {
  const [step, setStep] = useState<WorkflowStep>("tw3");
  const [sex, setSex] = useState<Sex | null>(null);
  const [chronAge, setChronAge] = useState("");
  const [ratings, setRatings] = useState<
    Partial<Record<Tw3LandmarkId, Tw3MaturityRating>>
  >({});
  const [boneAgeYears, setBoneAgeYears] = useState("");
  const [boneAgeFromTw3, setBoneAgeFromTw3] = useState(false);
  const [aphMode, setAphMode] = useState<AphMode>("bone-age");

  const [fatherCm, setFatherCm] = useState("");
  const [motherCm, setMotherCm] = useState("");
  const [parentalInputMode, setParentalInputMode] =
    useState<ParentalInputMode>("individual");
  const [mphDirectCm, setMphDirectCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightIsStandingVertical, setHeightIsStandingVertical] = useState(true);
  const [menarchalStatus, setMenarchalStatus] = useState<Tw3MenarchalStatus | null>(
    null,
  );
  const [tw3ApplyMphAdjustment, setTw3ApplyMphAdjustment] = useState(false);

  const [selectedMethod, setSelectedMethod] =
    useState<HeightPredictionMethod | null>(null);
  const [chartPredictions, setChartPredictions] =
    useState<AdultHeightPredictions | null>(null);

  const tw3SmsScore = useMemo(() => {
    if (!boneAgeFromTw3 || !sex) return null;
    try {
      return calculateTw3BoneAge({
        sex,
        landmarkRatings: ratings,
        smsScores: getTw3SmsScores(sex),
        smsToBoneAgeChart: getTw3SmsToBoneAgeChart(sex),
      }).value.skeletalMaturityScore;
    } catch {
      return null;
    }
  }, [boneAgeFromTw3, sex, ratings]);

  function goToPrediction(opts: { boneAge?: number; mode: AphMode }) {
    setAphMode(opts.mode);
    if (opts.mode === "no-bone-age") {
      setBoneAgeFromTw3(false);
    } else if (opts.boneAge !== undefined) {
      setBoneAgeYears(opts.boneAge.toFixed(2));
      setBoneAgeFromTw3(true);
    } else {
      setBoneAgeFromTw3(false);
    }
    setSelectedMethod(null);
    setStep("prediction");
  }

  function goToChart(
    method: HeightPredictionMethod,
    predictions: AdultHeightPredictions,
  ) {
    setSelectedMethod(method);
    setChartPredictions(predictions);
    setStep("chart");
  }

  function applyShowWorkFix(issueId: string, value?: string) {
    if (issueId === "bone-age-mismatch" && value) {
      setBoneAgeYears(value);
      setBoneAgeFromTw3(true);
    }
  }

  const shellFormula =
    step === "tw3"
      ? "TW3 RUS -> SMS -> Bone Age -> Adult Height Prediction"
      : step === "prediction"
        ? aphMode === "no-bone-age"
          ? "Khamis-Roche: standing height + weight + MPS (no bone age)"
          : "TW3: height + CA + RUS bone age (menarche for girls 11–14 y)  |  RWT: MPS + supine length (+1.25 cm if standing)"
        : step === "show-work"
          ? "Calculation audit trail, coefficient lookup, and QC for TW3 SMS and PAH"
          : "CDC stature & weight chart with chronologic age, bone age shift, and MPH/MPS at end of growth";

  return (
    <CalculatorShell
      title="Bone Age & Predicted Adult Height"
      formula={shellFormula}
      formulaAction={
        step === "tw3" ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => goToPrediction({ mode: "bone-age" })}
              disabled={!sex}
              className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm whitespace-nowrap"
            >
              Input bone age directly
            </button>
            <button
              type="button"
              onClick={() => goToPrediction({ mode: "no-bone-age" })}
              disabled={!sex}
              className="rounded-lg border border-teal-200 bg-white px-3 py-1.5 text-xs font-medium text-teal-800 hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm whitespace-nowrap"
            >
              APH without bone age
            </button>
          </div>
        ) : undefined
      }
    >
      {step === "tw3" ? (
        <Tw3BoneAgeSection
          sex={sex}
          onSexChange={setSex}
          chronAgeYears={chronAge}
          onChronAgeChange={setChronAge}
          ratings={ratings}
          onRatingsChange={setRatings}
          onContinueToPrediction={(ba) =>
            goToPrediction({ boneAge: ba, mode: "bone-age" })
          }
        />
      ) : step === "prediction" && sex ? (
        <AdultHeightPredictionSection
          sex={sex}
          onSexChange={setSex}
          aphMode={aphMode}
          chronAgeYears={chronAge}
          onChronAgeChange={setChronAge}
          boneAgeYears={boneAgeYears}
          onBoneAgeChange={(v) => {
            setBoneAgeYears(v);
            setBoneAgeFromTw3(false);
          }}
          fatherCm={fatherCm}
          onFatherCmChange={setFatherCm}
          motherCm={motherCm}
          onMotherCmChange={setMotherCm}
          parentalInputMode={parentalInputMode}
          onParentalInputModeChange={setParentalInputMode}
          mphDirectCm={mphDirectCm}
          onMphDirectCmChange={setMphDirectCm}
          heightCm={heightCm}
          onHeightCmChange={setHeightCm}
          weightKg={weightKg}
          onWeightKgChange={setWeightKg}
          heightIsStandingVertical={heightIsStandingVertical}
          onHeightIsStandingVerticalChange={setHeightIsStandingVertical}
          onBackToTw3={() => setStep("tw3")}
          onContinueToChart={goToChart}
          boneAgeFromTw3={boneAgeFromTw3}
          tw3SmsScore={tw3SmsScore}
          menarchalStatus={menarchalStatus}
          onMenarchalStatusChange={setMenarchalStatus}
          tw3ApplyMphAdjustment={tw3ApplyMphAdjustment}
          onTw3ApplyMphAdjustmentChange={setTw3ApplyMphAdjustment}
        />
      ) : selectedMethod && chartPredictions && sex ? (
        step === "show-work" ? (
          <ShowWorkSection
            sex={sex}
            chronAgeYears={chronAge}
            boneAgeYears={boneAgeYears}
            boneAgeFromTw3={boneAgeFromTw3}
            fatherCm={fatherCm}
            motherCm={motherCm}
            parentalInputMode={parentalInputMode}
            mphDirectCm={mphDirectCm}
            heightCm={heightCm}
            weightKg={weightKg}
            heightIsStandingVertical={heightIsStandingVertical}
            menarchalStatus={menarchalStatus}
            tw3ApplyMphAdjustment={tw3ApplyMphAdjustment}
            method={selectedMethod}
            ratings={ratings}
            displayedPredictionCm={
              (() => {
                const p = getPredictionForMethod(chartPredictions, selectedMethod);
                return p && !("error" in p) ? p.value : null;
              })()
            }
            onBackToChart={() => setStep("chart")}
            onApplyFix={applyShowWorkFix}
          />
        ) : (
          <GrowthChartSection
            sex={sex}
            chronAgeYears={chronAge}
            boneAgeYears={boneAgeYears}
            tw3SmsScore={boneAgeFromTw3 ? tw3SmsScore : null}
            heightCm={heightCm}
            weightKg={weightKg}
            method={selectedMethod}
            predictions={chartPredictions}
            onBackToPrediction={() => setStep("prediction")}
            onShowWork={() => setStep("show-work")}
          />
        )
      ) : null}
    </CalculatorShell>
  );
}
