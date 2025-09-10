export type TransactionType = "sale" | "purchase" | "aporte" | "service";
export type SortField = "date" | "value" | "type";
export type SortOrder = "asc" | "desc";

export interface FilterState {
  type: TransactionType | "all";
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  startDate: string;
  endDate: string;
}

export interface FiltersTransactionsProps {
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  initialFilters?: Partial<FilterState>;
}
