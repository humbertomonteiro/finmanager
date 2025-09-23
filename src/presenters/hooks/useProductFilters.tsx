import { useState, useMemo, useEffect } from "react";
import { Product } from "../../domain/entities/Product";
import { FilterState, SortField, SortOrder } from "../../types/filters";

interface UseProductFiltersReturn {
  filters: FilterState;
  filteredProducts: Product[];
  paginatedProducts: Product[];
  currentPage: number;
  totalPages: number;
  updateFilters: (newFilters: FilterState) => void;
  updateSort: (sortBy: SortField, sortOrder: SortOrder) => void;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

export const useProductFilters = (
  products: Product[],
  itemsPerPage: number = 6
): UseProductFiltersReturn => {
  const [filters, setFilters] = useState<FilterState>({
    stockFilter: "all",
    searchTerm: "",
    sortBy: "name",
    sortOrder: "asc",
    type: "all",
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Filtro por termo de busca
      const matchesSearch =
        filters.searchTerm === "" ||
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (product.description &&
          product.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())) ||
        (product.code &&
          product.code.toString().includes(filters.searchTerm)) ||
        (product.supplier &&
          product.supplier
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()));

      // Filtro por estoque
      let matchesStock = true;
      if (filters.stockFilter === "low" && product.stock !== undefined) {
        matchesStock = product.stock > 0 && product.stock <= 10;
      } else if (filters.stockFilter === "out" && product.stock !== undefined) {
        matchesStock = product.stock === 0;
      }

      return matchesSearch && matchesStock;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case "name":
          aValue = a.name ? a.name.toLowerCase() : "";
          bValue = b.name ? b.name.toLowerCase() : "";
          break;
        case "code":
          aValue = a.code ?? "";
          bValue = b.code ?? "";
          break;
        case "price":
          aValue = a.salePrice ?? 0;
          bValue = b.salePrice ?? 0;
          break;
        case "stock":
          aValue = a.stock ?? 0;
          bValue = b.stock ?? 0;
          break;
        default:
          aValue = a.name ? a.name.toLowerCase() : "";
          bValue = b.name ? b.name.toLowerCase() : "";
      }

      return filters.sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [products, filters]);

  // Paginação
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Resetar para a primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.searchTerm,
    filters.stockFilter,
    filters.sortBy,
    filters.sortOrder,
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
    filteredProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    updateFilters,
    updateSort,
    setCurrentPage,
    goToNextPage,
    goToPrevPage,
  };
};
