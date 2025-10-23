// ============================================
// FILE: src/pages/Dashboard.tsx (UPDATED - Add Navigation)
// ============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, Briefcase, FileText, CreditCard, 
  PieChart, BarChart3, IndianRupee 
} from 'lucide-react';

export default function Dashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {userProfile?.displayName?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your financial overview for today
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm opacity-90 mb-1">Net Worth</div>
                <div className="text-3xl font-bold">₹12.4L</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm opacity-90">+12.5% from last month</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Income</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">₹85,000</div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Salary credited</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Expenses</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">₹52,340</div>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400 transform rotate-180" />
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">61.6% of income</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm opacity-90 mb-1">Investments</div>
                <div className="text-3xl font-bold">₹8.2L</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm opacity-90">+18.3% returns (XIRR)</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => navigate('/transactions')}
            className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-blue-600 dark:text-blue-400 text-2xl">→</span>
            </div>
            <div className="text-blue-600 dark:text-blue-400 font-semibold text-lg mb-1">Add Transaction</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Record a new expense or income</div>
          </button>
          
          <button 
            onClick={() => navigate('/accounts')}
            className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-green-600 dark:text-green-400 text-2xl">→</span>
            </div>
            <div className="text-green-600 dark:text-green-400 font-semibold text-lg mb-1">Add Account</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Link a new bank or investment account</div>
          </button>
          
          <button 
            onClick={() => navigate('/budgets')}
            className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition text-left group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <span className="text-purple-600 dark:text-purple-400 text-2xl">→</span>
            </div>
            <div className="text-purple-600 dark:text-purple-400 font-semibold text-lg mb-1">Create Budget</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Set spending limits for categories</div>
          </button>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium mb-1">Coming Soon</p>
              <p className="text-sm">Transaction history will appear here in Module 4</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
