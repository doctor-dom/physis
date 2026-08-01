import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import CalciumAlbuminCorrectionPage from "./pages/CalciumAlbuminCorrectionPage";
import HyperglycemiaCorrectedSodiumPage from "./pages/HyperglycemiaCorrectedSodiumPage";
import SodiumBalanceReplacementPage from "./pages/SodiumBalanceReplacementPage";
import GirPage from "./pages/GirPage";
import BsaSteroidWeanPage from "./pages/BsaSteroidWeanPage";
import CahScreeningPage from "./pages/CahScreeningPage";
import PediatricBpPercentilesPage from "./pages/PediatricBpPercentilesPage";
import A1cConverterPage from "./pages/A1cConverterPage";
import InsulinMdiToIssPage from "./pages/InsulinMdiToIssPage";
import InsulinDilutedSlidingScalePage from "./pages/InsulinDilutedSlidingScalePage";
import GrowthWorkflowPage from "./pages/GrowthWorkflowPage";
import GrowthChartViewPage from "./pages/GrowthChartViewPage";
import MaintenanceIvfPage from "./pages/MaintenanceIvfPage";
import OtherCalculatorsPage from "./pages/OtherCalculatorsPage";
import DiabetesCalculatorsPage from "./pages/DiabetesCalculatorsPage";
import ElectrolytesCalculatorsPage from "./pages/ElectrolytesCalculatorsPage";
import GonadAuxologyCalculatorsPage from "./pages/GonadAuxologyCalculatorsPage";
import SplNewbornPage from "./pages/SplNewbornPage";
import SplChildPage from "./pages/SplChildPage";
import ClitoralDimensionPage from "./pages/ClitoralDimensionPage";
import RenalElectrolytePanelPage from "./pages/RenalElectrolytePanelPage";
import DisclaimerPage from "./pages/DisclaimerPage";

