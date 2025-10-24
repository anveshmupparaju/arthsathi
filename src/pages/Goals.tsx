
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    getAccounts,
} from '@/lib/firestore';
import { Goal, Account } from '@/types';
import {
    Plus, Pencil, Trash2, X, Check, Loader2, AlertCircle,
    Target, TrendingUp, Calendar, DollarSign, Flag,
    CheckCircle2, Clock, Zap
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function Goals() {
    const { currentUser, encryptionKey } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        linkedAccountIds: [] as string[],
        icon: '🎯',
        color: '#3b82f6',
    });

    const iconOptions = [
        '🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💰', '🏖️',
        '📱', '💻', '⌚', '🎸', '📷', '🏃', '🎮', '📚'
    ];

    const colorOptions = [
        '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
        '#06b6d4', '#ef4444', '#6366f1', '#f97316', '#14b8a6'
    ];

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        if (!currentUser || !encryptionKey) return;

        try {
            setLoading(true);
            const [goalsData, accountsData] = await Promise.all([
                getGoals(currentUser.uid, encryptionKey),
                getAccounts(currentUser.uid, encryptionKey),
            ]);
            setGoals(goalsData);
            setAccounts(accountsData);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load goals');
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingGoal(null);
        setFormData({
            name: '',
            description: '',
            targetAmount: 0,
            currentAmount: 0,
            targetDate: '',
            priority: 'medium',
            linkedAccountIds: [],
            icon: '🎯',
            color: '#3b82f6',
        });
        setShowModal(true);
        setError('');
    }

    function openEditModal(goal: Goal) {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            description: goal.description || '',
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            targetDate: goal.targetDate.toISOString().split('T')[0],
            priority: goal.priority,
            linkedAccountIds: goal.linkedAccountIds || [],
            icon: goal.icon,
            color: goal.color,
        });
        setShowModal(true);
        setError('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser || !encryptionKey) return;

        if (!formData.name.trim()) {
            setError('Goal name is required');
            return;
        }
        if (formData.targetAmount <= 0) {
            setError('Target amount must be greater than 0');
            return;
        }
        if (!formData.targetDate) {
            setError('Target date is required');
            return;
        }

        try {
            setSaving(true);
            setError('');

            const goalData = {
                name: formData.name,
                description: formData.description,
                targetAmount: formData.targetAmount,
                currentAmount: formData.currentAmount,
                targetDate: new Date(formData.targetDate),
                priority: formData.priority,
                linkedAccountIds: formData.linkedAccountIds,
                icon: formData.icon,
                color: formData.color,
                isCompleted: formData.currentAmount >= formData.targetAmount,
            };

            if (editingGoal) {
                await updateGoal(currentUser.uid, editingGoal.id, goalData, encryptionKey);
            } else {
                await createGoal(currentUser.uid, goalData, encryptionKey);
            }

            await loadData();
            setShowModal(false);
        } catch (error: any) {
            console.error('Error saving goal:', error);
            setError('Failed to save goal. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(goal: Goal) {
        if (!currentUser) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${goal.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteGoal(currentUser.uid, goal.id);
            await loadData();
        } catch (error) {
            console.error('Error deleting goal:', error);
            setError('Failed to delete goal');
        }
    }

    function toggleAccount(accountId: string) {
        if (formData.linkedAccountIds.includes(accountId)) {
            setFormData({
                ...formData,
                linkedAccountIds: formData.linkedAccountIds.filter(id => id !== accountId),
            });
        } else {
            setFormData({
                ...formData,
                linkedAccountIds: [...formData.linkedAccountIds, accountId],
            });
        }
    }

    const completedGoals = goals.filter(g => g.isCompleted);
    const activeGoals = goals.filter(g => !g.isCompleted);
    const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSavedAmount = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress = totalTargetAmount > 0 ? (totalSavedAmount / totalTargetAmount) * 100 : 0;

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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Set and track your financial goals
                            </p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Goal
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Active Goals</div>
                                    <div className="text-2xl font-bold">{activeGoals.length}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedGoals.length}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Target</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(totalTargetAmount)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Overall Progress</div>
                                    <div className="text-2xl font-bold">{overallProgress.toFixed(1)}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Active Goals */}
                {activeGoals.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Goals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeGoals.map((goal) => {
                                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                                const remaining = goal.targetAmount - goal.currentAmount;
                                const daysUntilTarget = Math.ceil(
                                    (goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                );

                                return (
                                    <div
                                        key={goal.id}
                                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                                    style={{ backgroundColor: goal.color + '20' }}
                                                >
                                                    {goal.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                                                    {goal.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {goal.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${goal.priority === 'high'
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                                    : goal.priority === 'medium'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {goal.priority === 'high' && <Flag className="w-3 h-3 inline" />}
                                                {goal.priority === 'medium' && <Zap className="w-3 h-3 inline" />}
                                                {goal.priority === 'low' && <Clock className="w-3 h-3 inline" />}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {progress.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                                                <div
                                                    className="h-3 rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min(progress, 100)}%`,
                                                        backgroundColor: goal.color,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {formatCurrency(goal.currentAmount)}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {formatCurrency(goal.targetAmount)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Remaining</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {formatCurrency(remaining)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Target Date</span>
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {formatDate(goal.targetDate)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Days Left</span>
                                                <span className={`font-medium ${daysUntilTarget < 30
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : daysUntilTarget < 90
                                                            ? 'text-yellow-600 dark:text-yellow-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                    }`}>
                                                    {daysUntilTarget} days
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(goal)}
                                                className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition flex items-center justify-center gap-2"
                                            >
                                                <Pencil className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goal)}
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
                    </div>
                )}

                {/* Completed Goals */}
                {completedGoals.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Completed Goals 🎉</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedGoals.map((goal) => (
                                <div
                                    key={goal.id}
                                    className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 shadow-lg border-2 border-green-200 dark:border-green-800"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                            style={{ backgroundColor: goal.color + '20' }}
                                        >
                                            {goal.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                                            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Goal Achieved!
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {formatCurrency(goal.targetAmount)}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Completed on {formatDate(goal.updatedAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {goals.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No goals yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Create your first financial goal to start tracking
                        </p>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Goal
                        </button>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {editingGoal ? 'Edit Goal' : 'Create New Goal'}
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

                                {/* Goal Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Goal Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="E.g., Dream Vacation, Emergency Fund"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                        rows={3}
                                        placeholder="Add details about your goal..."
                                    />
                                </div>

                                {/* Icon and Color Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Icon
                                        </label>
                                        <div className="grid grid-cols-8 gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                            {iconOptions.map((icon) => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon })}
                                                    className={`text-2xl p-2 rounded-lg transition ${formData.icon === icon
                                                            ? 'bg-blue-600 scale-110'
                                                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Color
                                        </label>
                                        <div className="grid grid-cols-5 gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                            {colorOptions.map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, color })}
                                                    className={`w-10 h-10 rounded-lg transition ${formData.color === color ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : ''
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Amounts */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Target Amount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.targetAmount || ''}
                                            onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="100000"
                                            step="1000"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Current Amount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.currentAmount || ''}
                                            onChange={(e) => setFormData({ ...formData, currentAmount: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="0"
                                            step="1000"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                {/* Target Date and Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Target Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.targetDate}
                                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="low">Low Priority</option>
                                            <option value="medium">Medium Priority</option>
                                            <option value="high">High Priority</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Linked Accounts */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Link Accounts (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                                        {accounts.map((account) => (
                                            <button
                                                key={account.id}
                                                type="button"
                                                onClick={() => toggleAccount(account.id)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${formData.linkedAccountIds.includes(account.id)
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <span className="truncate">{account.accountName}</span>
                                                {formData.linkedAccountIds.includes(account.id) && (
                                                    <Check className="w-4 h-4 ml-auto" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {accounts.length === 0 && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            No accounts available. Create accounts first to link them.
                                        </p>
                                    )}
                                </div>

                                {/* Progress Preview */}
                                {formData.targetAmount > 0 && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                            Goal Preview:
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-blue-700 dark:text-blue-400">Progress</span>
                                                <span className="font-bold text-blue-900 dark:text-blue-300">
                                                    {formData.targetAmount > 0
                                                        ? ((formData.currentAmount / formData.targetAmount) * 100).toFixed(1)
                                                        : 0}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min((formData.currentAmount / formData.targetAmount) * 100, 100)}%`,
                                                        backgroundColor: formData.color,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-blue-700 dark:text-blue-400">
                                                    Saved: {formatCurrency(formData.currentAmount)}
                                                </span>
                                                <span className="text-blue-700 dark:text-blue-400">
                                                    Remaining: {formatCurrency(formData.targetAmount - formData.currentAmount)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                                {editingGoal ? 'Update Goal' : 'Create Goal'}
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
