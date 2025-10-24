import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Calculator,
  TrendingUp,
  Home,
  GraduationCap,
  PiggyBank,
  CreditCard,
  Users,
  Calendar,
  DollarSign,
  Percent
} from 'lucide-react';
import SIPCalculator from '@/components/calculators/SIPCalculator';
import EMICalculator from '@/components/calculators/EMICalculator';
import RetirementCalculator from '@/components/calculators/RetirementCalculator';
import TaxCalculator from '@/components/calculators/TaxCalculator';
import LumpsumCalculator from '@/components/calculators/LumpsumCalculator';
import FDCalculator from '@/components/calculators/FDCalculator';
import PPFCalculator from '@/components/calculators/PPFCalculator';
import InflationCalculator from '@/components/calculators/InflationCalculator';
import SSYCalculator from '@/components/calculators/SSYCalculator';

type CalculatorType = 
  | 'sip'
  | 'emi'
  | 'retirement'
  | 'tax'
  | 'lumpsum'
  | 'fd'
  | 'ppf'
  | 'inflation'
  | 'ssy';

export default function Calculators() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorType>('sip');

  const calculators = [
    {
      id: 'sip' as CalculatorType,
      name: 'SIP Calculator',
      description: 'Calculate returns on Systematic Investment Plans',
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-600',
      component: SIPCalculator,
    },
    {
      id: 'emi' as CalculatorType,
      name: 'EMI Calculator',
      description: 'Calculate loan EMIs and payment schedules',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-600',
      component: EMICalculator,
    },
    {
      id: 'retirement' as CalculatorType,
      name: 'Retirement Planner',
      description: 'Plan your retirement corpus',
      icon: Users,
      color: 'from-green-500 to-emerald-600',
      component: RetirementCalculator,
    },
    {
      id: 'tax' as CalculatorType,
      name: 'Income Tax Calculator',
      description: 'Calculate tax liability (Old vs New regime)',
      icon: Calculator,
      color: 'from-red-500 to-orange-600',
      component: TaxCalculator,
    },
    {
      id: 'lumpsum' as CalculatorType,
      name: 'Lumpsum Calculator',
      description: 'Calculate returns on one-time investments',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      component: LumpsumCalculator,
    },
    {
      id: 'fd' as CalculatorType,
      name: 'FD Calculator',
      description: 'Calculate Fixed Deposit maturity amount',
      icon: PiggyBank,
      color: 'from-cyan-500 to-blue-600',
      component: FDCalculator,
    },
    {
      id: 'ppf' as CalculatorType,
      name: 'PPF Calculator',
      description: 'Calculate PPF returns and maturity',
      icon: Home,
      color: 'from-indigo-500 to-purple-600',
      component: PPFCalculator,
    },
    {
      id: 'inflation' as CalculatorType,
      name: 'Inflation Calculator',
      description: 'Estimate future value adjusted for inflation',
      icon: Percent,
      color: 'from-pink-500 to-red-600',
      component: InflationCalculator,
    },
    {
      id: 'ssy' as CalculatorType,
      name: 'SSY Calculator',
      description: 'For Sukanya Samriddhi Yojana scheme',
      icon: GraduationCap,
      color: 'from-rose-500 to-pink-600',
      component: SSYCalculator,
    },
  ];

  const ActiveCalculatorComponent = calculators.find(
    (calc) => calc.id === activeCalculator
  )?.component;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Financial Calculators
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Plan your financial goals with powerful calculators
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            const isActive = activeCalculator === calc.id;

            return (
              <button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                className={`p-4 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-br ' + calc.color + ' text-white shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive
                        ? 'bg-white/20'
                        : 'bg-gradient-to-br ' + calc.color
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-white'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold mb-1 ${
                        isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {calc.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        isActive ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {calc.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {ActiveCalculatorComponent && <ActiveCalculatorComponent />}
        </div>
      </div>
    </DashboardLayout>
  );
}