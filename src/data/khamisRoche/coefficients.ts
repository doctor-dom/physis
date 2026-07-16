/**
 * Khamis-Roche coefficients (Pediatrics 1994 erratum, Tables 1 & 2).
 * Source: data/excel/KR method.pdf
 * Equation uses inches and pounds; calculator converts from cm/kg.
 */
import type { KhamisRocheAgeChart } from "../../core/calculators/khamisRoche/calculateKhamisRocheHeight";

export const khamisRocheCoefficients = {
  "male": [
    {
      "ageYears": 4,
      "coefficients": {
        "beta0": -10.2567,
        "betaHeightIn": 1.23812,
        "betaWeightLb": -0.087235,
        "betaMpsIn": 0.50286
      }
    },
    {
      "ageYears": 4.5,
      "coefficients": {
        "beta0": -10.719,
        "betaHeightIn": 1.15964,
        "betaWeightLb": -0.074454,
        "betaMpsIn": 0.52887
      }
    },
    {
      "ageYears": 5,
      "coefficients": {
        "beta0": -11.0213,
        "betaHeightIn": 1.10674,
        "betaWeightLb": -0.064778,
        "betaMpsIn": 0.53919
      }
    },
    {
      "ageYears": 5.5,
      "coefficients": {
        "beta0": -11.1556,
        "betaHeightIn": 1.0748,
        "betaWeightLb": -0.05776,
        "betaMpsIn": 0.53691
      }
    },
    {
      "ageYears": 6,
      "coefficients": {
        "beta0": -11.1138,
        "betaHeightIn": 1.05923,
        "betaWeightLb": -0.052947,
        "betaMpsIn": 0.52513
      }
    },
    {
      "ageYears": 6.5,
      "coefficients": {
        "beta0": -11.0221,
        "betaHeightIn": 1.05542,
        "betaWeightLb": -0.049892,
        "betaMpsIn": 0.50692
      }
    },
    {
      "ageYears": 7,
      "coefficients": {
        "beta0": -10.9984,
        "betaHeightIn": 1.05877,
        "betaWeightLb": -0.048144,
        "betaMpsIn": 0.48538
      }
    },
    {
      "ageYears": 7.5,
      "coefficients": {
        "beta0": -11.0214,
        "betaHeightIn": 1.06467,
        "betaWeightLb": -0.047256,
        "betaMpsIn": 0.46361
      }
    },
    {
      "ageYears": 8,
      "coefficients": {
        "beta0": -11.0696,
        "betaHeightIn": 1.06853,
        "betaWeightLb": -0.046778,
        "betaMpsIn": 0.44469
      }
    },
    {
      "ageYears": 8.5,
      "coefficients": {
        "beta0": -11.122,
        "betaHeightIn": 1.06572,
        "betaWeightLb": -0.046261,
        "betaMpsIn": 0.43171
      }
    },
    {
      "ageYears": 9,
      "coefficients": {
        "beta0": -11.1571,
        "betaHeightIn": 1.05166,
        "betaWeightLb": -0.045254,
        "betaMpsIn": 0.42776
      }
    },
    {
      "ageYears": 9.5,
      "coefficients": {
        "beta0": -11.1405,
        "betaHeightIn": 1.02174,
        "betaWeightLb": -0.043311,
        "betaMpsIn": 0.43593
      }
    },
    {
      "ageYears": 10,
      "coefficients": {
        "beta0": -11.038,
        "betaHeightIn": 0.97135,
        "betaWeightLb": -0.039981,
        "betaMpsIn": 0.45932
      }
    },
    {
      "ageYears": 10.5,
      "coefficients": {
        "beta0": -10.8286,
        "betaHeightIn": 0.89589,
        "betaWeightLb": -0.034814,
        "betaMpsIn": 0.50101
      }
    },
    {
      "ageYears": 11,
      "coefficients": {
        "beta0": -10.4917,
        "betaHeightIn": 0.81239,
        "betaWeightLb": -0.02905,
        "betaMpsIn": 0.54781
      }
    },
    {
      "ageYears": 11.5,
      "coefficients": {
        "beta0": -10.0065,
        "betaHeightIn": 0.74134,
        "betaWeightLb": -0.024167,
        "betaMpsIn": 0.58409
      }
    },
    {
      "ageYears": 12,
      "coefficients": {
        "beta0": -9.3522,
        "betaHeightIn": 0.68325,
        "betaWeightLb": -0.020076,
        "betaMpsIn": 0.60927
      }
    },
    {
      "ageYears": 12.5,
      "coefficients": {
        "beta0": -8.6055,
        "betaHeightIn": 0.63869,
        "betaWeightLb": -0.016681,
        "betaMpsIn": 0.62279
      }
    },
    {
      "ageYears": 13,
      "coefficients": {
        "beta0": -7.8632,
        "betaHeightIn": 0.60818,
        "betaWeightLb": -0.013895,
        "betaMpsIn": 0.62407
      }
    },
    {
      "ageYears": 13.5,
      "coefficients": {
        "beta0": -7.1348,
        "betaHeightIn": 0.59228,
        "betaWeightLb": -0.011624,
        "betaMpsIn": 0.61253
      }
    },
    {
      "ageYears": 14,
      "coefficients": {
        "beta0": -6.4299,
        "betaHeightIn": 0.59151,
        "betaWeightLb": -0.009776,
        "betaMpsIn": 0.58762
      }
    },
    {
      "ageYears": 14.5,
      "coefficients": {
        "beta0": -5.7578,
        "betaHeightIn": 0.60643,
        "betaWeightLb": -0.008261,
        "betaMpsIn": 0.54875
      }
    },
    {
      "ageYears": 15,
      "coefficients": {
        "beta0": -5.1282,
        "betaHeightIn": 0.63757,
        "betaWeightLb": -0.006988,
        "betaMpsIn": 0.49536
      }
    },
    {
      "ageYears": 15.5,
      "coefficients": {
        "beta0": -4.5092,
        "betaHeightIn": 0.68548,
        "betaWeightLb": -0.005863,
        "betaMpsIn": 0.42687
      }
    },
    {
      "ageYears": 16,
      "coefficients": {
        "beta0": -3.9292,
        "betaHeightIn": 0.75069,
        "betaWeightLb": -0.004795,
        "betaMpsIn": 0.34271
      }
    },
    {
      "ageYears": 16.5,
      "coefficients": {
        "beta0": -3.4873,
        "betaHeightIn": 0.83375,
        "betaWeightLb": -0.003695,
        "betaMpsIn": 0.24231
      }
    },
    {
      "ageYears": 17,
      "coefficients": {
        "beta0": -3.283,
        "betaHeightIn": 0.9352,
        "betaWeightLb": -0.00247,
        "betaMpsIn": 0.1251
      }
    },
    {
      "ageYears": 17.5,
      "coefficients": {
        "beta0": -3.4156,
        "betaHeightIn": 1.05558,
        "betaWeightLb": -0.001027,
        "betaMpsIn": -0.0095
      }
    }
  ],
  "female": [
    {
      "ageYears": 4,
      "coefficients": {
        "beta0": -8.1325,
        "betaHeightIn": 1.24768,
        "betaWeightLb": -0.19435,
        "betaMpsIn": 0.44774
      }
    },
    {
      "ageYears": 4.5,
      "coefficients": {
        "beta0": -6.47656,
        "betaHeightIn": 1.22177,
        "betaWeightLb": -0.18519,
        "betaMpsIn": 0.41381
      }
    },
    {
      "ageYears": 5,
      "coefficients": {
        "beta0": -5.13583,
        "betaHeightIn": 1.19932,
        "betaWeightLb": -0.1753,
        "betaMpsIn": 0.38467
      }
    },
    {
      "ageYears": 5.5,
      "coefficients": {
        "beta0": -4.13791,
        "betaHeightIn": 1.1788,
        "betaWeightLb": -0.16484,
        "betaMpsIn": 0.36039
      }
    },
    {
      "ageYears": 6,
      "coefficients": {
        "beta0": -3.51039,
        "betaHeightIn": 1.15866,
        "betaWeightLb": -0.154,
        "betaMpsIn": 0.34105
      }
    },
    {
      "ageYears": 6.5,
      "coefficients": {
        "beta0": -3.14322,
        "betaHeightIn": 1.13737,
        "betaWeightLb": -0.14294,
        "betaMpsIn": 0.32672
      }
    },
    {
      "ageYears": 7,
      "coefficients": {
        "beta0": -2.87645,
        "betaHeightIn": 1.11342,
        "betaWeightLb": -0.13184,
        "betaMpsIn": 0.31748
      }
    },
    {
      "ageYears": 7.5,
      "coefficients": {
        "beta0": -2.66291,
        "betaHeightIn": 1.08525,
        "betaWeightLb": -0.12086,
        "betaMpsIn": 0.3134
      }
    },
    {
      "ageYears": 8,
      "coefficients": {
        "beta0": -2.45559,
        "betaHeightIn": 1.05135,
        "betaWeightLb": -0.11019,
        "betaMpsIn": 0.31457
      }
    },
    {
      "ageYears": 8.5,
      "coefficients": {
        "beta0": -2.20728,
        "betaHeightIn": 1.01018,
        "betaWeightLb": -0.09999,
        "betaMpsIn": 0.32105
      }
    },
    {
      "ageYears": 9,
      "coefficients": {
        "beta0": -1.87098,
        "betaHeightIn": 0.9602,
        "betaWeightLb": -0.09044,
        "betaMpsIn": 0.33291
      }
    },
    {
      "ageYears": 9.5,
      "coefficients": {
        "beta0": -1.0633,
        "betaHeightIn": 0.89989,
        "betaWeightLb": -0.08171,
        "betaMpsIn": 0.35025
      }
    },
    {
      "ageYears": 10,
      "coefficients": {
        "beta0": 0.33468,
        "betaHeightIn": 0.82771,
        "betaWeightLb": -0.07397,
        "betaMpsIn": 0.37312
      }
    },
    {
      "ageYears": 10.5,
      "coefficients": {
        "beta0": 1.97366,
        "betaHeightIn": 0.74213,
        "betaWeightLb": -0.06739,
        "betaMpsIn": 0.40161
      }
    },
    {
      "ageYears": 11,
      "coefficients": {
        "beta0": 3.50436,
        "betaHeightIn": 0.67173,
        "betaWeightLb": -0.06136,
        "betaMpsIn": 0.42042
      }
    },
    {
      "ageYears": 11.5,
      "coefficients": {
        "beta0": 4.57747,
        "betaHeightIn": 0.6415,
        "betaWeightLb": -0.05518,
        "betaMpsIn": 0.41686
      }
    },
    {
      "ageYears": 12,
      "coefficients": {
        "beta0": 4.84365,
        "betaHeightIn": 0.64452,
        "betaWeightLb": -0.04894,
        "betaMpsIn": 0.3949
      }
    },
    {
      "ageYears": 12.5,
      "coefficients": {
        "beta0": 4.27869,
        "betaHeightIn": 0.67386,
        "betaWeightLb": -0.04272,
        "betaMpsIn": 0.3585
      }
    },
    {
      "ageYears": 13,
      "coefficients": {
        "beta0": 3.21417,
        "betaHeightIn": 0.7226,
        "betaWeightLb": -0.03661,
        "betaMpsIn": 0.31163
      }
    },
    {
      "ageYears": 13.5,
      "coefficients": {
        "beta0": 1.83456,
        "betaHeightIn": 0.78383,
        "betaWeightLb": -0.03067,
        "betaMpsIn": 0.25826
      }
    },
    {
      "ageYears": 14,
      "coefficients": {
        "beta0": 0.32425,
        "betaHeightIn": 0.85062,
        "betaWeightLb": -0.025,
        "betaMpsIn": 0.20235
      }
    },
    {
      "ageYears": 14.5,
      "coefficients": {
        "beta0": -1.13224,
        "betaHeightIn": 0.91605,
        "betaWeightLb": -0.01967,
        "betaMpsIn": 0.14787
      }
    },
    {
      "ageYears": 15,
      "coefficients": {
        "beta0": -2.35055,
        "betaHeightIn": 0.97319,
        "betaWeightLb": -0.01477,
        "betaMpsIn": 0.0988
      }
    },
    {
      "ageYears": 15.5,
      "coefficients": {
        "beta0": -3.10326,
        "betaHeightIn": 1.01514,
        "betaWeightLb": -0.01037,
        "betaMpsIn": 0.05909
      }
    },
    {
      "ageYears": 16,
      "coefficients": {
        "beta0": -3.17885,
        "betaHeightIn": 1.03496,
        "betaWeightLb": -0.00655,
        "betaMpsIn": 0.03272
      }
    },
    {
      "ageYears": 16.5,
      "coefficients": {
        "beta0": -2.41657,
        "betaHeightIn": 1.02573,
        "betaWeightLb": -0.0034,
        "betaMpsIn": 0.02364
      }
    },
    {
      "ageYears": 17,
      "coefficients": {
        "beta0": -0.65579,
        "betaHeightIn": 0.98054,
        "betaWeightLb": -0.001,
        "betaMpsIn": 0.03584
      }
    },
    {
      "ageYears": 17.5,
      "coefficients": {
        "beta0": 2.26429,
        "betaHeightIn": 0.89246,
        "betaWeightLb": 0.00057,
        "betaMpsIn": 0.07327
      }
    }
  ]
} as {
  male: KhamisRocheAgeChart[];
  female: KhamisRocheAgeChart[];
};

export const KHAMIS_ROCHE_AGE_MIN = 4;
export const KHAMIS_ROCHE_AGE_MAX = 17.5;
