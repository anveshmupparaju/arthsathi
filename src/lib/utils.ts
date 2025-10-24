import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian format (₹1,00,000)
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency compact (₹1.2L, ₹3.5Cr)
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}

/**
 * Format date in Indian format (DD/MM/YYYY)
 */
export function formatDate(
  date: Date | string,
  locale: string = 'en-IN'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format date and time
 */
export function formatDateTime(
  date: Date | string,
  locale: string = 'en-IN'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format relative time (2 hours ago, yesterday, etc.)
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 172800) return 'Yesterday';
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(d);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Calculate XIRR (Extended Internal Rate of Return) for SIP/Investment returns
 */
export function calculateXIRR(
  cashflows: { date: Date; amount: number }[],
  guess: number = 0.1
): number {
  const maxIterations = 100;
  const tolerance = 0.0001;

  let rate = guess;

  for (let i = 0; i < maxIterations; i++) {
    const xnpv = cashflows.reduce((sum, cf) => {
      const days = Math.floor(
        (cf.date.getTime() - cashflows[0].date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + cf.amount / Math.pow(1 + rate, days / 365);
    }, 0);

    const xnpvDerivative = cashflows.reduce((sum, cf) => {
      const days = Math.floor(
        (cf.date.getTime() - cashflows[0].date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return (
        sum -
        (cf.amount * days) /
        365 /
        Math.pow(1 + rate, days / 365 + 1)
      );
    }, 0);

    const newRate = rate - xnpv / xnpvDerivative;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100; // Return as percentage
    }

    rate = newRate;
  }

  return rate * 100;
}

/**
 * Calculate EMI
 * Formula: EMI = P × r × (1 + r)^n / [(1 + r)^n - 1]
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  years: number
): {
  monthlyEMI: number;
  totalAmount: number;
  totalInterest: number;
} {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;

  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalAmount = emi * months;
  const totalInterest = totalAmount - principal;

  return {
    monthlyEMI: emi,
    totalAmount,
    totalInterest,
  };
}

/**
 * Calculate Lumpsum Investment Returns
 * Formula: A = P(1 + r)^t
 */
export function calculateLumpsum(
  principal: number,
  annualRate: number,
  years: number
): {
  maturityValue: number;
  totalReturns: number;
} {
  const rate = annualRate / 100;
  const maturityValue = principal * Math.pow(1 + rate, years);
  const totalReturns = maturityValue - principal;

  return {
    maturityValue,
    totalReturns,
  };
}

/**
 * Calculate Fixed Deposit Returns
 * Formula: A = P(1 + r/n)^(nt)
 */
export function calculateFD(
  principal: number,
  annualRate: number,
  years: number,
  compoundingFrequency: 'monthly' | 'quarterly' | 'yearly' = 'quarterly'
): {
  maturityValue: number;
  interestEarned: number;
} {
  const r = annualRate / 100;
  const n =
    compoundingFrequency === 'monthly'
      ? 12
      : compoundingFrequency === 'quarterly'
        ? 4
        : 1;
  const t = years;

  const maturityValue = principal * Math.pow(1 + r / n, n * t);
  const interestEarned = maturityValue - principal;

  return {
    maturityValue,
    interestEarned,
  };
}

/**
 * Calculate PPF Maturity
 * PPF has special rules: 15-year lock-in, 7.1% interest (as of 2024)
 */
export function calculatePPF(
  yearlyInvestment: number,
  years: number = 15,
  interestRate: number = 7.1
): {
  maturityValue: number;
  totalInvestment: number;
  totalInterest: number;
} {
  let balance = 0;
  const rate = interestRate / 100;

  for (let i = 1; i <= years; i++) {
    // Assuming investment is made at the start of the year
    const interestEarned = (balance + yearlyInvestment) * rate;
    balance += yearlyInvestment + interestEarned;
  }

  const totalInvestment = yearlyInvestment * years;
  const totalInterest = balance - totalInvestment;

  return {
    maturityValue: balance,
    totalInvestment,
    totalInterest,
  };
}

/**
 * Calculate Retirement Corpus Needed
 */
export function calculateRetirementCorpus(
  currentAge: number,
  retirementAge: number,
  monthlyExpenses: number,
  lifeExpectancy: number = 85,
  inflationRate: number = 6,
  postRetirementReturn: number = 8
): {
  corpusNeeded: number;
  yearsToRetirement: number;
  retirementYears: number;
} {
  const yearsToRetirement = retirementAge - currentAge;
  const retirementYears = lifeExpectancy - retirementAge;

  // Future value of monthly expenses at retirement
  const futureMonthlyExpenses =
    monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);

  // Annual expenses at retirement
  const annualExpenses = futureMonthlyExpenses * 12;

  // Corpus needed using present value of annuity formula
  const realReturn = (postRetirementReturn - inflationRate) / 100;
  
  let corpusNeeded = 0;
  if (realReturn === 0) {
    // If real return is 0, the formula simplifies
    corpusNeeded = annualExpenses * retirementYears;
  } else {
    corpusNeeded =
      annualExpenses *
      ((1 - Math.pow(1 + realReturn, -retirementYears)) / realReturn);
  }

  return {
    corpusNeeded: isNaN(corpusNeeded) ? 0 : corpusNeeded,
    yearsToRetirement,
    retirementYears,
  };
}

/**
 * Calculate Future Value with Inflation
 */
export function calculateInflationImpact(
  currentValue: number,
  years: number,
  inflationRate: number = 6
): {
  futureValue: number;
  purchasingPowerLoss: number;
} {
  const futureValue = currentValue * Math.pow(1 + inflationRate / 100, years);
  const purchasingPowerLoss = futureValue - currentValue;

  return {
    futureValue,
    purchasingPowerLoss,
  };
}

export type Deductions = {
  isSalaried: boolean;
  hra: number;
  section80C: number;
  section80D: number;
  nps80CCD1B: number; // Employee's additional contribution
  nps80CCD2: number; // Employer's contribution
};

/**
 * Calculate Income Tax (Simplified for Indian Tax Slabs FY 2024-25)
 * Old Regime
 */
export function calculateIncomeTaxOld(income: number, deductions: Deductions): {
  tax: number;
  effectiveRate: number;
  taxBreakdown: Array<{ slab: string; tax: number }>;
} {
  const {
    isSalaried,
    hra,
    section80C,
    section80D,
    nps80CCD1B,
    nps80CCD2,
  } = deductions;

  const standardDeduction = isSalaried ? 50000 : 0;
  const totalDeductions =
    standardDeduction +
    hra +
    Math.min(section80C, 150000) + // Cap 80C
    section80D + // Cap for 80D is complex, assuming user enters valid exempted amount
    Math.min(nps80CCD1B, 50000) + // Cap 80CCD(1B)
    nps80CCD2; // Employer contribution

  const taxableIncome = Math.max(0, income - totalDeductions);

  const slabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 5 },
    { limit: 1000000, rate: 20 },
    { limit: Infinity, rate: 30 },
  ];

  let tax = 0;
  let taxBreakdown: Array<{ slab: string; tax: number }> = [];
  let remainingIncome = taxableIncome;
  let previousLimit = 0;

  for (const slab of slabs) {
    if (remainingIncome <= 0) break;

    const taxableInSlab = Math.min(
      remainingIncome,
      slab.limit - previousLimit
    );
    const slabTax = (taxableInSlab * slab.rate) / 100;

    if (slabTax > 0) {
      taxBreakdown.push({
        slab: `₹${previousLimit.toLocaleString()} - ₹${slab.limit === Infinity ? 'Above' : slab.limit.toLocaleString()}`,
        tax: slabTax,
      });
    }

    tax += slabTax;
    remainingIncome -= taxableInSlab;
    previousLimit = slab.limit;
  }

  // Add 4% cess
  tax = tax * 1.04;

  const effectiveRate = income > 0 ? (tax / income) * 100 : 0;

  return {
    tax,
    effectiveRate,
    taxBreakdown,
  };
}

/**
 * Format large numbers in Indian format (Lakhs, Crores)
 */
export function formatIndianNumber(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return `₹${num.toFixed(2)}`;
}

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 */
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number {
  if (initialValue <= 0 || years <= 0) return 0;
  const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;
  return cagr;
}

/**
 * Calculate Simple Interest
 */
export function calculateSimpleInterest(
  principal: number,
  rate: number,
  time: number
): {
  interest: number;
  totalAmount: number;
} {
  const interest = (principal * rate * time) / 100;
  const totalAmount = principal + interest;

  return {
    interest,
    totalAmount,
  };
}

/**
 * Calculate Compound Interest
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  compoundingFrequency: number = 1
): {
  interest: number;
  totalAmount: number;
} {
  const amount =
    principal * Math.pow(1 + rate / (100 * compoundingFrequency), compoundingFrequency * time);
  const interest = amount - principal;

  return {
    interest,
    totalAmount: amount,
  };
}

/**
 * Calculate Break-even Point for EMI Prepayment
 */
export function calculatePrepaymentBenefit(
  remainingPrincipal: number,
  interestRate: number,
  remainingMonths: number,
  prepaymentAmount: number
): {
  originalEMI: number;
  newEMI: number;
  interestSaved: number;
  tenureReduction: number;
} {
  // Calculate original EMI
  const monthlyRate = interestRate / 12 / 100;
  const originalEMI =
    (remainingPrincipal * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths)) /
    (Math.pow(1 + monthlyRate, remainingMonths) - 1);

  // Calculate new principal after prepayment
  const newPrincipal = remainingPrincipal - prepaymentAmount;

  // Calculate new EMI (keeping same EMI amount)
  let newMonths = 0;
  let balance = newPrincipal;

  while (balance > 0 && newMonths < remainingMonths) {
    const interest = balance * monthlyRate;
    const principalPaid = originalEMI - interest;
    balance -= principalPaid;
    newMonths++;
  }

  const tenureReduction = remainingMonths - newMonths;
  const originalTotalPayment = originalEMI * remainingMonths;
  const newTotalPayment = originalEMI * newMonths + prepaymentAmount;
  const interestSaved = originalTotalPayment - newTotalPayment;

  return {
    originalEMI,
    newEMI: originalEMI,
    interestSaved,
    tenureReduction,
  };
}

