/** Auto-generated from data/excel/CAH-2003.csv, CAH-2018.csv, and CAH-2018-Israel.csv — run npm run import:data */

export interface Cah2003ThresholdRow {
  bwMinG: number;
  bwMaxG: number;
  ageMinDays: number;
  ageMaxDays: number;
  normalMaxNmol: number;
  elevatedMaxNmol: number;
}

export interface Cah2018PercentileTier {
  percentile: number;
  cutoffNmol: number;
}

export interface Cah2018ThresholdRow {
  stratification: "bw_only" | "ga_only" | "bw_and_ga";
  bwMinG: number;
  bwMaxG: number;
  gaMinWeeks: number;
  gaMaxWeeks: number;
  percentiles: Cah2018PercentileTier[];
  rowLabel?: string;
}

export interface CahIsraelThresholdRow {
  bwMinG: number;
  bwMaxG: number;
  gaMinWeeks: number;
  gaMaxWeeks: number;
  matchesUnknownGa: boolean;
  repeatRequestCutoffNmol: number;
  firstSampleReferralCutoffNmol: number | null;
  repeatNormalRule: "reduction_gt_30" | "absolute_lt";
  repeatNormalAbsoluteNmol: number | null;
  reductionMinPct: number | null;
  rowLabel?: string;
}

export const cah2003Thresholds = [
  {
    "bwMinG": 0,
    "bwMaxG": 999,
    "ageMinDays": 0,
    "ageMaxDays": 19,
    "normalMaxNmol": 200,
    "elevatedMaxNmol": 300
  },
  {
    "bwMinG": 0,
    "bwMaxG": 999,
    "ageMinDays": 20,
    "ageMaxDays": 29,
    "normalMaxNmol": 100,
    "elevatedMaxNmol": 200
  },
  {
    "bwMinG": 0,
    "bwMaxG": 999,
    "ageMinDays": 30,
    "ageMaxDays": 59,
    "normalMaxNmol": 60,
    "elevatedMaxNmol": 150
  },
  {
    "bwMinG": 0,
    "bwMaxG": 999,
    "ageMinDays": 60,
    "ageMaxDays": 9999,
    "normalMaxNmol": 30,
    "elevatedMaxNmol": 90
  },
  {
    "bwMinG": 1000,
    "bwMaxG": 1499,
    "ageMinDays": 0,
    "ageMaxDays": 3,
    "normalMaxNmol": 150,
    "elevatedMaxNmol": 200
  },
  {
    "bwMinG": 1000,
    "bwMaxG": 1499,
    "ageMinDays": 4,
    "ageMaxDays": 13,
    "normalMaxNmol": 120,
    "elevatedMaxNmol": 200
  },
  {
    "bwMinG": 1000,
    "bwMaxG": 1499,
    "ageMinDays": 14,
    "ageMaxDays": 19,
    "normalMaxNmol": 80,
    "elevatedMaxNmol": 200
  },
  {
    "bwMinG": 1000,
    "bwMaxG": 1499,
    "ageMinDays": 20,
    "ageMaxDays": 29,
    "normalMaxNmol": 60,
    "elevatedMaxNmol": 200
  },
  {
    "bwMinG": 1000,
    "bwMaxG": 1499,
    "ageMinDays": 30,
    "ageMaxDays": 59,
    "normalMaxNmol": 40,
    "elevatedMaxNmol": 125
  },
  {
    "bwMinG": 1000,
    "bwMaxG": 1499,
    "ageMinDays": 60,
    "ageMaxDays": 9999,
    "normalMaxNmol": 30,
    "elevatedMaxNmol": 90
  },
  {
    "bwMinG": 1500,
    "bwMaxG": 1999,
    "ageMinDays": 0,
    "ageMaxDays": 3,
    "normalMaxNmol": 80,
    "elevatedMaxNmol": 150
  },
  {
    "bwMinG": 1500,
    "bwMaxG": 1999,
    "ageMinDays": 4,
    "ageMaxDays": 13,
    "normalMaxNmol": 60,
    "elevatedMaxNmol": 150
  },
  {
    "bwMinG": 1500,
    "bwMaxG": 1999,
    "ageMinDays": 14,
    "ageMaxDays": 29,
    "normalMaxNmol": 40,
    "elevatedMaxNmol": 150
  },
  {
    "bwMinG": 1500,
    "bwMaxG": 1999,
    "ageMinDays": 30,
    "ageMaxDays": 9999,
    "normalMaxNmol": 30,
    "elevatedMaxNmol": 90
  },
  {
    "bwMinG": 2000,
    "bwMaxG": 2499,
    "ageMinDays": 0,
    "ageMaxDays": 1,
    "normalMaxNmol": 60,
    "elevatedMaxNmol": 60
  },
  {
    "bwMinG": 2000,
    "bwMaxG": 2499,
    "ageMinDays": 2,
    "ageMaxDays": 3,
    "normalMaxNmol": 50,
    "elevatedMaxNmol": 125
  },
  {
    "bwMinG": 2000,
    "bwMaxG": 2499,
    "ageMinDays": 4,
    "ageMaxDays": 13,
    "normalMaxNmol": 40,
    "elevatedMaxNmol": 125
  },
  {
    "bwMinG": 2000,
    "bwMaxG": 2499,
    "ageMinDays": 14,
    "ageMaxDays": 9999,
    "normalMaxNmol": 30,
    "elevatedMaxNmol": 90
  },
  {
    "bwMinG": 2500,
    "bwMaxG": 99999,
    "ageMinDays": 0,
    "ageMaxDays": 1,
    "normalMaxNmol": 60,
    "elevatedMaxNmol": 60
  },
  {
    "bwMinG": 2500,
    "bwMaxG": 99999,
    "ageMinDays": 2,
    "ageMaxDays": 3,
    "normalMaxNmol": 40,
    "elevatedMaxNmol": 90
  },
  {
    "bwMinG": 2500,
    "bwMaxG": 99999,
    "ageMinDays": 4,
    "ageMaxDays": 9999,
    "normalMaxNmol": 30,
    "elevatedMaxNmol": 90
  }
] as Cah2003ThresholdRow[];

