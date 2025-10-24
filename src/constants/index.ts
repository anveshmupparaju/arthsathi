import { Category, CategoryType } from '@/types';

// Default income categories
export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Salary', type: 'income', icon: '💼', color: '#10b981', isDefault: true },
  { name: 'Business Income', type: 'income', icon: '💰', color: '#059669', isDefault: true },
  { name: 'Investment Returns', type: 'income', icon: '📈', color: '#34d399', isDefault: true },
  { name: 'Bonus', type: 'income', icon: '🎁', color: '#6ee7b7', isDefault: true },
  { name: 'Freelance Income', type: 'income', icon: '💵', color: '#a7f3d0', isDefault: true },
  { name: 'Rental Income', type: 'income', icon: '🏠', color: '#d1fae5', isDefault: true },
  { name: 'Interest Income', type: 'income', icon: '🎯', color: '#10b981', isDefault: true },
  { name: 'Gifts Received', type: 'income', icon: '🎉', color: '#34d399', isDefault: true },
  { name: 'Refunds', type: 'income', icon: '💸', color: '#6ee7b7', isDefault: true },
  { name: 'Other Income', type: 'income', icon: '📊', color: '#a7f3d0', isDefault: true },
];

// Default expense categories
export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Food & Dining', type: 'expense', icon: '🍕', color: '#ef4444', isDefault: true },
  { name: 'Groceries', type: 'expense', icon: '🛒', color: '#f59e0b', isDefault: true },
  { name: 'Housing', type: 'expense', icon: '🏠', color: '#8b5cf6', isDefault: true },
  { name: 'Transportation', type: 'expense', icon: '🚗', color: '#3b82f6', isDefault: true },
  { name: 'Shopping', type: 'expense', icon: '🛍️', color: '#ec4899', isDefault: true },
  { name: 'Healthcare', type: 'expense', icon: '💊', color: '#ef4444', isDefault: true },
  { name: 'Education', type: 'expense', icon: '📚', color: '#6366f1', isDefault: true },
  { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#a855f7', isDefault: true },
  { name: 'Bills & Utilities', type: 'expense', icon: '📱', color: '#0ea5e9', isDefault: true },
  { name: 'Family & Personal', type: 'expense', icon: '👨‍👩‍👧‍👦', color: '#f97316', isDefault: true },
  { name: 'Travel', type: 'expense', icon: '✈️', color: '#14b8a6', isDefault: true },
  { name: 'EMI Payments', type: 'expense', icon: '💳', color: '#dc2626', isDefault: true },
  { name: 'Insurance Premiums', type: 'expense', icon: '🏥', color: '#7c3aed', isDefault: true },
  { name: 'Donations', type: 'expense', icon: '🙏', color: '#fb923c', isDefault: true },
  { name: 'Children', type: 'expense', icon: '🎓', color: '#fbbf24', isDefault: true },
  { name: 'Professional', type: 'expense', icon: '👔', color: '#4b5563', isDefault: true },
  { name: 'Maintenance', type: 'expense', icon: '🔧', color: '#78716c', isDefault: true },
  { name: 'Taxes', type: 'expense', icon: '💰', color: '#991b1b', isDefault: true },
  { name: 'Other Expenses', type: 'expense', icon: '💸', color: '#64748b', isDefault: true },
];

// Default investment categories
export const DEFAULT_INVESTMENT_CATEGORIES: Omit<Category, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Mutual Funds - Equity', type: 'investment', icon: '📊', color: '#2563eb', isDefault: true },
  { name: 'Mutual Funds - Debt', type: 'investment', icon: '📈', color: '#7c3aed', isDefault: true },
  { name: 'Mutual Funds - Hybrid', type: 'investment', icon: '📉', color: '#0891b2', isDefault: true },
  { name: 'Stocks', type: 'investment', icon: '📈', color: '#059669', isDefault: true },
  { name: 'Fixed Deposits', type: 'investment', icon: '🏦', color: '#4f46e5', isDefault: true },
  { name: 'Gold', type: 'investment', icon: '💎', color: '#f59e0b', isDefault: true },
  { name: 'Real Estate', type: 'investment', icon: '🏢', color: '#8b5cf6', isDefault: true },
  { name: 'PPF', type: 'investment', icon: '💰', color: '#10b981', isDefault: true },
  { name: 'EPF', type: 'investment', icon: '💼', color: '#14b8a6', isDefault: true },
  { name: 'NPS', type: 'investment', icon: '🏛️', color: '#6366f1', isDefault: true },
  { name: 'Bonds', type: 'investment', icon: '📜', color: '#8b5cf6', isDefault: true },
  { name: 'Chit Funds', type: 'investment', icon: '🌾', color: '#f97316', isDefault: true },
  { name: 'Post Office Schemes', type: 'investment', icon: '🏛️', color: '#0284c7', isDefault: true },
  { name: 'Cryptocurrency', type: 'investment', icon: '🌐', color: '#f59e0b', isDefault: true },
  { name: 'Other Investments', type: 'investment', icon: '💼', color: '#64748b', isDefault: true },
];

