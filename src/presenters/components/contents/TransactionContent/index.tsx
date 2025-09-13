import styles from "./transactionContent.module.css";

import { useState } from "react";

import { ActiveViewProps } from "../../../pages/Dashboard";
import { useTransaction } from "../../../contexts/TransactionContext";
import { useTransactionFilters } from "../../../hooks/useTransactionFilters";

import { GrTransaction } from "react-icons/gr";

import Metrics from "../../sections/transaction/Metrics";
import FiltersTransactions from "../../sections/transaction/FiltersTransactions";
import TransactionList from "../../sections/transaction/TransactionList";

interface TransactionContentProps {
  handleActiveView: (activeView: ActiveViewProps, dataEditing?: any) => void;
}

const ITEMS_PER_PAGE = 6;

export default function TransactionContent({
  handleActiveView,
}: TransactionContentProps) {
  const { transactions } = useTransaction();
  const {
    filters,
    filteredTransactions,
    paginatedTransactions,
    currentPage,
    totalPages,
    updateFilters,
    updateSort,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
  } = useTransactionFilters(transactions, ITEMS_PER_PAGE);

  const [showFilters, setShowFilters] = useState(false);
  const toggleFilters = () => setShowFilters(!showFilters);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            <GrTransaction />
            Transações
          </h2>
        </div>

        <button
          className={styles.addButton}
          onClick={() => handleActiveView("new-transaction")}
        >
          Nova Transação
        </button>
      </div>

      <Metrics filteredTransactions={filteredTransactions} />

      <FiltersTransactions
        onFiltersChange={updateFilters}
        onSortChange={updateSort}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        initialFilters={filters}
      />

      <TransactionList
        handleActiveView={handleActiveView}
        toggleFilters={toggleFilters}
        filteredTransactions={filteredTransactions}
        paginatedTransactions={paginatedTransactions}
        currentPage={currentPage}
        totalPages={totalPages}
        updateFilters={updateFilters}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPrevPage={goToPrevPage}
      />
    </div>
  );
}