/**
 * Calculate Home Loan Eligibility
 */
export function calculateHomeLoanEligibility(
  monthlyIncome: number,
  existingEMI: number,
  interestRate: number,
  tenure: number,
  foirPercentage: number = 50
): {
  eligibleLoanAmount: number;
  maxEMI: number;
  foirUsed: number;
} {
  // FOIR = Fixed Obligation to Income Ratio
  const maxEMI = (monthlyIncome * foirPercentage) / 100 - existingEMI;

  if (maxEMI <= 0) {
    return {
      eligibleLoanAmount: 0,
      maxEMI: 0,
      foirUsed: 0,
    };
  }

  // Calculate eligible loan amount using EMI formula (reverse calculation)
  const monthlyRate = interestRate / 12 / 100;
  const months = tenure * 12;

  const eligibleLoanAmount =
    (maxEMI * (Math.pow(1 + monthlyRate, months) - 1)) /
    (monthlyRate * Math.pow(1 + monthlyRate, months));

  const foirUsed = ((existingEMI + maxEMI) / monthlyIncome) * 100;

  return {
    eligibleLoanAmount,
    maxEMI,
    foirUsed,
  };
}

/**
 * Calculate Gratuity Amount
 * Gratuity = (Last drawn salary × 15 × Years of service) / 26
 */
