import React, { useState, useEffect } from 'react';
import { Home, IndianRupee, Calendar, Percent } from 'lucide-react';
import { formatCurrency, calculatePPF } from '@/lib/utils';

type PPFResult = {
  maturityValue: number;
  totalInvestment: number;
  totalInterest: number;
};

export default function PPFCalculator() {
  const [yearlyInvestment, setYearlyInvestment] = useState(150000);
  const [timePeriod, setTimePeriod] = useState(15);
  const [interestRate, setInterestRate] = useState(7.1);
  const [results, setResults] = useState<PPFResult>({
    maturityValue: 0,
    totalInvestment: 0,
    totalInterest: 0,
  });

  useEffect(() => {
    const calculatedResults = calculatePPF(yearlyInvestment, timePeriod, interestRate);
    setResults(calculatedResults);
  }, [yearlyInvestment, timePeriod, interestRate]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Home className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            PPF Calculator
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Calculate returns on your Public Provident Fund investment.
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
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{yearlyInvestment.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              type="range"
              min="500"
              max="150000"
              step="500"
              value={yearlyInvestment}
              onChange={(e) => setYearlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
            />
          </div>

          {/* Time Period */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Period (Years)
              </label>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                <Calendar className="w-4 h-4" />
                <span>{timePeriod} Years</span>
              </div>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              step="1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
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
              max="10"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-pink-600"
            />
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
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">{formatCurrency(results.totalInterest)}</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
            <div className="text-sm text-indigo-700 dark:text-indigo-400 mb-2">Maturity Value</div>
            <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">{formatCurrency(results.maturityValue)}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Note:</strong> PPF has a lock-in period of 15 years. The maximum yearly investment is ₹1,50,000. Interest is compounded annually.
        </p>
      </div>
    </div>
  );
}
