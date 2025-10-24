import React, { useState, useEffect } from 'react';
import { Users, IndianRupee, Calendar, Percent, DollarSign } from 'lucide-react';
import { formatCurrency, calculateRetirementCorpus } from '@/lib/utils';

type RetirementResult = {
  corpusNeeded: number;
  yearsToRetirement: number;
  retirementYears: number;
};

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [inflationRate, setInflationRate] = useState(6);
  const [postRetirementReturn, setPostRetirementReturn] = useState(8);

  const [results, setResults] = useState<RetirementResult>({
    corpusNeeded: 0,
    yearsToRetirement: 0,
    retirementYears: 0,
  });

  useEffect(() => {
    calculateCorpus();
  }, [currentAge, retirementAge, monthlyExpenses, lifeExpectancy, inflationRate, postRetirementReturn]);

  function calculateCorpus() {
    const calculatedResults = calculateRetirementCorpus(
      currentAge,
      retirementAge,
      monthlyExpenses,
      lifeExpectancy,
      inflationRate,
      postRetirementReturn
    );
    setResults(calculatedResults);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Retirement Planner
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Plan your retirement corpus and secure your future
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Current Age */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Current Age
              </label>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                <span>{currentAge} Years</span>
              </div>
            </div>
            <input
              type="range"
              min="18"
              max="60"
              step="1"
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            />
          </div>

          {/* Retirement Age */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Desired Retirement Age
              </label>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                <span>{retirementAge} Years</span>
              </div>
            </div>
            <input
              type="range"
              min={currentAge + 1} // Ensure retirement age is after current age
              max="70"
              step="1"
              value={retirementAge}
              onChange={(e) => setRetirementAge(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
            />
          </div>

          {/* Monthly Expenses at Retirement */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Monthly Expenses
              </label>
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{monthlyExpenses.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
step="5000"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-red-600"
            />
          </div>

          {/* Life Expectancy */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Life Expectancy
              </label>
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-semibold">
                <span>{lifeExpectancy} Years</span>
              </div>
            </div>
            <input
              type="range"
              min={retirementAge + 1} // Ensure life expectancy is after retirement age
              max="100"
              step="1"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-yellow-600"
            />
          </div>

          {/* Inflation Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expected Inflation Rate (p.a.)
              </label>
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
                <Percent className="w-4 h-4" />
                <span>{inflationRate}%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-600"
            />
          </div>

          {/* Post-Retirement Return */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Post-Retirement Investment Return (p.a.)
              </label>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                <Percent className="w-4 h-4" />
                <span>{postRetirementReturn}%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={postRetirementReturn}
              onChange={(e) => setPostRetirementReturn(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-600"
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400 mb-2">
              Retirement Corpus Needed
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">
              {formatCurrency(results.corpusNeeded)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              To maintain current lifestyle post-retirement
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-400 mb-2">
              Years to Retirement
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">
              {results.yearsToRetirement} Years
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Time left to build your corpus
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-700 dark:text-purple-400 mb-2">
              Years in Retirement
            </div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-300">
              {results.retirementYears} Years
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Period your corpus needs to last
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Note:</strong> This calculator provides an estimate. Actual needs may vary based on lifestyle changes, unexpected expenses, and market performance.
        </p>
      </div>
    </div>
  );
}