export const cah2018Thresholds = [
  {
    "stratification": "bw_only",
    "bwMinG": 0,
    "bwMaxG": 1499,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 288
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 320
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 357
      }
    ],
    "rowLabel": "<1500 g"
  },
  {
    "stratification": "bw_only",
    "bwMinG": 1500,
    "bwMaxG": 1999,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 126
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 151
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 178
      }
    ],
    "rowLabel": "1500–1999 g"
  },
  {
    "stratification": "bw_only",
    "bwMinG": 2000,
    "bwMaxG": 2499,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 85
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 104
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 123
      }
    ],
    "rowLabel": "2000–2499 g"
  },
  {
    "stratification": "bw_only",
    "bwMinG": 2500,
    "bwMaxG": 2999,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 51
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 60
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 69
      }
    ],
    "rowLabel": "2500–2999 g"
  },
  {
    "stratification": "bw_only",
    "bwMinG": 3000,
    "bwMaxG": 3499,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 32
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 39
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 45
      }
    ],
    "rowLabel": "3000–3499 g"
  },
  {
    "stratification": "bw_only",
    "bwMinG": 3500,
    "bwMaxG": 3999,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 26
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 33
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 41
      }
    ],
    "rowLabel": "3500–3999 g"
  },
  {
    "stratification": "bw_only",
    "bwMinG": 4000,
    "bwMaxG": 99999,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 25
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 30
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 36
      }
    ],
    "rowLabel": "≥4000 g"
  },
  {
    "stratification": "ga_only",
    "bwMinG": 0,
    "bwMaxG": 99999,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 29,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 233
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 290
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 306
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 316
      }
    ],
    "rowLabel": "≤29 wk"
  },
  {
    "stratification": "ga_only",
    "bwMinG": 0,
    "bwMaxG": 99999,
    "gaMinWeeks": 29,
    "gaMaxWeeks": 32,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 106
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 180
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 189
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 195
      }
    ],
    "rowLabel": "29–≤32 wk"
  },
  {
    "stratification": "ga_only",
    "bwMinG": 0,
    "bwMaxG": 99999,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 31,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 195
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 281
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 290
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 294
      }
    ],
    "rowLabel": "<32 wk"
  },
  {
    "stratification": "ga_only",
    "bwMinG": 0,
    "bwMaxG": 99999,
    "gaMinWeeks": 32,
    "gaMaxWeeks": 36,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 59
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 96
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 103
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 120
      }
    ],
    "rowLabel": "32–≤36 wk"
  },
  {
    "stratification": "ga_only",
    "bwMinG": 0,
    "bwMaxG": 99999,
    "gaMinWeeks": 36,
    "gaMaxWeeks": 36,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 40
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 72
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 96
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 108
      },
      {
        "percentile": 99.99,
        "cutoffNmol": 125
      }
    ],
    "rowLabel": "36 wk"
  },
  {
    "stratification": "ga_only",
    "bwMinG": 0,
    "bwMaxG": 99999,
    "gaMinWeeks": 37,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 19
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 36
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 46
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 52
      },
      {
        "percentile": 99.99,
        "cutoffNmol": 63
      }
    ],
    "rowLabel": ">36 wk"
  },
  {
    "stratification": "ga_only",
    "bwMinG": 0,
    "bwMaxG": 99999,
    "gaMinWeeks": 37,
    "gaMaxWeeks": 37,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 28
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 46
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 61
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 64
      },
      {
        "percentile": 99.99,
        "cutoffNmol": 81
      }
    ],
    "rowLabel": "37 wk"
  },
  {
    "stratification": "ga_only",
    "bwMinG": 0,
    "bwMaxG": 99999,
    "gaMinWeeks": 38,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 18
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 35
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 45
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 51
      },
      {
        "percentile": 99.99,
        "cutoffNmol": 59
      }
    ],
    "rowLabel": ">37 wk"
  },
  {
    "stratification": "bw_and_ga",
    "bwMinG": 0,
    "bwMaxG": 2500,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 31,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 205
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 283
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 292
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 307
      }
    ],
    "rowLabel": "≤2500 g and <32 wk"
  },
  {
    "stratification": "bw_and_ga",
    "bwMinG": 0,
    "bwMaxG": 2500,
    "gaMinWeeks": 32,
    "gaMaxWeeks": 36,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 105
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 123
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 147
      }
    ],
    "rowLabel": "≤2500 g and 32–≤36 wk"
  },
  {
    "stratification": "bw_and_ga",
    "bwMinG": 0,
    "bwMaxG": 2500,
    "gaMinWeeks": 37,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 62
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 70
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 85
      }
    ],
    "rowLabel": "≤2500 g and >36 wk"
  },
  {
    "stratification": "bw_and_ga",
    "bwMinG": 0,
    "bwMaxG": 2500,
    "gaMinWeeks": 36,
    "gaMaxWeeks": 36,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 40
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 72
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 89
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 101
      }
    ],
    "rowLabel": "≤2500 g and 36 wk"
  },
  {
    "stratification": "bw_and_ga",
    "bwMinG": 2501,
    "bwMaxG": 99999,
    "gaMinWeeks": 36,
    "gaMaxWeeks": 36,
    "percentiles": [
      {
        "percentile": 99,
        "cutoffNmol": 38
      },
      {
        "percentile": 99.9,
        "cutoffNmol": 70
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 90
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 109
      }
    ],
    "rowLabel": ">2500 g and 36 wk"
  },
  {
    "stratification": "bw_and_ga",
    "bwMinG": 2501,
    "bwMaxG": 99999,
    "gaMinWeeks": 37,
    "gaMaxWeeks": 37,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 48
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 59
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 65
      }
    ],
    "rowLabel": ">2500 g and 37 wk"
  },
  {
    "stratification": "bw_and_ga",
    "bwMinG": 2501,
    "bwMaxG": 99999,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 37,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 47
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 62
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 63
      },
      {
        "percentile": 99.99,
        "cutoffNmol": 71
      }
    ],
    "rowLabel": ">2500 g and ≤37 wk"
  },
  {
    "stratification": "bw_and_ga",
    "bwMinG": 2501,
    "bwMaxG": 99999,
    "gaMinWeeks": 38,
    "gaMaxWeeks": 999,
    "percentiles": [
      {
        "percentile": 99.9,
        "cutoffNmol": 25
      },
      {
        "percentile": 99.95,
        "cutoffNmol": 29
      },
      {
        "percentile": 99.97,
        "cutoffNmol": 34
      },
      {
        "percentile": 99.99,
        "cutoffNmol": 43
      }
    ],
    "rowLabel": ">2500 g and >37 wk"
  }
] as Cah2018ThresholdRow[];

