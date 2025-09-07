import React, { useState, useMemo, useEffect } from "react";
import { useProduct } from "../../../contexts/ProductContext";
import { Product } from "../../../../domain/entities/Product";
import styles from "./productList.module.css";
import ProductCard from "../ProductCard";
import { CreateProductForm } from "../CreateProductForm";

const ITEMS_PER_PAGE = 6;

const ProductList: React.FC = () => {
  const { products } = useProduct();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [sortBy, setSortBy] = useState<"name" | "code" | "price" | "stock">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);

  const [showFilters, setShowFilters] = useState(false);

  // Resetar para a primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter, sortBy, sortOrder]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Filtrar e ordenar produtos
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Filtro por termo de busca
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toString().includes(searchTerm) ||
        product.supplier?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por estoque
      let matchesStock = true;
      if (stockFilter === "low") {
        if (product.stock)
          matchesStock = product?.stock > 0 && product?.stock <= 10;
      } else if (stockFilter === "out") {
        matchesStock = product.stock === 0;
      }

      return matchesSearch && matchesStock;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "code":
          aValue = a.code;
          bValue = b.code;
          break;
        case "price":
          aValue = a.salePrice;
          bValue = b.salePrice;
          break;
        case "stock":
          aValue = a.stock;
          bValue = b.stock;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, stockFilter, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSort = (field: "name" | "code" | "price" | "stock") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (!products.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <h3>Nenhum produto cadastrado</h3>
          <p>Comece adicionando seu primeiro produto ao sistema.</p>
          <button
            className={styles.primaryButton}
            onClick={() => setShowForm(true)}
          >
            Adicionar Primeiro Produto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Produtos</h2>
          <p className={styles.subtitle}>
            {filteredAndSortedProducts.length} de {products.length}{" "}
            {filteredAndSortedProducts.length === 1 ? "produto" : "produtos"}{" "}
            {searchTerm || stockFilter !== "all"
              ? "encontrados"
              : "cadastrados"}
          </p>
        </div>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          Novo Produto
        </button>

        <button
          className={styles.mobileFilterButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros
        </button>
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
            placeholder="Buscar produtos por nome, código, descrição ou fornecedor..."
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

        <div className={styles.filterGroup}>
          <label htmlFor="stockFilter" className={styles.filterLabel}>
            Estoque:
          </label>
          <select
            id="stockFilter"
            value={stockFilter}
            onChange={(e) =>
              setStockFilter(e.target.value as "all" | "low" | "out")
            }
            className={styles.filterSelect}
          >
            <option value="all">Todos</option>
            <option value="low">Baixo estoque (≤ 10)</option>
            <option value="out">Sem estoque</option>
          </select>
        </div>

        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Ordenar por:</span>
          <div className={styles.sortButtons}>
            <button
              onClick={() => handleSort("name")}
              className={`${styles.sortButton} ${
                sortBy === "name" ? styles.active : ""
              }`}
            >
              Nome {getSortIcon("name")}
            </button>
            <button
              onClick={() => handleSort("code")}
              className={`${styles.sortButton} ${
                sortBy === "code" ? styles.active : ""
              }`}
            >
              Código {getSortIcon("code")}
            </button>
            <button
              onClick={() => handleSort("price")}
              className={`${styles.sortButton} ${
                sortBy === "price" ? styles.active : ""
              }`}
            >
              Preço {getSortIcon("price")}
            </button>
            <button
              onClick={() => handleSort("stock")}
              className={`${styles.sortButton} ${
                sortBy === "stock" ? styles.active : ""
              }`}
            >
              Estoque {getSortIcon("stock")}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de produtos */}
      {paginatedProducts.length > 0 ? (
        <>
          <div className={styles.grid}>
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
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
          <p>Nenhum produto encontrado com os filtros aplicados.</p>
          <button
            onClick={() => {
              setSearchTerm("");
              setStockFilter("all");
            }}
            className={styles.clearFiltersButton}
          >
            Limpar filtros
          </button>
        </div>
      )}

      {showForm && (
        <CreateProductForm
          product={editingProduct || undefined}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default ProductList;
