// src/presenters/components/contents/TransactionContent/index.tsx
import { useState, useMemo } from "react";
import { useTransaction } from "../../../contexts/TransactionContext";
import { useTransactionFilters } from "../../../hooks/useTransactionFilters";
import { ActiveViewProps } from "../../../pages/Dashboard";
import TransactionCard from "../../sections/transaction/TransactionCard";
import Metrics from "../../sections/transaction/Metrics";
import styles from "./transactionContent.module.css";

interface TransactionContentProps {
  handleActiveView: (view: ActiveViewProps, data?: any) => void;
  showAll?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function TransactionContent({
  handleActiveView,
  showAll = false,
}: TransactionContentProps) {
  const { transactions } = useTransaction();
  const {
    // filters,
    filteredTransactions,
    // paginatedTransactions,
    // currentPage,
    // totalPages,
    // updateFilters,
    // updateSort,
    // setCurrentPage,
    // goToNextPage,
    // goToPrevPage,
  } = useTransactionFilters(transactions, ITEMS_PER_PAGE);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState(showAll ? "all" : "month");

  const displayed = useMemo(() => {
    let list = [...transactions].sort(
      (a, b) =>
        new Date(b.date as Date).getTime() - new Date(a.date as Date).getTime()
    );

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.description || "").toLowerCase().includes(q) ||
          (t.customerName || "").toLowerCase().includes(q) ||
          (t.items || []).some((i) => i.name.toLowerCase().includes(q))
      );
    }

    if (typeFilter) {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (periodFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      list = list.filter((t) => {
        const d = new Date(t.date as Date);
        if (periodFilter === "today") return d >= today;
        if (periodFilter === "week") {
          const w = new Date(today);
          w.setDate(w.getDate() - 7);
          return d >= w;
        }
        if (periodFilter === "month")
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        return true;
      });
    }

    return showAll ? list : list.slice(0, 5);
  }, [transactions, search, typeFilter, periodFilter, showAll]);

  const pages = Math.max(1, Math.ceil(displayed.length / ITEMS_PER_PAGE));
  const [page, setPage] = useState(1);
  const paginated = showAll
    ? displayed.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    : displayed;

  return (
    <div className={styles.container}>
      {/* Metrics */}
      <Metrics
        filteredTransactions={
          periodFilter === "all"
            ? transactions
            : displayed.length
            ? displayed
            : filteredTransactions
        }
        transactions={transactions}
        onCreditClick={() => handleActiveView("credit-sales")}
      />

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--text-3)", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por descrição, cliente ou produto..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearch("")}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <select
          className={styles.select}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos os tipos</option>
          <option value="sale">Venda</option>
          <option value="credit_sale">Fiado</option>
          <option value="purchase">Compra</option>
          <option value="aporte">Aporte</option>
          <option value="service">Serviço</option>
          <option value="payment">Pagamento</option>
        </select>

        <select
          className={styles.select}
          value={periodFilter}
          onChange={(e) => {
            setPeriodFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">Todo período</option>
          <option value="today">Hoje</option>
          <option value="week">Últimos 7 dias</option>
          <option value="month">Este mês</option>
        </select>

        <div className={styles.count}>
          {displayed.length}{" "}
          {displayed.length === 1 ? "transação" : "transações"}
        </div>
      </div>

      {/* List */}
      {paginated.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div className={styles.emptyTitle}>Nenhuma transação encontrada</div>
          <div className={styles.emptySub}>
            {search || typeFilter
              ? "Tente ajustar os filtros"
              : "Crie sua primeira transação clicando em Nova Transação"}
          </div>
          {!search && !typeFilter && (
            <button
              className={styles.emptyBtn}
              onClick={() => handleActiveView("new-transaction")}
            >
              + Nova Transação
            </button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {paginated.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              handleActiveView={handleActiveView}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {showAll && pages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ‹ Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {page} de {pages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Próxima ›
          </button>
        </div>
      )}

      {/* "Ver todas" link on dashboard */}
      {!showAll && displayed.length === 5 && transactions.length > 5 && (
        <button
          className={styles.viewAllBtn}
          onClick={() => handleActiveView("transactions")}
        >
          Ver todas as {transactions.length} transações →
        </button>
      )}
    </div>
  );
}
