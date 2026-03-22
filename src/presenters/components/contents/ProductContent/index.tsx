// src/presenters/components/contents/ProductContent/index.tsx
import { useState, useMemo } from "react";
import { useProduct } from "../../../contexts/ProductContext";
import { ActiveViewProps } from "../../../pages/Dashboard";
import ProductCard from "../../sections/product/ProductCard";
import styles from "./productContent.module.css";

interface ProductContentProps {
  handleActiveView: (view: ActiveViewProps, data?: any) => void;
}

export default function ProductContent({
  handleActiveView,
}: ProductContentProps) {
  const { products } = useProduct();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const displayed = useMemo(() => {
    let list = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.code).includes(q) ||
          (p.supplier || "").toLowerCase().includes(q)
      );
    }

    if (stockFilter === "ok") list = list.filter((p) => (p.stock ?? 0) > 10);
    if (stockFilter === "low")
      list = list.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10);
    if (stockFilter === "out") list = list.filter((p) => (p.stock ?? 0) === 0);

    if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "stock")
      list.sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
    if (sortBy === "price") list.sort((a, b) => b.salePrice - a.salePrice);
    if (sortBy === "profit")
      list.sort(
        (a, b) => b.salePrice - b.costPrice - (a.salePrice - a.costPrice)
      );
    if (sortBy === "margin") {
      list.sort((a, b) => {
        const ma =
          a.costPrice > 0 ? (a.salePrice - a.costPrice) / a.costPrice : 0;
        const mb =
          b.costPrice > 0 ? (b.salePrice - b.costPrice) / b.costPrice : 0;
        return mb - ma;
      });
    }

    return list;
  }, [products, search, stockFilter, sortBy]);

  // Summary stats
  const totalStock = products.reduce((s, p) => s + (p.stock ?? 0), 0);
  const lowStock = products.filter(
    (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10
  ).length;
  const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;

  return (
    <div className={styles.container}>
      {/* Quick stats */}
      {products.length > 0 && (
        <div className={styles.quickStats}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{products.length}</span>
            <span className={styles.statLbl}>Produtos</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statVal}>{totalStock}</span>
            <span className={styles.statLbl}>Total em estoque</span>
          </div>
          <div className={styles.statDivider} />
          <div
            className={`${styles.stat} ${styles.statClickable}`}
            onClick={() => setStockFilter(stockFilter === "low" ? "" : "low")}
            title="Filtrar estoque baixo"
          >
            <span
              className={`${styles.statVal} ${
                lowStock > 0 ? styles.amber : ""
              }`}
            >
              {lowStock}
            </span>
            <span className={styles.statLbl}>Estoque baixo</span>
          </div>
          <div className={styles.statDivider} />
          <div
            className={`${styles.stat} ${styles.statClickable}`}
            onClick={() => setStockFilter(stockFilter === "out" ? "" : "out")}
            title="Filtrar sem estoque"
          >
            <span
              className={`${styles.statVal} ${
                outOfStock > 0 ? styles.red : ""
              }`}
            >
              {outOfStock}
            </span>
            <span className={styles.statLbl}>Sem estoque</span>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--text-3)", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, código ou fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch("")}>
              ×
            </button>
          )}
        </div>

        <select
          className={styles.select}
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">Todo estoque</option>
          <option value="ok">Estoque ok (+ 10)</option>
          <option value="low">Estoque baixo (≤ 10)</option>
          <option value="out">Sem estoque</option>
        </select>

        <select
          className={styles.select}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Ordenar: Nome A-Z</option>
          <option value="stock">Ordenar: Menor estoque</option>
          <option value="price">Ordenar: Maior preço</option>
          <option value="profit">Ordenar: Maior lucro</option>
          <option value="margin">Ordenar: Maior margem</option>
        </select>

        <div className={styles.count}>
          {displayed.length} produto{displayed.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
          </div>
          <div className={styles.emptyTitle}>
            {search || stockFilter
              ? "Nenhum produto encontrado"
              : "Nenhum produto cadastrado"}
          </div>
          <div className={styles.emptySub}>
            {search || stockFilter
              ? "Tente ajustar os filtros"
              : "Adicione seu primeiro produto para começar"}
          </div>
          {!search && !stockFilter && (
            <button
              className={styles.emptyBtn}
              onClick={() => handleActiveView("new-product")}
            >
              + Adicionar Produto
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {displayed.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              handleActiveView={handleActiveView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
