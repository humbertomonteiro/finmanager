// src/presenters/components/sections/product/ProductSearchInput/index.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Product } from "../../../../../domain/entities/Product";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import styles from "./productSearchInput.module.css";

interface ProductSearchInputProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  type: "sale" | "purchase";
  placeholder?: string;
}

export const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  products,
  onProductSelect,
  type,
  placeholder = "Buscar produto por nome ou código...",
}) => {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLDivElement>(null);
  const ignoreBlur = useRef(false);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          String(p.code).includes(q) ||
          (p.supplier || "").toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [products, term]);

  // Scroll active item into view
  useEffect(() => {
    if (idx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-item]");
      items[idx]?.scrollIntoView({ block: "nearest" });
    }
  }, [idx]);

  const select = (p: Product) => {
    onProductSelect(p);
    setTerm("");
    setOpen(false);
    setIdx(-1);
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) { if (e.key !== "Escape") setOpen(true); return; }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIdx((i) => (i < filtered.length - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setIdx((i) => (i > 0 ? i - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (idx >= 0 && filtered[idx]) select(filtered[idx]);
        break;
      case "Escape":
        setOpen(false);
        setIdx(-1);
        break;
    }
  };

  const stockStatus = (p: Product) => {
    const s = p.stock ?? 0;
    return s === 0 ? "out" : s <= 5 ? "low" : "ok";
  };

  const price = (p: Product) =>
    type === "sale" ? p.salePrice : p.costPrice;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.inputBox} ${open ? styles.inputBoxOpen : ""}`}>
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
          ref={inputRef}
          type="text"
          value={term}
          placeholder={placeholder}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); setIdx(-1); }}
          onFocus={() => setOpen(true)}
          onBlur={() => { if (!ignoreBlur.current) setOpen(false); ignoreBlur.current = false; }}
          onKeyDown={handleKey}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {term && (
          <button
            className={styles.clearBtn}
            onMouseDown={(e) => { e.preventDefault(); setTerm(""); setOpen(true); inputRef.current?.focus(); }}
          >
            ×
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className={styles.dropdown}
          onMouseDown={() => { ignoreBlur.current = true; }}
        >
          {filtered.map((p, i) => {
            const ss = stockStatus(p);
            const pr = price(p);
            return (
              <div
                key={p.id}
                data-item
                className={`${styles.item} ${i === idx ? styles.itemActive : ""}`}
                onClick={() => select(p)}
                onMouseEnter={() => setIdx(i)}
                role="option"
                aria-selected={i === idx}
              >
                <div className={styles.itemLeft}>
                  <div className={styles.itemName}>{p.name}</div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemCode}>#{p.code}</span>
                    {p.supplier && p.supplier !== "Desconhecido" && (
                      <span className={styles.itemSupplier}>· {p.supplier}</span>
                    )}
                    <span className={`${styles.itemStock} ${styles["stock_" + ss]}`}>
                      · {p.stock ?? 0} {(p.stock ?? 0) === 1 ? "unid." : "unids."}
                      {ss === "out" && " ⚠️"}
                    </span>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  <div className={`${styles.itemPrice} ${type === "sale" ? styles.priceSale : styles.pricePurchase}`}>
                    {formatCurrency(pr)}
                  </div>
                  <div className={styles.itemPriceLabel}>
                    {type === "sale" ? "venda" : "custo"}
                  </div>
                </div>
              </div>
            );
          })}

          {term && filtered.length === 0 && (
            <div className={styles.noResults}>
              Nenhum produto encontrado para "{term}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
