import React, { useState, useEffect } from 'react';
import { DollarSign, IndianRupee, Calendar, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function FDCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6.5);
  const [tenure, setTenure] = useState(5);
  const [frequency, setFrequency] = useState<'quarterly' | 'monthly' | 'yearly'>('quarterly');
  
  const calculateFD = () => {
    const r = rate / 100;
    const n = frequency === 'quarterly' ? 4 : frequency === 'monthly' ? 12 : 1;
    const t = tenure;
    const maturity = principal * Math.pow(1 + r / n, n * t);
    const interest = maturity - principal;
    return { maturity, interest };
  };

  const result = calculateFD();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">FD Calculator</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Calculate Fixed Deposit maturity amount</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Principal Amount</label>
            <input type="number" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Interest Rate (%)</label>
            <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} step="0.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Tenure (Years)</label>
            <input type="number" value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Compounding Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-200 dark:border-cyan-800">
            <div className="text-sm text-cyan-700 dark:text-cyan-400 mb-2">Principal Amount</div>
            <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-300">{formatCurrency(principal)}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400 mb-2">Interest Earned</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">{formatCurrency(result.interest)}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-400 mb-2">Maturity Amount</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">{formatCurrency(result.maturity)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
