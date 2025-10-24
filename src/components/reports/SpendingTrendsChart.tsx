import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
  period: { start: Date; end: Date };
}

export default function SpendingTrendsChart({ transactions, period }: Props) {
  const chartData = useMemo(() => {
    const filtered = transactions.filter(
      (txn) => txn.date >= period.start && txn.date <= period.end
    );

    // Group by day
    const dailyData: Record<string, { income: number; expense: number; date: string }> = {};

    filtered.forEach((txn) => {
      const dateKey = txn.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { income: 0, expense: 0, date: dateKey };
      }

      if (txn.type === 'income') {
        dailyData[dateKey].income += txn.amount;
      } else if (txn.type === 'expense') {
        dailyData[dateKey].expense += txn.amount;
      }
    });

    return Object.values(dailyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => ({
        ...item,
        dateLabel: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      }));
  }, [transactions, period]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        No transaction data for this period
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="dateLabel" stroke="#6b7280" />
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
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            name="Income"
          />
          <Line 
            type="monotone" 
            dataKey="expense" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            name="Expense"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
