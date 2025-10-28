import React from 'react';
import { AccountType } from '@/types';

interface InvestmentFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
  accountType: AccountType;
}

const InvestmentFields: React.FC<InvestmentFieldsProps> = ({ formData, setFormData, accountType }) => {
  const isRD = accountType === 'recurring_deposit';

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 space-y-4">
      <h4 className="text-md font-semibold text-green-900 dark:text-green-300">Investment Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isRD ? 'Total Deposited' : 'Principal Amount'}
          </label>
          <input
            type="number"
            value={formData.principalAmount || ''}
            onChange={(e) => setFormData({ ...formData, principalAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="50000"
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="7.5"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maturity Date
          </label>
          <input
            type="date"
            value={formData.maturityDate || ''}
            onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isRD && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Installment Amount
            </label>
            <input
              type="number"
              value={formData.installmentAmount || ''}
              onChange={(e) => setFormData({ ...formData, installmentAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="5000"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Maturity Amount
          </label>
          <input
            type="number"
            value={formData.maturityAmount || ''}
            onChange={(e) => setFormData({ ...formData, maturityAmount: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="65000"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(InvestmentFields);
