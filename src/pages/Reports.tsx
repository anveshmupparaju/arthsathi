import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getTransactions,
  getAccounts,
  getInvestments,
  getBudgetsWithSpending,
} from '@/lib/firestore';
import { Transaction, Account, Investment, Budget } from '@/types';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Loader2,
  FileText,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import SpendingTrendsChart from '@/components/reports/SpendingTrendsChart';
import CategoryBreakdownChart from '@/components/reports/CategoryBreakdownChart';
import IncomeVsExpenseChart from '@/components/reports/IncomeVsExpenseChart';
import NetWorthChart from '@/components/reports/NetWorthChart';
import MonthlyComparisonChart from '@/components/reports/MonthlyComparisonChart';

type ReportPeriod = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

export default function Reports() {
  const { currentUser, encryptionKey } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ReportPeriod>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [budgets, setBudgets] = useState<Array<Budget & { spent: number; percentage: number }>>([]);
  
  // Analytics states
  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalInvestment: 0,
    netSavings: 0,
    savingsRate: 0,
    topExpenseCategory: '',
    topExpenseAmount: 0,
    transactionCount: 0,
    averageTransactionSize: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      calculateAnalytics();
    }
  }, [transactions, period, customStartDate, customEndDate]);

  async function loadData() {
    if (!currentUser || !encryptionKey) return;

    try {
      setLoading(true);
      const [txns, accs, invs, budgs] = await Promise.all([
        getTransactions(currentUser.uid, encryptionKey, 500),
        getAccounts(currentUser.uid, encryptionKey),
        getInvestments(currentUser.uid, encryptionKey),
        getBudgetsWithSpending(currentUser.uid, encryptionKey),
      ]);
      
      setTransactions(txns);
      setAccounts(accs);
      setInvestments(invs);
      setBudgets(budgs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getDateRange(): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
      case 'this_month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last_month':
        start.setMonth(now.getMonth() - 1);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(now.getMonth() - 1);
        end.setDate(new Date(now.getFullYear(), now.getMonth(), 0).getDate());
        end.setHours(23, 59, 59, 999);
        break;
      case 'last_3_months':
        start.setMonth(now.getMonth() - 3);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last_6_months':
        start.setMonth(now.getMonth() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'this_year':
        start.setMonth(0);
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : start,
          end: customEndDate ? new Date(customEndDate) : end,
        };
    }

    return { start, end };
  }

  function calculateAnalytics() {
    const { start, end } = getDateRange();
    
    const filteredTransactions = transactions.filter(
      (txn) => txn.date >= start && txn.date <= end
    );

    const totalIncome = filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInvestment = filteredTransactions
      .filter((t) => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpense - totalInvestment;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    // Calculate top expense category
    const expensesByCategory = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategory = Object.entries(expensesByCategory).sort(
      ([, a], [, b]) => b - a
    )[0];

    const transactionCount = filteredTransactions.length;
    const averageTransactionSize =
      transactionCount > 0 ? (totalIncome + totalExpense + totalInvestment) / transactionCount : 0;

    setAnalytics({
      totalIncome,
      totalExpense,
      totalInvestment,
      netSavings,
      savingsRate,
      topExpenseCategory: topCategory?.[0] || 'N/A',
      topExpenseAmount: topCategory?.[1] || 0,
      transactionCount,
      averageTransactionSize,
    });
  }

  function getPeriodLabel(): string {
    switch (period) {
      case 'this_month':
        return 'This Month';
      case 'last_month':
        return 'Last Month';
      case 'last_3_months':
        return 'Last 3 Months';
      case 'last_6_months':
        return 'Last 6 Months';
      case 'this_year':
        return 'This Year';
      case 'custom':
        return 'Custom Period';
      default:
        return 'This Month';
    }
  }

  async function exportToPDF() {
    alert('PDF export coming soon! This will generate a comprehensive financial report.');
  }

  async function exportToExcel() {
    alert('Excel export coming soon! This will export all your data to a spreadsheet.');
  }

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visualize your financial data and insights
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Export PDF
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export Excel
              </button>
            </div>
          </div>

          {/* Period Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Period:
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(['this_month', 'last_month', 'last_3_months', 'last_6_months', 'this_year', 'custom'] as ReportPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      period === p
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {p === 'this_month' && 'This Month'}
                    {p === 'last_month' && 'Last Month'}
                    {p === 'last_3_months' && 'Last 3M'}
                    {p === 'last_6_months' && 'Last 6M'}
                    {p === 'this_year' && 'This Year'}
                    {p === 'custom' && 'Custom'}
                  </button>
                ))}
              </div>

              {period === 'custom' && (
                <div className="flex gap-2 ml-auto">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="self-center text-gray-500">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Total Income</div>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalIncome)}</div>
              </div>
            </div>
            <div className="text-xs opacity-80">{getPeriodLabel()}</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Total Expenses</div>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalExpense)}</div>
              </div>
            </div>
            <div className="text-xs opacity-80">{getPeriodLabel()}</div>
          </div>

          <div className={`bg-gradient-to-br ${analytics.netSavings >= 0 ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-red-600'} rounded-xl p-6 text-white shadow-lg`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Net Savings</div>
                <div className="text-2xl font-bold">{formatCurrency(Math.abs(analytics.netSavings))}</div>
              </div>
            </div>
            <div className="text-xs opacity-80">
              {analytics.savingsRate.toFixed(1)}% of income
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Transactions</div>
                <div className="text-2xl font-bold">{analytics.transactionCount}</div>
              </div>
            </div>
            <div className="text-xs opacity-80">
              Avg: {formatCurrency(analytics.averageTransactionSize)}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income vs Expense */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Income vs Expense
            </h3>
            <IncomeVsExpenseChart transactions={transactions} period={getDateRange()} />
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Expense by Category
            </h3>
            <CategoryBreakdownChart transactions={transactions} period={getDateRange()} />
          </div>
        </div>

        {/* Spending Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Spending Trends
          </h3>
          <SpendingTrendsChart transactions={transactions} period={getDateRange()} />
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Monthly Comparison
          </h3>
          <MonthlyComparisonChart transactions={transactions} />
        </div>

        {/* Net Worth Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Net Worth Trend
          </h3>
          <NetWorthChart 
            accounts={accounts} 
            investments={investments}
            transactions={transactions}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
