// src/presenters/components/sections/product/StockAdjustmentForm/index.tsx
import React, { useState, useMemo } from "react";
import { useProduct } from "../../../../contexts/ProductContext";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import styles from "./stockAdjustmentForm.module.css";

interface Props {
  onClose: () => void;
}

export const StockAdjustmentForm: React.FC<Props> = () => {
  const { products, updateProduct } = useProduct();
  const [search, setSearch] = useState("");
  const [adjustments, setAdjustments] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...products]
      .filter(
        (p) =>
          !q || p.name.toLowerCase().includes(q) || String(p.code).includes(q)
      )
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  }, [products, search]);

  const handleSave = async (id: string) => {
    const newStock = parseInt(adjustments[id] ?? "");
    if (isNaN(newStock) || newStock < 0) {
      alert("Estoque deve ser um número inteiro ≥ 0.");
      return;
    }
    setSaving(id);
    try {
      const prod = products.find((p) => p.id === id);
      if (!prod) return;
      prod.setStock(newStock);
      await updateProduct(prod);
      setSaved((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [id]: false })), 2000);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  const stockStatus = (s: number) => (s === 0 ? "out" : s <= 10 ? "low" : "ok");

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="6" height="4" />
              <rect x="2" y="10" width="6" height="4" />
              <rect x="2" y="17" width="6" height="4" />
              <line x1="10" y1="5" x2="22" y2="5" />
              <line x1="10" y1="12" x2="22" y2="12" />
              <line x1="10" y1="19" x2="22" y2="19" />
            </svg>
          </div>
          <div>
            <div className={styles.pageTitle}>Ajuste de Estoque</div>
            <div className={styles.pageSub}>{products.length} produtos</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
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
          placeholder="Buscar produto por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>Nenhum produto encontrado</div>
        ) : (
          filtered.map((p) => {
            const current = p.stock ?? 0;
            const adjusted = adjustments[p.id!];
            // const val = adjusted !== undefined ? parseInt(adjusted) : current;
            const diff =
              adjusted !== undefined ? (parseInt(adjusted) || 0) - current : 0;
            const status = stockStatus(current);

            return (
              <div key={p.id} className={styles.row}>
                {/* Left info */}
                <div className={styles.prodInfo}>
                  <div className={styles.prodName}>{p.name}</div>
                  <div className={styles.prodMeta}>
                    <span className={styles.prodCode}>#{p.code}</span>
                    <span className={styles.separator}>·</span>
                    <span
                      className={`${styles.stockStatus} ${
                        styles["status_" + status]
                      }`}
                    >
                      Atual: {current}
                    </span>
                    {p.supplier && p.supplier !== "Desconhecido" && (
                      <>
                        <span className={styles.separator}>·</span>
                        <span className={styles.supplier}>{p.supplier}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className={styles.prodPrice}>
                  {formatCurrency(p.salePrice)}
                </div>

                {/* Adjust control */}
                <div className={styles.adjControl}>
                  {diff !== 0 && (
                    <span
                      className={`${styles.diff} ${
                        diff > 0 ? styles.diffPos : styles.diffNeg
                      }`}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff}
                    </span>
                  )}
                  <input
                    type="number"
                    className={styles.adjInput}
                    value={adjusted ?? current}
                    min={0}
                    onChange={(e) =>
                      setAdjustments((prev) => ({
                        ...prev,
                        [p.id!]: e.target.value,
                      }))
                    }
                  />
                  <button
                    className={`${styles.saveBtn} ${
                      saved[p.id!] ? styles.saveBtnSaved : ""
                    }`}
                    onClick={() => handleSave(p.id!)}
                    disabled={saving === p.id || adjusted === undefined}
                  >
                    {saving === p.id ? "…" : saved[p.id!] ? "✓" : "Salvar"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
