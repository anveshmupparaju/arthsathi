import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
  period: { start: Date; end: Date };
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', 
  '#06b6d4', '#ef4444', '#6366f1', '#f97316', '#14b8a6'
];

export default function CategoryBreakdownChart({ transactions, period }: Props) {
  const chartData = useMemo(() => {
    const filtered = transactions.filter(
      (txn) => txn.date >= period.start && txn.date <= period.end && txn.type === 'expense'
    );

    const categoryTotals: Record<string, number> = {};
    filtered.forEach((txn) => {
      categoryTotals[txn.category] = (categoryTotals[txn.category] || 0) + txn.amount;
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [transactions, period]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        No expense data for this period
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
