import React, { useMemo } from 'react';
import { Transaction, Account, Investment } from '@/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  accounts: Account[];
  investments: Investment[];
  transactions: Transaction[];
}

export default function NetWorthChart({ accounts, investments, transactions }: Props) {
  const chartData = useMemo(() => {
    const monthsData: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsData[key] = 0;
    }

    Object.keys(monthsData).forEach((monthKey) => {
      const monthTransactions = transactions.filter((txn) => {
        const txnKey = `${txn.date.getFullYear()}-${String(txn.date.getMonth() + 1).padStart(2, '0')}`;
        return txnKey <= monthKey;
      });

      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const investment = monthTransactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);
      
      monthsData[monthKey] = income - expense - investment;
    });

    return Object.entries(monthsData).map(([key, savings]) => ({
      month: new Date(key + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      netWorth: Math.max(0, savings),
    }));
  }, [accounts, investments, transactions]);

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
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <Area 
            type="monotone" 
            dataKey="netWorth" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorNetWorth)" 
            name="Net Worth"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
