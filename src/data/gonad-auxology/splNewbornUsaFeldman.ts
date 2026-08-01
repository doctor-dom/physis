/** Auto-generated from data/excel/gonad-auxology — run node scripts/import-gonad-auxology-data.mjs */

export interface SplNewbornUsaFeldmanRow {
  gaWeeks: number;
  gaLabel: string;
  meanCm: number;
  sdCm: number;
  m2_5SdCm: number;
}

export const splNewbornUsaFeldman = [
  {
    "gaWeeks": 30,
    "gaLabel": "30-week gestation",
    "meanCm": 2.5,
    "sdCm": 0.4,
    "m2_5SdCm": 1.5
  },
  {
    "gaWeeks": 34,
    "gaLabel": "34-week gestation",
    "meanCm": 3,
    "sdCm": 0.4,
    "m2_5SdCm": 2
  },
  {
    "gaWeeks": 38,
    "gaLabel": "38+ weeks (term)",
    "meanCm": 3.5,
    "sdCm": 0.4,
    "m2_5SdCm": 2.5
  }
] as SplNewbornUsaFeldmanRow[];
