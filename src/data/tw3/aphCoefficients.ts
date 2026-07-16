import type {
  Tw3AgeBand,
  Tw3GirlAgeBand,
} from "../../core/calculators/tw3/calculateTw3PredictedHeight";

export const tw3AphCoefficients = {
  "male": [
    {
      "ageMinYears": 4,
      "ageMaxYears": 8,
      "betaHeight": 1.2,
      "betaChronAge": -7.3,
      "betaBoneAge": 0,
      "constant": 82,
      "residualSd": 4,
      "r": 0.84
    },
    {
      "ageMinYears": 8,
      "ageMaxYears": 8.5,
      "betaHeight": 1.22,
      "betaChronAge": -7.2,
      "betaBoneAge": -0.4,
      "constant": 82,
      "residualSd": 3.6,
      "r": 0.89
    },
    {
      "ageMinYears": 8.5,
      "ageMaxYears": 9,
      "betaHeight": 1.23,
      "betaChronAge": -7,
      "betaBoneAge": -0.7,
      "constant": 82,
      "residualSd": 3.6,
      "r": 0.89
    },
    {
      "ageMinYears": 9,
      "ageMaxYears": 9.5,
      "betaHeight": 1.22,
      "betaChronAge": -6.8,
      "betaBoneAge": -0.8,
      "constant": 82,
      "residualSd": 3.6,
      "r": 0.89
    },
    {
      "ageMinYears": 9.5,
      "ageMaxYears": 10,
      "betaHeight": 1.21,
      "betaChronAge": -6.5,
      "betaBoneAge": -0.8,
      "constant": 82,
      "residualSd": 3.6,
      "r": 0.89
    },
    {
      "ageMinYears": 10,
      "ageMaxYears": 10.5,
      "betaHeight": 1.2,
      "betaChronAge": -6.2,
      "betaBoneAge": -1,
      "constant": 83,
      "residualSd": 3.6,
      "r": 0.89
    },
    {
      "ageMinYears": 10.5,
      "ageMaxYears": 11,
      "betaHeight": 1.19,
      "betaChronAge": -5.9,
      "betaBoneAge": -1.2,
      "constant": 84,
      "residualSd": 3.6,
      "r": 0.89
    },
    {
      "ageMinYears": 11,
      "ageMaxYears": 11.5,
      "betaHeight": 1.16,
      "betaChronAge": -5.5,
      "betaBoneAge": -1.6,
      "constant": 89,
      "residualSd": 3.5,
      "r": 0.89
    },
    {
      "ageMinYears": 11.5,
      "ageMaxYears": 12,
      "betaHeight": 1.13,
      "betaChronAge": -5.1,
      "betaBoneAge": -2,
      "constant": 94,
      "residualSd": 3.5,
      "r": 0.89
    },
    {
      "ageMinYears": 12,
      "ageMaxYears": 12.5,
      "betaHeight": 1.08,
      "betaChronAge": -4.2,
      "betaBoneAge": -2.6,
      "constant": 98,
      "residualSd": 3.5,
      "r": 0.89
    },
    {
      "ageMinYears": 12.5,
      "ageMaxYears": 13,
      "betaHeight": 1.03,
      "betaChronAge": -3.4,
      "betaBoneAge": -3.2,
      "constant": 103,
      "residualSd": 3.5,
      "r": 0.88
    },
    {
      "ageMinYears": 13,
      "ageMaxYears": 13.5,
      "betaHeight": 0.98,
      "betaChronAge": -2.6,
      "betaBoneAge": -3.8,
      "constant": 108,
      "residualSd": 3.5,
      "r": 0.88
    },
    {
      "ageMinYears": 13.5,
      "ageMaxYears": 14,
      "betaHeight": 0.94,
      "betaChronAge": -1.9,
      "betaBoneAge": -4.4,
      "constant": 113,
      "residualSd": 3.5,
      "r": 0.88
    },
    {
      "ageMinYears": 14,
      "ageMaxYears": 14.5,
      "betaHeight": 0.9,
      "betaChronAge": -1.4,
      "betaBoneAge": -4.5,
      "constant": 114,
      "residualSd": 3.1,
      "r": 0.89
    },
    {
      "ageMinYears": 14.5,
      "ageMaxYears": 15,
      "betaHeight": 0.87,
      "betaChronAge": -1,
      "betaBoneAge": -4.6,
      "constant": 114,
      "residualSd": 3.1,
      "r": 0.89
    },
    {
      "ageMinYears": 15,
      "ageMaxYears": 15.5,
      "betaHeight": 0.84,
      "betaChronAge": -0.8,
      "betaBoneAge": -3.8,
      "constant": 104,
      "residualSd": 2.9,
      "r": 0.9
    },
    {
      "ageMinYears": 15.5,
      "ageMaxYears": 16,
      "betaHeight": 0.82,
      "betaChronAge": -0.6,
      "betaBoneAge": -3.1,
      "constant": 94,
      "residualSd": 2.9,
      "r": 0.9
    },
    {
      "ageMinYears": 16,
      "ageMaxYears": 16.5,
      "betaHeight": 0.88,
      "betaChronAge": -0.4,
      "betaBoneAge": -2.4,
      "constant": 71,
      "residualSd": 2.5,
      "r": 0.92
    },
    {
      "ageMinYears": 16.5,
      "ageMaxYears": 17,
      "betaHeight": 0.94,
      "betaChronAge": -0.3,
      "betaBoneAge": -1.8,
      "constant": 48,
      "residualSd": 2,
      "r": 0.96
    },
    {
      "ageMinYears": 17,
      "ageMaxYears": 17.5,
      "betaHeight": 0.96,
      "betaChronAge": -0.2,
      "betaBoneAge": -1.2,
      "constant": 34,
      "residualSd": 0.8,
      "r": 0.99
    },
    {
      "ageMinYears": 17.5,
      "ageMaxYears": 18,
      "betaHeight": 0.98,
      "betaChronAge": -0.1,
      "betaBoneAge": -0.7,
      "constant": 19,
      "residualSd": 0.8,
      "r": 0.99
    }
  ],
  "female": [
    {
      "chart": "childhood",
      "ageMinYears": 4,
      "ageMaxYears": 6,
      "betaHeight": 0.95,
      "betaChronAge": -6.5,
      "betaBoneAge": 0,
      "constant": 93,
      "residualSd": 3.5,
      "r": 0.85
    },
    {
      "chart": "childhood",
      "ageMinYears": 6,
      "ageMaxYears": 6.5,
      "betaHeight": 0.95,
      "betaChronAge": -6,
      "betaBoneAge": -0.4,
      "constant": 93,
      "residualSd": 3,
      "r": 0.86
    },
    {
      "chart": "childhood",
      "ageMinYears": 6.5,
      "ageMaxYears": 7,
      "betaHeight": 0.95,
      "betaChronAge": -5.5,
      "betaBoneAge": -0.8,
      "constant": 93,
      "residualSd": 3,
      "r": 0.86
    },
    {
      "chart": "childhood",
      "ageMinYears": 7,
      "ageMaxYears": 7.5,
      "betaHeight": 0.94,
      "betaChronAge": -5.1,
      "betaBoneAge": -1,
      "constant": 94,
      "residualSd": 3.2,
      "r": 0.85
    },
    {
      "chart": "childhood",
      "ageMinYears": 7.5,
      "ageMaxYears": 8,
      "betaHeight": 0.93,
      "betaChronAge": -4.7,
      "betaBoneAge": -1.1,
      "constant": 94,
      "residualSd": 3.2,
      "r": 0.85
    },
    {
      "chart": "childhood",
      "ageMinYears": 8,
      "ageMaxYears": 8.5,
      "betaHeight": 0.92,
      "betaChronAge": -4.4,
      "betaBoneAge": -1.5,
      "constant": 95,
      "residualSd": 2.9,
      "r": 0.89
    },
    {
      "chart": "childhood",
      "ageMinYears": 8.5,
      "ageMaxYears": 9,
      "betaHeight": 0.92,
      "betaChronAge": -4,
      "betaBoneAge": -1.9,
      "constant": 96,
      "residualSd": 2.9,
      "r": 0.89
    },
    {
      "chart": "childhood",
      "ageMinYears": 9,
      "ageMaxYears": 9.5,
      "betaHeight": 0.92,
      "betaChronAge": -3.8,
      "betaBoneAge": -2.3,
      "constant": 99,
      "residualSd": 2.8,
      "r": 0.85
    },
    {
      "chart": "childhood",
      "ageMinYears": 9.5,
      "ageMaxYears": 10,
      "betaHeight": 0.91,
      "betaChronAge": -3.6,
      "betaBoneAge": -2.7,
      "constant": 102,
      "residualSd": 2.8,
      "r": 0.85
    },
    {
      "chart": "childhood",
      "ageMinYears": 10,
      "ageMaxYears": 10.5,
      "betaHeight": 0.89,
      "betaChronAge": -3.2,
      "betaBoneAge": -3.2,
      "constant": 106,
      "residualSd": 2.9,
      "r": 0.85
    },
    {
      "chart": "childhood",
      "ageMinYears": 10.5,
      "ageMaxYears": 11,
      "betaHeight": 0.87,
      "betaChronAge": -2.7,
      "betaBoneAge": -3.6,
      "constant": 109,
      "residualSd": 2.9,
      "r": 0.85
    },
    {
      "chart": "premenarche",
      "ageMinYears": 11,
      "ageMaxYears": 11.5,
      "betaHeight": 0.83,
      "betaChronAge": -2.6,
      "betaBoneAge": -3.6,
      "constant": 114,
      "residualSd": 2.9,
      "r": 0.82
    },
    {
      "chart": "premenarche",
      "ageMinYears": 11.5,
      "ageMaxYears": 12,
      "betaHeight": 0.82,
      "betaChronAge": -2.5,
      "betaBoneAge": -3.6,
      "constant": 115,
      "residualSd": 2.9,
      "r": 0.82
    },
    {
      "chart": "premenarche",
      "ageMinYears": 12,
      "ageMaxYears": 12.5,
      "betaHeight": 0.83,
      "betaChronAge": -2.4,
      "betaBoneAge": -3.4,
      "constant": 111,
      "residualSd": 2.7,
      "r": 0.87
    },
    {
      "chart": "premenarche",
      "ageMinYears": 12.5,
      "ageMaxYears": 13,
      "betaHeight": 0.83,
      "betaChronAge": -2.3,
      "betaBoneAge": -3.3,
      "constant": 108,
      "residualSd": 2.7,
      "r": 0.87
    },
    {
      "chart": "premenarche",
      "ageMinYears": 13,
      "ageMaxYears": 13.5,
      "betaHeight": 0.85,
      "betaChronAge": -2,
      "betaBoneAge": -3.1,
      "constant": 98,
      "residualSd": 2.2,
      "r": 0.92
    },
    {
      "chart": "premenarche",
      "ageMinYears": 13.5,
      "ageMaxYears": 14,
      "betaHeight": 0.87,
      "betaChronAge": -1.8,
      "betaBoneAge": -3,
      "constant": 90,
      "residualSd": 2.2,
      "r": 0.92
    },
    {
      "chart": "premenarche",
      "ageMinYears": 14,
      "ageMaxYears": 14.5,
      "betaHeight": 0.91,
      "betaChronAge": -1.6,
      "betaBoneAge": -2.8,
      "constant": 79,
      "residualSd": 1.2,
      "r": 0.94
    },
    {
      "chart": "premenarche",
      "ageMinYears": 14.5,
      "ageMaxYears": 15,
      "betaHeight": 0.95,
      "betaChronAge": -1.4,
      "betaBoneAge": -2.5,
      "constant": 67,
      "residualSd": 1.2,
      "r": 0.94
    },
    {
      "chart": "postmenarche",
      "ageMinYears": 11,
      "ageMaxYears": 11.5,
      "betaHeight": 0.87,
      "betaChronAge": -2.3,
      "betaBoneAge": -3.3,
      "constant": 100,
      "residualSd": 2.6,
      "r": 0.87
    },
    {
      "chart": "postmenarche",
      "ageMinYears": 11.5,
      "ageMaxYears": 12,
      "betaHeight": 0.89,
      "betaChronAge": -1.9,
      "betaBoneAge": -3.3,
      "constant": 91,
      "residualSd": 2.6,
      "r": 0.87
    },
    {
      "chart": "postmenarche",
      "ageMinYears": 12,
      "ageMaxYears": 12.5,
      "betaHeight": 0.91,
      "betaChronAge": -1.4,
      "betaBoneAge": -3.2,
      "constant": 82,
      "residualSd": 2.1,
      "r": 0.89
    },
    {
      "chart": "postmenarche",
      "ageMinYears": 12.5,
      "ageMaxYears": 13,
      "betaHeight": 0.93,
      "betaChronAge": -1,
      "betaBoneAge": -2.7,
      "constant": 67,
      "residualSd": 2.1,
      "r": 0.89
    },
    {
      "chart": "postmenarche",
      "ageMinYears": 13,
      "ageMaxYears": 13.5,
      "betaHeight": 0.95,
      "betaChronAge": -0.9,
      "betaBoneAge": -2.2,
      "constant": 55,
      "residualSd": 1.6,
      "r": 0.94
    },
    {
      "chart": "postmenarche",
      "ageMinYears": 13.5,
      "ageMaxYears": 14,
      "betaHeight": 0.96,
      "betaChronAge": -0.9,
      "betaBoneAge": -1.8,
      "constant": 48,
      "residualSd": 1.6,
      "r": 0.94
    },
    {
      "chart": "postmenarche",
      "ageMinYears": 14,
      "ageMaxYears": 14.5,
      "betaHeight": 0.96,
      "betaChronAge": -0.8,
      "betaBoneAge": -1.4,
      "constant": 40,
      "residualSd": 1.2,
      "r": 0.97
    },
    {
      "chart": "postmenarche",
      "ageMinYears": 14.5,
      "ageMaxYears": 15,
      "betaHeight": 0.97,
      "betaChronAge": -0.8,
      "betaBoneAge": -1.3,
      "constant": 37,
      "residualSd": 1.2,
      "r": 0.97
    },
    {
      "chart": "late",
      "ageMinYears": 15,
      "ageMaxYears": 15.5,
      "betaHeight": 0.98,
      "betaChronAge": -0.6,
      "betaBoneAge": -1.1,
      "constant": 30,
      "residualSd": 0.8,
      "r": 0.99
    },
    {
      "chart": "late",
      "ageMinYears": 15.5,
      "ageMaxYears": 16,
      "betaHeight": 0.99,
      "betaChronAge": -0.4,
      "betaBoneAge": -0.7,
      "constant": 20,
      "residualSd": 0.8,
      "r": 0.99
    }
  ]
} as {
  male: Tw3AgeBand[];
  female: Tw3GirlAgeBand[];
};