export function calculateGratuity(
  lastSalary: number,
  yearsOfService: number
): number {
  // Gratuity is payable after 5 years of continuous service
  if (yearsOfService < 5) return 0;

  const gratuity = (lastSalary * 15 * yearsOfService) / 26;

  // Maximum gratuity amount is ₹20 lakhs (as per current rules)
  return Math.min(gratuity, 2000000);
}

/**
 * Calculate Provident Fund (EPF) Maturity
 */
export function calculateEPF(
  monthlyBasic: number,
  yearsOfService: number,
  employeeContribution: number = 12,
  employerContribution: number = 12,
  interestRate: number = 8.25
): {
  totalContribution: number;
  interestEarned: number;
  maturityAmount: number;
} {
  let balance = 0;
  const monthlyEmployeeContribution = (monthlyBasic * employeeContribution) / 100;
  const monthlyEmployerContribution = (monthlyBasic * employerContribution) / 100;
  const monthlyContribution = monthlyEmployeeContribution + monthlyEmployerContribution;
  const monthlyRate = interestRate / 12 / 100;
  const months = yearsOfService * 12;

  // Calculate using future value of annuity formula
  const maturityAmount =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const totalContribution = monthlyContribution * months;
  const interestEarned = maturityAmount - totalContribution;

  return {
    totalContribution,
    interestEarned,
    maturityAmount,
  };
}

