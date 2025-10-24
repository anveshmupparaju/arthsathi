
import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
}

export default function MonthlyComparisonChart({ transactions }: Props) {
  const chartData = useMemo(() => {
    const monthsData: Record<string, { income: number; expense: number; investment: number }> = {};

    transactions.forEach((txn) => {
      const monthKey = `${txn.date.getFullYear()}-${String(txn.date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthsData[monthKey]) {
        monthsData[monthKey] = { income: 0, expense: 0, investment: 0 };
      }

      if (txn.type === 'income') {
        monthsData[monthKey].income += txn.amount;
      } else if (txn.type === 'expense') {
        monthsData[monthKey].expense += txn.amount;
      } else if (txn.type === 'investment') {
        monthsData[monthKey].investment += txn.amount;
      }
    });

    return Object.entries(monthsData)
      .map(([key, values]) => ({
        month: new Date(key + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        monthKey: key,
        ...values,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .slice(-6);
  }, [transactions]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend />
          <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} name="Income" />
          <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} name="Expense" />
          <Bar dataKey="investment" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Investment" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
