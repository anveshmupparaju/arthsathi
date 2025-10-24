// ============================================
// FILE: src/pages/Categories.tsx - MODULE 10
// Custom Categories Management
// ============================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/firestore';
import { Category, CategoryType } from '@/types';
import {
  Plus, Pencil, Trash2, X, Check, Loader2, AlertCircle,
  Tag, Folder, TrendingUp, TrendingDown, Briefcase
} from 'lucide-react';
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INVESTMENT_CATEGORIES } from '@/constants';

export default function Categories() {
  const { currentUser, encryptionKey } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<CategoryType | 'all'>('all');

  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as CategoryType,
    icon: '📦',
    color: '#3b82f6',
  });

  const iconOptions = [
    '🍕', '🛒', '🏠', '🚗', '🛍️', '💊', '📚', '🎬', 
    '📱', '👨‍👩‍👧‍👦', '✈️', '💳', '🏥', '🙏', '🎓', '👔',
    '🔧', '💰', '💸', '📊', '💼', '📈', '💎', '🏦'
  ];

  const colorOptions = [
    '#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899',
    '#10b981', '#14b8a6', '#6366f1', '#f97316', '#78716c'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    if (!currentUser || !encryptionKey) return;

    try {
      setLoading(true);
      const data = await getCategories(currentUser.uid, encryptionKey);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingCategory(null);
    setFormData({
      name: '',
      type: 'expense',
      icon: '📦',
      color: '#3b82f6',
    });
    setShowModal(true);
    setError('');
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
    });
    setShowModal(true);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser || !encryptionKey) return;

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    // Check for duplicate name
    const duplicate = categories.find(
      (cat) => cat.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      cat.type === formData.type &&
      cat.id !== editingCategory?.id
    );

    if (duplicate) {
      setError('A category with this name already exists for this type');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const categoryData = {
        name: formData.name.trim(),
        type: formData.type,
        icon: formData.icon,
        color: formData.color,
        isDefault: false,
      };

      if (editingCategory) {
        await updateCategory(currentUser.uid, editingCategory.id, categoryData, encryptionKey);
      } else {
        await createCategory(currentUser.uid, categoryData, encryptionKey);
      }

      await loadCategories();
      setShowModal(false);
    } catch (error: any) {
      console.error('Error saving category:', error);
      setError('Failed to save category. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: Category) {
    if (!currentUser) return;

    if (category.isDefault) {
      setError('Cannot delete default categories');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteCategory(currentUser.uid, category.id);
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
  }

  // Combine default and custom categories
  const allCategories = [
    ...DEFAULT_INCOME_CATEGORIES.map(cat => ({ ...cat, id: `default-${cat.name}`, userId: 'default', createdAt: new Date() })),
    ...DEFAULT_EXPENSE_CATEGORIES.map(cat => ({ ...cat, id: `default-${cat.name}`, userId: 'default', createdAt: new Date() })),
    ...DEFAULT_INVESTMENT_CATEGORIES.map(cat => ({ ...cat, id: `default-${cat.name}`, userId: 'default', createdAt: new Date() })),
    ...categories,
  ] as Category[];

  // Filter categories
  const filteredCategories = filterType === 'all' 
    ? allCategories 
    : allCategories.filter(cat => cat.type === filterType);

  // Group by type
  const groupedCategories = {
    income: filteredCategories.filter(cat => cat.type === 'income'),
    expense: filteredCategories.filter(cat => cat.type === 'expense'),
    investment: filteredCategories.filter(cat => cat.type === 'investment'),
  };

  const customCategoriesCount = categories.length;
  const totalCategoriesCount = allCategories.length;

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your transaction categories
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm opacity-90">Total Categories</div>
                  <div className="text-2xl font-bold">{totalCategoriesCount}</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Income</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {groupedCategories.income.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Expense</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {groupedCategories.expense.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Custom</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {customCategoriesCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'income', 'expense', 'investment'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterType === type
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'all' && 'All Categories'}
                {type === 'income' && '💰 Income'}
                {type === 'expense' && '💸 Expense'}
                {type === 'investment' && '📈 Investment'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Categories by Type */}
        {(filterType === 'all' || filterType === 'income') && groupedCategories.income.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-6 h-6 text-green-600" />
              Income Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedCategories.income.map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.icon}
                    </div>
                    {!category.isDefault && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {category.name}
                  </h3>
                  {category.isDefault && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Default</span>
                  )}
                  {!category.isDefault && (
                    <span className="text-xs text-purple-600 dark:text-purple-400">Custom</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(filterType === 'all' || filterType === 'expense') && groupedCategories.expense.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-red-600" />
              Expense Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedCategories.expense.map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.icon}
                    </div>
                    {!category.isDefault && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {category.name}
                  </h3>
                  {category.isDefault && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Default</span>
                  )}
                  {!category.isDefault && (
                    <span className="text-xs text-purple-600 dark:text-purple-400">Custom</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {(filterType === 'all' || filterType === 'investment') && groupedCategories.investment.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-purple-600" />
              Investment Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {groupedCategories.investment.map((category) => (
                <div
                  key={category.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      {category.icon}
                    </div>
                    {!category.isDefault && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {category.name}
                  </h3>
                  {category.isDefault && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Default</span>
                  )}
                  {!category.isDefault && (
                    <span className="text-xs text-purple-600 dark:text-purple-400">Custom</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
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

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="E.g., Entertainment, Freelance"
                    required
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Type *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['income', 'expense', 'investment'] as CategoryType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, type })}
                        className={`px-4 py-3 rounded-xl font-medium transition capitalize ${
                          formData.type === type
                            ? type === 'income'
                              ? 'bg-green-600 text-white shadow-lg'
                              : type === 'expense'
                              ? 'bg-red-600 text-white shadow-lg'
                              : 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Selection */}
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
                        className={`text-2xl p-2 rounded-lg transition ${
                          formData.icon === icon
                            ? 'bg-blue-600 scale-110'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-lg transition ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
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
                        {editingCategory ? 'Update Category' : 'Add Category'}
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