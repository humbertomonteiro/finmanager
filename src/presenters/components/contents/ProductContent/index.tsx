import styles from "./productContent.module.css";

import { useState } from "react";

import { ActiveViewProps } from "../../../pages/Dashboard";
import { useProduct } from "../../../contexts/ProductContext";
import { useProductFilters } from "../../../hooks/useProductFilters";

import { FaBox } from "react-icons/fa6";

import FiltersProducts from "../../sections/product/FiltersProducts";
import ProductList from "../../sections/product/ProductList";

interface ProductContentProps {
  handleActiveView: (activeView: ActiveViewProps, dataEditing?: any) => void;
}

const ITEMS_PER_PAGE = 6;

export default function ProductContent({
  handleActiveView,
}: ProductContentProps) {
  const { products } = useProduct();
  const {
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
  } = useProductFilters(products, ITEMS_PER_PAGE);

  const [showFilters, setShowFilters] = useState(false);
  const toggleFilters = () => setShowFilters(!showFilters);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            <FaBox />
            Produtos
          </h2>
        </div>

        <button
          className={styles.addButton}
          onClick={() => handleActiveView("new-product")}
        >
          Novo Produto
        </button>
      </div>

      <FiltersProducts
        onFiltersChange={updateFilters}
        onSortChange={updateSort}
        showFilters={showFilters}
        onToggleFilters={toggleFilters}
        initialFilters={filters}
      />

      <ProductList
        handleActiveView={handleActiveView}
        toggleFilters={toggleFilters}
        filteredProducts={filteredProducts}
        paginatedProducts={paginatedProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        updateFilters={updateFilters}
        setCurrentPage={setCurrentPage}
        goToNextPage={goToNextPage}
        goToPrevPage={goToPrevPage}
      />
    </div>
  );
}
