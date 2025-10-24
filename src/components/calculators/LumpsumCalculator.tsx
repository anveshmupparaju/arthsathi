// ============================================
// FILE: src/components/calculators/LumpsumCalculator.tsx
// ============================================

import React, { useState, useEffect } from 'react';
import { DollarSign, IndianRupee, Calendar, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function LumpsumCalculator() {
  const [investment, setInvestment] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [results, setResults] = useState({
    totalInvestment: 0,
    estimatedReturns: 0,
    maturityValue: 0,
  });

  useEffect(() => {
    calculateLumpsum();
  }, [investment, expectedReturn, timePeriod]);

  function calculateLumpsum() {
    // Compound Interest: A = P(1 + r/n)^(nt)
    const rate = expectedReturn / 100;
    const maturityValue = investment * Math.pow(1 + rate, timePeriod);
    const estimatedReturns = maturityValue - investment;

    setResults({
      totalInvestment: investment,
      estimatedReturns,
      maturityValue,
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lumpsum Calculator</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Calculate returns on one-time investment</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Investment Amount</label>
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{investment.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="10000000"
              step="10000"
              value={investment}
              onChange={(e) => setInvestment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-yellow-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Return Rate (p.a.)</label>
              <span className="text-orange-600 dark:text-orange-400 font-semibold">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-600"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period</label>
              <span className="text-red-600 dark:text-red-400 font-semibold">{timePeriod} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-600"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">Total Investment</div>
            <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-300">{formatCurrency(results.totalInvestment)}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400 mb-2">Estimated Returns</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">{formatCurrency(results.estimatedReturns)}</div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
            <div className="text-sm text-orange-700 dark:text-orange-400 mb-2">Maturity Value</div>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-300">{formatCurrency(results.maturityValue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
