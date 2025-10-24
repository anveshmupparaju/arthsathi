import React, { useMemo } from 'react';
import { Transaction } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
  period: { start: Date; end: Date };
}

export default function IncomeVsExpenseChart({ transactions, period }: Props) {
  const chartData = useMemo(() => {
    const filtered = transactions.filter(
      (txn) => txn.date >= period.start && txn.date <= period.end
    );

    const income = filtered.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const investment = filtered.filter((t) => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);

    return [
      { name: 'Income', value: income, fill: '#10b981' },
      { name: 'Expense', value: expense, fill: '#ef4444' },
      { name: 'Investment', value: investment, fill: '#8b5cf6' },
    ];
  }, [transactions, period]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="name" stroke="#6b7280" />
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
          <Bar dataKey="value" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
