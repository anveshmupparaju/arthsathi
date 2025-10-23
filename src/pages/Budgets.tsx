// ============================================
// FILE: src/pages/Budgets.tsx - PART 1
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
    getBudgetsWithSpending,
    createBudget,
    updateBudget,
    deleteBudget,
} from '@/lib/firestore';
import { Budget } from '@/types';
import {
    Plus, Pencil, Trash2, X, Check, Loader2, AlertCircle,
    TrendingUp, PieChart, AlertTriangle, CheckCircle2, Target
} from 'lucide-react';
import {
    DEFAULT_EXPENSE_CATEGORIES,
} from '@/constants';
import { formatCurrency } from '@/lib/utils';

export default function Budgets() {
    const { currentUser, encryptionKey } = useAuth();
    const [budgets, setBudgets] = useState<Array<Budget & { spent: number; percentage: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        categoryIds: [] as string[],
        amount: 0,
        period: 'monthly' as 'monthly' | 'yearly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        rollover: false,
        alertThreshold: 80,
        isActive: true,
    });

    useEffect(() => {
        loadBudgets();
    }, []);

    async function loadBudgets() {
        if (!currentUser || !encryptionKey) return;

        try {
            setLoading(true);
            const data = await getBudgetsWithSpending(currentUser.uid, encryptionKey);
            setBudgets(data);
        } catch (error) {
            console.error('Error loading budgets:', error);
            setError('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingBudget(null);
        setFormData({
            name: '',
            categoryIds: [],
            amount: 0,
            period: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            rollover: false,
            alertThreshold: 80,
            isActive: true,
        });
        setShowModal(true);
        setError('');
    }

    function openEditModal(budget: Budget) {
        setEditingBudget(budget);
        setFormData({
            name: budget.name,
            categoryIds: budget.categoryIds,
            amount: budget.amount,
            period: budget.period,
            startDate: budget.startDate.toISOString().split('T')[0],
            endDate: budget.endDate ? budget.endDate.toISOString().split('T')[0] : '',
            rollover: budget.rollover,
            alertThreshold: budget.alertThreshold,
            isActive: budget.isActive,
        });
        setShowModal(true);
        setError('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser || !encryptionKey) return;

        if (!formData.name.trim()) {
            setError('Budget name is required');
            return;
        }
        if (formData.categoryIds.length === 0) {
            setError('Please select at least one category');
            return;
        }
        if (!formData.amount || formData.amount <= 0) {
            setError('Amount must be greater than 0');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const budgetData = {
                name: formData.name,
                categoryIds: formData.categoryIds,
                amount: formData.amount,
                period: formData.period,
                startDate: new Date(formData.startDate),
                endDate: formData.endDate ? new Date(formData.endDate) : undefined,
                rollover: formData.rollover,
                alertThreshold: formData.alertThreshold,
                isActive: formData.isActive,
            };

            if (editingBudget) {
                await updateBudget(currentUser.uid, editingBudget.id, budgetData, encryptionKey);
            } else {
                await createBudget(currentUser.uid, budgetData, encryptionKey);
            }

            await loadBudgets();
            setShowModal(false);
        } catch (error: any) {
            console.error('Error saving budget:', error);
            setError('Failed to save budget. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(budget: Budget) {
        if (!currentUser) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${budget.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteBudget(currentUser.uid, budget.id);
            await loadBudgets();
        } catch (error) {
            console.error('Error deleting budget:', error);
            setError('Failed to delete budget');
        }
    }

    function toggleCategory(categoryName: string) {
        if (formData.categoryIds.includes(categoryName)) {
            setFormData({
                ...formData,
                categoryIds: formData.categoryIds.filter((c) => c !== categoryName),
            });
        } else {
            setFormData({
                ...formData,
                categoryIds: [...formData.categoryIds, categoryName],
            });
        }
    }

    // Calculate totals
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </DashboardLayout>
        );
    }

    // ============================================
    // PART 2: Add this after Part 1 (after loading check)
    // This is the RETURN statement - Header, Summary, and Budget Cards
    // ============================================

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Set spending limits and track your progress
                            </p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Budget
                        </button>
                    </div>

                    {/* Overall Summary */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm opacity-90 mb-1">Overall Budget Progress</div>
                                <div className="text-3xl font-bold">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</div>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                <PieChart className="w-8 h-8" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="opacity-90">Progress</span>
                                <span className="font-semibold">{totalPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all ${totalPercentage >= 100
                                            ? 'bg-red-400'
                                            : totalPercentage >= 80
                                                ? 'bg-yellow-400'
                                                : 'bg-green-400'
                                        }`}
                                    style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                                />
                            </div>
                            <div className="text-sm opacity-90">
                                {totalBudget - totalSpent > 0
                                    ? `${formatCurrency(totalBudget - totalSpent)} remaining`
                                    : `${formatCurrency(totalSpent - totalBudget)} over budget`
                                }
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Active Budgets</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {budgets.filter(b => b.isActive).length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">On Track</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {budgets.filter(b => b.percentage < 80).length}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Over Budget</div>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                                        {budgets.filter(b => b.percentage >= 100).length}
                                    </div>
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

                {/* Budgets List */}
                {budgets.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <PieChart className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No budgets yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Create your first budget to start tracking spending
                        </p>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Budget
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {budgets.map((budget) => {
                            const status =
                                budget.percentage >= 100 ? 'over' :
                                    budget.percentage >= budget.alertThreshold ? 'warning' : 'good';

                            return (
                                <div
                                    key={budget.id}
                                    className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${status === 'over'
                                            ? 'border-red-200 dark:border-red-800'
                                            : status === 'warning'
                                                ? 'border-yellow-200 dark:border-yellow-800'
                                                : 'border-green-200 dark:border-green-800'
                                        }`}
                                >
                                    {/* Budget Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                {budget.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="capitalize">{budget.period}</span>
                                                <span>•</span>
                                                <span>{budget.categoryIds.length} categories</span>
                                            </div>
                                        </div>
                                        <div className={`px-2 py-1 rounded-lg text-xs font-medium ${budget.isActive
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {budget.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Spent</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {budget.percentage.toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${status === 'over'
                                                        ? 'bg-red-500'
                                                        : status === 'warning'
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(budget.spent)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">spent</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(budget.amount)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">budget</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remaining/Over */}
                                    <div className={`p-3 rounded-lg mb-4 ${status === 'over'
                                            ? 'bg-red-50 dark:bg-red-900/20'
                                            : status === 'warning'
                                                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                                                : 'bg-green-50 dark:bg-green-900/20'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            {status === 'over' ? (
                                                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            ) : status === 'warning' ? (
                                                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            )}
                                            <span className={`text-sm font-medium ${status === 'over'
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : status === 'warning'
                                                        ? 'text-yellow-600 dark:text-yellow-400'
                                                        : 'text-green-600 dark:text-green-400'
                                                }`}>
                                                {budget.spent > budget.amount
                                                    ? `${formatCurrency(budget.spent - budget.amount)} over budget`
                                                    : `${formatCurrency(budget.amount - budget.spent)} remaining`
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(budget)}
                                            className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition flex items-center justify-center gap-2"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(budget)}
                                            className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition flex items-center justify-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

        // ============================================
                // PART 3: Add this after Part 2
                // Replace the comment "CONTINUE TO PART 3"
                // This completes the component
                // ============================================

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {editingBudget ? 'Edit Budget' : 'Create New Budget'}
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

                                {/* Budget Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Budget Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="E.g., Monthly Groceries"
                                        required
                                    />
                                </div>

                                {/* Amount and Period */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Budget Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.amount || ''}
                                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="10000"
                                            step="100"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Period
                                        </label>
                                        <select
                                            value={formData.period}
                                            onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'yearly' })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Categories Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Categories * ({formData.categoryIds.length} selected)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                        {DEFAULT_EXPENSE_CATEGORIES.map((category) => (
                                            <button
                                                key={category.name}
                                                type="button"
                                                onClick={() => toggleCategory(category.name)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${formData.categoryIds.includes(category.name)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <span>{category.icon}</span>
                                                <span className="truncate">{category.name}</span>
                                                {formData.categoryIds.includes(category.name) && (
                                                    <Check className="w-4 h-4 ml-auto" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Click to select/deselect categories for this budget
                                    </p>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            End Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Alert Threshold */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Alert Threshold ({formData.alertThreshold}%)
                                    </label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="100"
                                        step="5"
                                        value={formData.alertThreshold}
                                        onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>50%</span>
                                        <span>Get alerted when spending reaches this threshold</span>
                                        <span>100%</span>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="rollover"
                                            checked={formData.rollover}
                                            onChange={(e) => setFormData({ ...formData, rollover: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="rollover" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Rollover unused budget to next period
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Mark this budget as active
                                        </label>
                                    </div>
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
                                                {editingBudget ? 'Update Budget' : 'Create Budget'}
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
