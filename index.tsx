import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Calculator,
  Printer,
  ChevronRight,
  Info,
  Settings,
  X,
  Check
} from 'lucide-react';

// ==========================================
// TYPES
// ==========================================

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

export type Theme = 'light' | 'dark' | 'contrast';
export type FontSize = 'small' | 'medium' | 'large';

// ==========================================
// CONSTANTS
// ==========================================

// Lương cơ sở (Base Salary) assumed for BHXH/BHYT cap if not specified explicitly in prompt for 2026.
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
  { id: 3, min: 30000000, max: 60000000, rate: 25 },
  { id: 4, min: 60000000, max: 100000000, rate: 30 },
  { id: 5, min: 100000000, max: null, rate: 35 },
];

export const PERIOD_LABELS = {
  [PolicyPeriod.P1_2025_H2]: 'P1: 01/07/2025 – 31/12/2025',
  [PolicyPeriod.P2_2026_H1]: 'P2: 01/01/2026 – 30/06/2026',
  [PolicyPeriod.P3_2026_H2_ONWARD]: 'P3: Từ 01/07/2026 trở đi',
};

// ==========================================
// THEME
// ==========================================

export const FONT_SIZES: Record<FontSize, string> = {
  small: 'text-[10pt]',
  medium: 'text-[11pt]',
  large: 'text-[13pt]',
};

export const THEMES: Record<Theme, {
  bgApp: string;
  bgCard: string;
  textMain: string;
  textMuted: string; 
  textHeader: string; 
  textHighlight: string; 
  borderCard: string;
  borderDivider: string;
  input: string;
  inputDisabled: string;
  inputLabel: string;
  checkboxText: string;
  buttonPrimary: string;
  tableBorder: string;
  tableHeaderBg: string;
  tableHeaderText: string;
  tableRowAlt: string; 
  tableRowNormal: string;
  resultLabel: string; 
  resultValue: string;
  sectionTitleBorder: string;
  disclaimerBg: string;
  disclaimerBorder: string;
  disclaimerText: string;
  toggleOn: string;
  toggleOff: string;
  toggleDot: string;
  accentColor: string; 
}> = {
  light: {
    bgApp: 'bg-blue-50',
    bgCard: 'bg-white',
    textMain: 'text-gray-800',
    textMuted: 'text-gray-600',
    textHeader: 'text-green-700',
    textHighlight: 'text-green-700',
    borderCard: 'border border-blue-200',
    borderDivider: 'border-blue-100',
    input: 'bg-white border border-blue-300 focus:border-green-600 text-gray-900',
    inputDisabled: 'bg-gray-100 text-gray-500 border border-blue-200',
    inputLabel: 'text-blue-900',
    checkboxText: 'text-gray-600',
    buttonPrimary: 'bg-green-600 hover:bg-green-700 text-white',
    tableBorder: 'border-blue-200',
    tableHeaderBg: 'bg-blue-100',
    tableHeaderText: 'text-blue-900',
    tableRowAlt: 'bg-blue-50',
    tableRowNormal: 'bg-white',
    resultLabel: 'text-green-800',
    resultValue: 'text-green-800',
    sectionTitleBorder: 'border-green-600',
    disclaimerBg: 'bg-yellow-50',
    disclaimerBorder: 'border-yellow-200',
    disclaimerText: 'text-yellow-800',
    toggleOn: 'bg-green-600',
    toggleOff: 'bg-gray-300',
    toggleDot: 'bg-white',
    accentColor: 'text-green-600',
  },
  dark: {
    bgApp: 'bg-gray-900',
    bgCard: 'bg-gray-800',
    textMain: 'text-gray-300',
    textMuted: 'text-gray-400',
    textHeader: 'text-green-400',
    textHighlight: 'text-green-400',
    borderCard: 'border border-gray-700',
    borderDivider: 'border-gray-700',
    input: 'bg-gray-700 border border-gray-600 focus:border-green-500 text-white',
    inputDisabled: 'bg-gray-800 text-gray-500 border border-gray-700',
    inputLabel: 'text-gray-200',
    checkboxText: 'text-gray-400',
    buttonPrimary: 'bg-green-700 hover:bg-green-600 text-white',
    tableBorder: 'border-gray-700',
    tableHeaderBg: 'bg-gray-700',
    tableHeaderText: 'text-gray-200',
    tableRowAlt: 'bg-gray-700/50',
    tableRowNormal: 'bg-gray-800',
    resultLabel: 'text-green-400',
    resultValue: 'text-green-400',
    sectionTitleBorder: 'border-green-500',
    disclaimerBg: 'bg-yellow-900/20',
    disclaimerBorder: 'border-yellow-700/50',
    disclaimerText: 'text-yellow-200',
    toggleOn: 'bg-green-600',
    toggleOff: 'bg-gray-600',
    toggleDot: 'bg-gray-200',
    accentColor: 'text-green-500',
  },
  contrast: {
    bgApp: 'bg-white',
    bgCard: 'bg-white',
    textMain: 'text-black',
    textMuted: 'text-black',
    textHeader: 'text-black underline decoration-2',
    textHighlight: 'text-black font-extrabold',
    borderCard: 'border-2 border-black shadow-none',
    borderDivider: 'border-black',
    input: 'bg-white border-2 border-black focus:ring-2 focus:ring-black text-black placeholder-gray-500',
    inputDisabled: 'bg-gray-200 text-black border-2 border-dashed border-black',
    inputLabel: 'text-black font-bold',
    checkboxText: 'text-black font-bold',
    buttonPrimary: 'bg-black text-yellow-300 border-2 border-black hover:bg-yellow-300 hover:text-black hover:border-black font-bold',
    tableBorder: 'border-black',
    tableHeaderBg: 'bg-black',
    tableHeaderText: 'text-yellow-300 font-bold',
    tableRowAlt: 'bg-gray-200',
    tableRowNormal: 'bg-white',
    resultLabel: 'text-black underline decoration-2',
    resultValue: 'text-black font-black',
    sectionTitleBorder: 'border-black',
    disclaimerBg: 'bg-white',
    disclaimerBorder: 'border-2 border-black',
    disclaimerText: 'text-black font-bold italic',
    toggleOn: 'bg-black',
    toggleOff: 'bg-gray-200 border-2 border-black',
    toggleDot: 'bg-yellow-300 border border-black',
    accentColor: 'text-black',
  }
};

