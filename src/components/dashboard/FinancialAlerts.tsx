import React from 'react';
import { FinancialAlert } from '@/lib/notifications';
import { AlertCircle, Info, Bell } from 'lucide-react';

interface FinancialAlertsProps {
  alerts: FinancialAlert[];
}

const alertIcons = {
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  success: <Bell className="w-5 h-5 text-green-500" />,
};

const alertStyles = {
  warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
};

const FinancialAlerts: React.FC<FinancialAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className={`p-4 rounded-xl flex items-start gap-4 border ${alertStyles[alert.type]}`}>
          <div className="flex-shrink-0 mt-0.5">{alertIcons[alert.type]}</div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialAlerts;