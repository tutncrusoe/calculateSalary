import { PolicyPeriod, Region, TaxBracket } from './types';

// Lương cơ sở (Base Salary) assumed for BHXH/BHYT cap if not specified explicitly in prompt for 2026.
// Prompt only gives Regional Min Wage explicitly. 
// We will use 2,340,000 (current from July 2024) as a safe constant for 2025/2026 base unless configured otherwise.
export const BASE_SALARY_2025_2026 = 2340000; 

export const INSURANCE_RATES = {
  EMP: {
    BHXH: 0.08,
    BHYT: 0.015,
    BHTN: 0.01,
  },
  COMP: {
    BHXH: 0.17,
    BHYT: 0.03,
    BHTN: 0.01,
    TNLD_BNN: 0.005,
  },
};

export const REGIONAL_MIN_WAGE_2025 = {
  [Region.I]: 4960000,
  [Region.II]: 4410000,
  [Region.III]: 3860000,
  [Region.IV]: 3450000,
};

export const REGIONAL_MIN_WAGE_2026 = {
  [Region.I]: 5310000,
  [Region.II]: 4730000,
  [Region.III]: 4140000,
  [Region.IV]: 3700000,
};

export const DEDUCTIONS = {
  [PolicyPeriod.P1_2025_H2]: {
    SELF: 11000000,
    DEPENDENT: 4400000,
  },
  [PolicyPeriod.P2_2026_H1]: {
    SELF: 15500000,
    DEPENDENT: 6200000,
  },
  [PolicyPeriod.P3_2026_H2_ONWARD]: {
    SELF: 15500000,
    DEPENDENT: 6200000,
  },
};

// 7 Brackets for P1 and P2
export const TAX_BRACKETS_7: TaxBracket[] = [
  { id: 1, min: 0, max: 5000000, rate: 5 },
  { id: 2, min: 5000000, max: 10000000, rate: 10 },
  { id: 3, min: 10000000, max: 18000000, rate: 15 },
  { id: 4, min: 18000000, max: 32000000, rate: 20 },
  { id: 5, min: 32000000, max: 52000000, rate: 25 },
  { id: 6, min: 52000000, max: 80000000, rate: 30 },
  { id: 7, min: 80000000, max: null, rate: 35 },
];

// 5 Brackets for P3
export const TAX_BRACKETS_5: TaxBracket[] = [
  { id: 1, min: 0, max: 10000000, rate: 5 },
  { id: 2, min: 10000000, max: 30000000, rate: 10 },
  { id: 3, min: 30000000, max: 60000000, rate: 25 }, // Per UI Spec Section 4
  { id: 4, min: 60000000, max: 100000000, rate: 30 },
  { id: 5, min: 100000000, max: null, rate: 35 },
];

export const PERIOD_LABELS = {
  [PolicyPeriod.P1_2025_H2]: 'P1: 01/07/2025 – 31/12/2025',
  [PolicyPeriod.P2_2026_H1]: 'P2: 01/01/2026 – 30/06/2026',
  [PolicyPeriod.P3_2026_H2_ONWARD]: 'P3: Từ 01/07/2026 trở đi',
};