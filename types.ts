export enum CalculationMode {
  GROSS_TO_NET = 'GROSS_TO_NET',
  NET_TO_GROSS = 'NET_TO_GROSS',
}

export enum PolicyPeriod {
  P1_2025_H2 = 'P1_2025_H2',
  P2_2026_H1 = 'P2_2026_H1',
  P3_2026_H2_ONWARD = 'P3_2026_H2_ONWARD',
}

export enum Region {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
}

export interface TaxBracket {
  id: number;
  min: number; // Million VND
  max: number | null; // Million VND, null for infinity
  rate: number; // Percentage (0-100)
}

export interface CalculationInput {
  mode: CalculationMode;
  period: PolicyPeriod;
  amount: number; // The input amount (Gross or Net)
  region: Region;
  dependents: number;
  insuranceSalary: number; // The salary used for insurance calculation
  isInsuranceOnActualSalary: boolean; // If true, insuranceSalary tracks the gross
  otherDeductions: number;
}

export interface TaxDetail {
  level: number;
  taxableIncomeSegment: number;
  rate: number;
  taxAmount: number;
  rangeLabel: string;
}

export interface CalculationResult {
  gross: number;
  bhxhEmp: number;
  bhytEmp: number;
  bhtnEmp: number;
  preTaxIncome: number;
  selfDeduction: number;
  dependentDeduction: number;
  otherDeductions: number;
  taxableIncome: number;
  pitTotal: number;
  net: number;
  taxDetails: TaxDetail[];
  
  // Employer Costs
  bhxhComp: number;
  bhytComp: number;
  bhtnComp: number;
  tnldBnnComp: number;
  totalEmployerCost: number;
}