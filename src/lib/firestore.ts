// ============================================
// FILE: src/lib/firestore.ts
// ============================================
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