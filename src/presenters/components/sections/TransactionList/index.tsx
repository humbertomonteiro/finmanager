// src/components/sections/TransactionList.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useTransaction } from "../../../contexts/TransactionContext";
import { Transaction } from "../../../../domain/entities/Transaction";
import styles from "./transactionList.module.css";
import TransactionCard from "../TransactionCard";

const ITEMS_PER_PAGE = 12;

const TransactionList: React.FC = () => {
  const { transactions, metrics } = useTransaction(); // Add metrics from context
  console.log("Transações no TransactionList:", transactions);
  console.log("Métricas no TransactionList:", metrics);

  // Estados para filtros
  const [typeFilter, setTypeFilter] = useState<
    "all" | "sale" | "purchase" | "aporte"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "value" | "type">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Configurar datas padrão (início e fim do mês atual)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(firstDay.toISOString().split("T")[0]);
    setEndDate(lastDay.toISOString().split("T")[0]);
  }, []);

  // Resetar para a primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, searchTerm, sortBy, sortOrder, startDate, endDate]);

  // Filtrar e ordenar transações
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      // Filtro por tipo
      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;

      // Filtro por termo de busca
      const matchesSearch =
        searchTerm === "" ||
        transaction.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.id?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por data
      const transactionDate = new Date(transaction.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      let matchesDate = true;
      if (start) {
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && transactionDate >= start;
      }
      if (end) {
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && transactionDate <= end;
      }

      return matchesType && matchesSearch && matchesDate; // Fixed: Include matchesDate
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "value":
          aValue = a.value;
          bValue = b.value;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [
    transactions,
    typeFilter,
    searchTerm,
    sortBy,
    sortOrder,
    startDate,
    endDate,
  ]);

  // Calcular totais com base nas transações filtradas
  const totals = useMemo(() => {
    return filteredAndSortedTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "sale") {
          acc.sales += transaction.value;
        } else if (transaction.type === "purchase") {
          acc.purchases += transaction.value;
        } else if (transaction.type === "aporte") {
          acc.contributions += transaction.value;
        }
        acc.total += transaction.value;
        return acc;
      },
      { sales: 0, purchases: 0, contributions: 0, total: 0 }
    );
  }, [filteredAndSortedTransactions, startDate, endDate]);

  // Paginação
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredAndSortedTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSort = (field: "date" | "value" | "type") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const handleViewDetails = (transaction: Transaction) => {
    console.log("Visualizar detalhes:", transaction);
  };

  // const clearAllFilters = () => {
  //   setSearchTerm("");
  //   setTypeFilter("all");
  //   const now = new Date();
  //   const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  //   const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  //   setStartDate(firstDay.toISOString().split("T")[0]);
  //   setEndDate(lastDay.toISOString().split("T")[0]);
  //   setShowFilters(false);
  // };

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

  // const toggleFilters = () => {
  //   setShowFilters(!showFilters);
  // };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Transações</h2>
          <p className={styles.subtitle}>
            {filteredAndSortedTransactions.length} de {transactions.length}{" "}
            {filteredAndSortedTransactions.length === 1
              ? "transação"
              : "transações"}{" "}
            encontradas
          </p>
        </div>

        <button
          className={styles.mobileFilterButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros
        </button>
      </div>

      {/* Resumo de totais */}
      <div className={styles.totals}>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Total em Vendas</span>
          <span className={styles.totalValueSales}>
            R$ {totals.sales.toFixed(2)}
          </span>
        </div>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Total em Compras</span>
          <span className={styles.totalValuePurchases}>
            R$ {totals.purchases.toFixed(2)}
          </span>
        </div>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Total em Aportes</span>
          <span className={styles.totalValueContributions}>
            R$ {totals.contributions.toFixed(2)}
          </span>
        </div>
        <div className={styles.totalItem}>
          <span className={styles.totalLabel}>Saldo Total</span>
          <span className={styles.totalValue}>
            R${" "}
            {(totals.sales + totals.contributions - totals.purchases).toFixed(
              2
            )}
          </span>
        </div>
      </div>

      {/* Filtros e controles */}
      <div
        className={`${styles.controls} ${
          showFilters ? styles.controlsOpen : ""
        }`}
      >
        {showFilters && (
          <div className={styles.headerControls}>
            <h3>Filtros</h3>{" "}
            <button onClick={() => setShowFilters(false)}>x</button>
          </div>
        )}
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar transações por descrição ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={styles.clearSearch}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="typeFilter" className={styles.filterLabel}>
              Tipo:
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as "all" | "sale" | "purchase" | "aporte"
                )
              }
              className={styles.filterSelect}
            >
              <option value="all">Todos os tipos</option>
              <option value="sale">Vendas</option>
              <option value="purchase">Compras</option>
              <option value="aporte">Aportes</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="startDate" className={styles.filterLabel}>
              De:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="endDate" className={styles.filterLabel}>
              Até:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>

        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Ordenar por:</span>
          <div className={styles.sortButtons}>
            <button
              onClick={() => handleSort("date")}
              className={`${styles.sortButton} ${
                sortBy === "date" ? styles.active : ""
              }`}
            >
              Data {getSortIcon("date")}
            </button>
            <button
              onClick={() => handleSort("value")}
              className={`${styles.sortButton} ${
                sortBy === "value" ? styles.active : ""
              }`}
            >
              Valor {getSortIcon("value")}
            </button>
            <button
              onClick={() => handleSort("type")}
              className={`${styles.sortButton} ${
                sortBy === "type" ? styles.active : ""
              }`}
            >
              Tipo {getSortIcon("type")}
            </button>
          </div>
        </div>
      </div>
      {/* <div
        className={`${styles.controls} ${
          showFilters ? styles.controlsOpen : ""
        }`}
      >
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buscar transações por descrição ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className={styles.clearSearch}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="typeFilter" className={styles.filterLabel}>
              Tipo:
            </label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as "all" | "sale" | "purchase" | "aporte"
                )
              }
              className={styles.filterSelect}
            >
              <option value="all">Todos os tipos</option>
              <option value="sale">Vendas</option>
              <option value="purchase">Compras</option>
              <option value="aporte">Aportes</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="startDate" className={styles.filterLabel}>
              De:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="endDate" className={styles.filterLabel}>
              Até:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>

        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Ordenar por:</span>
          <div className={styles.sortButtons}>
            <button
              onClick={() => handleSort("date")}
              className={`${styles.sortButton} ${
                sortBy === "date" ? styles.active : ""
              }`}
            >
              Data {getSortIcon("date")}
            </button>
            <button
              onClick={() => handleSort("value")}
              className={`${styles.sortButton} ${
                sortBy === "value" ? styles.active : ""
              }`}
            >
              Valor {getSortIcon("value")}
            </button>
            <button
              onClick={() => handleSort("type")}
              className={`${styles.sortButton} ${
                sortBy === "type" ? styles.active : ""
              }`}
            >
              Tipo {getSortIcon("type")}
            </button>
          </div>
        </div>

        <div className={styles.mobileActions}>
          <button
            onClick={clearAllFilters}
            className={styles.clearFiltersButton}
          >
            🗑️ Limpar Filtros
          </button>
          <button onClick={toggleFilters} className={styles.applyFiltersButton}>
            ✅ Aplicar
          </button>
        </div>
      </div> */}

      {/* Lista de transações */}
      {paginatedTransactions.length > 0 ? (
        <>
          <div className={styles.grid}>
            {paginatedTransactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onEdit={handleViewDetails}
              />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
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
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("all");
              const now = new Date();
              const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
              const lastDay = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
              );
              setStartDate(firstDay.toISOString().split("T")[0]);
              setEndDate(lastDay.toISOString().split("T")[0]);
            }}
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
