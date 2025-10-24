import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
    getInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    getAccounts,
} from '@/lib/firestore';
import { Investment, InvestmentType, Account } from '@/types';
import {
    Plus, Pencil, Trash2, X, Check, Loader2, AlertCircle,
    TrendingUp, TrendingDown, PieChart, BarChart3, IndianRupee,
    Calendar, Target, Briefcase, Search, Filter
} from 'lucide-react';
import { INVESTMENT_TYPE_LABELS } from '@/constants';
import { formatCurrency, formatDate, calculateXIRR } from '@/lib/utils';

export default function Investments() {
    const { currentUser, encryptionKey } = useAuth();
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<InvestmentType | 'all'>('all');

    // Form state
    const [formData, setFormData] = useState({
        investmentType: 'mutual_fund' as InvestmentType,
        name: '',
        schemeCode: '',
        folioNumber: '',
        accountId: '',
        units: 0,
        purchasePrice: 0,
        currentPrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        maturityDate: '',
        interestRate: 0,
        sipAmount: 0,
        sipDate: 1,
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        if (!currentUser || !encryptionKey) return;

        try {
            setLoading(true);
            const [invs, accs] = await Promise.all([
                getInvestments(currentUser.uid, encryptionKey),
                getAccounts(currentUser.uid, encryptionKey),
            ]);
            setInvestments(invs);
            setAccounts(accs);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load investments');
        } finally {
            setLoading(false);
        }
    }

    function openAddModal() {
        setEditingInvestment(null);
        setFormData({
            investmentType: 'mutual_fund',
            name: '',
            schemeCode: '',
            folioNumber: '',
            accountId: accounts.length > 0 ? accounts[0].id : '',
            units: 0,
            purchasePrice: 0,
            currentPrice: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
            maturityDate: '',
            interestRate: 0,
            sipAmount: 0,
            sipDate: 1,
            notes: '',
        });
        setShowModal(true);
        setError('');
    }

    function openEditModal(investment: Investment) {
        setEditingInvestment(investment);
        setFormData({
            investmentType: investment.investmentType,
            name: investment.name,
            schemeCode: investment.schemeCode || '',
            folioNumber: investment.folioNumber || '',
            accountId: investment.accountId || '',
            units: investment.units || 0,
            purchasePrice: investment.purchasePrice,
            currentPrice: investment.currentPrice,
            purchaseDate: investment.purchaseDate.toISOString().split('T')[0],
            maturityDate: investment.maturityDate ? investment.maturityDate.toISOString().split('T')[0] : '',
            interestRate: investment.interestRate || 0,
            sipAmount: investment.sipAmount || 0,
            sipDate: investment.sipDate || 1,
            notes: investment.notes || '',
        });
        setShowModal(true);
        setError('');
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!currentUser || !encryptionKey) return;

        if (!formData.name.trim()) {
            setError('Investment name is required');
            return;
        }
        if (formData.purchasePrice <= 0) {
            setError('Purchase price must be greater than 0');
            return;
        }

        try {
            setSaving(true);
            setError('');

            // Calculate returns
            const units = formData.units || 1;
            const investedValue = formData.purchasePrice * units;
            const currentValue = formData.currentPrice * units;
            const returns = currentValue - investedValue;

            // Calculate XIRR for SIPs (simplified - using absolute returns for now)
            const xirr = investedValue > 0 ? ((currentValue - investedValue) / investedValue) * 100 : 0;

            const investmentData = {
                investmentType: formData.investmentType,
                name: formData.name,
                schemeCode: formData.schemeCode || undefined,
                folioNumber: formData.folioNumber || undefined,
                accountId: formData.accountId || undefined,
                units: formData.units || undefined,
                purchasePrice: formData.purchasePrice,
                currentPrice: formData.currentPrice,
                purchaseDate: new Date(formData.purchaseDate),
                maturityDate: formData.maturityDate ? new Date(formData.maturityDate) : undefined,
                interestRate: formData.interestRate || undefined,
                sipAmount: formData.sipAmount || undefined,
                sipDate: formData.sipDate || undefined,
                returns,
                xirr,
                notes: formData.notes || undefined,
            };

            if (editingInvestment) {
                await updateInvestment(
                    currentUser.uid,
                    editingInvestment.id,
                    investmentData,
                    encryptionKey
                );
            } else {
                await createInvestment(currentUser.uid, investmentData, encryptionKey);
            }

            await loadData();
            setShowModal(false);
        } catch (error: any) {
            console.error('Error saving investment:', error);
            setError('Failed to save investment. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(investment: Investment) {
        if (!currentUser) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${investment.name}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteInvestment(currentUser.uid, investment.id);
            await loadData();
        } catch (error) {
            console.error('Error deleting investment:', error);
            setError('Failed to delete investment');
        }
    }

    // Filter investments
    const filteredInvestments = investments.filter((inv) => {
        const matchesSearch =
            searchTerm === '' ||
            inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.folioNumber && inv.folioNumber.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = filterType === 'all' || inv.investmentType === filterType;

        return matchesSearch && matchesType;
    });

    // Calculate portfolio summary
    const totalInvested = investments.reduce((sum, inv) => {
        const units = inv.units || 1;
        return sum + (inv.purchasePrice * units);
    }, 0);

    const totalCurrent = investments.reduce((sum, inv) => {
        const units = inv.units || 1;
        return sum + (inv.currentPrice * units);
    }, 0);

    const totalReturns = totalCurrent - totalInvested;
    const returnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    // Group investments by type
    const investmentsByType = investments.reduce((groups, inv) => {
        const type = inv.investmentType;
        if (!groups[type]) groups[type] = [];
        groups[type].push(inv);
        return groups;
    }, {} as Record<string, Investment[]>);

    // Asset allocation
    const assetAllocation = Object.entries(investmentsByType).map(([type, invs]) => {
        const typeValue = invs.reduce((sum, inv) => {
            const units = inv.units || 1;
            return sum + (inv.currentPrice * units);
        }, 0);
        return {
            type: INVESTMENT_TYPE_LABELS[type as InvestmentType] || type,
            value: typeValue,
            percentage: totalCurrent > 0 ? (typeValue / totalCurrent) * 100 : 0,
        };
    }).sort((a, b) => b.value - a.value);

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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Portfolio</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Track and manage all your investments
                            </p>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Investment
                        </button>
                    </div>

                    {/* Portfolio Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Total Invested</div>
                                    <div className="text-2xl font-bold">{formatCurrency(totalInvested)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Current Value</div>
                                    <div className="text-2xl font-bold">{formatCurrency(totalCurrent)}</div>
                                </div>
                            </div>
                        </div>

                        <div className={`bg-gradient-to-br ${totalReturns >= 0 ? 'from-purple-500 to-pink-600' : 'from-red-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    {totalReturns >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Total Returns</div>
                                    <div className="text-2xl font-bold">
                                        {totalReturns >= 0 ? '' : ''}{formatCurrency(totalReturns)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm opacity-90">Returns %</div>
                                    <div className="text-2xl font-bold">
                                        {returnsPercentage >= 0 ? '' : ''}{returnsPercentage.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Asset Allocation */}
                    {assetAllocation.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5" />
                                Asset Allocation
                            </h3>
                            <div className="space-y-3">
                                {assetAllocation.map((asset, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-900 dark:text-white">{asset.type}</span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {formatCurrency(asset.value)} ({asset.percentage.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                                                style={{ width: `${asset.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div> {/* End of Header section */}

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search investments..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as InvestmentType | 'all')}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Types</option>
                            {Object.entries(INVESTMENT_TYPE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
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

                {/* Investments List */}
                {filteredInvestments.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {searchTerm || filterType !== 'all' ? 'No investments found' : 'No investments yet'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {searchTerm || filterType !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Add your first investment to start tracking your portfolio'}
                        </p>
                        {!searchTerm && filterType === 'all' && (
                            <button
                                onClick={openAddModal}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Your First Investment
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredInvestments.map((inv) => {
                            const units = inv.units || 1;
                            const investedValue = inv.purchasePrice * units;
                            const currentValue = inv.currentPrice * units;
                            const returns = currentValue - investedValue;
                            const returnsPercent = investedValue > 0 ? (returns / investedValue) * 100 : 0;

                            return (
                                <div
                                    key={inv.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                                >
                                    {/* Investment Header */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                    {inv.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {INVESTMENT_TYPE_LABELS[inv.investmentType]}
                                                </p>
                                            </div>
                                        </div>
                                        {inv.folioNumber && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                Folio: {inv.folioNumber}
                                            </div>
                                        )}
                                    </div>

                                    {/* Investment Values */}
                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Invested</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(investedValue)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Current Value</span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(currentValue)}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Returns</span>
                                                <div className="text-right">
                                                    <div className={`text-sm font-bold ${returns >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {returns >= 0 ? '' : ''}{formatCurrency(returns)}
                                                    </div>
                                                    <div className={`text-xs ${returns >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {returns >= 0 ? '' : ''}{returnsPercent.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
                                        {inv.units && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Units</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{inv.units}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Purchase Date</span>
                                            <span className="font-medium text-gray-900 dark:text-white">{formatDate(inv.purchaseDate)}</span>
                                        </div>
                                        {inv.sipAmount && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">SIP Amount</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(inv.sipAmount)}/month</span>
                                            </div>
                                        )}
                                        {inv.interestRate && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{inv.interestRate}% p.a.</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(inv)}
                                            className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition flex items-center justify-center gap-2"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(inv)}
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

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
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

                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    </div>
                                )}

                                {/* Investment Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Investment Type *
                                    </label>
                                    <select
                                        value={formData.investmentType}
                                        onChange={(e) => setFormData({ ...formData, investmentType: e.target.value as InvestmentType })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        required
                                    >
                                        {Object.entries(INVESTMENT_TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Investment Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Investment Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="E.g., HDFC Mid Cap 250"
                                        required
                                    />
                                </div>

                                {/* Scheme Code and Folio Number */}
                                {(formData.investmentType === 'mutual_fund' || formData.investmentType === 'sip') && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Scheme Code
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.schemeCode}
                                                onChange={(e) => setFormData({ ...formData, schemeCode: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="119551"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Folio Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.folioNumber}
                                                onChange={(e) => setFormData({ ...formData, folioNumber: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="12345678"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Account Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Linked Account (Optional)
                                    </label>
                                    <select
                                        value={formData.accountId}
                                        onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="">None</option>
                                        {accounts.map((acc) => (
                                            <option key={acc.id} value={acc.id}>
                                                {acc.accountName} ({formatCurrency(acc.balance)})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Units */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Units / Quantity
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.units || ''}
                                        onChange={(e) => setFormData({ ...formData, units: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="100"
                                        step="0.001"
                                        min="0"
                                    />
                                </div>

                                {/* Purchase and Current Price */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Purchase Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.purchasePrice || ''}
                                            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="100.00"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Current Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.currentPrice || ''}
                                            onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="120.00"
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Purchase Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.purchaseDate}
                                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Maturity Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.maturityDate}
                                            onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Interest Rate (for FD, PPF, etc.) */}
                                {(['fd', 'rd', 'ppf', 'epf', 'nps', 'bond', 'post_office'].includes(formData.investmentType)) && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Interest Rate (% p.a.)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.interestRate || ''}
                                            onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            placeholder="7.5"
                                            step="0.01"
                                            min="0"
                                        />
                                    </div>
                                )}

                                {/* SIP Details */}
                                {formData.investmentType === 'sip' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                SIP Amount (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.sipAmount || ''}
                                                onChange={(e) => setFormData({ ...formData, sipAmount: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="5000"
                                                step="100"
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                SIP Date (Day of Month)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.sipDate}
                                                onChange={(e) => setFormData({ ...formData, sipDate: parseInt(e.target.value) || 1 })}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="1"
                                                min="1"
                                                max="31"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Calculated Values Display */}
                                {formData.purchasePrice > 0 && formData.currentPrice > 0 && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                                            Calculated Returns:
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-blue-700 dark:text-blue-400">Invested Value:</span>
                                                <div className="font-bold text-blue-900 dark:text-blue-300">
                                                    {formatCurrency(formData.purchasePrice * (formData.units || 1))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-blue-700 dark:text-blue-400">Current Value:</span>
                                                <div className="font-bold text-blue-900 dark:text-blue-300">
                                                    {formatCurrency(formData.currentPrice * (formData.units || 1))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-blue-700 dark:text-blue-400">Absolute Returns:</span>
                                                <div className={`font-bold ${(formData.currentPrice - formData.purchasePrice) * (formData.units || 1) >= 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {formatCurrency((formData.currentPrice - formData.purchasePrice) * (formData.units || 1))}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-blue-700 dark:text-blue-400">Returns %:</span>
                                                <div className={`font-bold ${formData.currentPrice >= formData.purchasePrice
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {(((formData.currentPrice - formData.purchasePrice) / formData.purchasePrice) * 100).toFixed(2)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                        rows={3}
                                        placeholder="Additional notes about this investment..."
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
                                                {editingInvestment ? 'Update Investment' : 'Add Investment'}
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
