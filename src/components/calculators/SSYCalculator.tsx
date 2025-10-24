import React, { useState, useEffect } from 'react';
import { GraduationCap, IndianRupee, Calendar, Percent } from 'lucide-react';
import { formatCurrency, calculateSSY } from '@/lib/utils';

type SSYResult = {
  maturityAmount: number;
  totalInvestment: number;
  interestEarned: number;
};

export default function SSYCalculator() {
  const [yearlyInvestment, setYearlyInvestment] = useState(150000);
  const [interestRate, setInterestRate] = useState(8.2);
  const [results, setResults] = useState<SSYResult>({
    maturityAmount: 0,
    totalInvestment: 0,
    interestEarned: 0,
  });

  // SSY has a fixed contribution period of 15 years
  const contributionPeriod = 15;

  useEffect(() => {
    const calculatedResults = calculateSSY(yearlyInvestment, contributionPeriod, interestRate);
    setResults(calculatedResults);
  }, [yearlyInvestment, interestRate]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            SSY Calculator
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Calculate returns for Sukanya Samriddhi Yojana.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Yearly Investment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Yearly Investment
              </label>
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{yearlyInvestment.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              type="range"
              min="250"
              max="150000"
              step="250"
              value={yearlyInvestment}
              onChange={(e) => setYearlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-rose-600"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Interest Rate (p.a.)
              </label>
              <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-semibold">
                <Percent className="w-4 h-4" />
                <span>{interestRate}%</span>
              </div>
            </div>
            <input
              type="range"
              min="5"
              max="12"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-pink-600"
            />
          </div>

           <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Contribution is made for <strong>15 years</strong>, but the amount matures after <strong>21 years</strong>.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-400 mb-2">Total Investment</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">{formatCurrency(results.totalInvestment)}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400 mb-2">Total Interest</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">{formatCurrency(results.interestEarned)}</div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-rose-200 dark:border-rose-800">
            <div className="text-sm text-rose-700 dark:text-rose-400 mb-2">Maturity Value (after 21 years)</div>
            <div className="text-3xl font-bold text-rose-900 dark:text-rose-300">{formatCurrency(results.maturityAmount)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}