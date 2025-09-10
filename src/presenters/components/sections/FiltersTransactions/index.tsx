// src/components/filters/FiltersTransactions.tsx
import React, { useState, useEffect } from "react";
import {
  FilterState,
  SortField,
  SortOrder,
  TransactionType,
} from "../../../../types/filters";
import styles from "./filtersTransactions.module.css";
import { FaArrowDown, FaArrowsUpDown, FaArrowUp } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

interface FiltersTransactionsProps {
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  initialFilters?: Partial<FilterState>;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

const FiltersTransactions: React.FC<FiltersTransactionsProps> = ({
  onFiltersChange,
  onSortChange,
  initialFilters,
  showFilters = true,
  onToggleFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    searchTerm: "",
    sortBy: "date",
    sortOrder: "desc",
    startDate: "",
    endDate: "",
    ...initialFilters,
  });

  // Configurar datas padrão (início e fim do mês atual)
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFilters((prev) => ({
      ...prev,
      startDate: prev.startDate || firstDay.toISOString().split("T")[0],
      endDate: prev.endDate || lastDay.toISOString().split("T")[0],
    }));
  }, []);

  // Notificar mudanças nos filtros
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (field: SortField) => {
    const newSortOrder =
      filters.sortBy === field
        ? filters.sortOrder === "asc"
          ? "desc"
          : "asc"
        : "desc";

    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: newSortOrder,
    }));

    onSortChange(field, newSortOrder);
  };

  const clearSearch = () => {
    handleFilterChange("searchTerm", "");
  };

  const clearAllFilters = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFilters({
      type: "all",
      searchTerm: "",
      sortBy: "date",
      sortOrder: "desc",
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    });
  };

  const getSortIcon = (field: SortField) => {
    if (filters.sortBy !== field) return <FaArrowsUpDown />;
    return filters.sortOrder === "asc" ? <FaArrowUp /> : <FaArrowDown />;
  };

  return (
    <div
      className={`${styles.controls} ${showFilters ? styles.controlsOpen : ""}`}
    >
      <div className={styles.headerControls}>
        <h3>Filtros</h3>
        <div className={styles.headerActions}>
          <button onClick={clearAllFilters} className={styles.clearAllButton}>
            Limpar Tudo
          </button>
          {showFilters && (
            <button
              onClick={onToggleFilters}
              className={styles.hideFiltersButton}
            >
              <IoClose />
            </button>
          )}
        </div>
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Buscar transações por descrição ou ID..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          className={styles.searchInput}
        />
        {filters.searchTerm && (
          <button
            onClick={clearSearch}
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
            value={filters.type}
            onChange={(e) =>
              handleFilterChange(
                "type",
                e.target.value as TransactionType | "all"
              )
            }
            className={styles.filterSelect}
          >
            <option value="all">Todos os tipos</option>
            <option value="sale">Vendas</option>
            <option value="purchase">Compras</option>
            <option value="aporte">Aportes</option>
            <option value="service">Serviços</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="startDate" className={styles.filterLabel}>
            De:
          </label>
          <input
            type="date"
            id="startDate"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
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
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
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
              filters.sortBy === "date" ? styles.active : ""
            }`}
          >
            Data {getSortIcon("date")}
          </button>
          <button
            onClick={() => handleSort("value")}
            className={`${styles.sortButton} ${
              filters.sortBy === "value" ? styles.active : ""
            }`}
          >
            Valor {getSortIcon("value")}
          </button>
          <button
            onClick={() => handleSort("type")}
            className={`${styles.sortButton} ${
              filters.sortBy === "type" ? styles.active : ""
            }`}
          >
            Tipo {getSortIcon("type")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersTransactions;