export default function App() {
  return (
    <Routes>
      <Route path="/growth/chart-view" element={<GrowthChartViewPage />} />
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculators" element={<OtherCalculatorsPage />} />
        <Route path="/calculators/electrolytes" element={<ElectrolytesCalculatorsPage />} />
        <Route path="/calculators/diabetes" element={<DiabetesCalculatorsPage />} />
        <Route path="/calculators/gonad-auxology" element={<GonadAuxologyCalculatorsPage />} />
        <Route path="/spl-newborn" element={<SplNewbornPage />} />
        <Route path="/spl-child" element={<SplChildPage />} />
        <Route path="/clitoral-dimension" element={<ClitoralDimensionPage />} />
        <Route path="/growth" element={<GrowthWorkflowPage />} />
        <Route path="/mph" element={<Navigate to="/growth" replace />} />
        <Route path="/tw3" element={<Navigate to="/growth" replace />} />
        <Route path="/rwt" element={<Navigate to="/growth" replace />} />
        <Route path="/renal-electrolytes" element={<RenalElectrolytePanelPage />} />
        <Route path="/trp" element={<Navigate to="/renal-electrolytes" replace />} />
        <Route path="/ccr" element={<Navigate to="/renal-electrolytes" replace />} />
        <Route path="/calcium-albumin" element={<CalciumAlbuminCorrectionPage />} />
        <Route path="/fwd" element={<Navigate to="/sodium-balance" replace />} />
        <Route path="/sodium-balance" element={<SodiumBalanceReplacementPage />} />
        <Route
          path="/hyperglycemia-sodium-correction"
          element={<HyperglycemiaCorrectedSodiumPage />}
        />
        <Route path="/gir" element={<GirPage />} />
        <Route path="/bsa-steroid" element={<BsaSteroidWeanPage />} />
        <Route path="/cah-screening" element={<CahScreeningPage />} />
        <Route path="/pediatric-bp" element={<PediatricBpPercentilesPage />} />
        <Route path="/a1c-converter" element={<A1cConverterPage />} />
        <Route path="/maintenance-ivf" element={<MaintenanceIvfPage />} />
        <Route path="/insulin-mdi-iss" element={<InsulinMdiToIssPage />} />
        <Route path="/insulin-diluted-iss" element={<InsulinDilutedSlidingScalePage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export const PRIMARY_WORKFLOW = {
  path: "/growth",
  title: "TW3-RUS ➡️ SMS ➡️ APH/PAH",
  description:
    "Utilize the Tanner-Whitehouse 3 Radius-Ulna-Short-bones (TW3-RUS) method to derive a skeletal maturity score (SMS). Then predict adult height with adjusted Roche-Wainer-Thissen (RWT), TW3-RUS, and Khamis-Roche methods.",
} as const;

export const OTHER_CLINICAL_CALCULATORS_PATH = "/calculators";
export const ELECTROLYTES_CALCULATORS_PATH = "/calculators/electrolytes";
export const DIABETES_CALCULATORS_PATH = "/calculators/diabetes";
export const GONAD_AUXOLOGY_CALCULATORS_PATH = "/calculators/gonad-auxology";

export const GONAD_AUXOLOGY_CALCULATORS = [
  {
    path: "/spl-newborn",
    title: "Stretched penile length (newborn)",
    description:
      "SPL vs gestational age using Turkish preterm/term nomogram (Halil et al.) with percentile plot.",
  },
  {
    path: "/spl-child",
    title: "Stretched penile length (child)",
    description:
      "SPL vs decimal age on Bulgarian and two US reference nomograms (Schonfeld and Feldman) with percentile plots.",
  },
  {
    path: "/clitoral-dimension",
    title: "Clitoral dimensions (neonate)",
    description:
      "Clitoral length and width vs gestational age (Alaei et al.) with percentile nomogram plots.",
  },
] as const;

export const ELECTROLYTE_CALCULATORS = [
  {
    path: "/sodium-balance",
    title: "Sodium balance and replacement",
    description:
      "Free water deficit and hypo/hypernatremia infusion guidance.",
  },
  {
    path: "/hyperglycemia-sodium-correction",
    title: "Hyperglycemia sodium correction",
    description:
      "Estimate corrected serum sodium during hyperglycemia to assess true sodium status.",
  },
  {
    path: "/renal-electrolytes",
    title: "Renal electrolyte indices",
    description:
      "Tubular Resorption of Phosphate (TRP), calcium clearance ratio (CCR), spot UCa/UCr, and transtubular potassium gradient (TTKG).",
  },
  {
    path: "/calcium-albumin",
    title: "Calcium correction for albumin",
    description:
      "Correct total serum calcium for hyper- or hypoalbuminemia.",
  },
] as const;

export const DIABETES_CALCULATORS = [
  {
    path: "/insulin-diluted-iss",
    title: "Diluted ISS generation",
    description:
      "Meal, snack, and correction sliding scales for diluted lispro with syringe draw-up guidance.",
  },
  {
    path: "/insulin-mdi-iss",
    title: "Insulin MDI → ISS",
    description:
      "Convert insulin ISF/ICR MDI regimen to sliding scales using fixed carbs.",
  },
  {
    path: "/a1c-converter",
    title: "A1c Converter",
    description:
      "Convert GMI, A1c, fructosamine, and estimated average glucose from one known value.",
  },
] as const;

type ClinicalCalculatorLink = {
  kind: "calculator";
  path: string;
  title: string;
  description: string;
};

type ClinicalCalculatorGroup = {
  kind: "group";
  path: string;
  title: string;
  description: string;
};

export const OTHER_CLINICAL_CALCULATOR_GROUPS: ClinicalCalculatorGroup[] = [
  {
    kind: "group",
    path: ELECTROLYTES_CALCULATORS_PATH,
    title: "Electrolytes",
    description: "Electrolyte-based clinical calculators.",
  },
  {
    kind: "group",
    path: DIABETES_CALCULATORS_PATH,
    title: "Diabetes",
    description: "Diabetes-related clinical tools and calculators.",
  },
  {
    kind: "group",
    path: GONAD_AUXOLOGY_CALCULATORS_PATH,
    title: "Gonad Auxology",
    description: "External genitalia measurement nomograms and percentiles.",
  },
];

export const OTHER_CLINICAL_CALCULATORS: ClinicalCalculatorLink[] = [
  {
    kind: "calculator",
    path: "/maintenance-ivf",
    title: "Maintenance IVF (Holliday-Segar)",
    description:
      "Pediatric maintenance intravenous fluid rate by weight using the Holliday-Segar method.",
  },
  {
    kind: "calculator",
    path: "/gir",
    title: "Glucose Infusion Rate (GIR)",
    description:
      "IV and enteral GIR with combined total; guidance for neonatal hypoglycemia and CHI.",
  },
  {
    kind: "calculator",
    path: "/bsa-steroid",
    title: "BSA & Steroid Wean",
    description:
      "Body Surface Area via Haycock, or Costeff if kg-only",
  },
  {
    kind: "calculator",
    path: "/pediatric-bp",
    title: "Pediatric Hypertensive BP Percentiles",
    description:
      "AAP 2017 BP percentile thresholds by age, sex, and height with HTN staging.",
  },
  {
    kind: "calculator",
    path: "/cah-screening",
    title: "CAH Screening",
    description:
      "17-OHP unit conversion and interpretation based on GA+BW using Olgemöller 2003 and Pode-Shakked 2018 algorithms.",
  },
];
