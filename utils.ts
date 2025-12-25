import {
  BASE_SALARY_2025_2026,
  DEDUCTIONS,
  INSURANCE_RATES,
  REGIONAL_MIN_WAGE_2025,
  REGIONAL_MIN_WAGE_2026,
  TAX_BRACKETS_5,
  TAX_BRACKETS_7,
} from './constants';
import {
  CalculationInput,
  CalculationResult,
  PolicyPeriod,
  TaxBracket,
  TaxDetail,
} from './types';

/**
 * Calculates Insurance and Tax details given a GROSS salary.
 */
export const calculateGrossToNet = (
  gross: number,
  input: CalculationInput
): CalculationResult => {
  const { period, region, dependents, otherDeductions, insuranceSalary } = input;

  // 1. Determine Parameters based on Period
  const isP1 = period === PolicyPeriod.P1_2025_H2;
  const isP3 = period === PolicyPeriod.P3_2026_H2_ONWARD;

  const deductions = DEDUCTIONS[period];
  const regionalMinWageMap = isP1
    ? REGIONAL_MIN_WAGE_2025
    : REGIONAL_MIN_WAGE_2026;
  const regionalMinWage = regionalMinWageMap[region];
  
  const taxBrackets = isP3 ? TAX_BRACKETS_5 : TAX_BRACKETS_7;

  // 2. Calculate Insurance
  // Cap BHTN: 20 * Regional Min Wage
  const bhtnWageBase = Math.min(insuranceSalary, 20 * regionalMinWage);
  
  // Cap BHXH/BHYT: 20 * Base Salary (Lương cơ sở)
  // Note: Using configured constant base salary.
  const socialWageBase = Math.min(insuranceSalary, 20 * BASE_SALARY_2025_2026);

  // Employee Contributions
  const bhxhEmp = socialWageBase * INSURANCE_RATES.EMP.BHXH;
  const bhytEmp = socialWageBase * INSURANCE_RATES.EMP.BHYT;
  const bhtnEmp = bhtnWageBase * INSURANCE_RATES.EMP.BHTN;
  const totalInsuranceEmp = bhxhEmp + bhytEmp + bhtnEmp;

  // Employer Contributions
  const bhxhComp = socialWageBase * INSURANCE_RATES.COMP.BHXH;
  const bhytComp = socialWageBase * INSURANCE_RATES.COMP.BHYT;
  const bhtnComp = bhtnWageBase * INSURANCE_RATES.COMP.BHTN;
  const tnldBnnComp = socialWageBase * INSURANCE_RATES.COMP.TNLD_BNN;
  const totalEmployerCost = gross + bhxhComp + bhytComp + bhtnComp + tnldBnnComp;

  // 3. Calculate Taxable Income
  const preTaxIncome = gross - totalInsuranceEmp;
  const selfDeduction = deductions.SELF;
  const dependentDeduction = deductions.DEPENDENT * dependents;
  const totalDeductions = selfDeduction + dependentDeduction + otherDeductions;
  
  const taxableIncome = Math.max(0, preTaxIncome - totalDeductions);

  // 4. Calculate PIT Breakdown
  let pitTotal = 0;
  const taxDetails: TaxDetail[] = [];

  let remainingTaxable = taxableIncome;
  let previousMax = 0;

  for (const bracket of taxBrackets) {
    if (taxableIncome <= previousMax) break;

    const bracketMax = bracket.max === null ? Infinity : bracket.max;
    // The amount in this bracket is either the full bracket width or the remaining taxable income
    // Need to correctly segment it.
    
    // Logic: 
    // Segment = Min(TaxableIncome, BracketMax) - PreviousMax
    // If Segment > 0, calc tax.
    
    // However, since we iterate in order:
    // This bracket covers from bracket.min to bracket.max.
    // The taxable amount falling in this bracket is:
    const upperLimit = bracket.max === null ? taxableIncome : bracket.max;
    const lowerLimit = bracket.min;

    if (taxableIncome > lowerLimit) {
      const taxableInBracket = Math.min(taxableIncome, upperLimit) - lowerLimit;
      const taxForBracket = taxableInBracket * (bracket.rate / 100);
      
      pitTotal += taxForBracket;
      
      taxDetails.push({
        level: bracket.id,
        rangeLabel: bracket.max === null 
          ? `Trên ${(bracket.min / 1000000).toLocaleString()} triệu` 
          : `${bracket.id === 1 ? 'Đến' : 'Trên ' + (bracket.min / 1000000).toLocaleString() + ' đến'} ${(bracket.max / 1000000).toLocaleString()} triệu`,
        taxableIncomeSegment: taxableInBracket,
        rate: bracket.rate,
        taxAmount: taxForBracket,
      });
    }

    previousMax = bracketMax === null ? Infinity : bracketMax;
  }

  // 5. Calculate Net
  const net = preTaxIncome - pitTotal;

  return {
    gross,
    bhxhEmp,
    bhytEmp,
    bhtnEmp,
    preTaxIncome,
    selfDeduction,
    dependentDeduction,
    otherDeductions,
    taxableIncome,
    pitTotal,
    net,
    taxDetails,
    bhxhComp,
    bhytComp,
    bhtnComp,
    tnldBnnComp,
    totalEmployerCost,
  };
};

/**
 * Finds Gross from Net using Binary Search.
 * If isInsuranceOnActualSalary is true, the insurance varies with the guessed Gross.
 * If false, the insurance is fixed based on the input.insuranceSalary.
 */
export const findGrossFromNet = (
  targetNet: number,
  input: CalculationInput
): CalculationResult => {
  // Binary Search Settings
  let low = targetNet;
  let high = targetNet * 3; // Initial guess upper bound (usually safe)
  let mid = 0;
  let result: CalculationResult | null = null;
  const tolerance = 1; // 1 VND
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    mid = (low + high) / 2;
    
    // If user selected "insurance based on salary", we update insuranceSalary to the guessed gross (mid)
    // Otherwise, we keep the user-defined fixed insurance salary
    const currentInput = {
      ...input,
      insuranceSalary: input.isInsuranceOnActualSalary ? mid : input.insuranceSalary
    };

    const calculated = calculateGrossToNet(mid, currentInput);
    const diff = calculated.net - targetNet;

    if (Math.abs(diff) <= tolerance) {
      result = calculated;
      break;
    }

    if (diff > 0) {
      // Calculated Net is too high -> Gross is too high
      high = mid;
    } else {
      // Calculated Net is too low -> Gross is too low
      low = mid;
    }
    
    result = calculated; // Store last best attempt
  }

  return result!;
};