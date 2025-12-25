import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  CalculationInput,
  CalculationMode,
  CalculationResult,
  PolicyPeriod,
  Region,
} from './types';
import { PERIOD_LABELS } from './constants';
import { calculateGrossToNet, findGrossFromNet } from './utils';

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

  // --- Handlers ---
  const handleInputChange = (field: keyof CalculationInput, value: any) => {
    setInput((prev) => {
      const next = { ...prev, [field]: value };
      
      // Auto-sync insurance salary if toggle is on and we change the amount (if mode is Gross -> Net)
      // If mode is Net -> Gross, 'amount' is Net, so we don't know Gross yet.
      // However, for the initial inputs, we keep logic simple.
      if (field === 'amount' && prev.mode === CalculationMode.GROSS_TO_NET && prev.isInsuranceOnActualSalary) {
        next.insuranceSalary = value;
      }
      // If user manually types in insurance salary, disable the auto-sync? 
      // The prompt says "Default is Income, allow user to input diff".
      // We handle this by a checkbox "Đóng BH trên lương chính thức".
      
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
    <div className="min-h-screen bg-blue-50 text-[11pt] text-gray-800 p-4 md:p-8 font-serif leading-relaxed">
      <div className="max-w-4xl mx-auto bg-white shadow-lg border border-blue-200 p-6 rounded-md">
        
        {/* --- Header --- */}
        <header className="mb-6 border-b border-blue-100 pb-4">
          <h1 className="text-2xl font-bold text-green-700 text-center uppercase mb-2">
            TÍNH THUẾ PIT GROSS &harr; NET THEO 3 GIAI ĐOẠN
          </h1>
          <p className="text-center text-blue-900 italic">
            Vietnam Payroll & Tax Calculation Engine
          </p>
        </header>

        {/* --- Input Form --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Column 1: Core Settings */}
          <div className="space-y-4">
            {/* Calculation Mode */}
            <div>
              <label className="block font-bold text-blue-900 mb-1">Phương thức tính:</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-green-600 focus:ring-green-600"
                    checked={input.mode === CalculationMode.GROSS_TO_NET}
                    onChange={() => handleInputChange('mode', CalculationMode.GROSS_TO_NET)}
                  />
                  <span className="ml-2">GROSS &rarr; NET</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="radio"
                    className="form-radio text-green-600 focus:ring-green-600"
                    checked={input.mode === CalculationMode.NET_TO_GROSS}
                    onChange={() => handleInputChange('mode', CalculationMode.NET_TO_GROSS)}
                  />
                  <span className="ml-2">NET &rarr; GROSS</span>
                </label>
              </div>
            </div>

            {/* Policy Period */}
            <div>
              <label className="block font-bold text-blue-900 mb-1">Giai đoạn chính sách:</label>
              <select
                className="w-full border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:border-green-600"
                value={input.period}
                onChange={(e) => handleInputChange('period', e.target.value)}
              >
                {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block font-bold text-blue-900 mb-1">
                {input.mode === CalculationMode.GROSS_TO_NET ? 'Thu nhập Gross (VNĐ)' : 'Thu nhập Net mong muốn (VNĐ)'}:
              </label>
              <input
                type="number"
                min="0"
                className="w-full border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:border-green-600 font-bold text-green-700"
                value={input.amount}
                onChange={(e) => handleInputChange('amount', Number(e.target.value))}
              />
            </div>
            
            {/* Region */}
            <div>
              <label className="block font-bold text-blue-900 mb-1">Vùng (để tính trần BHTN):</label>
              <select
                className="w-full border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:border-green-600"
                value={input.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
              >
                <option value={Region.I}>Vùng I</option>
                <option value={Region.II}>Vùng II</option>
                <option value={Region.III}>Vùng III</option>
                <option value={Region.IV}>Vùng IV</option>
              </select>
            </div>
          </div>

          {/* Column 2: Deductions & Insurance */}
          <div className="space-y-4">
             {/* Insurance Salary Configuration */}
             <div className="bg-blue-50/50 p-3 rounded border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block font-bold text-blue-900">Mức lương đóng BHXH:</label>
                <label className="inline-flex items-center text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox text-green-600 rounded"
                    checked={input.isInsuranceOnActualSalary}
                    onChange={(e) => handleInputChange('isInsuranceOnActualSalary', e.target.checked)}
                  />
                  <span className="ml-1 text-gray-600">Theo lương chính thức</span>
                </label>
              </div>
              <input
                type="number"
                min="0"
                disabled={input.isInsuranceOnActualSalary}
                className={`w-full border rounded px-3 py-1.5 focus:outline-none focus:border-green-600 ${input.isInsuranceOnActualSalary ? 'bg-gray-100 text-gray-500' : 'bg-white border-blue-300'}`}
                value={input.insuranceSalary}
                onChange={(e) => handleInputChange('insuranceSalary', Number(e.target.value))}
              />
              <p className="text-[10pt] text-gray-500 mt-1 italic">
                *Đã tự động áp dụng trần BHXH/BHYT (20 x Lương cơ sở) và BHTN (20 x Lương tối thiểu vùng).
              </p>
            </div>

            {/* Dependents */}
            <div>
              <label className="block font-bold text-blue-900 mb-1">Số người phụ thuộc:</label>
              <input
                type="number"
                min="0"
                className="w-full border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:border-green-600"
                value={input.dependents}
                onChange={(e) => handleInputChange('dependents', Math.max(0, Number(e.target.value)))}
              />
            </div>

            {/* Other Deductions */}
            <div>
              <label className="block font-bold text-blue-900 mb-1">Giảm trừ khác (VNĐ):</label>
              <input
                type="number"
                min="0"
                className="w-full border border-blue-300 rounded px-3 py-1.5 focus:outline-none focus:border-green-600"
                value={input.otherDeductions}
                onChange={(e) => handleInputChange('otherDeductions', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-t border-blue-100 pt-4">
           {/* Employer Cost Toggle */}
           <label className="inline-flex items-center cursor-pointer select-none">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={showEmployerCost}
                onChange={(e) => setShowEmployerCost(e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full ${showEmployerCost ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${showEmployerCost ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <span className="ml-3 font-bold text-blue-900">Hiển thị Chi phí Người sử dụng lao động</span>
          </label>

          <div className="flex space-x-3">
            <button
              onClick={handleCalculate}
              className="flex items-center px-6 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 transition"
            >
              <Calculator className="w-4 h-4 mr-2" />
              TÍNH
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-6 py-2 bg-green-600 text-white font-bold rounded shadow hover:bg-green-700 transition"
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
              <h2 className="text-lg font-bold text-green-700 border-b-2 border-green-600 inline-block mb-3 uppercase">
                A. DIỄN GIẢI CHI TIẾT ({input.mode === CalculationMode.GROSS_TO_NET ? 'GROSS' : 'CONVERTED GROSS'})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-blue-200">
                  <tbody>
                    <tr className="bg-blue-50">
                      <td className="p-2 border border-blue-200 font-bold text-green-700">Lương Gross</td>
                      <td className="p-2 border border-blue-200 text-right font-bold text-green-700 text-lg">{fmt(result.gross)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-blue-200 pl-6">BHXH (8%)</td>
                      <td className="p-2 border border-blue-200 text-right">-{fmt(result.bhxhEmp)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-blue-200 pl-6">BHYT (1.5%)</td>
                      <td className="p-2 border border-blue-200 text-right">-{fmt(result.bhytEmp)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-blue-200 pl-6">BHTN (1%)</td>
                      <td className="p-2 border border-blue-200 text-right">-{fmt(result.bhtnEmp)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-2 border border-blue-200 font-bold">Thu nhập trước thuế</td>
                      <td className="p-2 border border-blue-200 text-right font-bold">{fmt(result.preTaxIncome)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-blue-200 pl-6">Giảm trừ bản thân</td>
                      <td className="p-2 border border-blue-200 text-right">-{fmt(result.selfDeduction)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-blue-200 pl-6">Giảm trừ người phụ thuộc ({input.dependents})</td>
                      <td className="p-2 border border-blue-200 text-right">-{fmt(result.dependentDeduction)}</td>
                    </tr>
                     <tr>
                      <td className="p-2 border border-blue-200 pl-6">Giảm trừ khác</td>
                      <td className="p-2 border border-blue-200 text-right">-{fmt(result.otherDeductions)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="p-2 border border-blue-200 font-bold">Thu nhập chịu thuế</td>
                      <td className="p-2 border border-blue-200 text-right font-bold">{fmt(result.taxableIncome)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 border border-blue-200 font-bold text-green-700">Thuế TNCN (*)</td>
                      <td className="p-2 border border-blue-200 text-right font-bold text-green-700">-{fmt(result.pitTotal)}</td>
                    </tr>
                    <tr className="bg-green-100">
                      <td className="p-2 border border-blue-200 font-bold text-green-800 text-lg">LƯƠNG NET</td>
                      <td className="p-2 border border-blue-200 text-right font-bold text-green-800 text-2xl">{fmt(result.net)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Block B: Tax Breakdown */}
            <section>
              <h2 className="text-lg font-bold text-green-700 border-b-2 border-green-600 inline-block mb-3 uppercase">
                B. CHI TIẾT THUẾ TNCN (*)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-blue-200 text-center">
                  <thead>
                    <tr className="bg-blue-100 text-blue-900">
                      <th className="p-2 border border-blue-200">Bậc</th>
                      <th className="p-2 border border-blue-200 text-left">Khoảng thu nhập chịu thuế</th>
                      <th className="p-2 border border-blue-200">Thuế suất</th>
                      <th className="p-2 border border-blue-200 text-right">Tiền nộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.taxDetails.length > 0 ? (
                      result.taxDetails.map((detail) => (
                        <tr key={detail.level} className="hover:bg-blue-50">
                          <td className="p-2 border border-blue-200">{detail.level}</td>
                          <td className="p-2 border border-blue-200 text-left font-bold text-green-700">{detail.rangeLabel}</td>
                          <td className="p-2 border border-blue-200">{detail.rate}%</td>
                          <td className="p-2 border border-blue-200 text-right font-bold text-green-700">{fmt(detail.taxAmount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 border border-blue-200 text-gray-500 italic">
                          Không phát sinh thuế TNCN (Thu nhập chịu thuế &le; 0)
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="p-2 border border-blue-200 font-bold text-right">Tổng thuế TNCN:</td>
                      <td className="p-2 border border-blue-200 text-right font-bold text-green-700">{fmt(result.pitTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Block C: Employer Cost */}
            {showEmployerCost && (
              <section className="animate-fade-in-up">
                <h2 className="text-lg font-bold text-green-700 border-b-2 border-green-600 inline-block mb-3 uppercase">
                  C. CHI PHÍ NGƯỜI SỬ DỤNG LAO ĐỘNG
                </h2>
                <div className="overflow-x-auto">
                   <table className="w-full border-collapse border border-blue-200">
                    <tbody>
                      <tr className="bg-blue-50">
                        <td className="p-2 border border-blue-200 font-bold text-green-700">Lương Gross</td>
                        <td className="p-2 border border-blue-200 text-right font-bold text-green-700">{fmt(result.gross)}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-blue-200 pl-6">BHXH (17%)</td>
                        <td className="p-2 border border-blue-200 text-right">{fmt(result.bhxhComp)}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-blue-200 pl-6">BHYT (3%)</td>
                        <td className="p-2 border border-blue-200 text-right">{fmt(result.bhytComp)}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-blue-200 pl-6">BHTN (1%)</td>
                        <td className="p-2 border border-blue-200 text-right">{fmt(result.bhtnComp)}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-blue-200 pl-6">TNLĐ-BNN (0.5%)</td>
                        <td className="p-2 border border-blue-200 text-right">{fmt(result.tnldBnnComp)}</td>
                      </tr>
                      <tr className="bg-green-100">
                        <td className="p-2 border border-blue-200 font-bold text-green-800">TỔNG CHI PHÍ</td>
                        <td className="p-2 border border-blue-200 text-right font-bold text-green-800 text-xl">{fmt(result.totalEmployerCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 flex items-start">
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