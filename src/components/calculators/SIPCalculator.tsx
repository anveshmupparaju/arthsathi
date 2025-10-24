import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, Calendar, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [results, setResults] = useState({
    totalInvestment: 0,
    estimatedReturns: 0,
    maturityValue: 0,
  });

  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, expectedReturn, timePeriod]);

  function calculateSIP() {
    const monthlyRate = expectedReturn / 12 / 100;
    const months = timePeriod * 12;
    
    // SIP Future Value Formula: P * [((1 + r)^n - 1) / r] * (1 + r)
    const maturityValue = monthlyInvestment * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const totalInvestment = monthlyInvestment * months;
    const estimatedReturns = maturityValue - totalInvestment;

    setResults({
      totalInvestment,
      estimatedReturns,
      maturityValue,
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            SIP Calculator
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Calculate returns on your Systematic Investment Plan
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Monthly Investment */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Monthly Investment
              </label>
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{monthlyInvestment.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>₹500</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Expected Return */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Expected Return Rate (p.a.)
              </label>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-semibold">
                <Percent className="w-4 h-4" />
                <span>{expectedReturn}%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1%</span>
              <span>30%</span>
            </div>
          </div>

          {/* Time Period */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Period
              </label>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                <Calendar className="w-4 h-4" />
                <span>{timePeriod} Years</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={timePeriod}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 Year</span>
              <span>40 Years</span>
            </div>
          </div>

          {/* Direct Input Fields */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Monthly (₹)
              </label>
              <input
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="500"
                max="100000"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Return (%)
              </label>
              <input
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="30"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Years
              </label>
              <input
                type="number"
                value={timePeriod}
                onChange={(e) => setTimePeriod(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="40"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Result Cards */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-400 mb-2">
              Total Investment
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">
              {formatCurrency(results.totalInvestment)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {monthlyInvestment.toLocaleString('en-IN')}/month × {timePeriod * 12} months
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400 mb-2">
              Estimated Returns
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">
              {formatCurrency(results.estimatedReturns)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              @ {expectedReturn}% p.a. for {timePeriod} years
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-700 dark:text-purple-400 mb-2">
              Maturity Value
            </div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-300">
              {formatCurrency(results.maturityValue)}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Total corpus after {timePeriod} years
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Breakdown
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Investment</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {results.maturityValue > 0
                    ? ((results.totalInvestment / results.maturityValue) * 100).toFixed(1)
                    : '0.0'}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(results.totalInvestment / results.maturityValue) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-sm pt-2">
                <span className="text-gray-600 dark:text-gray-400">Returns</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {results.maturityValue > 0
                    ? ((results.estimatedReturns / results.maturityValue) * 100).toFixed(1)
                    : '0.0'}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${(results.estimatedReturns / results.maturityValue) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-300">
          <strong>Note:</strong> These calculations are for illustrative purposes only. 
          Actual returns may vary based on market conditions and fund performance. 
          Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  );
}