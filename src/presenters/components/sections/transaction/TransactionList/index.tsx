import { Transaction } from "../../../../../domain/entities/Transaction";
import styles from "./transactionList.module.css";
import TransactionCard from "../TransactionCard";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import { FilterState } from "../../../../../types/filters";

interface TransactionListProps {
  handleActiveView: (activeView: ActiveViewProps, dataEditing?: any) => void;
  toggleFilters: () => void;
  filteredTransactions: Transaction[];
  paginatedTransactions: Transaction[];
  currentPage: number;
  totalPages: number;
  updateFilters: (newFilters: FilterState) => void;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

const TransactionList = ({
  handleActiveView,
  toggleFilters,
  filteredTransactions,
  paginatedTransactions,
  currentPage,
  totalPages,
  updateFilters,
  setCurrentPage,
  goToNextPage,
  goToPrevPage,
}: TransactionListProps) => {
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

  if (!filteredTransactions.length) {
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
      {paginatedTransactions.length > 0 ? (
        <div className={styles.listTransactions}>
          <div className={styles.headerList}>
            <div className={styles.listTitle}>
              <h3>Transações</h3>
              <p className={styles.subtitle}>
                {filteredTransactions.length}{" "}
                {filteredTransactions.length === 1
                  ? "transação "
                  : "transações "}
                encontradas
              </p>
            </div>
            <button
              className={styles.mobileFilterButton}
              onClick={toggleFilters}
            >
              Filtros
            </button>
          </div>
          <div className={styles.grid}>
            {paginatedTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                handleActiveView={() =>
                  handleActiveView("new-transaction", transaction)
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
        </div>
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
