// ============================================
// FILE: src/pages/Dashboard.tsx - ENHANCED VERSION
// Replace the existing Dashboard.tsx with this complete version
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, Briefcase, FileText, CreditCard, 
  PieChart, BarChart3, IndianRupee, ArrowUpCircle, 
  ArrowDownCircle, Wallet, Target, Calendar, Loader2
} from 'lucide-react';
import { 
  getTransactions, 
  getAccounts, 
  getInvestments,
  getBudgetsWithSpending 
} from '@/lib/firestore';
import { Transaction, Account, Investment, Budget } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { userProfile, currentUser, encryptionKey } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [budgets, setBudgets] = useState<Array<Budget & { spent: number; percentage: number }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    if (!currentUser || !encryptionKey) return;

    try {
      setLoading(true);
      const [txns, accs, invs, budgs] = await Promise.all([
        getTransactions(currentUser.uid, encryptionKey, 100),
        getAccounts(currentUser.uid, encryptionKey),
        getInvestments(currentUser.uid, encryptionKey),
        getBudgetsWithSpending(currentUser.uid, encryptionKey),
      ]);
      
      setTransactions(txns);
      setAccounts(accs);
      setInvestments(invs);
      setBudgets(budgs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate metrics
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const monthlyTransactions = transactions.filter(t => t.date >= firstDayOfMonth);
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlySavings = monthlyIncome - monthlyExpense;
  
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const totalInvested = investments.reduce((sum, inv) => {
    const units = inv.units || 1;
    return sum + (inv.purchasePrice * units);
  }, 0);
  
  const totalCurrentValue = investments.reduce((sum, inv) => {
    const units = inv.units || 1;
    return sum + (inv.currentPrice * units);
  }, 0);
  
  const investmentReturns = totalCurrentValue - totalInvested;
  const returnsPercentage = totalInvested > 0 ? (investmentReturns / totalInvested) * 100 : 0;

  const netWorth = totalBalance + totalCurrentValue;

  // Recent Activity Chart Data (Last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const activityData = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => 
      t.date.toDateString() === date.toDateString()
    );
    
    const income = dayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      day: date.toLocaleDateString('en-IN', { weekday: 'short' }),
      income,
      expense,
    };
  });

  // Expense by Category (Pie Chart)
  const categoryData = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

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
                <div className="text-3xl font-bold">{formatCurrency(netWorth)}</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm opacity-90">
              {returnsPercentage >= 0 ? '+' : ''}{returnsPercentage.toFixed(1)}% overall return
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Income</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(monthlyIncome)}</div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">This month</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Expenses</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(monthlyExpense)}</div>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {monthlyIncome > 0 ? ((monthlyExpense / monthlyIncome) * 100).toFixed(1) : 0}% of income
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm opacity-90 mb-1">Investments</div>
                <div className="text-3xl font-bold">{formatCurrency(totalCurrentValue)}</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="text-sm opacity-90">
              {formatCurrency(investmentReturns)} returns
            </div>
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

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Last 7 Days Activity
            </h3>
            {activityData.some(d => d.income > 0 || d.expense > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium mb-1">No activity yet</p>
                  <p className="text-sm">Start adding transactions to see your activity</p>
                </div>
              </div>
            )}
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <PieChart className="w-6 h-6" />
              Expense Breakdown
            </h3>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <PieChart className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-lg font-medium mb-1">No expenses yet</p>
                  <p className="text-sm">Add expenses to see category breakdown</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Recent Transactions
            </h3>
            <button
              onClick={() => navigate('/transactions')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All →
            </button>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((txn) => (
                <div 
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      txn.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : txn.type === 'expense'
                        ? 'bg-red-100 dark:bg-red-900/30'
                        : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {txn.type === 'income' && <ArrowDownCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                      {txn.type === 'expense' && <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                      {txn.type === 'investment' && <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {txn.description || txn.category}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {txn.category} • {txn.date.toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${
                    txn.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
              <button
                onClick={() => navigate('/transactions')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Your First Transaction
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
