import React, { useState, useEffect } from 'react';
import { Calculator, IndianRupee } from 'lucide-react';
import { formatCurrency, calculateIncomeTaxOld, calculateIncomeTaxNew, Deductions } from '@/lib/utils';

type TaxResult = {
  tax: number;
  effectiveRate: number;
  taxBreakdown: Array<{ slab: string; tax: number }>;
};

const initialDeductions: Deductions = {
  isSalaried: true,
  hra: 0,
  section80C: 0,
  section80D: 0,
  nps80CCD1B: 0,
  nps80CCD2: 0,
};

export default function TaxCalculator() {
  const [income, setIncome] = useState(1000000);
  const [deductions, setDeductions] = useState<Deductions>(initialDeductions);
  const [oldRegimeResult, setOldRegimeResult] = useState<TaxResult | null>(null);
  const [newRegimeResult, setNewRegimeResult] = useState<TaxResult | null>(null);

  useEffect(() => {
    calculateTaxes();
  }, [income, deductions]);

  function calculateTaxes() {
    setOldRegimeResult(calculateIncomeTaxOld(income, deductions));
    setNewRegimeResult(calculateIncomeTaxNew(income, { isSalaried: deductions.isSalaried, nps80CCD2: deductions.nps80CCD2 }));
  }

  const handleDeductionChange = (field: keyof Deductions, value: string | boolean) => {
    setDeductions(prev => ({ ...prev, [field]: typeof value === 'boolean' ? value : Number(value) }));
  }

  const betterRegime =
    oldRegimeResult && newRegimeResult
      ? oldRegimeResult.tax < newRegimeResult.tax
        ? 'old'
        : 'new'
      : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Income Tax Calculator
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Compare your tax liability between Old and New regimes.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Annual Income
              </label>
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{income.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              type="range"
              min="250000"
              max="10000000"
              step="50000"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>₹2,50,000</span>
              <span>₹1,00,00,000</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
              Annual Income (₹)
            </label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
            />
          </div>

          {/* Deductions Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Deductions</h3>
              <div className="flex items-center space-x-2">
                <label htmlFor="isSalaried" className="text-sm font-medium text-gray-700 dark:text-gray-300">Salaried?</label>
                <input
                  type="checkbox"
                  id="isSalaried"
                  checked={deductions.isSalaried}
                  onChange={(e) => handleDeductionChange('isSalaried', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DeductionInput label="HRA Exemption" value={deductions.hra} onChange={(e) => handleDeductionChange('hra', e.target.value)} />
              <DeductionInput label="80C (Max 1.5L)" value={deductions.section80C} onChange={(e) => handleDeductionChange('section80C', e.target.value)} />
              <DeductionInput label="80D (Medical)" value={deductions.section80D} onChange={(e) => handleDeductionChange('section80D', e.target.value)} />
              <DeductionInput label="NPS (80CCD(1B))" value={deductions.nps80CCD1B} onChange={(e) => handleDeductionChange('nps80CCD1B', e.target.value)} />
              <div className="sm:col-span-2">
                <DeductionInput label="Employer NPS (80CCD(2))" value={deductions.nps80CCD2} onChange={(e) => handleDeductionChange('nps80CCD2', e.target.value)} />
              </div>
            </div>
            {deductions.isSalaried && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                A standard deduction of <strong>₹50,000</strong> is applied for salaried individuals in both regimes.
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              <strong>Note:</strong> HRA, 80C, 80D, and employee's NPS (80CCD1B) are applicable only under the <strong>Old Regime</strong>. Employer's NPS contribution is deductible in both.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {oldRegimeResult && (
            <div className={`rounded-xl p-6 border-2 ${betterRegime === 'old' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'}`}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Old Regime</h3>
                {betterRegime === 'old' && <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded-full">SAVING</span>}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Total Tax Payable</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{formatCurrency(oldRegimeResult.tax)}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tax Breakdown:</h4>
                {oldRegimeResult.taxBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{item.slab}</span>
                    <span className="font-mono">{formatCurrency(item.tax)}</span>
                  </div>
                ))}
                 <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-300 dark:border-gray-600">
                    <span>4% Cess</span>
                    <span className="font-mono">{formatCurrency(oldRegimeResult.tax - oldRegimeResult.tax / 1.04)}</span>
                  </div>
              </div>
            </div>
          )}

          {newRegimeResult && (
            <div className={`rounded-xl p-6 border-2 ${betterRegime === 'new' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'}`}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Regime</h3>
                {betterRegime === 'new' && <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded-full">SAVING</span>}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Total Tax Payable</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{formatCurrency(newRegimeResult.tax)}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tax Breakdown:</h4>
                {newRegimeResult.taxBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>{item.slab}</span>
                    <span className="font-mono">{formatCurrency(item.tax)}</span>
                  </div>
                ))}
                 <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-300 dark:border-gray-600">
                    <span>4% Cess</span>
                    <span className="font-mono">{formatCurrency(newRegimeResult.tax - newRegimeResult.tax / 1.04)}</span>
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface DeductionInputProps {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function DeductionInput({ label, value, onChange }: DeductionInputProps) {
  return (
    <div>
      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">₹</span>
        <input type="number" value={value || ''} onChange={onChange} className="w-full pl-7 pr-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" min="0" />
      </div>
    </div>
  );
}