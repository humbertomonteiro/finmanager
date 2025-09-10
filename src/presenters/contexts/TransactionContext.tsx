// src/contexts/TransactionContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { TransactionRepository } from "../../infrastructure/repositories/FirebaseTransactionRepository";
import { ProductRepository } from "../../infrastructure/repositories/FirebaseProductRepository";
import { TransactionService } from "../../domain/services/TransactionService";

import { CreateTransactionUsecase } from "../../domain/usecases/CreateTransactionUsecase";
import { DeleteTransactionUsecase } from "../../domain/usecases/DeleteTransactionUsecase";
import { Transaction } from "../../domain/entities/Transaction";

const transactionRepository = new TransactionRepository();
const productRepository = new ProductRepository();
const transactionService = new TransactionService(transactionRepository);
const createTransactionUsecase = new CreateTransactionUsecase(
  transactionRepository,
  productRepository
);
const deleteTransactionUsecase = new DeleteTransactionUsecase(
  transactionRepository,
  productRepository
);

type TransactionContextType = {
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;
  createTransaction: (transaction: Transaction) => Promise<string>;
  deleteTransaction: (transaction: Transaction) => Promise<string | void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
};

export const TransactionContext = createContext<
  TransactionContextType | undefined
>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
    try {
      const result = await transactionService.getAll();
      setTransactions(result);
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const createTransaction = async (transaction: Transaction) => {
    try {
      const transactionId = await createTransactionUsecase.execute(transaction);
      await fetchTransactions();
      return transactionId;
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const deleteTransaction = async (transaction: Transaction) => {
    try {
      const transactionId = await deleteTransactionUsecase.execute(transaction);
      await fetchTransactions();
      return transactionId;
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      await transactionService.update(transaction);
      await fetchTransactions();
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        fetchTransactions,
        createTransaction,
        deleteTransaction,
        updateTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context)
    throw new Error("useTransaction must be used within a TransactionProvider");
  return context;
};
