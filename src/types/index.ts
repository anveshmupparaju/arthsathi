// User types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  encryptionSalt: string;
  locale: string;
  currency: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Account types
export type AccountType =
  | 'savings'
  | 'current'
  | 'fixed_deposit'
  | 'recurring_deposit'
  | 'salary'
  | 'nre'
  | 'nro'
  | 'demat'
  | 'trading'
  | 'mutual_fund'
  | 'ppf'
  | 'epf'
  | 'nps'
  | 'sukanya'
  | 'gold'
  | 'credit_card'
  | 'home_loan'
  | 'personal_loan'
  | 'car_loan'
  | 'education_loan'
  | 'gold_loan'
  | 'other_loan';

export interface Account {
  id: string;
  userId: string;
  accountName: string;
  accountType: AccountType;
  bankName?: string;
  accountNumber?: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction types
export type TransactionType = 'income' | 'expense' | 'investment' | 'transfer';

export type PaymentMethod =
  | 'cash'
  | 'upi'
  | 'card'
  | 'net_banking'
  | 'cheque'
  | 'wallet'
  | 'other';

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  date: Date;
  amount: number;
  type: TransactionType;
  category: string;
  subcategory?: string;
  description: string;
  merchant?: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  attachments: string[];
  isRecurring: boolean;
  recurringId?: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Category types
export type CategoryType = 'income' | 'expense' | 'investment';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isDefault: boolean;
  userId?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Budget types
export interface Budget {
  id: string;
  userId: string;
  name: string;
  categoryIds: string[];
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  rollover: boolean;
  alertThreshold: number; // percentage (e.g., 80 for 80%)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Investment types
export type InvestmentType =
  | 'mutual_fund'
  | 'sip'
  | 'stock'
  | 'ppf'
  | 'epf'
  | 'nps'
  | 'fd'
  | 'rd'
  | 'gold'
  | 'sgb'
  | 'real_estate'
  | 'bond'
  | 'crypto'
  | 'chit_fund'
  | 'post_office'
  | 'other';

export interface Investment {
  id: string;
  userId: string;
  accountId?: string;
  investmentType: InvestmentType;
  name: string;
  schemeCode?: string;
  folioNumber?: string;
  units?: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: Date;
  maturityDate?: Date;
  interestRate?: number;
  sipAmount?: number;
  sipDate?: number; // day of month
  returns: number; // absolute returns
  xirr?: number; // percentage
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Loan types
export interface Loan {
  id: string;
  userId: string;
  loanType: AccountType;
  lenderName: string;
  accountNumber?: string;
  principalAmount: number;
  outstandingPrincipal: number;
  interestRate: number;
  tenure: number; // in months
  emiAmount: number;
  emiDate: number; // day of month
  startDate: Date;
  endDate: Date;
  prepayments: Prepayment[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prepayment {
  date: Date;
  amount: number;
  reduceTenure: boolean;
}

// Insurance types
export type InsuranceType =
  | 'life_term'
  | 'life_endowment'
  | 'life_ulip'
  | 'life_moneyback'
  | 'health_individual'
  | 'health_family'
  | 'health_critical'
  | 'vehicle_two_wheeler'
  | 'vehicle_four_wheeler'
  | 'home'
  | 'travel'
  | 'other';

export interface Insurance {
  id: string;
  userId: string;
  insuranceType: InsuranceType;
  policyNumber: string;
  insurerName: string;
  sumAssured: number;
  premiumAmount: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';
  startDate: Date;
  endDate: Date;
  nextPremiumDate: Date;
  nominees: Nominee[];
  documents: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Nominee {
  name: string;
  relationship: string;
  share: number; // percentage
}

// Goal types
export interface Goal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: 'low' | 'medium' | 'high';
  linkedAccountIds: string[];
  icon: string;
  color: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Reminder types
export type ReminderType = 'bill' | 'emi' | 'premium' | 'investment' | 'other';

export interface Reminder {
  id: string;
  userId: string;
  type: ReminderType;
  title: string;
  description?: string;
  amount?: number;
  dueDate: Date;
  isRecurring: boolean;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
  isDone: boolean;
  linkedId?: string; // linked to transaction, loan, insurance, etc.
  createdAt: Date;
  updatedAt: Date;
}

// Encrypted data wrapper
export interface EncryptedData {
  data: string; // base64 encoded encrypted JSON
  updatedAt: Date;
}

// Dashboard summary
export interface DashboardSummary {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  savingsRate: number;
  investmentValue: number;
  investmentReturns: number;
}