// All default categories combined
export const DEFAULT_CATEGORIES = [
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INVESTMENT_CATEGORIES,
];

// Account type labels
export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: 'Savings Account',
  current: 'Current Account',
  fixed_deposit: 'Fixed Deposit',
  recurring_deposit: 'Recurring Deposit',
  salary: 'Salary Account',
  nre: 'NRE Account',
  nro: 'NRO Account',
  demat: 'Demat Account',
  trading: 'Trading Account',
  mutual_fund: 'Mutual Fund Folio',
  ppf: 'PPF Account',
  epf: 'EPF Account',
  nps: 'NPS Account',
  sukanya: 'Sukanya Samriddhi Account',
  gold: 'Gold Investment',
  credit_card: 'Credit Card',
  home_loan: 'Home Loan',
  personal_loan: 'Personal Loan',
  car_loan: 'Car Loan',
  education_loan: 'Education Loan',
  gold_loan: 'Gold Loan',
  other_loan: 'Other Loan',
};

// Payment method labels
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Debit/Credit Card',
  net_banking: 'Net Banking',
  cheque: 'Cheque',
  wallet: 'Digital Wallet',
  other: 'Other',
};

// Investment type labels
export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  mutual_fund: 'Mutual Fund',
  sip: 'SIP',
  stock: 'Stock/Equity',
  ppf: 'PPF',
  epf: 'EPF',
  nps: 'NPS',
  fd: 'Fixed Deposit',
  rd: 'Recurring Deposit',
  gold: 'Physical Gold',
  sgb: 'Sovereign Gold Bonds',
  real_estate: 'Real Estate',
  bond: 'Bonds',
  crypto: 'Cryptocurrency',
  chit_fund: 'Chit Fund',
  post_office: 'Post Office Scheme',
  other: 'Other Investment',
};

// Insurance type labels
export const INSURANCE_TYPE_LABELS: Record<string, string> = {
  life_term: 'Life Insurance - Term',
  life_endowment: 'Life Insurance - Endowment',
  life_ulip: 'Life Insurance - ULIP',
  life_moneyback: 'Life Insurance - Money Back',
  health_individual: 'Health Insurance - Individual',
  health_family: 'Health Insurance - Family Floater',
  health_critical: 'Health Insurance - Critical Illness',
  vehicle_two_wheeler: 'Vehicle Insurance - Two Wheeler',
  vehicle_four_wheeler: 'Vehicle Insurance - Four Wheeler',
  home: 'Home Insurance',
  travel: 'Travel Insurance',
  other: 'Other Insurance',
};

// Currency options (commonly used in India)
export const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
];

// Locale options
export const LOCALE_OPTIONS = [
  { code: 'en-IN', name: 'English (India)' },
  { code: 'hi-IN', name: 'हिन्दी (Hindi)' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'mr-IN', name: 'मराठी (Marathi)' },
  { code: 'bn-IN', name: 'বাংলা (Bengali)' },
  { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
];

// Chart color palette
export const CHART_COLORS = [
  '#2563eb', '#7c3aed', '#0891b2', '#059669', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316',
];

// Budget alert thresholds
export const BUDGET_ALERT_THRESHOLDS = [50, 75, 80, 90, 95, 100];

// Date format options
export const DATE_FORMAT_OPTIONS = [
  { format: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Indian)' },
  { format: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { format: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
];

// Auto-lock timeout options (in minutes)
export const AUTO_LOCK_OPTIONS = [5, 10, 15, 30, 60];

// App configuration
export const APP_CONFIG = {
  name: 'ArthSathi',
  tagline: 'आपका वित्तीय साथी',
  version: '1.0.0',
  defaultCurrency: 'INR',
  defaultLocale: 'en-IN',
  defaultAutoLock: 15, // minutes
};
