export type TransactionType =
  | "sale"
  | "purchase"
  | "aporte"
  | "service"
  | "payment"
  | "credit_sale";

export type ProductStockFilter = "all" | "low" | "out";

export type PaymentStatus = "all" | "pending" | "paid";

export type SortField =
  | "date"
  | "value"
  | "type"
  | "name"
  | "code"
  | "price"
  | "stock";

export type SortOrder = "asc" | "desc";

export interface FilterState {
  type?: TransactionType | "all";
  stockFilter?: ProductStockFilter;
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  startDate?: string;
  endDate?: string;
  paymentStatus?: PaymentStatus;
}

export interface FiltersTransactionsProps {
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  initialFilters?: Partial<FilterState>;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export interface FiltersProductsProps {
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sortBy: SortField, sortOrder: SortOrder) => void;
  initialFilters?: Partial<FilterState>;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}
