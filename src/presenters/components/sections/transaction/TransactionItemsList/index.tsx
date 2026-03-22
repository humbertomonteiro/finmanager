// src/presenters/components/sections/transaction/TransactionItemsList/index.tsx
import React from "react";
import { TransactionItem } from "../../../../../domain/entities/Transaction";
import { Product } from "../../../../../domain/entities/Product";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import styles from "./transactionItemsList.module.css";

interface TransactionItemsListProps {
  items: TransactionItem[];
  products: Product[];
  transactionType: "sale" | "purchase" | "aporte";
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
}

export const TransactionItemsList: React.FC<TransactionItemsListProps> = ({
  items,
  products,
  transactionType,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const getProduct = (id: string) => products.find((p) => p.id === id);

  const changeQty = (idx: number, delta: number) => {
    const newQty = items[idx].quantity + delta;
    if (newQty <= 0) onRemoveItem(idx);
    else onUpdateQuantity(idx, newQty);
  };

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          {items.length} {items.length === 1 ? "item" : "itens"} · {totalQty} unid.
        </span>
        <span className={styles.headerSubtotal}>{formatCurrency(subtotal)}</span>
      </div>

      <div className={styles.list}>
        {items.map((item, i) => {
          const product = getProduct(item.productId);
          const lineTotal = item.quantity * item.unitPrice;
          const stockOk =
            transactionType !== "sale" ||
            !product ||
            (product.stock ?? 0) >= item.quantity;

          return (
            <div
              key={i}
              className={`${styles.row} ${!stockOk ? styles.rowWarning : ""}`}
            >
              {/* Name + stock */}
              <div className={styles.info}>
                <div className={styles.name}>{item.name}</div>
                <div className={styles.meta}>
                  {formatCurrency(item.unitPrice)}/un
                  {product && (
                    <span className={`${styles.stock} ${!stockOk ? styles.stockWarn : ""}`}>
                      · {!stockOk ? `⚠️ Estoque: ${product.stock}` : `Estoque: ${product.stock}`}
                    </span>
                  )}
                </div>
              </div>

              {/* Qty controls */}
              <div className={styles.controls}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => changeQty(i, -1)}
                  aria-label="Reduzir"
                >
                  −
                </button>
                <input
                  type="number"
                  className={styles.qtyInput}
                  value={item.quantity}
                  min={1}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v > 0) onUpdateQuantity(i, v);
                  }}
                  aria-label="Quantidade"
                />
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => changeQty(i, 1)}
                  aria-label="Aumentar"
                >
                  +
                </button>
              </div>

              {/* Line total */}
              <div className={styles.total}>{formatCurrency(lineTotal)}</div>

              {/* Remove */}
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemoveItem(i)}
                aria-label="Remover item"
                title="Remover"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
