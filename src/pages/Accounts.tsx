import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getActiveAccounts
} from '@/lib/firestore';
import { Account, AccountType } from '@/types';
import {
    Plus, Pencil, Trash2, Eye, EyeOff, CreditCard,
    Wallet, TrendingUp, AlertCircle, Loader2, X, Check
} from 'lucide-react';
import { ACCOUNT_TYPE_LABELS, CURRENCY_OPTIONS } from '@/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import AccountFormFields from '@/components/accounts/AccountFormFields';
import DashboardLayout from '@/components/DashboardLayout';

export default function Accounts() {
    const { currentUser, encryptionKey } = useAuth();
    const [allAccounts, setAllAccounts] = useState<Account[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        accountName: '',
        accountType: 'savings' as AccountType,
        bankName: '',
        accountNumber: '',
        balance: 0,
        currency: 'INR',
        isActive: true,
        // Credit Card
        creditLimit: 0,
        statementDate: 1,
        dueDate: 1,
        // Loan
        loanAmount: 0,
        interestRate: 0,
        interestRateHistory: [],
        tenure: 0,
        emiAmount: 0,
        emiDate: 1,
        autoDebit: false,
        autoDebitAccountId: '',
        // Investments (FD/RD etc)
        principalAmount: 0,
        maturityDate: '',
        maturityAmount: 0,
        installmentAmount: 0,
        // Demat
        brokerName: '',
        depository: '',
        dpId: '',
        clientId: '',
    });

    // Load accounts
    const loadAccounts = useCallback(async () => {
        if (!currentUser || !encryptionKey) return;

        try {
            setLoading(true);
            const [all, active] = await Promise.all([
                getAccounts(currentUser.uid, encryptionKey),
                getActiveAccounts(currentUser.uid, encryptionKey)
            ]);
            setAccounts(all);
            setAllAccounts(active);
        } catch (error) {
            console.error('Error loading accounts:', error);
            setError('Failed to load accounts');
        } finally {
            setLoading(false);
        }
    }, [currentUser, encryptionKey]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    function openAddModal() {
        setEditingAccount(null);
        setFormData({
            accountName: '',
            accountType: 'savings',
            bankName: '',
            accountNumber: '',
            balance: 0,
            currency: 'INR',
            isActive: true,
            creditLimit: 0,
            statementDate: 1,
            dueDate: 1,
            loanAmount: 0,
            interestRate: 0,
            interestRateHistory: [],
            tenure: 0,
            emiAmount: 0,
            emiDate: 1,
            autoDebit: false,
            autoDebitAccountId: '',
            principalAmount: 0,
            maturityDate: '',
            maturityAmount: 0,
            installmentAmount: 0,
            brokerName: '',
            depository: '',
            dpId: '',
            clientId: '',
        });
        setShowModal(true);
        setError('');
    }

    function openEditModal(account: Account) {
        setEditingAccount(account);
        setFormData({
            accountName: account.accountName,
            accountType: account.accountType,
            bankName: account.bankName || '',
            accountNumber: account.accountNumber || '',
            balance: account.balance,
            currency: account.currency,
            isActive: account.isActive,
            creditLimit: account.creditLimit || 0,
            statementDate: account.statementDate || 1,
            dueDate: account.dueDate || 1,
            loanAmount: account.loanAmount || 0,
            interestRate: account.interestRate || 0,
            interestRateHistory: account.interestRateHistory || [],
            tenure: account.tenure || 0,
            emiAmount: account.emiAmount || 0,
            emiDate: account.emiDate || 1,
            autoDebit: account.autoDebit || false,
            autoDebitAccountId: account.autoDebitAccountId || '',
            principalAmount: account.principalAmount || 0,
            maturityDate: account.maturityDate ? new Date(account.maturityDate).toISOString().split('T')[0] : '',
            maturityAmount: account.maturityAmount || 0,
            installmentAmount: account.installmentAmount || 0,
            brokerName: account.brokerName || '',
            depository: account.depository || '',
            dpId: account.dpId || '',
            clientId: account.clientId || '',
        });
        setShowModal(true);
        setError('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser || !encryptionKey) return;

        // Validation
        if (!formData.accountName.trim()) {
            setError('Account name is required');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const accountData = {
                ...formData,
            }; // formData now matches the required structure

            if (editingAccount) {
                // Update existing account
                await updateAccount(
                    currentUser.uid,
                    editingAccount.id,
                    accountData,
                    encryptionKey
                );
            } else {
                // Create new account
                await createAccount(currentUser.uid, accountData, encryptionKey);
            }

            await loadAccounts();
            setShowModal(false);
        } catch (error: any) {
            console.error('Error saving account:', error);
            setError('Failed to save account. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(account: Account) {
        if (!currentUser) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${account.accountName}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteAccount(currentUser.uid, account.id);
            await loadAccounts();
        } catch (error) {
            console.error('Error deleting account:', error);
            setError('Failed to delete account');
        }
    }

    // Calculate totals
    const totalBalance = accounts
        .filter(a => a.isActive)
        .reduce((sum, a) => sum + a.balance, 0);

    const activeAccounts = accounts.filter(a => a.isActive).length;
    const inactiveAccounts = accounts.filter(a => !a.isActive).length;

    // Group accounts by type
    const accountsByType = accounts.reduce((groups, account) => {
        const type = account.accountType;
        if (!groups[type]) groups[type] = [];
        groups[type].push(account);
        return groups;
    }, {} as Record<string, Account[]>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Accounts</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Manage your bank accounts, investments, and loans
                            </p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Account
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Total Balance</div>
                                    <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                    <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Active Accounts</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeAccounts}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Accounts</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{accounts.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Accounts List */}
                {accounts.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No accounts yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Add your first account to start tracking your finances
                        </p>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Account
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(accountsByType).map(([type, typeAccounts]) => (
                            <div key={type}>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {ACCOUNT_TYPE_LABELS[type] || type}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {typeAccounts.map((account) => (
                                        <div
                                            key={account.id}
                                            className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-2 shadow-lg hover:shadow-xl transition ${account.isActive
                                                    ? 'border-gray-200 dark:border-gray-700'
                                                    : 'border-gray-300 dark:border-gray-600 opacity-60'
                                                }`}
                                        >
                                            {/* Account Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                        {account.accountName}
                                                    </h3>
                                                    {account.bankName && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {account.bankName}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${account.isActive
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {account.isActive ? 'Active' : 'Inactive'}
                                                </div>
                                            </div>

                                            {/* Balance */}
                                            <div className="mb-4">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Balance</div>
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(account.balance, account.currency)}
                                                </div>
                                            </div>

                                            {/* Account Number (masked) */}
                                            {account.accountNumber && (
                                                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Number</div>
                                                    <div className="font-mono text-sm text-gray-900 dark:text-white">
                                                        ••••  ••••  {account.accountNumber.slice(-4)}
                                                    </div>
                                                </div>
                                            )}

                                            {/* EMI Details for Loan Accounts */}
                                            {account.accountType.includes('_loan') && (
                                                <div className="space-y-2 mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
                                                    {account.emiAmount && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">EMI Amount</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.emiAmount)}</span>
                                                        </div>
                                                    )}
                                                    {account.emiDate && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">EMI Date</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {account.emiDate}{account.emiDate === 1 ? 'st' : account.emiDate === 2 ? 'nd' : account.emiDate === 3 ? 'rd' : 'th'} of every month
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Demat/Trading Details */}
                                            {(account.accountType === 'demat' || account.accountType === 'trading') && (
                                                <div className="space-y-2 mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-xs">
                                                    {account.brokerName && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Broker</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{account.brokerName}</span>
                                                        </div>
                                                    )}
                                                    {(account.dpId || account.clientId) && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Client/DP ID</span>
                                                            <span className="font-medium text-gray-900 dark:text-white font-mono">{account.dpId}{account.clientId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Credit Card Details */}
                                            {account.accountType === 'credit_card' && (
                                                <div className="space-y-2 mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-xs">
                                                    {account.creditLimit && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Credit Limit</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(account.creditLimit)}</span>
                                                        </div>
                                                    )}
                                                    {account.statementDate && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Statement Date</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {account.statementDate}{account.statementDate === 1 ? 'st' : account.statementDate === 2 ? 'nd' : account.statementDate === 3 ? 'rd' : 'th'} of month
                                                            </span>
                                                        </div>
                                                    )}
                                                    {account.dueDate && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Due Date</span>
                                                            <span className="font-medium text-gray-900 dark:text-white">
                                                                {account.dueDate}{account.dueDate === 1 ? 'st' : account.dueDate === 2 ? 'nd' : account.dueDate === 3 ? 'rd' : 'th'} of month
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Investment Details */}
                                            {['fixed_deposit', 'recurring_deposit'].includes(account.accountType) && (
                                                <div className="space-y-2 mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-xs">
                                                    {account.maturityAmount && (
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Matures at {formatCurrency(account.maturityAmount)}</span>
                                                            {account.maturityDate && (
                                                                <span className="font-medium text-gray-900 dark:text-white">on {formatDate(account.maturityDate)}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => openEditModal(account)}
                                                    className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition flex items-center justify-center gap-2"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(account)}
                                                    className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </button>
                                            </div>

                                            {/* Last Updated */}
                                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                                                Updated {formatDate(account.updatedAt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {editingAccount ? 'Edit Account' : 'Add New Account'}
                                    </h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Account Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Account Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.accountName}
                                        onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="My Savings Account"
                                        required
                                    />
                                </div>

                                {/* Account Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Account Type *
                                    </label>
                                    <select
                                        value={formData.accountType}
                                        onChange={(e) => setFormData({ ...formData, accountType: e.target.value as AccountType })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bank Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Bank / Institution Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.bankName}
                                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="State Bank of India"
                                    />
                                </div>

                                {/* Account Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.accountNumber}
                                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                                        placeholder="1234567890"
                                    />
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        🔒 This will be encrypted and stored securely
                                    </p>
                                </div>

                                <AccountFormFields
                                    accountType={formData.accountType}
                                    formData={formData}
                                    setFormData={setFormData}
                                    allAccounts={allAccounts}
                                />

                                {/* Balance & Currency */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Current Balance *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.balance}
                                            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Currency
                                        </label>
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            {CURRENCY_OPTIONS.map((currency) => (
                                                <option key={currency.code} value={currency.code}>
                                                    {currency.symbol} {currency.code} - {currency.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mark this account as active
                                    </label>
                                </div>

                                {/* Buttons */}
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
                                                {editingAccount ? 'Update Account' : 'Add Account'}
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
