import { Transaction, Account, Investment, Budget } from '@/types';
import { formatCurrency, formatDate } from './utils';

/**
 * Export transactions to CSV
 */
export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = [
    'Date',
    'Type',
    'Category',
    'Description',
    'Merchant',
    'Amount',
    'Payment Method',
    'Account',
    'Tags',
    'Notes'
  ];

  const rows = transactions.map(txn => [
    formatDate(txn.date),
    txn.type,
    txn.category,
    txn.description,
    txn.merchant || '',
    txn.amount.toString(),
    txn.paymentMethod,
    txn.accountId,
    txn.tags?.join('; ') || '',
    txn.notes || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Export accounts to CSV
 */
export function exportAccountsToCSV(accounts: Account[]): string {
  const headers = [
    'Account Name',
    'Account Type',
    'Bank Name',
    'Balance',
    'Currency',
    'Status',
    'Created Date'
  ];

  const rows = accounts.map(acc => [
    acc.accountName,
    acc.accountType,
    acc.bankName || '',
    acc.balance.toString(),
    acc.currency,
    acc.isActive ? 'Active' : 'Inactive',
    formatDate(acc.createdAt)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Export investments to CSV
 */
export function exportInvestmentsToCSV(investments: Investment[]): string {
  const headers = [
    'Investment Name',
    'Type',
    'Units',
    'Purchase Price',
    'Current Price',
    'Invested Value',
    'Current Value',
    'Returns',
    'Returns %',
    'Purchase Date',
    'Maturity Date'
  ];

  const rows = investments.map(inv => {
    const units = inv.units || 1;
    const invested = inv.purchasePrice * units;
    const current = inv.currentPrice * units;
    const returns = current - invested;
    const returnsPercent = invested > 0 ? (returns / invested) * 100 : 0;

    return [
      inv.name,
      inv.investmentType,
      units.toString(),
      inv.purchasePrice.toString(),
      inv.currentPrice.toString(),
      invested.toString(),
      current.toString(),
      returns.toString(),
      returnsPercent.toFixed(2),
      formatDate(inv.purchaseDate),
      inv.maturityDate ? formatDate(inv.maturityDate) : ''
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate Financial Report (Plain Text)
 */
export function generateTextReport(
  transactions: Transaction[],
  accounts: Account[],
  investments: Investment[],
  period: { start: Date; end: Date }
): string {
  const filteredTransactions = transactions.filter(
    txn => txn.date >= period.start && txn.date <= period.end
  );

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalInvestment = filteredTransactions
    .filter(t => t.type === 'investment')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpense - totalInvestment;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const totalAccountBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const totalInvested = investments.reduce((sum, inv) => {
    const units = inv.units || 1;
    return sum + (inv.purchasePrice * units);
  }, 0);

  const totalCurrentValue = investments.reduce((sum, inv) => {
    const units = inv.units || 1;
    return sum + (inv.currentPrice * units);
  }, 0);

  const investmentReturns = totalCurrentValue - totalInvested;

  const report = `
ARTHSATHI FINANCIAL REPORT
Period: ${formatDate(period.start)} to ${formatDate(period.end)}
Generated: ${formatDate(new Date())}

═══════════════════════════════════════════════════════════

INCOME & EXPENSE SUMMARY
─────────────────────────────────────────────────────────
Total Income:              ${formatCurrency(totalIncome)}
Total Expenses:            ${formatCurrency(totalExpense)}
Total Investments:         ${formatCurrency(totalInvestment)}
─────────────────────────────────────────────────────────
Net Savings:               ${formatCurrency(netSavings)}
Savings Rate:              ${savingsRate.toFixed(1)}%

═══════════════════════════════════════════════════════════

ACCOUNTS SUMMARY
─────────────────────────────────────────────────────────
Total Accounts:            ${accounts.length}
Active Accounts:           ${accounts.filter(a => a.isActive).length}
Total Balance:             ${formatCurrency(totalAccountBalance)}

═══════════════════════════════════════════════════════════

INVESTMENT SUMMARY
─────────────────────────────────────────────────────────
Total Investments:         ${investments.length}
Total Invested:            ${formatCurrency(totalInvested)}
Current Value:             ${formatCurrency(totalCurrentValue)}
Returns:                   ${formatCurrency(investmentReturns)}
Returns %:                 ${totalInvested > 0 ? ((investmentReturns / totalInvested) * 100).toFixed(2) : 0}%

═══════════════════════════════════════════════════════════

TRANSACTIONS
─────────────────────────────────────────────────────────
Total Transactions:        ${filteredTransactions.length}
Income Transactions:       ${filteredTransactions.filter(t => t.type === 'income').length}
Expense Transactions:      ${filteredTransactions.filter(t => t.type === 'expense').length}
Investment Transactions:   ${filteredTransactions.filter(t => t.type === 'investment').length}

═══════════════════════════════════════════════════════════

TOP EXPENSE CATEGORIES
─────────────────────────────────────────────────────────
${getTopExpenseCategories(filteredTransactions, 5)}

═══════════════════════════════════════════════════════════

This report was generated by Arthsathi - Your Financial Companion
For more details, visit your dashboard at https://arthsathi.app
  `;

  return report.trim();
}

function getTopExpenseCategories(transactions: Transaction[], limit: number): string {
  const categoryTotals: Record<string, number> = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(txn => {
      categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
    });

  const sorted = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit);

  return sorted
    .map(([category, amount], index) => 
      `${index + 1}. ${category.padEnd(25)} ${formatCurrency(amount)}`
    )
    .join('\n');
}

/**
 * Export all data to JSON (for backup)
 */
export function exportAllDataToJSON(
  transactions: Transaction[],
  accounts: Account[],
  investments: Investment[],
  budgets: Array<Budget & { spent: number; percentage: number }>
): string {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    data: {
      transactions,
      accounts,
      investments,
      budgets,
    },
    summary: {
      totalTransactions: transactions.length,
      totalAccounts: accounts.length,
      totalInvestments: investments.length,
      totalBudgets: budgets.length,
    }
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Download JSON file
 */
export function downloadJSON(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download text file
 */
export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// UPDATE: src/App.tsx - Add Reports Route
// ============================================

/*
Add this import at the top:
import ReportsPage from '@/pages/Reports';

Add this route after calculators:
<Route
  path="/reports"
  element={
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  }
/>
*/

// ============================================
// Complete Updated App.tsx
// ============================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ResetPassword from '@/pages/ResetPassword';
import LandingPage from '@/pages/Landing';
import DashboardPage from '@/pages/Dashboard';
import AccountsPage from '@/pages/Accounts';
import TransactionsPage from '@/pages/Transactions';
import BudgetsPage from '@/pages/Budgets';
import InvestmentsPage from '@/pages/Investments';
import CalculatorsPage from '@/pages/Calculators';
import ReportsPage from '@/pages/Reports';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <ProtectedRoute>
                  <AccountsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budgets"
              element={
                <ProtectedRoute>
                  <BudgetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/investments"
              element={
                <ProtectedRoute>
                  <InvestmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calculators"
              element={
                <ProtectedRoute>
                  <CalculatorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
