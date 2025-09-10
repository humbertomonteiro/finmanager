// src/components/sections/TransactionList.tsx
import { useState } from "react";
import { useTransaction } from "../../../contexts/TransactionContext";
import styles from "./transactionList.module.css";
import TransactionCard from "../TransactionCard";
import { GrTransaction } from "react-icons/gr";
import { ActiveViewProps } from "../../../pages/Dashboard";
import { useTransactionFilters } from "../../../../hooks/useTransactionFilters";
import FiltersTransactions from "../FiltersTransactions";
import Metrics from "../Metrics";

interface TransactionListProps {
  handleFormCreate: (activeView: ActiveViewProps, dataEditing?: any) => void;
}

const ITEMS_PER_PAGE = 6;

const TransactionList = ({ handleFormCreate }: TransactionListProps) => {
  const { transactions } = useTransaction();
  const [showFilters, setShowFilters] = useState(false);

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

  const toggleFilters = () => setShowFilters(!showFilters);

  const clearAllFilters = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    updateFilters({
      type: "all",
      searchTerm: "",
      sortBy: "date",
      sortOrder: "desc",
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    });
  };

  if (!transactions.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <h3>Nenhuma transação encontrada</h3>
          <p>Comece registrando sua primeira transação no sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            <GrTransaction />
            Transações
          </h2>
          <p className={styles.subtitle}>
            {filteredTransactions.length} de {transactions.length}{" "}
            {filteredTransactions.length === 1 ? "transação" : "transações"}{" "}
            encontradas
          </p>
        </div>

        <button
          className={styles.addButton}
          onClick={() => handleFormCreate("new-transaction")}
        >
          Nova Transação
        </button>

        <button className={styles.mobileFilterButton} onClick={toggleFilters}>
          {showFilters ? "Ocultar" : "Mostrar"} Filtros
        </button>
      </div>

      <Metrics filteredTransactions={filteredTransactions} />

      {/* Filtros */}
      <FiltersTransactions
        onFiltersChange={updateFilters}
        onSortChange={updateSort}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        initialFilters={filters}
      />

      {/* Lista de transações */}
      {paginatedTransactions.length > 0 ? (
        <>
          <div className={styles.grid}>
            {paginatedTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                handleFormCreate={() =>
                  handleFormCreate("new-transaction", transaction)
                }
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                ← Anterior
              </button>

              <div className={styles.pageNumbers}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`${styles.pageButton} ${
                        currentPage === pageNum ? styles.active : ""
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className={styles.pageDots}>...</span>
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`${styles.pageButton} ${
                      currentPage === totalPages ? styles.active : ""
                    }`}
                  >
                    {totalPages}
                  </button>
                )}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Próxima →
              </button>

              <div className={styles.pageInfo}>
                Página {currentPage} de {totalPages}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.noResults}>
          <p>Nenhuma transação encontrada com os filtros aplicados.</p>
          <button
            onClick={clearAllFilters}
            className={styles.clearFiltersButton}
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
