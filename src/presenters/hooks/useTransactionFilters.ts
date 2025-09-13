// src/hooks/useTransactionFilters.ts
import { useState, useMemo, useEffect } from "react";
import { Transaction } from "../../domain/entities/Transaction";
import { FilterState, SortField, SortOrder } from "../../types/filters";

interface UseTransactionFiltersReturn {
  filters: FilterState;
  filteredTransactions: Transaction[];
  paginatedTransactions: Transaction[];
  currentPage: number;
  totalPages: number;
  updateFilters: (newFilters: FilterState) => void;
  updateSort: (sortBy: SortField, sortOrder: SortOrder) => void;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

export const useTransactionFilters = (
  transactions: Transaction[],
  itemsPerPage: number = 6
): UseTransactionFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    searchTerm: "",
    sortBy: "date",
    sortOrder: "desc",
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Configurar datas padrão
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

  // Filtrar e ordenar transações
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      // Filtro por tipo
      const matchesType =
        filters.type === "all" || transaction.type === filters.type;

      // Filtro por termo de busca
      const matchesSearch =
        filters.searchTerm === "" ||
        transaction.description
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        transaction.id
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        transaction.items?.some((item) =>
          item.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );

      // Filtro por data
      const transactionDate = new Date(transaction.date);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;

      let matchesDate = true;
      if (start) {
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && transactionDate >= start;
      }
      if (end) {
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && transactionDate <= end;
      }

      return matchesType && matchesSearch && matchesDate;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
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

      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [transactions, filters]);

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  // Resetar para a primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.type,
    filters.searchTerm,
    filters.sortBy,
    filters.sortOrder,
    filters.startDate,
    filters.endDate,
  ]);

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const updateSort = (sortBy: SortField, sortOrder: SortOrder) => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return {
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
  };
};
