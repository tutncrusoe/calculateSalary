import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Printer,
  ChevronRight,
  Info,
  Settings,
  X,
  Check
} from 'lucide-react';
import {
  CalculationInput,
  CalculationMode,
  CalculationResult,
  PolicyPeriod,
  Region,
  Theme,
  FontSize
} from './types';
import { PERIOD_LABELS } from './constants';
import { calculateGrossToNet, findGrossFromNet } from './utils';
import { THEMES, FONT_SIZES } from './theme';

const App: React.FC = () => {
  // --- State ---
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

  // Settings State
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [showSettings, setShowSettings] = useState(false);

  // Load settings from local storage
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme') as Theme;
    const savedFontSize = localStorage.getItem('app_fontSize') as FontSize;
    if (savedTheme && THEMES[savedTheme]) setTheme(savedTheme);
    if (savedFontSize && FONT_SIZES[savedFontSize]) setFontSize(savedFontSize);
  }, []);

  // Save settings
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

  // --- Handlers ---
  const handleInputChange = (field: keyof CalculationInput, value: any) => {
    setInput((prev) => {
      const next = { ...prev, [field]: value };
      
      // Auto-sync insurance salary if toggle is on and we change the amount (if mode is Gross -> Net)
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

  // Sync insurance salary when toggling "On Actual Salary"
  useEffect(() => {
    if (input.isInsuranceOnActualSalary && input.mode === CalculationMode.GROSS_TO_NET) {
      setInput(prev => ({ ...prev, insuranceSalary: prev.amount }));
    }
  }, [input.isInsuranceOnActualSalary, input.amount, input.mode]);

  // Initial Calculation
  useEffect(() => {
    handleCalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Formatter
  const fmt = (val: number) => Math.round(val).toLocaleString('vi-VN');

  return (
    <div className={`min-h-screen ${currentTheme.bgApp} ${currentFontSizeClass} ${currentTheme.textMain} p-4 md:p-8 font-serif leading-relaxed transition-colors duration-300`}>
      <div className={`max-w-4xl mx-auto ${currentTheme.bgCard} shadow-lg ${currentTheme.borderCard} p-6 rounded-md transition-all duration-300 relative`}>
        
        {/* Settings Button */}
        <button 
          onClick={() => setShowSettings(true)}
          className={`absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 ${currentTheme.textMuted}`}
          title="Tùy chỉnh giao diện"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Settings Modal/Panel */}
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

        {/* --- Header --- */}
        <header className={`mb-6 border-b ${currentTheme.borderDivider} pb-4 pr-10`}>
          <h1 className={`text-2xl font-bold ${currentTheme.textHeader} text-center uppercase mb-2`}>
            TÍNH THUẾ PIT GROSS &harr; NET THEO 3 GIAI ĐOẠN
          </h1>
          <p className={`text-center ${currentTheme.inputLabel} italic`}>
            Vietnam Payroll & Tax Calculation Engine
          </p>
        </header>

        {/* --- Input Form --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Column 1: Core Settings */}
          <div className="space-y-4">
            {/* Calculation Mode */}
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

            {/* Policy Period */}
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

            {/* Amount */}
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
            
            {/* Region */}
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

          {/* Column 2: Deductions & Insurance */}
          <div className="space-y-4">
             {/* Insurance Salary Configuration */}
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

            {/* Dependents */}
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

            {/* Other Deductions */}
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

        {/* Action Buttons */}
        <div className={`flex flex-wrap items-center justify-between gap-4 mb-8 border-t ${currentTheme.borderDivider} pt-4`}>
           {/* Employer Cost Toggle */}
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

        {/* --- Results --- */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Block A: Explanation */}
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

            {/* Block B: Tax Breakdown */}
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

            {/* Block C: Employer Cost */}
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

            {/* Disclaimer */}
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

export default App;