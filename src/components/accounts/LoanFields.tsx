import React from 'react';
import { Account } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface LoanFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  allAccounts: Account[];
}

const LoanFields: React.FC<LoanFieldsProps> = ({ formData, setFormData, allAccounts }) => {
  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 space-y-4">
      <h4 className="text-md font-semibold text-blue-900 dark:text-blue-300">Loan Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Loan Amount
          </label>
          <input
            type="number"
            value={formData.loanAmount || ''}
            onChange={(e) => setFormData({ ...formData, loanAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="500000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Interest Rate (% p.a.)
          </label>
          <input
            type="number"
            value={formData.interestRate || ''}
            onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="9.5"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tenure (Months)
          </label>
          <input
            type="number"
            value={formData.tenure || ''}
            onChange={(e) => setFormData({ ...formData, tenure: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="60"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            EMI Amount
          </label>
          <input
            type="number"
            value={formData.emiAmount || ''}
            onChange={(e) => setFormData({ ...formData, emiAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="10500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            EMI Date (Day of Month)
          </label>
          <input
            type="number"
            value={formData.emiDate || ''}
            onChange={(e) => setFormData({ ...formData, emiDate: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="1" max="31"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="autoDebit" checked={formData.autoDebit} onChange={(e) => setFormData({ ...formData, autoDebit: e.target.checked })} className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <label htmlFor="autoDebit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Debit Enabled</label>
      </div>
      {formData.autoDebit && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Debit from Account</label>
          <select value={formData.autoDebitAccountId} onChange={(e) => setFormData({ ...formData, autoDebitAccountId: e.target.value })} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Select debit account</option>
            {allAccounts.filter(acc => !acc.accountType.includes('_loan')).map(acc => (
              <option key={acc.id} value={acc.id}>{acc.accountName} ({formatCurrency(acc.balance)})</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default React.memo(LoanFields);
