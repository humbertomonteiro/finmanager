import React, { useState, useEffect } from "react";
import {
  FilterState,
  SortField,
  SortOrder,
  ProductStockFilter,
} from "../../../../../types/filters";
import styles from "./filtersProducts.module.css";
import { FaArrowDown, FaArrowsUpDown, FaArrowUp } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

interface FiltersProductsProps {
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  initialFilters?: Partial<FilterState>;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

const FiltersProducts: React.FC<FiltersProductsProps> = ({
  onFiltersChange,
  onSortChange,
  initialFilters,
  showFilters = true,
  onToggleFilters,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    stockFilter: "all",
    searchTerm: "",
    sortBy: "name",
    sortOrder: "asc",
    type: "all",
    startDate: "",
    endDate: "",
    ...initialFilters,
  });

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
        : "asc"; // Alinhado com o contexto de produtos

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
    const resetFilters: FilterState = {
      stockFilter: "all",
      searchTerm: "",
      sortBy: "name",
      sortOrder: "asc",
      type: "all",
      startDate: "",
      endDate: "",
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters); // Notificação imediata, como em FiltersTransactions
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
          placeholder="Buscar produtos por nome, código, descrição ou fornecedor..."
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
          <label htmlFor="stockFilter" className={styles.filterLabel}>
            Estoque:
          </label>
          <select
            id="stockFilter"
            value={filters.stockFilter || "all"} // Garante valor padrão
            onChange={(e) =>
              handleFilterChange(
                "stockFilter",
                e.target.value as ProductStockFilter
              )
            }
            className={styles.filterSelect}
          >
            <option value="all">Todos</option>
            <option value="low">Baixo estoque (≤ 10)</option>
            <option value="out">Sem estoque</option>
          </select>
        </div>
      </div>

      <div className={styles.sortGroup}>
        <span className={styles.sortLabel}>Ordenar por:</span>
        <div className={styles.sortButtons}>
          <button
            onClick={() => handleSort("name")}
            className={`${styles.sortButton} ${
              filters.sortBy === "name" ? styles.active : ""
            }`}
          >
            Nome {getSortIcon("name")}
          </button>
          <button
            onClick={() => handleSort("code")}
            className={`${styles.sortButton} ${
              filters.sortBy === "code" ? styles.active : ""
            }`}
          >
            Código {getSortIcon("code")}
          </button>
          <button
            onClick={() => handleSort("price")}
            className={`${styles.sortButton} ${
              filters.sortBy === "price" ? styles.active : ""
            }`}
          >
            Preço {getSortIcon("price")}
          </button>
          <button
            onClick={() => handleSort("stock")}
            className={`${styles.sortButton} ${
              filters.sortBy === "stock" ? styles.active : ""
            }`}
          >
            Estoque {getSortIcon("stock")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersProducts;