/**
 * Calculate Sukanya Samriddhi Yojana Returns
 * Lock-in: 21 years from account opening or marriage after 18 years
 */
export function calculateSSY(
  yearlyInvestment: number,
  contributionYears: number = 15,
  interestRate: number = 8.2
): {
  totalInvestment: number;
  maturityAmount: number;
  interestEarned: number;
} {
  let balance = 0;
  const rate = interestRate / 100;
  const maxInvestment = 150000; // Maximum per year
  const maturityYears = 21;

  const actualInvestment = Math.min(yearlyInvestment, maxInvestment);

  for (let i = 1; i <= maturityYears; i++) {
    let yearStartBalance = balance;
    if (i <= contributionYears) {
      balance += actualInvestment;
    }
    const interestForYear = balance * rate;
    balance += interestForYear;
  }

  const totalInvestment = actualInvestment * contributionYears;
  const interestEarned = balance - totalInvestment;

  return {
    totalInvestment,
    maturityAmount: balance,
    interestEarned,
  };
}

/**
 * Calculate National Pension System (NPS) Returns
 */
export function calculateNPS(
  monthlyContribution: number,
  currentAge: number,
  retirementAge: number = 60,
  expectedReturn: number = 10
): {
  totalContribution: number;
  maturityCorpus: number;
  returns: number;
  monthlyPension: number;
  lumpsum: number;
} {
  const years = retirementAge - currentAge;
  const months = years * 12;
  const monthlyRate = expectedReturn / 12 / 100;

  // Calculate maturity corpus using SIP formula
  const maturityCorpus =
    monthlyContribution *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const totalContribution = monthlyContribution * months;
  const returns = maturityCorpus - totalContribution;

  // At retirement, 60% must be used for annuity, 40% can be withdrawn
  const annuityAmount = maturityCorpus * 0.6;
  const lumpsum = maturityCorpus * 0.4;

  // Assume annuity rate of 6% for monthly pension calculation
  const monthlyPension = (annuityAmount * 0.06) / 12;

  return {
    totalContribution,
    maturityCorpus,
    returns,
    monthlyPension,
    lumpsum,
  };
}

/**
 * Calculate Income Tax (New Regime FY 2024-25)
 */

export function calculateIncomeTaxNew(income: number, deductions: { isSalaried: boolean, nps80CCD2: number }): {
  tax: number;
  effectiveRate: number;
  taxBreakdown: Array<{ slab: string; tax: number }>;
} {
  const { isSalaried, nps80CCD2 } = deductions;
  // New regime allows standard deduction and employer's NPS contribution
  const standardDeduction = isSalaried ? 50000 : 0;
  const totalDeductions = standardDeduction + nps80CCD2;
  const taxableIncome = Math.max(0, income - totalDeductions);

  const slabs = [
    { limit: 300000, rate: 0 },
    { limit: 700000, rate: 5 },
    { limit: 1000000, rate: 10 },
    { limit: 1200000, rate: 15 },
    { limit: 1500000, rate: 20 },
    { limit: Infinity, rate: 30 },
  ];

  let tax = 0;
  let taxBreakdown: Array<{ slab: string; tax: number }> = [];
  let remainingIncome = taxableIncome;
  let previousLimit = 0;

  for (const slab of slabs) {
    if (remainingIncome <= 0) break;

    const taxableInSlab = Math.min(
      remainingIncome,
      slab.limit - previousLimit
    );
    const slabTax = (taxableInSlab * slab.rate) / 100;

    if (slabTax > 0) {
      taxBreakdown.push({
        slab: `₹${previousLimit.toLocaleString()} - ₹${slab.limit === Infinity ? 'Above' : slab.limit.toLocaleString()}`,
        tax: slabTax,
      });
    }

    tax += slabTax;
    remainingIncome -= taxableInSlab;
    previousLimit = slab.limit;
  }

  // Add 4% cess
  tax = tax * 1.04;

  const effectiveRate = income > 0 ? (tax / income) * 100 : 0;

  return {
    tax,
    effectiveRate,
    taxBreakdown,
  };
}