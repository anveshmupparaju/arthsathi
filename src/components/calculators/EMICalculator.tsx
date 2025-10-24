import React, { useState, useEffect } from 'react';
import { CreditCard, IndianRupee, Calendar, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(9);
  const [loanTenure, setLoanTenure] = useState(20);
  const [results, setResults] = useState({
    monthlyEMI: 0,
    totalInterest: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, loanTenure]);

  function calculateEMI() {
    const monthlyRate = interestRate / 12 / 100;
    const months = loanTenure * 12;
    
    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = loanAmount * monthlyRate * 
      Math.pow(1 + monthlyRate, months) / 
      (Math.pow(1 + monthlyRate, months) - 1);
    
    const totalAmount = emi * months;
    const totalInterest = totalAmount - loanAmount;

    setResults({
      monthlyEMI: emi,
      totalInterest,
      totalAmount,
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            EMI Calculator
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Calculate your loan EMI and payment schedule
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Loan Amount
              </label>
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-semibold">
                <IndianRupee className="w-4 h-4" />
                <span>{loanAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <input
              type="range"
              min="100000"
              max="10000000"
              step="100000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>₹1L</span>
              <span>₹1Cr</span>
            </div>
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
              max="20"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-pink-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>5%</span>
              <span>20%</span>
            </div>
          </div>

          {/* Loan Tenure */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Loan Tenure
              </label>
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                <Calendar className="w-4 h-4" />
                <span>{loanTenure} Years</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={loanTenure}
              onChange={(e) => setLoanTenure(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

          {/* Direct Input Fields */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Amount (₹)
              </label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="100000"
                max="10000000"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Rate (%)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="5"
                max="20"
                step="0.1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                Years
              </label>
              <input
                type="number"
                value={loanTenure}
                onChange={(e) => setLoanTenure(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="1"
                max="30"
              />
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {/* Monthly EMI - Large Display */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm opacity-90 mb-2">
              Monthly EMI
            </div>
            <div className="text-4xl font-bold mb-1">
              {formatCurrency(results.monthlyEMI)}
            </div>
            <div className="text-xs opacity-80">
              Pay this amount every month for {loanTenure} years
            </div>
          </div>

          {/* Other Results */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-700 dark:text-blue-400 mb-2">
              Principal Amount
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {formatCurrency(loanAmount)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <div className="text-sm text-red-700 dark:text-red-400 mb-2">
              Total Interest
            </div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-300">
              {formatCurrency(results.totalInterest)}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              @ {interestRate}% for {loanTenure} years
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400 mb-2">
              Total Amount Payable
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-300">
              {formatCurrency(results.totalAmount)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              Principal + Interest over {loanTenure} years
            </div>
          </div>

          {/* Breakdown Chart */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Payment Breakdown
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Principal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {((loanAmount / results.totalAmount) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(loanAmount / results.totalAmount) * 100}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-sm pt-2">
                <span className="text-gray-600 dark:text-gray-400">Interest</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {((results.totalInterest / results.totalAmount) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{
                    width: `${(results.totalInterest / results.totalAmount) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> Consider making prepayments to reduce your total interest burden. 
          Even small additional payments can significantly reduce your loan tenure and interest cost.
        </p>
      </div>
    </div>
  );
}
