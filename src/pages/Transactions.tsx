import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAccounts,
  getCategories,
} from '@/lib/firestore';
import { Transaction, TransactionType, PaymentMethod, Account, Category } from '@/types';
import {
  Plus, Search, Pencil, Trash2, X, Check, Loader2, AlertCircle,
  ArrowUpCircle, ArrowDownCircle, RefreshCw, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  DEFAULT_INCOME_CATEGORIES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INVESTMENT_CATEGORIES,
  PAYMENT_METHOD_LABELS,
} from '@/constants';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

export default function Transactions() {
  const { currentUser, encryptionKey } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'expense' as TransactionType,
    category: '',
    subcategory: '',
    description: '',
    merchant: '',
    accountId: '',
    toAccountId: '',
    paymentMethod: 'cash' as PaymentMethod,
    tags: [] as string[],
    notes: '',
    isRecurring: false,
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!currentUser || !encryptionKey) return;

    try {
      setLoading(true);
      const [txns, accs, cats] = await Promise.all([
        getTransactions(currentUser.uid, encryptionKey, 100),
        getAccounts(currentUser.uid, encryptionKey),
        getCategories(currentUser.uid, encryptionKey),
      ]);
      setTransactions(txns);
      setAccounts(accs);
      setCustomCategories(cats);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: 'expense',
      category: '',
      subcategory: '',
      description: '',
      merchant: '',
      accountId: accounts.length > 0 ? accounts[0].id : '',
      toAccountId: '',
      paymentMethod: 'cash',
      tags: [],
      notes: '',
      isRecurring: false,
    });
    setShowModal(true);
    setError('');
  }

  function openEditModal(transaction: Transaction) {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date.toISOString().split('T')[0],
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      subcategory: transaction.subcategory || '',
      description: transaction.description,
      merchant: transaction.merchant || '',
      accountId: transaction.accountId,
      toAccountId: transaction.toAccountId || '',
      paymentMethod: transaction.paymentMethod,
      tags: transaction.tags || [],
      notes: transaction.notes || '',
      isRecurring: transaction.isRecurring,
    });
    setShowModal(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !encryptionKey) return;

    if (formData.type !== 'transfer' && (!formData.amount || formData.amount <= 0)) {
      setError('Amount must be greater than 0');
      return;
    }
    if (formData.type !== 'transfer' && !formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.accountId) {
      setError('Please select an account');
      return;
    }
    if (formData.type === 'transfer' && !formData.toAccountId) {
      setError('Please select a destination account for the transfer');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const transactionData = {
        date: new Date(formData.date),
        amount: formData.amount,
        type: formData.type,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        description: formData.description,
        toAccountId: formData.type === 'transfer' ? formData.toAccountId : undefined,
        merchant: formData.merchant || undefined,
        accountId: formData.accountId,
        paymentMethod: formData.paymentMethod,
        tags: formData.tags,
        attachments: [],
        isRecurring: formData.isRecurring,
        notes: formData.notes || undefined,
      };

      if (editingTransaction) {
        await updateTransaction(
          currentUser.uid,
          editingTransaction.id,
          editingTransaction,
          transactionData,
          encryptionKey
        );
      } else {
        await createTransaction(currentUser.uid, transactionData, encryptionKey);
      }

      await loadData();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      setError('Failed to save transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(transaction: Transaction) {
    if (!currentUser) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this transaction? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteTransaction(currentUser.uid, transaction.id, transaction);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError('Failed to delete transaction');
    }
  }

  // Combine default and custom categories
  const allCategories = [
    ...DEFAULT_INCOME_CATEGORIES,
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INVESTMENT_CATEGORIES,
    ...customCategories,
  ];

  // Get available categories based on type
  const availableCategories =
    allCategories.filter(c => c.type === formData.type);


  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      searchTerm === '' ||
      txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.merchant && txn.merchant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      txn.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || txn.type === filterType;
    const matchesCategory = filterCategory === 'all' || txn.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Calculate summary
  const summary = {
    totalIncome: transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    totalExpense: transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    totalInvestment: transactions.filter((t) => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0),
  };

  const netSavings = summary.totalIncome - summary.totalExpense - summary.totalInvestment;

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your income, expenses, and investments
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button
                onClick={openAddModal}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <ArrowDownCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs opacity-90">Total Income</div>
                  <div className="text-xl font-bold">{formatCurrency(summary.totalIncome)}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs opacity-90">Total Expenses</div>
                  <div className="text-xl font-bold">{formatCurrency(summary.totalExpense)}</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs opacity-90">Investments</div>
                  <div className="text-xl font-bold">{formatCurrency(summary.totalInvestment)}</div>
                </div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${netSavings >= 0 ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-red-600'} rounded-xl p-4 text-white shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs opacity-90">Net Savings</div>
                  <div className="text-xl font-bold">{formatCurrency(Math.abs(netSavings))}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TransactionType | 'all')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="investment">Investment</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              {allCategories.map((cat, idx) => (
                <option key={idx} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Transactions List - Now Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'No transactions found'
                  : 'No transactions yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || filterType !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Add your first transaction to start tracking'}
              </p>
              {!searchTerm && filterType === 'all' && filterCategory === 'all' && (
                <button
                  onClick={openAddModal}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Transaction
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((txn) => {
                    const account = accounts.find((a) => a.id === txn.accountId);
                    const category = allCategories.find((c) => c.name === txn.category);
                    return (
                      <li key={txn.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category?.icon || '📊'}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{txn.description || txn.category}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(txn.date)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${txn.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{account?.accountName}</p>
                          </div>
                        </div>
                        <div className="flex justify-end items-center mt-2">
                          <button onClick={() => openEditModal(txn)} className="p-2 text-blue-600 dark:text-blue-400"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(txn)} className="p-2 text-red-600 dark:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Account</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTransactions.map((txn) => {
                      const account = accounts.find((a) => a.id === txn.accountId);
                      const category = allCategories.find((c) => c.name === txn.category);
                      return (
                        <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white font-medium">{formatDate(txn.date)}</div><div className="text-xs text-gray-500 dark:text-gray-400">{formatRelativeTime(txn.date)}</div></td>
                          <td className="px-6 py-4"><div className="text-sm text-gray-900 dark:text-white font-medium">{txn.description || 'No description'}</div>{txn.merchant && (<div className="text-xs text-gray-500 dark:text-gray-400">{txn.merchant}</div>)}</td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-2"><span className="text-lg">{category?.icon || '📊'}</span><span className="text-sm text-gray-900 dark:text-white">{txn.category}</span></div></td>
                          <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900 dark:text-white">{account?.accountName || 'Unknown'}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right"><div className={`text-sm font-semibold ${txn.type === 'income' ? 'text-green-600 dark:text-green-400' : txn.type === 'expense' ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400'}`}>{txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}</div><div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{txn.type}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-right"><div className="flex justify-end gap-2"><button onClick={() => openEditModal(txn)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"><Pencil className="w-4 h-4" /></button><button onClick={() => handleDelete(txn)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 className="w-4 h-4" /></button></div></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Transaction Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Type *
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {(['income', 'expense', 'investment', 'transfer'] as TransactionType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type, category: '' })}
                        className={`px-4 py-3 rounded-xl font-medium transition ${formData.type === type
                            ? (type === 'income' ? 'bg-green-600 text-white shadow-lg'
                              : type === 'expense' ? 'bg-red-600 text-white shadow-lg'
                              : type === 'investment' ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-yellow-500 text-white shadow-lg' // transfer
                            )
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                      >
                        <div className="text-2xl mb-1">
                          {type === 'income' && '💰'}
                          {type === 'expense' && '💸'}
                          {type === 'investment' && '📈'}
                          {type === 'transfer' && '🔄'}
                        </div>
                        <div className="capitalize text-sm">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date and Amount Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                </div>

                {/* Category Dropdown */}
                {formData.type !== 'transfer' && (<div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {availableCategories.map((cat, idx) => (
                      <option key={idx} value={cat.name}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>)}

                {/* Account Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {formData.type === 'transfer' ? 'From Account *' : 'Account *'}
                  </label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select an account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.accountName} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* To Account Dropdown (for transfers) */}
                {formData.type === 'transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      To Account *
                    </label>
                    <select
                      value={formData.toAccountId}
                      onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    >
                      <option value="">Select destination account</option>
                      {accounts.filter(acc => acc.id !== formData.accountId).map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.accountName} ({formatCurrency(acc.balance)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="E.g., Weekly groceries"
                  />
                </div>

                {/* Merchant and Payment Method Row */}
                {formData.type !== 'transfer' && (<div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Merchant/Payee
                    </label>
                    <input
                      type="text"
                      value={formData.merchant}
                      onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="E.g., Amazon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>)}

                {/* Notes Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
