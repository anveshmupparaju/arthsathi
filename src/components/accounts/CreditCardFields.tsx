import React from 'react';

interface CreditCardFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const CreditCardFields: React.FC<CreditCardFieldsProps> = ({ formData, setFormData }) => {
  return (
    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 space-y-4">
      <h4 className="text-md font-semibold text-purple-900 dark:text-purple-300">Credit Card Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Credit Limit
          </label>
          <input
            type="number"
            value={formData.creditLimit || ''}
            onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="100000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Statement Date (Day)
          </label>
          <input
            type="number"
            value={formData.statementDate || ''}
            onChange={(e) => setFormData({ ...formData, statementDate: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="1" max="31"
            placeholder="e.g., 15"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Due Date (Day)
          </label>
          <input
            type="number"
            value={formData.dueDate || ''}
            onChange={(e) => setFormData({ ...formData, dueDate: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            min="1" max="31"
            placeholder="e.g., 5"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreditCardFields);
