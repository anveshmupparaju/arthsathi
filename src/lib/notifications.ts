import { Account, Transaction } from '@/types';
import { formatCurrency, formatDate } from './utils';

export interface FinancialAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  date: Date;
}

/**
 * Generates financial alerts based on user's accounts and transactions.
 * This function can be expanded to check for more types of events.
 */
export function generateFinancialAlerts(
  accounts: Account[],
  transactions: Transaction[],
  daysLookahead: number = 5
): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];
  const today = new Date();
  const lookaheadDate = new Date();
  lookaheadDate.setDate(today.getDate() + daysLookahead);

  // --- Check for upcoming Credit Card due dates ---
  const creditCards = accounts.filter(acc => acc.accountType === 'credit_card' && acc.isActive);

  creditCards.forEach(card => {
    if (card.dueDate) {
      const dueDateThisMonth = new Date(today.getFullYear(), today.getMonth(), card.dueDate);

      // Check if due date is within the lookahead period
      if (dueDateThisMonth >= today && dueDateThisMonth <= lookaheadDate) {
        // Simple check: has a payment (transfer) been made to this card recently?
        const recentPayment = transactions.find(t =>
          t.type === 'transfer' &&
          t.toAccountId === card.id &&
          new Date(t.date) > new Date(today.getFullYear(), today.getMonth(), 1) // This month
        );

        if (!recentPayment && card.balance < 0) { // Only alert if there's a balance
          alerts.push({
            id: `cc-due-${card.id}`,
            type: 'warning',
            title: `Upcoming Bill: ${card.accountName}`,
            message: `Your credit card bill for ${formatCurrency(Math.abs(card.balance))} is due on ${formatDate(dueDateThisMonth)}.`,
            date: dueDateThisMonth,
          });
        }
      }
    }
  });

  // --- Check for upcoming Loan EMI dates ---
  const loans = accounts.filter(acc => acc.accountType.includes('_loan') && acc.isActive);

  loans.forEach(loan => {
    if (loan.emiDate && loan.emiAmount) {
      const emiDateThisMonth = new Date(today.getFullYear(), today.getMonth(), loan.emiDate);

      if (emiDateThisMonth >= today && emiDateThisMonth <= lookaheadDate) {
        alerts.push({
          id: `emi-due-${loan.id}`,
          type: 'info',
          title: `Upcoming EMI: ${loan.accountName}`,
          message: `An EMI of ${formatCurrency(loan.emiAmount)} is scheduled for ${formatDate(emiDateThisMonth)}.`,
          date: emiDateThisMonth,
        });
      }
    }
  });

  // Sort alerts by date
  return alerts.sort((a, b) => a.date.getTime() - b.date.getTime());
}