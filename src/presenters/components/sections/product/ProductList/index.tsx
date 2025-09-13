import { Product } from "../../../../../domain/entities/Product";
import styles from "./productList.module.css";
import ProductCard from "../ProductCard";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import { FilterState } from "../../../../../types/filters";

interface ProductListProps {
  handleActiveView: (activeView: ActiveViewProps, dataEditing?: any) => void;
  toggleFilters: () => void;
  filteredProducts: Product[];
  paginatedProducts: Product[];
  currentPage: number;
  totalPages: number;
  updateFilters: (newFilters: FilterState) => void;
  setCurrentPage: (page: number) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
}

const ProductList = ({
  handleActiveView,
  toggleFilters,
  filteredProducts,
  paginatedProducts,
  currentPage,
  totalPages,
  updateFilters,
  setCurrentPage,
  goToNextPage,
  goToPrevPage,
}: ProductListProps) => {
  const clearAllFilters = () => {
    updateFilters({
      stockFilter: "all",
      searchTerm: "",
      sortBy: "name",
      sortOrder: "asc",
    });
  };

  if (!filteredProducts.length) {
    // Use filteredProducts para verificar vazio
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <h3>Nenhum produto cadastrado</h3>
          <p>Comece adicionando seu primeiro produto ao sistema.</p>
          <button
            className={styles.primaryButton}
            onClick={() => handleActiveView("new-product")}
          >
            Adicionar Primeiro Produto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {paginatedProducts.length > 0 ? (
        <div className={styles.listProducts}>
          <div className={styles.headerList}>
            <div className={styles.listTitle}>
              <h3>Produtos</h3>
              <p className={styles.subtitle}>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "produto " : "produtos "}
                encontrados
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
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                handleActiveView={() =>
                  handleActiveView("new-product", product)
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
          <p>Nenhum produto encontrado com os filtros aplicados.</p>
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

export default ProductList;
