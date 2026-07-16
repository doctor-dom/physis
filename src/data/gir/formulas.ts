import type { GirFormulaEntry } from "../../core/calculators/gir/calculateGir";

/** Auto-generated from data/calc/enteral-GIR.csv — run npm run import:data */
export const girFormulas = [
  {
    "id": "human-milk-fortifier",
    "label": "Human Milk (+ fortifier)",
    "choMgPerMl": {
      "20": 70,
      "22": 77,
      "24": 84,
      "27": 95,
      "30": 105
    },
    "refs": "[1]"
  },
  {
    "id": "similac-advance-360-total-care",
    "label": "Similac Advance / 360 Total Care",
    "choMgPerMl": {
      "20": 72,
      "22": 79,
      "24": 86,
      "27": 97,
      "30": 108
    },
    "refs": "[1]"
  },
  {
    "id": "enfamil-neuropro",
    "label": "Enfamil NeuroPro",
    "choMgPerMl": {
      "20": 74,
      "22": 81,
      "24": 89,
      "27": 100,
      "30": 111
    },
    "refs": "[1]"
  },
  {
    "id": "similac-sensitive",
    "label": "Similac Sensitive",
    "choMgPerMl": {
      "20": 72,
      "22": 79,
      "24": 86,
      "27": 97,
      "30": 108
    },
    "refs": "[1]"
  },
  {
    "id": "enfamil-gentlease",
    "label": "Enfamil Gentlease",
    "choMgPerMl": {
      "20": 75,
      "22": 83,
      "24": 90,
      "27": 101,
      "30": 113
    },
    "refs": "[1]"
  },
  {
    "id": "nutramigen",
    "label": "Nutramigen",
    "choMgPerMl": {
      "20": 75,
      "22": 83,
      "24": 90,
      "27": 101,
      "30": 113
    },
    "refs": "[1]"
  },
  {
    "id": "similac-alimentum",
    "label": "Similac Alimentum",
    "choMgPerMl": {
      "20": 69,
      "22": 76,
      "24": 83,
      "27": 93,
      "30": 104
    },
    "refs": "[1]"
  },
  {
    "id": "elecare-infant",
    "label": "EleCare (infant)",
    "choMgPerMl": {
      "20": 72,
      "22": 79,
      "24": 86,
      "27": 97,
      "30": 108
    },
    "refs": "[1]"
  },
  {
    "id": "neocate-infant",
    "label": "Neocate Infant",
    "choMgPerMl": {
      "20": 72,
      "22": 79,
      "24": 86,
      "27": 97,
      "30": 108
    },
    "refs": "[1]"
  }
] as GirFormulaEntry[];

export const GIR_KCAL_PER_OZ_OPTIONS = [20,22,24,27,30] as const;