// ==========================================
// UTILS
// ==========================================

export const calculateGrossToNet = (
  gross: number,
  input: CalculationInput
): CalculationResult => {
  const { period, region, dependents, otherDeductions, insuranceSalary } = input;

  const isP1 = period === PolicyPeriod.P1_2025_H2;
  const isP3 = period === PolicyPeriod.P3_2026_H2_ONWARD;

  const deductions = DEDUCTIONS[period];
  const regionalMinWageMap = isP1
    ? REGIONAL_MIN_WAGE_2025
    : REGIONAL_MIN_WAGE_2026;
  const regionalMinWage = regionalMinWageMap[region];
  
  const taxBrackets = isP3 ? TAX_BRACKETS_5 : TAX_BRACKETS_7;

  // Cap BHTN: 20 * Regional Min Wage
  const bhtnWageBase = Math.min(insuranceSalary, 20 * regionalMinWage);
  
  // Cap BHXH/BHYT: 20 * Base Salary
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

  // Calculate Taxable Income
  const preTaxIncome = gross - totalInsuranceEmp;
  const selfDeduction = deductions.SELF;
  const dependentDeduction = deductions.DEPENDENT * dependents;
  const totalDeductions = selfDeduction + dependentDeduction + otherDeductions;
  
  const taxableIncome = Math.max(0, preTaxIncome - totalDeductions);

  // Calculate PIT Breakdown
  let pitTotal = 0;
  const taxDetails: TaxDetail[] = [];

  let remainingTaxable = taxableIncome;
  let previousMax = 0;

  for (const bracket of taxBrackets) {
    if (taxableIncome <= previousMax) break;

    const bracketMax = bracket.max === null ? Infinity : bracket.max;
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

  // Calculate Net
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

export const findGrossFromNet = (
  targetNet: number,
  input: CalculationInput
): CalculationResult => {
  let low = targetNet;
  let high = targetNet * 3;
  let mid = 0;
  let result: CalculationResult | null = null;
  const tolerance = 1; // 1 VND
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    mid = (low + high) / 2;
    
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
      high = mid;
    } else {
      low = mid;
    }
    
    result = calculated;
  }

  return result!;
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

const App: React.FC = () => {
  const [input, setInput] = useState<CalculationInput>({
    mode: CalculationMode.GROSS_TO_NET,
    period: PolicyPeriod.P1_2025_H2,
    amount: 20000000,
    region: Region.I,
    dependents: 0,
    insuranceSalary: 20000000,
    isInsuranceOnActualSalary: true,
    otherDeductions: 0,
  });

  const [showEmployerCost, setShowEmployerCost] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as Theme;
    const savedFontSize = localStorage.getItem('app_fontSize') as FontSize;
    if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);
    if (savedFontSize && FONT_SIZES[savedFontSize]) setFontSize(savedFontSize);
  }, []);

  const updateTheme = (t: Theme) => {
    setTheme(t);
    localStorage.setItem('app_theme', t);
  };
  const updateFontSize = (fs: FontSize) => {
    setFontSize(fs);
    localStorage.setItem('app_fontSize', fs);
  };

  const currentTheme = THEMES[theme];
  const currentFontSizeClass = FONT_SIZES[fontSize];

  const handleInputChange = (field: keyof CalculationInput, value: any) => {
    setInput((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'amount' && prev.mode === CalculationMode.GROSS_TO_NET && prev.isInsuranceOnActualSalary) {
        next.insuranceSalary = value;
      }
      return next;
    });
  };

  const handleCalculate = () => {
    if (input.mode === CalculationMode.GROSS_TO_NET) {
      const res = calculateGrossToNet(input.amount, input);
      setResult(res);
    } else {
      const res = findGrossFromNet(input.amount, input);
      setResult(res);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (input.isInsuranceOnActualSalary && input.mode === CalculationMode.GROSS_TO_NET) {
      setInput(prev => ({ ...prev, insuranceSalary: prev.amount }));
    }
  }, [input.isInsuranceOnActualSalary, input.amount, input.mode]);

  useEffect(() => {
    handleCalculate();
  }, []);

  const fmt = (val: number) => Math.round(val).toLocaleString('vi-VN');

  return (
    <div className={`min-h-screen ${currentTheme.bgApp} ${currentFontSizeClass} ${currentTheme.textMain} p-4 md:p-8 font-serif leading-relaxed transition-colors duration-300`}>
      <div className={`max-w-4xl mx-auto ${currentTheme.bgCard} shadow-lg ${currentTheme.borderCard} p-6 rounded-md transition-all duration-300 relative`}>
        
        <button 
          onClick={() => setShowSettings(true)}
          className={`absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 ${currentTheme.textMuted}`}
          title="Tùy chỉnh giao diện"
        >
          <Settings className="w-5 h-5" />
        </button>

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className={`w-full max-w-sm ${currentTheme.bgCard} ${currentTheme.borderCard} shadow-2xl rounded-lg p-6 relative`}>
              <button 
                onClick={() => setShowSettings(false)}
                className={`absolute top-2 right-2 p-2 ${currentTheme.textMuted} hover:opacity-70`}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className={`text-xl font-bold mb-4 ${currentTheme.textHeader}`}>Tùy chỉnh giao diện</h2>
              
              <div className="mb-6">
                <label className={`block font-bold mb-2 ${currentTheme.textMain}`}>Chế độ màu</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'contrast'] as Theme[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateTheme(t)}
                      className={`px-3 py-2 rounded border flex flex-col items-center justify-center gap-1 transition-all
                        ${theme === t ? `${currentTheme.buttonPrimary} ring-2 ring-offset-1` : `${currentTheme.bgApp} ${currentTheme.textMain} ${currentTheme.borderDivider}`}
                      `}
                    >
                      {t === 'light' && 'Sáng'}
                      {t === 'dark' && 'Tối'}
                      {t === 'contrast' && 'Tương phản'}
                      {theme === t && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className={`block font-bold mb-2 ${currentTheme.textMain}`}>Cỡ chữ</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as FontSize[]).map((fs) => (
                    <button
                      key={fs}
                      onClick={() => updateFontSize(fs)}
                      className={`px-3 py-2 rounded border flex flex-col items-center justify-center gap-1 transition-all
                        ${fontSize === fs ? `${currentTheme.buttonPrimary} ring-2 ring-offset-1` : `${currentTheme.bgApp} ${currentTheme.textMain} ${currentTheme.borderDivider}`}
                      `}
                    >
                      {fs === 'small' && <span className="text-xs">Nhỏ</span>}
                      {fs === 'medium' && <span className="text-sm">Vừa</span>}
                      {fs === 'large' && <span className="text-lg">Lớn</span>}
                      {fontSize === fs && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-right">
                <button 
                  onClick={() => setShowSettings(false)}
                  className={`px-4 py-2 rounded font-bold ${currentTheme.buttonPrimary}`}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        <header className={`mb-6 border-b ${currentTheme.borderDivider} pb-4 pr-10`}>
          <h1 className={`text-2xl font-bold ${currentTheme.textHeader} text-center uppercase mb-2`}>
            TÍNH THUẾ PIT GROSS &harr; NET THEO 3 GIAI ĐOẠN
          </h1>
          <p className={`text-center ${currentTheme.inputLabel} italic`}>
            Vietnam Payroll & Tax Calculation Engine
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          <div className="space-y-4">
            <div>
              <label className={`block font-bold mb-1 ${currentTheme.inputLabel}`}>Phương thức tính:</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className={`form-radio focus:ring-opacity-50 ${currentTheme.accentColor}`}
                    checked={input.mode === CalculationMode.GROSS_TO_NET}
                    onChange={() => handleInputChange('mode', CalculationMode.GROSS_TO_NET)}
                  />
                  <span className={`ml-2 ${currentTheme.textMain}`}>GROSS &rarr; NET</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className={`form-radio focus:ring-opacity-50 ${currentTheme.accentColor}`}
                    checked={input.mode === CalculationMode.NET_TO_GROSS}
                    onChange={() => handleInputChange('mode', CalculationMode.NET_TO_GROSS)}
                  />
                  <span className={`ml-2 ${currentTheme.textMain}`}>NET &rarr; GROSS</span>
                </label>
              </div>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${currentTheme.inputLabel}`}>Giai đoạn chính sách:</label>
              <select
                className={`w-full rounded px-3 py-1.5 focus:outline-none ${currentTheme.input}`}
                value={input.period}
                onChange={(e) => handleInputChange('period', e.target.value)}
              >
                {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key} className="text-black">{label}</option> 
                ))}
              </select>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${currentTheme.inputLabel}`}>
                {input.mode === CalculationMode.GROSS_TO_NET ? 'Thu nhập Gross (VNĐ)' : 'Thu nhập Net mong muốn (VNĐ)'}:
              </label>
              <input
                type="number"
                min="0"
                className={`w-full rounded px-3 py-1.5 focus:outline-none font-bold ${currentTheme.input} ${currentTheme.textHighlight}`}
                value={input.amount}
                onChange={(e) => handleInputChange('amount', Number(e.target.value))}
              />
            </div>
            
            <div>
              <label className={`block font-bold mb-1 ${currentTheme.inputLabel}`}>Vùng (để tính trần BHTN):</label>
              <select
                className={`w-full rounded px-3 py-1.5 focus:outline-none ${currentTheme.input}`}
                value={input.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
              >
                <option value={Region.I} className="text-black">Vùng I</option>
                <option value={Region.II} className="text-black">Vùng II</option>
                <option value={Region.III} className="text-black">Vùng III</option>
                <option value={Region.IV} className="text-black">Vùng IV</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
             <div className={`p-3 rounded border ${currentTheme.borderDivider} ${theme === 'light' ? 'bg-blue-50/50' : currentTheme.bgApp}`}>
              <div className="flex items-center justify-between mb-2">
                <label className={`block font-bold ${currentTheme.inputLabel}`}>Mức lương đóng BHXH:</label>
                <label className="inline-flex items-center text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className={`form-checkbox rounded ${currentTheme.accentColor}`}
                    checked={input.isInsuranceOnActualSalary}
                    onChange={(e) => handleInputChange('isInsuranceOnActualSalary', e.target.checked)}
                  />
                  <span className={`ml-1 ${currentTheme.checkboxText}`}>Theo lương chính thức</span>
                </label>
              </div>
              <input
                type="number"
                min="0"
                disabled={input.isInsuranceOnActualSalary}
                className={`w-full rounded px-3 py-1.5 focus:outline-none ${input.isInsuranceOnActualSalary ? currentTheme.inputDisabled : currentTheme.input}`}
                value={input.insuranceSalary}
                onChange={(e) => handleInputChange('insuranceSalary', Number(e.target.value))}
              />
              <p className={`text-[0.9em] mt-1 italic ${currentTheme.textMuted}`}>
                *Đã tự động áp dụng trần BHXH/BHYT (20 x Lương cơ sở) và BHTN (20 x Lương tối thiểu vùng).
              </p>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${currentTheme.inputLabel}`}>Số người phụ thuộc:</label>
              <input
                type="number"
                min="0"
                className={`w-full rounded px-3 py-1.5 focus:outline-none ${currentTheme.input}`}
                value={input.dependents}
                onChange={(e) => handleInputChange('dependents', Math.max(0, Number(e.target.value)))}
              />
            </div>

            <div>
              <label className={`block font-bold mb-1 ${currentTheme.inputLabel}`}>Giảm trừ khác (VNĐ):</label>
              <input
                type="number"
                min="0"
                className={`w-full rounded px-3 py-1.5 focus:outline-none ${currentTheme.input}`}
                value={input.otherDeductions}
                onChange={(e) => handleInputChange('otherDeductions', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-4 mb-8 border-t ${currentTheme.borderDivider} pt-4`}>
           <label className="inline-flex items-center cursor-pointer select-none">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={showEmployerCost}
                onChange={(e) => setShowEmployerCost(e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${showEmployerCost ? currentTheme.toggleOn : currentTheme.toggleOff}`}></div>
              <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition transform ${currentTheme.toggleDot} ${showEmployerCost ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className={`ml-3 font-bold ${currentTheme.inputLabel}`}>Hiển thị Chi phí Người sử dụng lao động</span>
          </label>

          <div className="flex space-x-3">
            <button
              onClick={handleCalculate}
              className={`flex items-center px-6 py-2 font-bold rounded shadow transition ${currentTheme.buttonPrimary}`}
            >
              <Calculator className="w-4 h-4 mr-2" />
              TÍNH
            </button>
            <button
              onClick={handlePrint}
              className={`flex items-center px-6 py-2 font-bold rounded shadow transition ${currentTheme.buttonPrimary}`}
            >
              <Printer className="w-4 h-4 mr-2" />
              IN
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-8 animate-fade-in">
            
            <section>
              <h2 className={`text-lg font-bold border-b-2 inline-block mb-3 uppercase ${currentTheme.textHeader} ${currentTheme.sectionTitleBorder}`}>
                A. DIỄN GIẢI CHI TIẾT ({input.mode === CalculationMode.GROSS_TO_NET ? 'GROSS' : 'CONVERTED GROSS'})
              </h2>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border ${currentTheme.tableBorder}`}>
                  <tbody>
                    <tr className={currentTheme.tableRowAlt}>
                      <td className={`p-2 border font-bold ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>Lương Gross</td>
                      <td className={`p-2 border text-right font-bold text-lg ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>{fmt(result.gross)}</td>
                    </tr>
                    <tr className={currentTheme.tableRowNormal}>
                      <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>BHXH (8%)</td>
                      <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>-{fmt(result.bhxhEmp)}</td>
                    </tr>
                    <tr className={currentTheme.tableRowNormal}>
                      <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>BHYT (1.5%)</td>
                      <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>-{fmt(result.bhytEmp)}</td>
                    </tr>
                    <tr className={currentTheme.tableRowNormal}>
                      <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>BHTN (1%)</td>
                      <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>-{fmt(result.bhtnEmp)}</td>
                    </tr>
                    <tr className={currentTheme.tableRowAlt}>
                      <td className={`p-2 border font-bold ${currentTheme.tableBorder} ${currentTheme.textMain}`}>Thu nhập trước thuế</td>
                      <td className={`p-2 border text-right font-bold ${currentTheme.tableBorder} ${currentTheme.textMain}`}>{fmt(result.preTaxIncome)}</td>
                    </tr>
                    <tr className={currentTheme.tableRowNormal}>
                      <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>Giảm trừ bản thân</td>
                      <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>-{fmt(result.selfDeduction)}</td>
                    </tr>
                    <tr className={currentTheme.tableRowNormal}>
                      <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>Giảm trừ người phụ thuộc ({input.dependents})</td>
                      <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>-{fmt(result.dependentDeduction)}</td>
                    </tr>
                     <tr className={currentTheme.tableRowNormal}>
                      <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>Giảm trừ khác</td>
                      <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>-{fmt(result.otherDeductions)}</td>
                    </tr>
                    <tr className={currentTheme.tableRowAlt}>
                      <td className={`p-2 border font-bold ${currentTheme.tableBorder} ${currentTheme.textMain}`}>Thu nhập chịu thuế</td>
                      <td className={`p-2 border text-right font-bold ${currentTheme.tableBorder} ${currentTheme.textMain}`}>{fmt(result.taxableIncome)}</td>
                    </tr>
                    <tr className={currentTheme.tableRowNormal}>
                      <td className={`p-2 border font-bold ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>Thuế TNCN (*)</td>
                      <td className={`p-2 border text-right font-bold ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>-{fmt(result.pitTotal)}</td>
                    </tr>
                    <tr className={`${theme === 'light' ? 'bg-green-100' : currentTheme.tableRowAlt}`}>
                      <td className={`p-2 border font-bold text-lg ${currentTheme.tableBorder} ${currentTheme.resultLabel}`}>LƯƠNG NET</td>
                      <td className={`p-2 border text-right font-bold text-2xl ${currentTheme.tableBorder} ${currentTheme.resultValue}`}>{fmt(result.net)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className={`text-lg font-bold border-b-2 inline-block mb-3 uppercase ${currentTheme.textHeader} ${currentTheme.sectionTitleBorder}`}>
                B. CHI TIẾT THUẾ TNCN (*)
              </h2>
              <div className="overflow-x-auto">
                <table className={`w-full border-collapse border text-center ${currentTheme.tableBorder}`}>
                  <thead>
                    <tr className={`${currentTheme.tableHeaderBg} ${currentTheme.tableHeaderText}`}>
                      <th className={`p-2 border ${currentTheme.tableBorder}`}>Bậc</th>
                      <th className={`p-2 border text-left ${currentTheme.tableBorder}`}>Khoảng thu nhập chịu thuế</th>
                      <th className={`p-2 border ${currentTheme.tableBorder}`}>Thuế suất</th>
                      <th className={`p-2 border text-right ${currentTheme.tableBorder}`}>Tiền nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.taxDetails.length > 0 ? (
                      result.taxDetails.map((detail) => (
                        <tr key={detail.level} className={`${currentTheme.tableRowNormal} hover:${theme === 'light' ? 'bg-blue-50' : currentTheme.tableRowAlt}`}>
                          <td className={`p-2 border ${currentTheme.tableBorder} ${currentTheme.textMain}`}>{detail.level}</td>
                          <td className={`p-2 border text-left font-bold ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>{detail.rangeLabel}</td>
                          <td className={`p-2 border ${currentTheme.tableBorder} ${currentTheme.textMain}`}>{detail.rate}%</td>
                          <td className={`p-2 border text-right font-bold ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>{fmt(detail.taxAmount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className={currentTheme.tableRowNormal}>
                        <td colSpan={4} className={`p-4 border italic ${currentTheme.tableBorder} ${currentTheme.textMuted}`}>
                          Không phát sinh thuế TNCN (Thu nhập chịu thuế &le; 0)
                        </td>
                      </tr>
                    )}
                    <tr className={currentTheme.tableRowAlt}>
                      <td colSpan={3} className={`p-2 border font-bold text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>Tổng thuế TNCN:</td>
                      <td className={`p-2 border text-right font-bold ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>{fmt(result.pitTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {showEmployerCost && (
              <section className="animate-fade-in-up">
                <h2 className={`text-lg font-bold border-b-2 inline-block mb-3 uppercase ${currentTheme.textHeader} ${currentTheme.sectionTitleBorder}`}>
                  C. CHI PHÍ NGƯỜI SỬ DỤNG LAO ĐỘNG
                </h2>
                <div className="overflow-x-auto">
                   <table className={`w-full border-collapse border ${currentTheme.tableBorder}`}>
                    <tbody>
                      <tr className={currentTheme.tableRowAlt}>
                        <td className={`p-2 border font-bold ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>Lương Gross</td>
                        <td className={`p-2 border text-right font-bold ${currentTheme.tableBorder} ${currentTheme.textHeader}`}>{fmt(result.gross)}</td>
                      </tr>
                      <tr className={currentTheme.tableRowNormal}>
                        <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>BHXH (17%)</td>
                        <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>{fmt(result.bhxhComp)}</td>
                      </tr>
                      <tr className={currentTheme.tableRowNormal}>
                        <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>BHYT (3%)</td>
                        <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>{fmt(result.bhytComp)}</td>
                      </tr>
                      <tr className={currentTheme.tableRowNormal}>
                        <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>BHTN (1%)</td>
                        <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>{fmt(result.bhtnComp)}</td>
                      </tr>
                      <tr className={currentTheme.tableRowNormal}>
                        <td className={`p-2 border pl-6 ${currentTheme.tableBorder} ${currentTheme.textMain}`}>TNLĐ-BNN (0.5%)</td>
                        <td className={`p-2 border text-right ${currentTheme.tableBorder} ${currentTheme.textMain}`}>{fmt(result.tnldBnnComp)}</td>
                      </tr>
                      <tr className={`${theme === 'light' ? 'bg-green-100' : currentTheme.tableRowAlt}`}>
                        <td className={`p-2 border font-bold ${currentTheme.tableBorder} ${currentTheme.resultLabel}`}>TỔNG CHI PHÍ</td>
                        <td className={`p-2 border text-right font-bold text-xl ${currentTheme.tableBorder} ${currentTheme.resultValue}`}>{fmt(result.totalEmployerCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <div className={`mt-8 p-4 rounded text-sm border flex items-start ${currentTheme.disclaimerBg} ${currentTheme.disclaimerBorder} ${currentTheme.disclaimerText}`}>
               <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
               <p>
                 <strong>Miễn trừ trách nhiệm:</strong> Công cụ này chỉ mang tính chất tham khảo. 
                 Số liệu thực tế có thể thay đổi tùy thuộc vào chính sách nội bộ, thời điểm chi trả và các văn bản hướng dẫn thi hành luật thuế/bảo hiểm mới nhất. 
                 Vui lòng đối chiếu với bộ phận Kế toán/Nhân sự của quý công ty.
                 <br/>
                 Giai đoạn áp dụng hiện tại: <strong>{PERIOD_LABELS[input.period]}</strong>.
               </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);