export const cahIsraelThresholds = [
  {
    "bwMinG": 0,
    "bwMaxG": 2500,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 31,
    "matchesUnknownGa": false,
    "repeatRequestCutoffNmol": 180,
    "firstSampleReferralCutoffNmol": null,
    "repeatNormalRule": "reduction_gt_30",
    "repeatNormalAbsoluteNmol": null,
    "reductionMinPct": 30,
    "rowLabel": "≤2500 g and GA <32 wk"
  },
  {
    "bwMinG": 0,
    "bwMaxG": 2500,
    "gaMinWeeks": 32,
    "gaMaxWeeks": 36,
    "matchesUnknownGa": false,
    "repeatRequestCutoffNmol": 105,
    "firstSampleReferralCutoffNmol": null,
    "repeatNormalRule": "reduction_gt_30",
    "repeatNormalAbsoluteNmol": null,
    "reductionMinPct": 30,
    "rowLabel": "≤2500 g and GA 32–36 wk"
  },
  {
    "bwMinG": 0,
    "bwMaxG": 2500,
    "gaMinWeeks": 37,
    "gaMaxWeeks": 999,
    "matchesUnknownGa": true,
    "repeatRequestCutoffNmol": 85,
    "firstSampleReferralCutoffNmol": null,
    "repeatNormalRule": "reduction_gt_30",
    "repeatNormalAbsoluteNmol": null,
    "reductionMinPct": 30,
    "rowLabel": "≤2500 g and GA >36 or unknown"
  },
  {
    "bwMinG": 2501,
    "bwMaxG": 99999,
    "gaMinWeeks": 0,
    "gaMaxWeeks": 37,
    "matchesUnknownGa": false,
    "repeatRequestCutoffNmol": 70,
    "firstSampleReferralCutoffNmol": 90,
    "repeatNormalRule": "absolute_lt",
    "repeatNormalAbsoluteNmol": 70,
    "reductionMinPct": null,
    "rowLabel": ">2500 g and GA ≤37 wk"
  },
  {
    "bwMinG": 2501,
    "bwMaxG": 99999,
    "gaMinWeeks": 38,
    "gaMaxWeeks": 999,
    "matchesUnknownGa": true,
    "repeatRequestCutoffNmol": 35,
    "firstSampleReferralCutoffNmol": 90,
    "repeatNormalRule": "absolute_lt",
    "repeatNormalAbsoluteNmol": 35,
    "reductionMinPct": null,
    "rowLabel": ">2500 g and GA >37 or unknown"
  }
] as CahIsraelThresholdRow[];
