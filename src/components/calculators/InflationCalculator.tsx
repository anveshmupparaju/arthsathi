import React, { useState, useEffect } from 'react';
import { Percent, IndianRupee, Calendar } from 'lucide-react';
import { formatCurrency, calculateInflationImpact } from '@/lib/utils';

type InflationResult = {
  futureValue: number;
  purchasingPowerLoss: number;
};

export default function InflationCalculator() {
  const [currentValue, setCurrentValue] = useState(100000);
  const [years, setYears] = useState(10);
  const [inflationRate, setInflationRate] = useState(6);
  const [results, setResults] = useState<InflationResult>({
    futureValue: 0,
    purchasingPowerLoss: 0,
  });

  useEffect(() => {
    const calculatedResults = calculateInflationImpact(currentValue, years, inflationRate);
    setResults(calculatedResults);
  }, [currentValue, years, inflationRate]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
          <Percent className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inflation Calculator
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estimate the future value of money and its purchasing power.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Current Value */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Value / Cost
              </label>
              <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{currentValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              type="range"
              min="1000"
              max="10000000"
              step="1000"
              value={currentValue}
              onChange={(e) => setCurrentValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-pink-600"
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
                <span>{years} Years</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
            />
          </div>

          {/* Inflation Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expected Inflation Rate (p.a.)
              </label>
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                <Percent className="w-4 h-4" />
                <span>{inflationRate}%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-600"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
            <div className="text-sm text-pink-700 dark:text-pink-400 mb-2">
              Future Value
            </div>
            <div className="text-3xl font-bold text-pink-900 dark:text-pink-300">
              {formatCurrency(results.futureValue)}
            </div>
            <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">
              The same item will cost this much in {years} years.
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
            <div className="text-sm text-orange-700 dark:text-orange-400 mb-2">
              Purchasing Power Loss
            </div>
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-300">
              - {formatCurrency(results.purchasingPowerLoss)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              The value of {formatCurrency(currentValue)} today will effectively be worth less by this amount.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
