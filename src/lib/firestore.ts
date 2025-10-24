import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { encryptData, decryptData } from './encryption';
import { Account } from '@/types';
import { Transaction } from '@/types';
import { Budget } from '@/types';
import { Investment } from '@/types';
import { Goal } from '@/types';
import { Category } from '@/types';

/**
 * Account Firestore Operations
 */

// Create a new account
export async function createAccount(
  userId: string,
  accountData: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  encryptionKey: CryptoKey
): Promise<string> {
  try {
    // Generate account ID
    const accountRef = doc(collection(db, 'users', userId, 'accounts'));
    const accountId = accountRef.id;

    // Encrypt sensitive fields
    const encryptedData = await encryptData(
      {
        accountName: accountData.accountName,
        bankName: accountData.bankName,
        accountNumber: accountData.accountNumber,
      },
      encryptionKey
    );

    // Prepare document for Firestore
    const firestoreDoc = {
      data: encryptedData, // Encrypted blob
      accountType: accountData.accountType, // Unencrypted for filtering
      balance: accountData.balance,
      currency: accountData.currency,
      isActive: accountData.isActive,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(accountRef, firestoreDoc);
    return accountId;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

// Get all accounts for a user
export async function getAccounts(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Account[]> {
  try {
    const accountsRef = collection(db, 'users', userId, 'accounts');
    const q = query(accountsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const accounts: Account[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Decrypt sensitive data
      const decryptedData = await decryptData(data.data, encryptionKey);

      accounts.push({
        id: docSnap.id,
        userId,
        accountName: decryptedData.accountName,
        accountType: data.accountType,
        bankName: decryptedData.bankName,
        accountNumber: decryptedData.accountNumber,
        balance: data.balance,
        currency: data.currency,
        isActive: data.isActive,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return accounts;
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
}

// Get a single account by ID
export async function getAccount(
  userId: string,
  accountId: string,
  encryptionKey: CryptoKey
): Promise<Account | null> {
  try {
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);
    const docSnap = await getDoc(accountRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const decryptedData = await decryptData(data.data, encryptionKey);

    return {
      id: docSnap.id,
      userId,
      accountName: decryptedData.accountName,
      accountType: data.accountType,
      bankName: decryptedData.bankName,
      accountNumber: decryptedData.accountNumber,
      balance: data.balance,
      currency: data.currency,
      isActive: data.isActive,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
}

// Update an account
export async function updateAccount(
  userId: string,
  accountId: string,
  accountData: Partial<Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  encryptionKey: CryptoKey
): Promise<void> {
  try {
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);

    // Separate encrypted and unencrypted fields
    const encryptedFields: any = {};
    const unencryptedFields: any = {};

    if (accountData.accountName !== undefined) encryptedFields.accountName = accountData.accountName;
    if (accountData.bankName !== undefined) encryptedFields.bankName = accountData.bankName;
    if (accountData.accountNumber !== undefined) encryptedFields.accountNumber = accountData.accountNumber;

    if (accountData.accountType !== undefined) unencryptedFields.accountType = accountData.accountType;
    if (accountData.balance !== undefined) unencryptedFields.balance = accountData.balance;
    if (accountData.currency !== undefined) unencryptedFields.currency = accountData.currency;
    if (accountData.isActive !== undefined) unencryptedFields.isActive = accountData.isActive;

    // Encrypt sensitive data if any
    if (Object.keys(encryptedFields).length > 0) {
      // Get existing encrypted data
      const docSnap = await getDoc(accountRef);
      if (docSnap.exists()) {
        const existingData = await decryptData(docSnap.data().data, encryptionKey);
        const mergedData = { ...existingData, ...encryptedFields };
        const encryptedData = await encryptData(mergedData, encryptionKey);
        unencryptedFields.data = encryptedData;
      }
    }

    unencryptedFields.updatedAt = serverTimestamp();

    await updateDoc(accountRef, unencryptedFields);
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
}

// Delete an account
export async function deleteAccount(
  userId: string,
  accountId: string
): Promise<void> {
  try {
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);
    await deleteDoc(accountRef);
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

// Get active accounts only
export async function getActiveAccounts(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Account[]> {
  try {
    const accountsRef = collection(db, 'users', userId, 'accounts');
    const q = query(
      accountsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const accounts: Account[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      accounts.push({
        id: docSnap.id,
        userId,
        accountName: decryptedData.accountName,
        accountType: data.accountType,
        bankName: decryptedData.bankName,
        accountNumber: decryptedData.accountNumber,
        balance: data.balance,
        currency: data.currency,
        isActive: data.isActive,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return accounts;
  } catch (error) {
    console.error('Error fetching active accounts:', error);
    throw error;
  }
}

// Get accounts by type
export async function getAccountsByType(
  userId: string,
  accountType: string,
  encryptionKey: CryptoKey
): Promise<Account[]> {
  try {
    const accountsRef = collection(db, 'users', userId, 'accounts');
    const q = query(
      accountsRef,
      where('accountType', '==', accountType),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const accounts: Account[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      accounts.push({
        id: docSnap.id,
        userId,
        accountName: decryptedData.accountName,
        accountType: data.accountType,
        bankName: decryptedData.bankName,
        accountNumber: decryptedData.accountNumber,
        balance: data.balance,
        currency: data.currency,
        isActive: data.isActive,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return accounts;
  } catch (error) {
    console.error('Error fetching accounts by type:', error);
    throw error;
  }
}

// Calculate total balance across all accounts
export async function getTotalBalance(
  userId: string,
  encryptionKey: CryptoKey
): Promise<number> {
  try {
    const accounts = await getActiveAccounts(userId, encryptionKey);
    return accounts.reduce((total, account) => total + account.balance, 0);
  } catch (error) {
    console.error('Error calculating total balance:', error);
    throw error;
  }
}

/**
 * Transaction Firestore Operations
 */

// Create a new transaction
export async function createTransaction(
  userId: string,
  transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  encryptionKey: CryptoKey
): Promise<string> {
  try {
    const transactionRef = doc(collection(db, 'users', userId, 'transactions'));
    const transactionId = transactionRef.id;

    // Encrypt sensitive fields
    const encryptedData = await encryptData(
      {
        description: transactionData.description,
        merchant: transactionData.merchant,
        notes: transactionData.notes,
        tags: transactionData.tags,
        attachments: transactionData.attachments,
      },
      encryptionKey
    );

    // Prepare document for Firestore
    const firestoreDoc = {
      data: encryptedData, // Encrypted blob
      date: Timestamp.fromDate(transactionData.date),
      amount: transactionData.amount,
      type: transactionData.type,
      category: transactionData.category,
      subcategory: transactionData.subcategory || null,
      accountId: transactionData.accountId,
      paymentMethod: transactionData.paymentMethod,
      isRecurring: transactionData.isRecurring,
      recurringId: transactionData.recurringId || null,
      location: transactionData.location || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(transactionRef, firestoreDoc);

    // Update account balance
    if (transactionData.accountId) {
      await updateAccountBalance(
        userId,
        transactionData.accountId,
        transactionData.amount,
        transactionData.type
      );
    }

    return transactionId;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Get all transactions for a user
export async function getTransactions(
  userId: string,
  encryptionKey: CryptoKey,
  limit?: number
): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    let q = query(transactionsRef, orderBy('date', 'desc'));
    
    if (limit) {
      q = query(q, limit as any);
    }
    
    const snapshot = await getDocs(q);

    const transactions: Transaction[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      transactions.push({
        id: docSnap.id,
        userId,
        date: (data.date as Timestamp).toDate(),
        amount: data.amount,
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
        description: decryptedData.description,
        merchant: decryptedData.merchant,
        accountId: data.accountId,
        paymentMethod: data.paymentMethod,
        tags: decryptedData.tags || [],
        attachments: decryptedData.attachments || [],
        isRecurring: data.isRecurring,
        recurringId: data.recurringId,
        notes: decryptedData.notes,
        location: data.location,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Get transactions by date range
export async function getTransactionsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date,
  encryptionKey: CryptoKey
): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(
      transactionsRef,
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);

    const transactions: Transaction[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      transactions.push({
        id: docSnap.id,
        userId,
        date: (data.date as Timestamp).toDate(),
        amount: data.amount,
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
        description: decryptedData.description,
        merchant: decryptedData.merchant,
        accountId: data.accountId,
        paymentMethod: data.paymentMethod,
        tags: decryptedData.tags || [],
        attachments: decryptedData.attachments || [],
        isRecurring: data.isRecurring,
        recurringId: data.recurringId,
        notes: decryptedData.notes,
        location: data.location,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    throw error;
  }
}

// Get transactions by account
export async function getTransactionsByAccount(
  userId: string,
  accountId: string,
  encryptionKey: CryptoKey
): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(
      transactionsRef,
      where('accountId', '==', accountId),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);

    const transactions: Transaction[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      transactions.push({
        id: docSnap.id,
        userId,
        date: (data.date as Timestamp).toDate(),
        amount: data.amount,
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
        description: decryptedData.description,
        merchant: decryptedData.merchant,
        accountId: data.accountId,
        paymentMethod: data.paymentMethod,
        tags: decryptedData.tags || [],
        attachments: decryptedData.attachments || [],
        isRecurring: data.isRecurring,
        recurringId: data.recurringId,
        notes: decryptedData.notes,
        location: data.location,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions by account:', error);
    throw error;
  }
}

// Update a transaction
export async function updateTransaction(
  userId: string,
  transactionId: string,
  oldTransaction: Transaction,
  transactionData: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  encryptionKey: CryptoKey
): Promise<void> {
  try {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);

    // Separate encrypted and unencrypted fields
    const encryptedFields: any = {};
    const unencryptedFields: any = {};

    if (transactionData.description !== undefined) encryptedFields.description = transactionData.description;
    if (transactionData.merchant !== undefined) encryptedFields.merchant = transactionData.merchant;
    if (transactionData.notes !== undefined) encryptedFields.notes = transactionData.notes;
    if (transactionData.tags !== undefined) encryptedFields.tags = transactionData.tags;
    if (transactionData.attachments !== undefined) encryptedFields.attachments = transactionData.attachments;

    if (transactionData.date !== undefined) unencryptedFields.date = Timestamp.fromDate(transactionData.date);
    if (transactionData.amount !== undefined) unencryptedFields.amount = transactionData.amount;
    if (transactionData.type !== undefined) unencryptedFields.type = transactionData.type;
    if (transactionData.category !== undefined) unencryptedFields.category = transactionData.category;
    if (transactionData.subcategory !== undefined) unencryptedFields.subcategory = transactionData.subcategory;
    if (transactionData.accountId !== undefined) unencryptedFields.accountId = transactionData.accountId;
    if (transactionData.paymentMethod !== undefined) unencryptedFields.paymentMethod = transactionData.paymentMethod;
    if (transactionData.isRecurring !== undefined) unencryptedFields.isRecurring = transactionData.isRecurring;
    if (transactionData.recurringId !== undefined) unencryptedFields.recurringId = transactionData.recurringId;
    if (transactionData.location !== undefined) unencryptedFields.location = transactionData.location;

    // Encrypt sensitive data if any
    if (Object.keys(encryptedFields).length > 0) {
      const docSnap = await getDoc(transactionRef);
      if (docSnap.exists()) {
        const existingData = await decryptData(docSnap.data().data, encryptionKey);
        const mergedData = { ...existingData, ...encryptedFields };
        const encryptedData = await encryptData(mergedData, encryptionKey);
        unencryptedFields.data = encryptedData;
      }
    }

    unencryptedFields.updatedAt = serverTimestamp();

    await updateDoc(transactionRef, unencryptedFields);

    // Update account balance if amount or type changed
    if (
      (transactionData.amount !== undefined || transactionData.type !== undefined) &&
      oldTransaction.accountId
    ) {
      // Reverse old transaction
      await updateAccountBalance(
        userId,
        oldTransaction.accountId,
        -oldTransaction.amount,
        oldTransaction.type
      );

      // Apply new transaction
      const newAmount = transactionData.amount ?? oldTransaction.amount;
      const newType = transactionData.type ?? oldTransaction.type;
      await updateAccountBalance(userId, oldTransaction.accountId, newAmount, newType);
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

// Delete a transaction
export async function deleteTransaction(
  userId: string,
  transactionId: string,
  transaction: Transaction
): Promise<void> {
  try {
    const transactionRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(transactionRef);

    // Reverse the account balance
    if (transaction.accountId) {
      await updateAccountBalance(
        userId,
        transaction.accountId,
        -transaction.amount,
        transaction.type
      );
    }
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

// Helper: Update account balance
async function updateAccountBalance(
  userId: string,
  accountId: string,
  amount: number,
  type: string
): Promise<void> {
  try {
    const accountRef = doc(db, 'users', userId, 'accounts', accountId);
    const accountSnap = await getDoc(accountRef);

    if (accountSnap.exists()) {
      const currentBalance = accountSnap.data().balance || 0;
      let newBalance = currentBalance;

      if (type === 'income') {
        newBalance = currentBalance + amount;
      } else if (type === 'expense') {
        newBalance = currentBalance - amount;
      } else if (type === 'investment') {
        newBalance = currentBalance - amount;
      }

      await updateDoc(accountRef, {
        balance: newBalance,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating account balance:', error);
    throw error;
  }
}

// Get transactions by category
export async function getTransactionsByCategory(
  userId: string,
  category: string,
  encryptionKey: CryptoKey
): Promise<Transaction[]> {
  try {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(
      transactionsRef,
      where('category', '==', category),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);

    const transactions: Transaction[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      transactions.push({
        id: docSnap.id,
        userId,
        date: (data.date as Timestamp).toDate(),
        amount: data.amount,
        type: data.type,
        category: data.category,
        subcategory: data.subcategory,
        description: decryptedData.description,
        merchant: decryptedData.merchant,
        accountId: data.accountId,
        paymentMethod: data.paymentMethod,
        tags: decryptedData.tags || [],
        attachments: decryptedData.attachments || [],
        isRecurring: data.isRecurring,
        recurringId: data.recurringId,
        notes: decryptedData.notes,
        location: data.location,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions by category:', error);
    throw error;
  }
}

// Get spending summary by category for a date range
export async function getSpendingSummary(
  userId: string,
  startDate: Date,
  endDate: Date,
  encryptionKey: CryptoKey
): Promise<Record<string, number>> {
  try {
    const transactions = await getTransactionsByDateRange(
      userId,
      startDate,
      endDate,
      encryptionKey
    );

    const summary: Record<string, number> = {};

    transactions.forEach((txn) => {
      if (txn.type === 'expense') {
        if (!summary[txn.category]) {
          summary[txn.category] = 0;
        }
        summary[txn.category] += txn.amount;
      }
    });

    return summary;
  } catch (error) {
    console.error('Error getting spending summary:', error);
    throw error;
  }
}

/**
 * Budget Firestore Operations
 */

// Create a new budget
export async function createBudget(
  userId: string,
  budgetData: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  encryptionKey: CryptoKey
): Promise<string> {
  try {
    const budgetRef = doc(collection(db, 'users', userId, 'budgets'));
    const budgetId = budgetRef.id;

    // Encrypt sensitive fields
    const encryptedData = await encryptData(
      {
        name: budgetData.name,
        categoryIds: budgetData.categoryIds,
      },
      encryptionKey
    );

    // Prepare document for Firestore
    const firestoreDoc = {
      data: encryptedData,
      amount: budgetData.amount,
      period: budgetData.period,
      startDate: Timestamp.fromDate(budgetData.startDate),
      endDate: budgetData.endDate ? Timestamp.fromDate(budgetData.endDate) : null,
      rollover: budgetData.rollover,
      alertThreshold: budgetData.alertThreshold,
      isActive: budgetData.isActive,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(budgetRef, firestoreDoc);
    return budgetId;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw error;
  }
}

// Get all budgets for a user
export async function getBudgets(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Budget[]> {
  try {
    const budgetsRef = collection(db, 'users', userId, 'budgets');
    const q = query(budgetsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const budgets: Budget[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      budgets.push({
        id: docSnap.id,
        userId,
        name: decryptedData.name,
        categoryIds: decryptedData.categoryIds,
        amount: data.amount,
        period: data.period,
        startDate: (data.startDate as Timestamp).toDate(),
        endDate: data.endDate ? (data.endDate as Timestamp).toDate() : undefined,
        rollover: data.rollover,
        alertThreshold: data.alertThreshold,
        isActive: data.isActive,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return budgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw error;
  }
}

// Get active budgets only
export async function getActiveBudgets(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Budget[]> {
  try {
    const budgetsRef = collection(db, 'users', userId, 'budgets');
    const q = query(
      budgetsRef,
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const budgets: Budget[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      budgets.push({
        id: docSnap.id,
        userId,
        name: decryptedData.name,
        categoryIds: decryptedData.categoryIds,
        amount: data.amount,
        period: data.period,
        startDate: (data.startDate as Timestamp).toDate(),
        endDate: data.endDate ? (data.endDate as Timestamp).toDate() : undefined,
        rollover: data.rollover,
        alertThreshold: data.alertThreshold,
        isActive: data.isActive,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return budgets;
  } catch (error) {
    console.error('Error fetching active budgets:', error);
    throw error;
  }
}

// Update a budget
export async function updateBudget(
  userId: string,
  budgetId: string,
  budgetData: Partial<Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  encryptionKey: CryptoKey
): Promise<void> {
  try {
    const budgetRef = doc(db, 'users', userId, 'budgets', budgetId);

    const encryptedFields: any = {};
    const unencryptedFields: any = {};

    if (budgetData.name !== undefined) encryptedFields.name = budgetData.name;
    if (budgetData.categoryIds !== undefined) encryptedFields.categoryIds = budgetData.categoryIds;

    if (budgetData.amount !== undefined) unencryptedFields.amount = budgetData.amount;
    if (budgetData.period !== undefined) unencryptedFields.period = budgetData.period;
    if (budgetData.startDate !== undefined) unencryptedFields.startDate = Timestamp.fromDate(budgetData.startDate);
    if (budgetData.endDate !== undefined) unencryptedFields.endDate = budgetData.endDate ? Timestamp.fromDate(budgetData.endDate) : null;
    if (budgetData.rollover !== undefined) unencryptedFields.rollover = budgetData.rollover;
    if (budgetData.alertThreshold !== undefined) unencryptedFields.alertThreshold = budgetData.alertThreshold;
    if (budgetData.isActive !== undefined) unencryptedFields.isActive = budgetData.isActive;

    if (Object.keys(encryptedFields).length > 0) {
      const docSnap = await getDoc(budgetRef);
      if (docSnap.exists()) {
        const existingData = await decryptData(docSnap.data().data, encryptionKey);
        const mergedData = { ...existingData, ...encryptedFields };
        const encryptedData = await encryptData(mergedData, encryptionKey);
        unencryptedFields.data = encryptedData;
      }
    }

    unencryptedFields.updatedAt = serverTimestamp();

    await updateDoc(budgetRef, unencryptedFields);
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
}

// Delete a budget
export async function deleteBudget(
  userId: string,
  budgetId: string
): Promise<void> {
  try {
    const budgetRef = doc(db, 'users', userId, 'budgets', budgetId);
    await deleteDoc(budgetRef);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
}

// Get budget spending for current period
export async function getBudgetSpending(
  userId: string,
  budget: Budget,
  encryptionKey: CryptoKey
): Promise<number> {
  try {
    const now = new Date();
    let startDate = budget.startDate;
    let endDate = budget.endDate || now;

    // Calculate period dates
    if (budget.period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (budget.period === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    // Get transactions for budget categories in period
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(
      transactionsRef,
      where('date', '>=', Timestamp.fromDate(startDate)),
      where('date', '<=', Timestamp.fromDate(endDate)),
      where('type', '==', 'expense')
    );

    const snapshot = await getDocs(q);
    let totalSpent = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      // Check if transaction category is in budget categories
      if (budget.categoryIds.includes(data.category)) {
        totalSpent += data.amount;
      }
    }

    return totalSpent;
  } catch (error) {
    console.error('Error getting budget spending:', error);
    throw error;
  }
}

// Get all budgets with their spending
export async function getBudgetsWithSpending(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Array<Budget & { spent: number; percentage: number }>> {
  try {
    const budgets = await getBudgets(userId, encryptionKey);
    const budgetsWithSpending = [];

    for (const budget of budgets) {
      const spent = await getBudgetSpending(userId, budget, encryptionKey);
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      budgetsWithSpending.push({
        ...budget,
        spent,
        percentage,
      });
    }

    return budgetsWithSpending;
  } catch (error) {
    console.error('Error getting budgets with spending:', error);
    throw error;
  }
}

/**
 * Goal Firestore Operations
 */

// Create a new goal
export async function createGoal(
  userId: string,
  goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  encryptionKey: CryptoKey
): Promise<string> {
  try {
    const goalRef = doc(collection(db, 'users', userId, 'goals'));
    const goalId = goalRef.id;

    // Encrypt sensitive fields
    const encryptedData = await encryptData(
      {
        name: goalData.name,
        description: goalData.description,
        linkedAccountIds: goalData.linkedAccountIds,
      },
      encryptionKey
    );

    // Prepare document for Firestore
    const firestoreDoc = {
      data: encryptedData,
      targetAmount: goalData.targetAmount,
      currentAmount: goalData.currentAmount,
      targetDate: Timestamp.fromDate(goalData.targetDate),
      priority: goalData.priority,
      icon: goalData.icon,
      color: goalData.color,
      isCompleted: goalData.isCompleted,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(goalRef, firestoreDoc);
    return goalId;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
}

// Get all goals for a user
export async function getGoals(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Goal[]> {
  try {
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(goalsRef, orderBy('targetDate', 'asc'));
    const snapshot = await getDocs(q);

    const goals: Goal[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      goals.push({
        id: docSnap.id,
        userId,
        name: decryptedData.name,
        description: decryptedData.description,
        linkedAccountIds: decryptedData.linkedAccountIds || [],
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount,
        targetDate: (data.targetDate as Timestamp).toDate(),
        priority: data.priority,
        icon: data.icon,
        color: data.color,
        isCompleted: data.isCompleted,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
}

// Update a goal
export async function updateGoal(
  userId: string,
  goalId: string,
  goalData: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  encryptionKey: CryptoKey
): Promise<void> {
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);

    const encryptedFields: any = {};
    const unencryptedFields: any = {};

    if (goalData.name !== undefined) encryptedFields.name = goalData.name;
    if (goalData.description !== undefined) encryptedFields.description = goalData.description;
    if (goalData.linkedAccountIds !== undefined) encryptedFields.linkedAccountIds = goalData.linkedAccountIds;

    if (goalData.targetAmount !== undefined) unencryptedFields.targetAmount = goalData.targetAmount;
    if (goalData.currentAmount !== undefined) unencryptedFields.currentAmount = goalData.currentAmount;
    if (goalData.targetDate !== undefined) unencryptedFields.targetDate = Timestamp.fromDate(goalData.targetDate);
    if (goalData.priority !== undefined) unencryptedFields.priority = goalData.priority;
    if (goalData.icon !== undefined) unencryptedFields.icon = goalData.icon;
    if (goalData.color !== undefined) unencryptedFields.color = goalData.color;
    if (goalData.isCompleted !== undefined) unencryptedFields.isCompleted = goalData.isCompleted;

    if (Object.keys(encryptedFields).length > 0) {
      const docSnap = await getDoc(goalRef);
      if (docSnap.exists()) {
        const existingData = await decryptData(docSnap.data().data, encryptionKey);
        const mergedData = { ...existingData, ...encryptedFields };
        const encryptedData = await encryptData(mergedData, encryptionKey);
        unencryptedFields.data = encryptedData;
      }
    }

    unencryptedFields.updatedAt = serverTimestamp();

    await updateDoc(goalRef, unencryptedFields);
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
}

// Delete a goal
export async function deleteGoal(
  userId: string,
  goalId: string
): Promise<void> {
  try {
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
}

/**
 * Category Firestore Operations
 */

// Create a new category
export async function createCategory(
  userId: string,
  categoryData: Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  encryptionKey: CryptoKey
): Promise<string> {
  try {
    const categoryRef = doc(collection(db, 'users', userId, 'categories'));
    const categoryId = categoryRef.id;

    // Encrypt sensitive fields
    const encryptedData = await encryptData(
      {
        name: categoryData.name,
      },
      encryptionKey
    );

    // Prepare document for Firestore
    const firestoreDoc = {
      data: encryptedData,
      type: categoryData.type,
      icon: categoryData.icon,
      color: categoryData.color,
      isDefault: false, // Custom categories are never default
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(categoryRef, firestoreDoc);
    return categoryId;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

// Get all custom categories for a user
export async function getCategories(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const q = query(categoriesRef, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);

    const categories: Category[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      categories.push({
        id: docSnap.id,
        userId,
        name: decryptedData.name,
        type: data.type,
        icon: data.icon,
        color: data.color,
        isDefault: data.isDefault,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Update a category
export async function updateCategory(
  userId: string,
  categoryId: string,
  categoryData: Partial<Omit<Category, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  encryptionKey: CryptoKey
): Promise<void> {
  try {
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);

    const encryptedFields: any = {};
    const unencryptedFields: any = {};

    if (categoryData.name !== undefined) encryptedFields.name = categoryData.name;

    if (categoryData.type !== undefined) unencryptedFields.type = categoryData.type;
    if (categoryData.icon !== undefined) unencryptedFields.icon = categoryData.icon;
    if (categoryData.color !== undefined) unencryptedFields.color = categoryData.color;

    if (Object.keys(encryptedFields).length > 0) {
      const docSnap = await getDoc(categoryRef);
      if (docSnap.exists()) {
        const existingData = await decryptData(docSnap.data().data, encryptionKey);
        const mergedData = { ...existingData, ...encryptedFields };
        const encryptedData = await encryptData(mergedData, encryptionKey);
        unencryptedFields.data = encryptedData;
      }
    }

    unencryptedFields.updatedAt = serverTimestamp();

    await updateDoc(categoryRef, unencryptedFields);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

// Delete a category
export async function deleteCategory(
  userId: string,
  categoryId: string
): Promise<void> {
  try {
    const categoryRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

/**
 * Investment Firestore Operations
 */

// Create a new investment
export async function createInvestment(
  userId: string,
  investmentData: Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  encryptionKey: CryptoKey
): Promise<string> {
  try {
    const investmentRef = doc(collection(db, 'users', userId, 'investments'));
    const investmentId = investmentRef.id;

    // Encrypt sensitive fields
    const encryptedData = await encryptData(
      {
        name: investmentData.name,
        schemeCode: investmentData.schemeCode,
        folioNumber: investmentData.folioNumber,
        notes: investmentData.notes,
      },
      encryptionKey
    );

    // Prepare document for Firestore
    const firestoreDoc = {
      data: encryptedData,
      investmentType: investmentData.investmentType,
      accountId: investmentData.accountId || null,
      units: investmentData.units || null,
      purchasePrice: investmentData.purchasePrice,
      currentPrice: investmentData.currentPrice,
      purchaseDate: Timestamp.fromDate(investmentData.purchaseDate),
      maturityDate: investmentData.maturityDate ? Timestamp.fromDate(investmentData.maturityDate) : null,
      interestRate: investmentData.interestRate || null,
      sipAmount: investmentData.sipAmount || null,
      sipDate: investmentData.sipDate || null,
      returns: investmentData.returns,
      xirr: investmentData.xirr || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(investmentRef, firestoreDoc);
    return investmentId;
  } catch (error) {
    console.error('Error creating investment:', error);
    throw error;
  }
}

// Get all investments for a user
export async function getInvestments(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Investment[]> {
  try {
    const investmentsRef = collection(db, 'users', userId, 'investments');
    const q = query(investmentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const investments: Investment[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      investments.push({
        id: docSnap.id,
        userId,
        investmentType: data.investmentType,
        name: decryptedData.name,
        schemeCode: decryptedData.schemeCode,
        folioNumber: decryptedData.folioNumber,
        accountId: data.accountId,
        units: data.units,
        purchasePrice: data.purchasePrice,
        currentPrice: data.currentPrice,
        purchaseDate: (data.purchaseDate as Timestamp).toDate(),
        maturityDate: data.maturityDate ? (data.maturityDate as Timestamp).toDate() : undefined,
        interestRate: data.interestRate,
        sipAmount: data.sipAmount,
        sipDate: data.sipDate,
        returns: data.returns,
        xirr: data.xirr,
        notes: decryptedData.notes,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return investments;
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
}

// Get a single investment by ID
export async function getInvestment(
  userId: string,
  investmentId: string,
  encryptionKey: CryptoKey
): Promise<Investment | null> {
  try {
    const investmentRef = doc(db, 'users', userId, 'investments', investmentId);
    const docSnap = await getDoc(investmentRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    const decryptedData = await decryptData(data.data, encryptionKey);

    return {
      id: docSnap.id,
      userId,
      investmentType: data.investmentType,
      name: decryptedData.name,
      schemeCode: decryptedData.schemeCode,
      folioNumber: decryptedData.folioNumber,
      accountId: data.accountId,
      units: data.units,
      purchasePrice: data.purchasePrice,
      currentPrice: data.currentPrice,
      purchaseDate: (data.purchaseDate as Timestamp).toDate(),
      maturityDate: data.maturityDate ? (data.maturityDate as Timestamp).toDate() : undefined,
      interestRate: data.interestRate,
      sipAmount: data.sipAmount,
      sipDate: data.sipDate,
      returns: data.returns,
      xirr: data.xirr,
      notes: decryptedData.notes,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    };
  } catch (error) {
    console.error('Error fetching investment:', error);
    throw error;
  }
}

// Update an investment
export async function updateInvestment(
  userId: string,
  investmentId: string,
  investmentData: Partial<Omit<Investment, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  encryptionKey: CryptoKey
): Promise<void> {
  try {
    const investmentRef = doc(db, 'users', userId, 'investments', investmentId);

    const encryptedFields: any = {};
    const unencryptedFields: any = {};

    if (investmentData.name !== undefined) encryptedFields.name = investmentData.name;
    if (investmentData.schemeCode !== undefined) encryptedFields.schemeCode = investmentData.schemeCode;
    if (investmentData.folioNumber !== undefined) encryptedFields.folioNumber = investmentData.folioNumber;
    if (investmentData.notes !== undefined) encryptedFields.notes = investmentData.notes;

    if (investmentData.investmentType !== undefined) unencryptedFields.investmentType = investmentData.investmentType;
    if (investmentData.accountId !== undefined) unencryptedFields.accountId = investmentData.accountId;
    if (investmentData.units !== undefined) unencryptedFields.units = investmentData.units;
    if (investmentData.purchasePrice !== undefined) unencryptedFields.purchasePrice = investmentData.purchasePrice;
    if (investmentData.currentPrice !== undefined) unencryptedFields.currentPrice = investmentData.currentPrice;
    if (investmentData.purchaseDate !== undefined) unencryptedFields.purchaseDate = Timestamp.fromDate(investmentData.purchaseDate);
    if (investmentData.maturityDate !== undefined) {
      unencryptedFields.maturityDate = investmentData.maturityDate ? Timestamp.fromDate(investmentData.maturityDate) : null;
    }
    if (investmentData.interestRate !== undefined) unencryptedFields.interestRate = investmentData.interestRate;
    if (investmentData.sipAmount !== undefined) unencryptedFields.sipAmount = investmentData.sipAmount;
    if (investmentData.sipDate !== undefined) unencryptedFields.sipDate = investmentData.sipDate;
    if (investmentData.returns !== undefined) unencryptedFields.returns = investmentData.returns;
    if (investmentData.xirr !== undefined) unencryptedFields.xirr = investmentData.xirr;

    if (Object.keys(encryptedFields).length > 0) {
      const docSnap = await getDoc(investmentRef);
      if (docSnap.exists()) {
        const existingData = await decryptData(docSnap.data().data, encryptionKey);
        const mergedData = { ...existingData, ...encryptedFields };
        const encryptedData = await encryptData(mergedData, encryptionKey);
        unencryptedFields.data = encryptedData;
      }
    }

    unencryptedFields.updatedAt = serverTimestamp();

    await updateDoc(investmentRef, unencryptedFields);
  } catch (error) {
    console.error('Error updating investment:', error);
    throw error;
  }
}

// Delete an investment
export async function deleteInvestment(
  userId: string,
  investmentId: string
): Promise<void> {
  try {
    const investmentRef = doc(db, 'users', userId, 'investments', investmentId);
    await deleteDoc(investmentRef);
  } catch (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
}

// Get investments by type
export async function getInvestmentsByType(
  userId: string,
  investmentType: string,
  encryptionKey: CryptoKey
): Promise<Investment[]> {
  try {
    const investmentsRef = collection(db, 'users', userId, 'investments');
    const q = query(
      investmentsRef,
      where('investmentType', '==', investmentType),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);

    const investments: Investment[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const decryptedData = await decryptData(data.data, encryptionKey);

      investments.push({
        id: docSnap.id,
        userId,
        investmentType: data.investmentType,
        name: decryptedData.name,
        schemeCode: decryptedData.schemeCode,
        folioNumber: decryptedData.folioNumber,
        accountId: data.accountId,
        units: data.units,
        purchasePrice: data.purchasePrice,
        currentPrice: data.currentPrice,
        purchaseDate: (data.purchaseDate as Timestamp).toDate(),
        maturityDate: data.maturityDate ? (data.maturityDate as Timestamp).toDate() : undefined,
        interestRate: data.interestRate,
        sipAmount: data.sipAmount,
        sipDate: data.sipDate,
        returns: data.returns,
        xirr: data.xirr,
        notes: decryptedData.notes,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      });
    }

    return investments;
  } catch (error) {
    console.error('Error fetching investments by type:', error);
    throw error;
  }
}

// Calculate portfolio summary
export async function getPortfolioSummary(
  userId: string,
  encryptionKey: CryptoKey
): Promise<{
  totalInvested: number;
  totalCurrent: number;
  totalReturns: number;
  returnsPercentage: number;
}> {
  try {
    const investments = await getInvestments(userId, encryptionKey);

    const totalInvested = investments.reduce((sum, inv) => {
      const units = inv.units || 1;
      return sum + (inv.purchasePrice * units);
    }, 0);

    const totalCurrent = investments.reduce((sum, inv) => {
      const units = inv.units || 1;
      return sum + (inv.currentPrice * units);
    }, 0);

    const totalReturns = totalCurrent - totalInvested;
    const returnsPercentage = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrent,
      totalReturns,
      returnsPercentage,
    };
  } catch (error) {
    console.error('Error calculating portfolio summary:', error);
    throw error;
  }
}

// Get upcoming SIPs
export async function getUpcomingSIPs(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Investment[]> {
  try {
    const investments = await getInvestmentsByType(userId, 'sip', encryptionKey);
    
    // Filter for SIPs with sipAmount and sipDate
    return investments.filter(inv => inv.sipAmount && inv.sipDate);
  } catch (error) {
    console.error('Error fetching upcoming SIPs:', error);
    throw error;
  }
}

// Get maturing investments (within next 30 days)
export async function getMaturingInvestments(
  userId: string,
  encryptionKey: CryptoKey
): Promise<Investment[]> {
  try {
    const investments = await getInvestments(userId, encryptionKey);
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return investments.filter(inv => 
      inv.maturityDate && 
      inv.maturityDate <= thirtyDaysFromNow &&
      inv.maturityDate >= new Date()
    );
  } catch (error) {
    console.error('Error fetching maturing investments:', error);
    throw error;
  }
}