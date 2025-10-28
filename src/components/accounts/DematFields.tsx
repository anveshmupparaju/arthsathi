import React from 'react';

interface DematFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const DematFields: React.FC<DematFieldsProps> = ({ formData, setFormData }) => {
  return (
    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-4">
      <h4 className="text-md font-semibold text-indigo-900 dark:text-indigo-300">Demat & Trading Account Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Broker Name
          </label>
          <input
            type="text"
            value={formData.brokerName || ''}
            onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Zerodha, Groww"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Depository
          </label>
          <select
            value={formData.depository || ''}
            onChange={(e) => setFormData({ ...formData, depository: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Depository</option>
            <option value="NSDL">NSDL</option>
            <option value="CDSL">CDSL</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            DP ID
          </label>
          <input
            type="text"
            value={formData.dpId || ''}
            onChange={(e) => setFormData({ ...formData, dpId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Depository Participant ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client ID / BO ID
          </label>
          <input
            type="text"
            value={formData.clientId || ''}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Beneficiary Owner ID"
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(DematFields);