import type { RwtAgeCoefficientChart } from "../../core/calculators/rwt/calculateRwtHeight";

export const rwtCoefficients = {
  "male": {
    "original": [
      {
        "ageYears": 1,
        "coefficients": {
          "beta0": 1.632,
          "betaHeight": 0.966,
          "betaWeight": 0.199,
          "betaMph": 0.606,
          "betaBoneAge": -0.673
        }
      },
      {
        "ageYears": 1.25,
        "coefficients": {
          "beta0": -1.841,
          "betaHeight": 1.032,
          "betaWeight": 0.086,
          "betaMph": 0.58,
          "betaBoneAge": -0.417
        }
      },
      {
        "ageYears": 1.5,
        "coefficients": {
          "beta0": -4.892,
          "betaHeight": 1.086,
          "betaWeight": -0.016,
          "betaMph": 0.559,
          "betaBoneAge": -0.205
        }
      },
      {
        "ageYears": 1.75,
        "coefficients": {
          "beta0": -7.528,
          "betaHeight": 1.13,
          "betaWeight": -0.106,
          "betaMph": 0.54,
          "betaBoneAge": -0.033
        }
      },
      {
        "ageYears": 2,
        "coefficients": {
          "beta0": -9.764,
          "betaHeight": 1.163,
          "betaWeight": -0.186,
          "betaMph": 0.523,
          "betaBoneAge": 0.104
        }
      },
      {
        "ageYears": 2.25,
        "coefficients": {
          "beta0": -11.618,
          "betaHeight": 1.189,
          "betaWeight": -0.256,
          "betaMph": 0.509,
          "betaBoneAge": 0.211
        }
      },
      {
        "ageYears": 2.5,
        "coefficients": {
          "beta0": -13.114,
          "betaHeight": 1.207,
          "betaWeight": -0.316,
          "betaMph": 0.496,
          "betaBoneAge": 0.291
        }
      },
      {
        "ageYears": 2.75,
        "coefficients": {
          "beta0": -14.278,
          "betaHeight": 1.219,
          "betaWeight": -0.369,
          "betaMph": 0.485,
          "betaBoneAge": 0.349
        }
      },
      {
        "ageYears": 3,
        "coefficients": {
          "beta0": -15.139,
          "betaHeight": 1.227,
          "betaWeight": -0.413,
          "betaMph": 0.475,
          "betaBoneAge": 0.388
        }
      },
      {
        "ageYears": 3.25,
        "coefficients": {
          "beta0": -15.729,
          "betaHeight": 1.23,
          "betaWeight": -0.45,
          "betaMph": 0.466,
          "betaBoneAge": 0.41
        }
      },
      {
        "ageYears": 3.5,
        "coefficients": {
          "beta0": -16.081,
          "betaHeight": 1.229,
          "betaWeight": -0.481,
          "betaMph": 0.458,
          "betaBoneAge": 0.419
        }
      },
      {
        "ageYears": 3.75,
        "coefficients": {
          "beta0": -16.228,
          "betaHeight": 1.226,
          "betaWeight": -0.505,
          "betaMph": 0.451,
          "betaBoneAge": 0.417
        }
      },
      {
        "ageYears": 4,
        "coefficients": {
          "beta0": -16.201,
          "betaHeight": 1.221,
          "betaWeight": -0.523,
          "betaMph": 0.444,
          "betaBoneAge": 0.405
        }
      },
      {
        "ageYears": 4.25,
        "coefficients": {
          "beta0": -16.034,
          "betaHeight": 1.214,
          "betaWeight": -0.537,
          "betaMph": 0.437,
          "betaBoneAge": 0.387
        }
      },
      {
        "ageYears": 4.5,
        "coefficients": {
          "beta0": -15.758,
          "betaHeight": 1.206,
          "betaWeight": -0.546,
          "betaMph": 0.431,
          "betaBoneAge": 0.363
        }
      },
      {
        "ageYears": 4.75,
        "coefficients": {
          "beta0": -15.4,
          "betaHeight": 1.197,
          "betaWeight": -0.55,
          "betaMph": 0.424,
          "betaBoneAge": 0.335
        }
      },
      {
        "ageYears": 5,
        "coefficients": {
          "beta0": -14.99,
          "betaHeight": 1.188,
          "betaWeight": -0.551,
          "betaMph": 0.418,
          "betaBoneAge": 0.303
        }
      },
      {
        "ageYears": 5.25,
        "coefficients": {
          "beta0": -14.551,
          "betaHeight": 1.179,
          "betaWeight": -0.548,
          "betaMph": 0.412,
          "betaBoneAge": 0.269
        }
      },
      {
        "ageYears": 5.5,
        "coefficients": {
          "beta0": -14.106,
          "betaHeight": 1.169,
          "betaWeight": -0.543,
          "betaMph": 0.406,
          "betaBoneAge": 0.234
        }
      },
      {
        "ageYears": 5.75,
        "coefficients": {
          "beta0": -13.672,
          "betaHeight": 1.16,
          "betaWeight": -0.535,
          "betaMph": 0.4,
          "betaBoneAge": 0.198
        }
      },
      {
        "ageYears": 6,
        "coefficients": {
          "beta0": -13.267,
          "betaHeight": 1.152,
          "betaWeight": -0.524,
          "betaMph": 0.394,
          "betaBoneAge": 0.161
        }
      },
      {
        "ageYears": 6.25,
        "coefficients": {
          "beta0": -12.901,
          "betaHeight": 1.143,
          "betaWeight": -0.512,
          "betaMph": 0.389,
          "betaBoneAge": 0.123
        }
      },
      {
        "ageYears": 6.5,
        "coefficients": {
          "beta0": -12.583,
          "betaHeight": 1.135,
          "betaWeight": -0.499,
          "betaMph": 0.383,
          "betaBoneAge": 0.085
        }
      },
      {
        "ageYears": 6.75,
        "coefficients": {
          "beta0": -12.318,
          "betaHeight": 1.127,
          "betaWeight": -0.484,
          "betaMph": 0.378,
          "betaBoneAge": 0.046
        }
      },
      {
        "ageYears": 7,
        "coefficients": {
          "beta0": -12.107,
          "betaHeight": 1.12,
          "betaWeight": -0.468,
          "betaMph": 0.373,
          "betaBoneAge": 0.006
        }
      },
      {
        "ageYears": 7.25,
        "coefficients": {
          "beta0": -11.948,
          "betaHeight": 1.113,
          "betaWeight": -0.451,
          "betaMph": 0.369,
          "betaBoneAge": -0.034
        }
      },
      {
        "ageYears": 7.5,
        "coefficients": {
          "beta0": -11.834,
          "betaHeight": 1.106,
          "betaWeight": -0.434,
          "betaMph": 0.365,
          "betaBoneAge": -0.077
        }
      },
      {
        "ageYears": 7.75,
        "coefficients": {
          "beta0": -11.756,
          "betaHeight": 1.1,
          "betaWeight": -0.417,
          "betaMph": 0.361,
          "betaBoneAge": -0.121
        }
      },
      {
        "ageYears": 8,
        "coefficients": {
          "beta0": -11.701,
          "betaHeight": 1.093,
          "betaWeight": -0.4,
          "betaMph": 0.358,
          "betaBoneAge": -0.167
        }
      },
      {
        "ageYears": 8.25,
        "coefficients": {
          "beta0": -11.652,
          "betaHeight": 1.086,
          "betaWeight": -0.382,
          "betaMph": 0.356,
          "betaBoneAge": -0.217
        }
      },
      {
        "ageYears": 8.5,
        "coefficients": {
          "beta0": -11.592,
          "betaHeight": 1.079,
          "betaWeight": -0.365,
          "betaMph": 0.354,
          "betaBoneAge": -0.27
        }
      },
      {
        "ageYears": 8.75,
        "coefficients": {
          "beta0": -11.498,
          "betaHeight": 1.071,
          "betaWeight": -0.349,
          "betaMph": 0.353,
          "betaBoneAge": -0.327
        }
      },
      {
        "ageYears": 9,
        "coefficients": {
          "beta0": -11.349,
          "betaHeight": 1.063,
          "betaWeight": -0.333,
          "betaMph": 0.353,
          "betaBoneAge": -0.389
        }
      },
      {
        "ageYears": 9.25,
        "coefficients": {
          "beta0": -11.118,
          "betaHeight": 1.054,
          "betaWeight": -0.317,
          "betaMph": 0.353,
          "betaBoneAge": -0.455
        }
      },
      {
        "ageYears": 9.5,
        "coefficients": {
          "beta0": -10.779,
          "betaHeight": 1.044,
          "betaWeight": -0.303,
          "betaMph": 0.355,
          "betaBoneAge": -0.527
        }
      },
      {
        "ageYears": 9.75,
        "coefficients": {
          "beta0": -10.306,
          "betaHeight": 1.033,
          "betaWeight": -0.289,
          "betaMph": 0.357,
          "betaBoneAge": -0.605
        }
      },
      {
        "ageYears": 10,
        "coefficients": {
          "beta0": -9.671,
          "betaHeight": 1.021,
          "betaWeight": -0.276,
          "betaMph": 0.36,
          "betaBoneAge": -0.69
        }
      },
      {
        "ageYears": 10.25,
        "coefficients": {
          "beta0": -8.848,
          "betaHeight": 1.008,
          "betaWeight": -0.263,
          "betaMph": 0.363,
          "betaBoneAge": -0.781
        }
      },
      {
        "ageYears": 10.5,
        "coefficients": {
          "beta0": -7.812,
          "betaHeight": 0.993,
          "betaWeight": -0.252,
          "betaMph": 0.368,
          "betaBoneAge": -0.878
        }
      },
      {
        "ageYears": 10.75,
        "coefficients": {
          "beta0": -6.54,
          "betaHeight": 0.977,
          "betaWeight": -0.241,
          "betaMph": 0.373,
          "betaBoneAge": -0.983
        }
      },
      {
        "ageYears": 11,
        "coefficients": {
          "beta0": -5.01,
          "betaHeight": 0.96,
          "betaWeight": -0.231,
          "betaMph": 0.378,
          "betaBoneAge": -1.094
        }
      },
      {
        "ageYears": 11.25,
        "coefficients": {
          "beta0": -3.206,
          "betaHeight": 0.942,
          "betaWeight": -0.222,
          "betaMph": 0.384,
          "betaBoneAge": -1.211
        }
      },
      {
        "ageYears": 11.5,
        "coefficients": {
          "beta0": -1.113,
          "betaHeight": 0.923,
          "betaWeight": -0.213,
          "betaMph": 0.39,
          "betaBoneAge": -1.335
        }
      },
      {
        "ageYears": 11.75,
        "coefficients": {
          "beta0": 1.273,
          "betaHeight": 0.902,
          "betaWeight": -0.206,
          "betaMph": 0.397,
          "betaBoneAge": -1.464
        }
      },
      {
        "ageYears": 12,
        "coefficients": {
          "beta0": 3.958,
          "betaHeight": 0.881,
          "betaWeight": -0.198,
          "betaMph": 0.403,
          "betaBoneAge": -1.597
        }
      },
      {
        "ageYears": 12.25,
        "coefficients": {
          "beta0": 6.931,
          "betaHeight": 0.859,
          "betaWeight": -0.191,
          "betaMph": 0.409,
          "betaBoneAge": -1.735
        }
      },
      {
        "ageYears": 12.5,
        "coefficients": {
          "beta0": 10.181,
          "betaHeight": 0.837,
          "betaWeight": -0.184,
          "betaMph": 0.414,
          "betaBoneAge": -1.875
        }
      },
      {
        "ageYears": 12.75,
        "coefficients": {
          "beta0": 13.684,
          "betaHeight": 0.815,
          "betaWeight": -0.177,
          "betaMph": 0.418,
          "betaBoneAge": -2.015
        }
      },
      {
        "ageYears": 13,
        "coefficients": {
          "beta0": 17.405,
          "betaHeight": 0.794,
          "betaWeight": -0.17,
          "betaMph": 0.421,
          "betaBoneAge": -2.156
        }
      },
      {
        "ageYears": 13.25,
        "coefficients": {
          "beta0": 21.297,
          "betaHeight": 0.773,
          "betaWeight": -0.163,
          "betaMph": 0.422,
          "betaBoneAge": -2.294
        }
      },
      {
        "ageYears": 13.5,
        "coefficients": {
          "beta0": 25.304,
          "betaHeight": 0.755,
          "betaWeight": -0.155,
          "betaMph": 0.422,
          "betaBoneAge": -2.427
        }
      },
      {
        "ageYears": 13.75,
        "coefficients": {
          "beta0": 29.349,
          "betaHeight": 0.738,
          "betaWeight": -0.146,
          "betaMph": 0.418,
          "betaBoneAge": -2.553
        }
      },
      {
        "ageYears": 14,
        "coefficients": {
          "beta0": 33.345,
          "betaHeight": 0.724,
          "betaWeight": -0.136,
          "betaMph": 0.412,
          "betaBoneAge": -2.668
        }
      },
      {
        "ageYears": 14.25,
        "coefficients": {
          "beta0": 37.183,
          "betaHeight": 0.714,
          "betaWeight": -0.125,
          "betaMph": 0.401,
          "betaBoneAge": -2.771
        }
      },
      {
        "ageYears": 14.5,
        "coefficients": {
          "beta0": 40.738,
          "betaHeight": 0.709,
          "betaWeight": -0.112,
          "betaMph": 0.387,
          "betaBoneAge": -2.856
        }
      },
      {
        "ageYears": 14.75,
        "coefficients": {
          "beta0": 43.869,
          "betaHeight": 0.709,
          "betaWeight": -0.098,
          "betaMph": 0.367,
          "betaBoneAge": -2.922
        }
      },
      {
        "ageYears": 15,
        "coefficients": {
          "beta0": 46.403,
          "betaHeight": 0.717,
          "betaWeight": -0.081,
          "betaMph": 0.342,
          "betaBoneAge": -2.962
        }
      },
      {
        "ageYears": 15.25,
        "coefficients": {
          "beta0": 48.154,
          "betaHeight": 0.732,
          "betaWeight": -0.062,
          "betaMph": 0.31,
          "betaBoneAge": -2.973
        }
      },
      {
        "ageYears": 15.5,
        "coefficients": {
          "beta0": 48.898,
          "betaHeight": 0.756,
          "betaWeight": -0.04,
          "betaMph": 0.271,
          "betaBoneAge": -2.949
        }
      },
      {
        "ageYears": 15.75,
        "coefficients": {
          "beta0": 48.402,
          "betaHeight": 0.792,
          "betaWeight": -0.015,
          "betaMph": 0.223,
          "betaBoneAge": -2.885
        }
      },
      {
        "ageYears": 16,
        "coefficients": {
          "beta0": 46.391,
          "betaHeight": 0.839,
          "betaWeight": -0.014,
          "betaMph": 0.167,
          "betaBoneAge": -2.776
        }
      }
    ],
    "adjusted": [
      {
        "ageYears": 3,
        "coefficients": {
          "beta0": -27.234,
          "betaHeight": 1.26246,
          "betaWeight": -0.25019,
          "betaMph": 0.53461,
          "betaBoneAge": -0.65638
        }
      },
      {
        "ageYears": 3.5,
        "coefficients": {
          "beta0": -28.2574,
          "betaHeight": 1.23505,
          "betaWeight": -0.30869,
          "betaMph": 0.53982,
          "betaBoneAge": -0.70428
        }
      },
      {
        "ageYears": 4,
        "coefficients": {
          "beta0": -28.9167,
          "betaHeight": 1.21348,
          "betaWeight": -0.34595,
          "betaMph": 0.53855,
          "betaBoneAge": -0.76831
        }
      },
      {
        "ageYears": 4.5,
        "coefficients": {
          "beta0": -29.2444,
          "betaHeight": 1.19675,
          "betaWeight": -0.36472,
          "betaMph": 0.5318,
          "betaBoneAge": -0.73631
        }
      },
      {
        "ageYears": 5,
        "coefficients": {
          "beta0": -29.2727,
          "betaHeight": 1.18387,
          "betaWeight": -0.36721,
          "betaMph": 0.52055,
          "betaBoneAge": -0.78353
        }
      },
      {
        "ageYears": 5.5,
        "coefficients": {
          "beta0": -29.0343,
          "betaHeight": 1.17385,
          "betaWeight": -0.35645,
          "betaMph": 0.50581,
          "betaBoneAge": -0.80409
        }
      },
      {
        "ageYears": 6,
        "coefficients": {
          "beta0": -28.5616,
          "betaHeight": 1.16573,
          "betaWeight": -0.33493,
          "betaMph": 0.48857,
          "betaBoneAge": -0.82953
        }
      },
      {
        "ageYears": 6.5,
        "coefficients": {
          "beta0": -27.8955,
          "betaHeight": 1.15849,
          "betaWeight": -0.30526,
          "betaMph": 0.46982,
          "betaBoneAge": -0.86454
        }
      },
      {
        "ageYears": 7,
        "coefficients": {
          "beta0": -27.0179,
          "betaHeight": 1.15117,
          "betaWeight": -0.27008,
          "betaMph": 0.45056,
          "betaBoneAge": -0.91381
        }
      },
      {
        "ageYears": 7.5,
        "coefficients": {
          "beta0": -25.8717,
          "betaHeight": 1.14277,
          "betaWeight": -0.232,
          "betaMph": 0.43178,
          "betaBoneAge": -0.98203
        }
      },
      {
        "ageYears": 8,
        "coefficients": {
          "beta0": -24.4,
          "betaHeight": 1.13231,
          "betaWeight": -0.19364,
          "betaMph": 0.41449,
          "betaBoneAge": -1.07388
        }
      },
      {
        "ageYears": 8.5,
        "coefficients": {
          "beta0": -22.5461,
          "betaHeight": 1.1188,
          "betaWeight": -0.15762,
          "betaMph": 0.39967,
          "betaBoneAge": -1.19404
        }
      },
      {
        "ageYears": 9,
        "coefficients": {
          "beta0": -20.2529,
          "betaHeight": 1.10126,
          "betaWeight": -0.12657,
          "betaMph": 0.38832,
          "betaBoneAge": -1.34721
        }
      },
      {
        "ageYears": 9.5,
        "coefficients": {
          "beta0": -17.0286,
          "betaHeight": 1.07869,
          "betaWeight": -0.10311,
          "betaMph": 0.38143,
          "betaBoneAge": -1.53808
        }
      },
      {
        "ageYears": 10,
        "coefficients": {
          "beta0": -12.5118,
          "betaHeight": 1.05012,
          "betaWeight": -0.08985,
          "betaMph": 0.38001,
          "betaBoneAge": -1.77132
        }
      },
      {
        "ageYears": 10.5,
        "coefficients": {
          "beta0": -6.8414,
          "betaHeight": 1.01698,
          "betaWeight": -0.08062,
          "betaMph": 0.37987,
          "betaBoneAge": -2.04178
        }
      },
      {
        "ageYears": 11,
        "coefficients": {
          "beta0": -0.1564,
          "betaHeight": 0.98228,
          "betaWeight": -0.06811,
          "betaMph": 0.37618,
          "betaBoneAge": -2.32959
        }
      },
      {
        "ageYears": 11.5,
        "coefficients": {
          "beta0": 7.4041,
          "betaHeight": 0.94744,
          "betaWeight": -0.05323,
          "betaMph": 0.36898,
          "betaBoneAge": -2.61742
        }
      },
      {
        "ageYears": 12,
        "coefficients": {
          "beta0": 15.7014,
          "betaHeight": 0.91384,
          "betaWeight": -0.03687,
          "betaMph": 0.35828,
          "betaBoneAge": -2.88793
        }
      },
      {
        "ageYears": 12.5,
        "coefficients": {
          "beta0": 24.0267,
          "betaHeight": 0.88289,
          "betaWeight": 0.01995,
          "betaMph": 0.34412,
          "betaBoneAge": -3.12378
        }
      },
      {
        "ageYears": 13,
        "coefficients": {
          "beta0": 31.5226,
          "betaHeight": 0.85598,
          "betaWeight": -0.00337,
          "betaMph": 0.32651,
          "betaBoneAge": -3.30763
        }
      },
      {
        "ageYears": 13.5,
        "coefficients": {
          "beta0": 37.8261,
          "betaHeight": 0.83452,
          "betaWeight": 0.01195,
          "betaMph": 0.3049,
          "betaBoneAge": -3.42213
        }
      },
      {
        "ageYears": 14,
        "coefficients": {
          "beta0": 42.5748,
          "betaHeight": 0.81989,
          "betaWeight": 0.02512,
          "betaMph": 0.28108,
          "betaBoneAge": -3.49946
        }
      },
      {
        "ageYears": 14.5,
        "coefficients": {
          "beta0": 45.4058,
          "betaHeight": 0.81349,
          "betaWeight": 0.03521,
          "betaMph": 0.25333,
          "betaBoneAge": -3.73776
        }
      },
      {
        "ageYears": 15,
        "coefficients": {
          "beta0": 45.9566,
          "betaHeight": 0.81674,
          "betaWeight": 0.04133,
          "betaMph": 0.2222,
          "betaBoneAge": -3.1762
        }
      },
      {
        "ageYears": 15.5,
        "coefficients": {
          "beta0": 43.744,
          "betaHeight": 0.83101,
          "betaWeight": 0.04257,
          "betaMph": 0.18777,
          "betaBoneAge": -2.83994
        }
      },
      {
        "ageYears": 16,
        "coefficients": {
          "beta0": 37.88,
          "betaHeight": 0.85772,
          "betaWeight": 0.03802,
          "betaMph": 0.15006,
          "betaBoneAge": -2.34764
        }
      },
      {
        "ageYears": 16.5,
        "coefficients": {
          "beta0": 27.3943,
          "betaHeight": 0.89825,
          "betaWeight": 0.02677,
          "betaMph": 0.10908,
          "betaBoneAge": -1.68196
        }
      },
      {
        "ageYears": 17,
        "coefficients": {
          "beta0": 11.3167,
          "betaHeight": 0.95402,
          "betaWeight": 0.00791,
          "betaMph": 0.06487,
          "betaBoneAge": -0.82556
        }
      },
      {
        "ageYears": 17.5,
        "coefficients": {
          "beta0": -11.3232,
          "betaHeight": 1.0264,
          "betaWeight": -0.01946,
          "betaMph": 0.01745,
          "betaBoneAge": 0.23891
        }
      }
    ]
  },
  "female": {
    "original": [
      {
        "ageYears": 1,
        "coefficients": {
          "beta0": 21.729,
          "betaHeight": 1.087,
          "betaWeight": -0.271,
          "betaMph": 0.386,
          "betaBoneAge": 0.434
        }
      },
      {
        "ageYears": 1.25,
        "coefficients": {
          "beta0": 20.684,
          "betaHeight": 1.112,
          "betaWeight": -0.369,
          "betaMph": 0.367,
          "betaBoneAge": 0.094
        }
      },
      {
        "ageYears": 1.5,
        "coefficients": {
          "beta0": 19.957,
          "betaHeight": 1.134,
          "betaWeight": -0.455,
          "betaMph": 0.349,
          "betaBoneAge": -0.172
        }
      },
      {
        "ageYears": 1.75,
        "coefficients": {
          "beta0": 19.463,
          "betaHeight": 1.153,
          "betaWeight": -0.53,
          "betaMph": 0.332,
          "betaBoneAge": -0.374
        }
      },
      {
        "ageYears": 2,
        "coefficients": {
          "beta0": 19.131,
          "betaHeight": 1.17,
          "betaWeight": -0.594,
          "betaMph": 0.316,
          "betaBoneAge": -0.523
        }
      },
      {
        "ageYears": 2.25,
        "coefficients": {
          "beta0": 18.908,
          "betaHeight": 1.183,
          "betaWeight": -0.648,
          "betaMph": 0.301,
          "betaBoneAge": -0.623
        }
      },
      {
        "ageYears": 2.5,
        "coefficients": {
          "beta0": 18.74,
          "betaHeight": 1.192,
          "betaWeight": -0.69,
          "betaMph": 0.287,
          "betaBoneAge": -0.69
        }
      },
      {
        "ageYears": 2.75,
        "coefficients": {
          "beta0": 18.604,
          "betaHeight": 1.204,
          "betaWeight": -0.729,
          "betaMph": 0.274,
          "betaBoneAge": -0.725
        }
      },
      {
        "ageYears": 3,
        "coefficients": {
          "beta0": 18.474,
          "betaHeight": 1.21,
          "betaWeight": -0.757,
          "betaMph": 0.262,
          "betaBoneAge": -0.736
        }
      },
      {
        "ageYears": 3.25,
        "coefficients": {
          "beta0": 18.337,
          "betaHeight": 1.215,
          "betaWeight": -0.777,
          "betaMph": 0.251,
          "betaBoneAge": -0.729
        }
      },
      {
        "ageYears": 3.5,
        "coefficients": {
          "beta0": 18.187,
          "betaHeight": 1.217,
          "betaWeight": -0.791,
          "betaMph": 0.241,
          "betaBoneAge": -0.711
        }
      },
      {
        "ageYears": 3.75,
        "coefficients": {
          "beta0": 18.024,
          "betaHeight": 1.217,
          "betaWeight": -0.798,
          "betaMph": 0.232,
          "betaBoneAge": -0.684
        }
      },
      {
        "ageYears": 4,
        "coefficients": {
          "beta0": 17.855,
          "betaHeight": 1.215,
          "betaWeight": -0.8,
          "betaMph": 0.224,
          "betaBoneAge": -0.655
        }
      },
      {
        "ageYears": 4.25,
        "coefficients": {
          "beta0": 17.691,
          "betaHeight": 1.212,
          "betaWeight": -0.797,
          "betaMph": 0.217,
          "betaBoneAge": -0.626
        }
      },
      {
        "ageYears": 4.5,
        "coefficients": {
          "beta0": 17.548,
          "betaHeight": 1.206,
          "betaWeight": -0.789,
          "betaMph": 0.21,
          "betaBoneAge": -0.6
        }
      },
      {
        "ageYears": 4.75,
        "coefficients": {
          "beta0": 17.444,
          "betaHeight": 1.199,
          "betaWeight": -0.777,
          "betaMph": 0.205,
          "betaBoneAge": -0.582
        }
      },
      {
        "ageYears": 5,
        "coefficients": {
          "beta0": 17.398,
          "betaHeight": 1.19,
          "betaWeight": -0.761,
          "betaMph": 0.2,
          "betaBoneAge": -0.571
        }
      },
      {
        "ageYears": 5.25,
        "coefficients": {
          "beta0": 17.431,
          "betaHeight": 1.18,
          "betaWeight": -0.742,
          "betaMph": 0.197,
          "betaBoneAge": -0.572
        }
      },
      {
        "ageYears": 5.5,
        "coefficients": {
          "beta0": 17.567,
          "betaHeight": 1.168,
          "betaWeight": -0.721,
          "betaMph": 0.193,
          "betaBoneAge": -0.584
        }
      },
      {
        "ageYears": 5.75,
        "coefficients": {
          "beta0": 17.826,
          "betaHeight": 1.155,
          "betaWeight": -0.697,
          "betaMph": 0.191,
          "betaBoneAge": -0.609
        }
      },
      {
        "ageYears": 6,
        "coefficients": {
          "beta0": 18.229,
          "betaHeight": 1.14,
          "betaWeight": -0.671,
          "betaMph": 0.19,
          "betaBoneAge": -0.647
        }
      },
      {
        "ageYears": 6.25,
        "coefficients": {
          "beta0": 18.796,
          "betaHeight": 1.124,
          "betaWeight": -0.644,
          "betaMph": 0.189,
          "betaBoneAge": -0.7
        }
      },
      {
        "ageYears": 6.5,
        "coefficients": {
          "beta0": 19.544,
          "betaHeight": 1.107,
          "betaWeight": -0.616,
          "betaMph": 0.188,
          "betaBoneAge": -0.766
        }
      },
      {
        "ageYears": 6.75,
        "coefficients": {
          "beta0": 20.489,
          "betaHeight": 1.089,
          "betaWeight": -0.587,
          "betaMph": 0.189,
          "betaBoneAge": -0.845
        }
      },
      {
        "ageYears": 7,
        "coefficients": {
          "beta0": 21.642,
          "betaHeight": 1.069,
          "betaWeight": -0.557,
          "betaMph": 0.189,
          "betaBoneAge": -0.938
        }
      },
      {
        "ageYears": 7.25,
        "coefficients": {
          "beta0": 23.017,
          "betaHeight": 1.049,
          "betaWeight": -0.527,
          "betaMph": 0.191,
          "betaBoneAge": -1.043
        }
      },
      {
        "ageYears": 7.5,
        "coefficients": {
          "beta0": 24.602,
          "betaHeight": 1.028,
          "betaWeight": -0.498,
          "betaMph": 0.192,
          "betaBoneAge": -1.158
        }
      },
      {
        "ageYears": 7.75,
        "coefficients": {
          "beta0": 26.416,
          "betaHeight": 1.006,
          "betaWeight": -0.468,
          "betaMph": 0.194,
          "betaBoneAge": -1.284
        }
      },
      {
        "ageYears": 8,
        "coefficients": {
          "beta0": 28.448,
          "betaHeight": 0.983,
          "betaWeight": -0.439,
          "betaMph": 0.196,
          "betaBoneAge": -1.418
        }
      },
      {
        "ageYears": 8.25,
        "coefficients": {
          "beta0": 30.69,
          "betaHeight": 0.96,
          "betaWeight": -0.411,
          "betaMph": 0.199,
          "betaBoneAge": -1.558
        }
      },
      {
        "ageYears": 8.5,
        "coefficients": {
          "beta0": 33.129,
          "betaHeight": 0.937,
          "betaWeight": -0.384,
          "betaMph": 0.202,
          "betaBoneAge": -1.704
        }
      },
      {
        "ageYears": 8.75,
        "coefficients": {
          "beta0": 35.747,
          "betaHeight": 0.914,
          "betaWeight": -0.359,
          "betaMph": 0.204,
          "betaBoneAge": -1.853
        }
      },
      {
        "ageYears": 9,
        "coefficients": {
          "beta0": 38.52,
          "betaHeight": 0.891,
          "betaWeight": -0.334,
          "betaMph": 0.207,
          "betaBoneAge": -2.003
        }
      },
      {
        "ageYears": 9.25,
        "coefficients": {
          "beta0": 41.421,
          "betaHeight": 0.868,
          "betaWeight": -0.311,
          "betaMph": 0.21,
          "betaBoneAge": -2.154
        }
      },
      {
        "ageYears": 9.5,
        "coefficients": {
          "beta0": 44.415,
          "betaHeight": 0.845,
          "betaWeight": -0.289,
          "betaMph": 0.212,
          "betaBoneAge": -2.301
        }
      },
      {
        "ageYears": 9.75,
        "coefficients": {
          "beta0": 47.464,
          "betaHeight": 0.824,
          "betaWeight": -0.269,
          "betaMph": 0.214,
          "betaBoneAge": -2.444
        }
      },
      {
        "ageYears": 10,
        "coefficients": {
          "beta0": 50.525,
          "betaHeight": 0.803,
          "betaWeight": -0.25,
          "betaMph": 0.216,
          "betaBoneAge": -2.581
        }
      },
      {
        "ageYears": 10.25,
        "coefficients": {
          "beta0": 53.548,
          "betaHeight": 0.783,
          "betaWeight": -0.233,
          "betaMph": 0.217,
          "betaBoneAge": -2.71
        }
      },
      {
        "ageYears": 10.5,
        "coefficients": {
          "beta0": 56.481,
          "betaHeight": 0.766,
          "betaWeight": -0.217,
          "betaMph": 0.217,
          "betaBoneAge": -2.829
        }
      },
      {
        "ageYears": 10.75,
        "coefficients": {
          "beta0": 59.267,
          "betaHeight": 0.749,
          "betaWeight": -0.203,
          "betaMph": 0.217,
          "betaBoneAge": -2.936
        }
      },
      {
        "ageYears": 11,
        "coefficients": {
          "beta0": 61.841,
          "betaHeight": 0.736,
          "betaWeight": -0.19,
          "betaMph": 0.216,
          "betaBoneAge": -3.029
        }
      },
      {
        "ageYears": 11.25,
        "coefficients": {
          "beta0": 64.136,
          "betaHeight": 0.724,
          "betaWeight": -0.179,
          "betaMph": 0.214,
          "betaBoneAge": -3.108
        }
      },
      {
        "ageYears": 11.5,
        "coefficients": {
          "beta0": 66.093,
          "betaHeight": 0.716,
          "betaWeight": -0.169,
          "betaMph": 0.211,
          "betaBoneAge": -3.171
        }
      },
      {
        "ageYears": 11.75,
        "coefficients": {
          "beta0": 67.627,
          "betaHeight": 0.711,
          "betaWeight": -0.159,
          "betaMph": 0.206,
          "betaBoneAge": -3.217
        }
      },
      {
        "ageYears": 12,
        "coefficients": {
          "beta0": 68.67,
          "betaHeight": 0.71,
          "betaWeight": -0.151,
          "betaMph": 0.201,
          "betaBoneAge": -3.245
        }
      },
      {
        "ageYears": 12.25,
        "coefficients": {
          "beta0": 69.14,
          "betaHeight": 0.713,
          "betaWeight": -0.143,
          "betaMph": 0.193,
          "betaBoneAge": -3.254
        }
      },
      {
        "ageYears": 12.5,
        "coefficients": {
          "beta0": 68.966,
          "betaHeight": 0.72,
          "betaWeight": -0.136,
          "betaMph": 0.184,
          "betaBoneAge": -3.244
        }
      },
      {
        "ageYears": 12.75,
        "coefficients": {
          "beta0": 68.061,
          "betaHeight": 0.733,
          "betaWeight": -0.129,
          "betaMph": 0.173,
          "betaBoneAge": -3.214
        }
      },
      {
        "ageYears": 13,
        "coefficients": {
          "beta0": 66.339,
          "betaHeight": 0.752,
          "betaWeight": -0.121,
          "betaMph": 0.16,
          "betaBoneAge": -3.166
        }
      },
      {
        "ageYears": 13.25,
        "coefficients": {
          "beta0": 63.728,
          "betaHeight": 0.777,
          "betaWeight": -0.113,
          "betaMph": 0.144,
          "betaBoneAge": -3.1
        }
      },
      {
        "ageYears": 13.5,
        "coefficients": {
          "beta0": 60.15,
          "betaHeight": 0.81,
          "betaWeight": -0.105,
          "betaMph": 0.127,
          "betaBoneAge": -3.015
        }
      },
      {
        "ageYears": 13.75,
        "coefficients": {
          "beta0": 55.522,
          "betaHeight": 0.85,
          "betaWeight": -0.085,
          "betaMph": 0.106,
          "betaBoneAge": -2.915
        }
      },
      {
        "ageYears": 14,
        "coefficients": {
          "beta0": 49.781,
          "betaHeight": 0.898,
          "betaWeight": -0.083,
          "betaMph": 0.083,
          "betaBoneAge": -2.8
        }
      }
    ],
    "adjusted": [
      {
        "ageYears": 3,
        "coefficients": {
          "beta0": -23.9478,
          "betaHeight": 1.45753,
          "betaWeight": -1.14127,
          "betaMph": 0.39955,
          "betaBoneAge": -0.16198
        }
      },
      {
        "ageYears": 3.5,
        "coefficients": {
          "beta0": -20.3292,
          "betaHeight": 1.36486,
          "betaWeight": -1.11756,
          "betaMph": 0.40731,
          "betaBoneAge": -0.2478
        }
      },
      {
        "ageYears": 4,
        "coefficients": {
          "beta0": -17.4687,
          "betaHeight": 1.29673,
          "betaWeight": -1.07989,
          "betaMph": 0.4068,
          "betaBoneAge": -0.31738
        }
      },
      {
        "ageYears": 4.5,
        "coefficients": {
          "beta0": -15.2455,
          "betaHeight": 1.24936,
          "betaWeight": -1.03034,
          "betaMph": 0.39932,
          "betaBoneAge": -0.37813
        }
      },
      {
        "ageYears": 5,
        "coefficients": {
          "beta0": -13.5388,
          "betaHeight": 1.21884,
          "betaWeight": -0.97101,
          "betaMph": 0.3862,
          "betaBoneAge": -0.43747
        }
      },
      {
        "ageYears": 5.5,
        "coefficients": {
          "beta0": -12.2278,
          "betaHeight": 1.20167,
          "betaWeight": -0.90399,
          "betaMph": 0.36875,
          "betaBoneAge": -0.50281
        }
      },
      {
        "ageYears": 6,
        "coefficients": {
          "beta0": -11.1916,
          "betaHeight": 1.19378,
          "betaWeight": -0.83135,
          "betaMph": 0.34829,
          "betaBoneAge": -0.58157
        }
      },
      {
        "ageYears": 6.5,
        "coefficients": {
          "beta0": -10.5424,
          "betaHeight": 1.19145,
          "betaWeight": -0.75518,
          "betaMph": 0.32611,
          "betaBoneAge": -0.68116
        }
      },
      {
        "ageYears": 7,
        "coefficients": {
          "beta0": -10.067,
          "betaHeight": 1.19089,
          "betaWeight": -0.67757,
          "betaMph": 0.30355,
          "betaBoneAge": -0.80899
        }
      },
      {
        "ageYears": 7.5,
        "coefficients": {
          "beta0": -9.1559,
          "betaHeight": 1.18832,
          "betaWeight": -0.60062,
          "betaMph": 0.28191,
          "betaBoneAge": -0.97248
        }
      },
      {
        "ageYears": 8,
        "coefficients": {
          "beta0": -7.1992,
          "betaHeight": 1.17992,
          "betaWeight": -0.52639,
          "betaMph": 0.2625,
          "betaBoneAge": -1.17904
        }
      },
      {
        "ageYears": 8.5,
        "coefficients": {
          "beta0": -3.5889,
          "betaHeight": 1.16192,
          "betaWeight": -0.45698,
          "betaMph": 0.24665,
          "betaBoneAge": -1.43608
        }
      },
      {
        "ageYears": 9,
        "coefficients": {
          "beta0": 2.2858,
          "betaHeight": 1.1305,
          "betaWeight": -0.39448,
          "betaMph": 0.23366,
          "betaBoneAge": -1.75101
        }
      },
      {
        "ageYears": 9.5,
        "coefficients": {
          "beta0": 10.7978,
          "betaHeight": 1.08188,
          "betaWeight": -0.34097,
          "betaMph": 0.23084,
          "betaBoneAge": -2.13125
        }
      },
      {
        "ageYears": 10,
        "coefficients": {
          "beta0": 20.8509,
          "betaHeight": 1.01227,
          "betaWeight": -0.29853,
          "betaMph": 0.2361,
          "betaBoneAge": -2.58422
        }
      },
      {
        "ageYears": 10.5,
        "coefficients": {
          "beta0": 30.8503,
          "betaHeight": 0.94329,
          "betaWeight": -0.26275,
          "betaMph": 0.2361,
          "betaBoneAge": -2.96492
        }
      },
      {
        "ageYears": 11,
        "coefficients": {
          "beta0": 39.2013,
          "betaHeight": 0.89702,
          "betaWeight": -0.22799,
          "betaMph": 0.231,
          "betaBoneAge": -3.14271
        }
      },
      {
        "ageYears": 11.5,
        "coefficients": {
          "beta0": 44.3092,
          "betaHeight": 0.87033,
          "betaWeight": -0.19458,
          "betaMph": 0.2195,
          "betaBoneAge": -3.14657
        }
      },
      {
        "ageYears": 12,
        "coefficients": {
          "beta0": 44.5791,
          "betaHeight": 0.86007,
          "betaWeight": -0.16283,
          "betaMph": 0.20291,
          "betaBoneAge": -3.00544
        }
      },
      {
        "ageYears": 12.5,
        "coefficients": {
          "beta0": 41.0599,
          "betaHeight": 0.86311,
          "betaWeight": -0.13304,
          "betaMph": 0.18251,
          "betaBoneAge": -2.74831
        }
      },
      {
        "ageYears": 13,
        "coefficients": {
          "beta0": 36.0835,
          "betaHeight": 0.8763,
          "betaWeight": -0.10554,
          "betaMph": 0.15961,
          "betaBoneAge": -2.40411
        }
      },
      {
        "ageYears": 13.5,
        "coefficients": {
          "beta0": 29.8981,
          "betaHeight": 0.89652,
          "betaWeight": -0.08063,
          "betaMph": 0.13548,
          "betaBoneAge": -2.00183
        }
      },
      {
        "ageYears": 14,
        "coefficients": {
          "beta0": 23.0799,
          "betaHeight": 0.92063,
          "betaWeight": -0.05862,
          "betaMph": 0.11144,
          "betaBoneAge": -1.57041
        }
      },
      {
        "ageYears": 14.5,
        "coefficients": {
          "beta0": 15.7131,
          "betaHeight": 0.94548,
          "betaWeight": -0.03984,
          "betaMph": 0.08878,
          "betaBoneAge": -1.13882
        }
      },
      {
        "ageYears": 15,
        "coefficients": {
          "beta0": 8.2098,
          "betaHeight": 0.96794,
          "betaWeight": -0.02458,
          "betaMph": 0.06879,
          "betaBoneAge": -0.73603
        }
      },
      {
        "ageYears": 15.5,
        "coefficients": {
          "beta0": 1.6941,
          "betaHeight": 0.98488,
          "betaWeight": -0.01317,
          "betaMph": 0.05276,
          "betaBoneAge": -0.39099
        }
      },
      {
        "ageYears": 16,
        "coefficients": {
          "beta0": -2.4822,
          "betaHeight": 0.99315,
          "betaWeight": -0.00591,
          "betaMph": 0.04199,
          "betaBoneAge": -0.13266
        }
      },
      {
        "ageYears": 16.5,
        "coefficients": {
          "beta0": -3.648,
          "betaHeight": 0.98962,
          "betaWeight": -0.00312,
          "betaMph": 0.03778,
          "betaBoneAge": 0.00999
        }
      },
      {
        "ageYears": 17,
        "coefficients": {
          "beta0": -1.132,
          "betaHeight": 0.97115,
          "betaWeight": -0.00511,
          "betaMph": 0.04141,
          "betaBoneAge": 0.00801
        }
      },
      {
        "ageYears": 17.5,
        "coefficients": {
          "beta0": 5.7371,
          "betaHeight": 0.9346,
          "betaWeight": -0.01219,
          "betaMph": 0.05419,
          "betaBoneAge": -0.16758
        }
      }
    ]
  }
} as {
  male: { original: RwtAgeCoefficientChart[]; adjusted: RwtAgeCoefficientChart[] };
  female: { original: RwtAgeCoefficientChart[]; adjusted: RwtAgeCoefficientChart[] };
};
