// src/presenters/components/sections/product/ProductCard/index.tsx
import { useState } from "react";
import { Product } from "../../../../../domain/entities/Product";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { useProduct } from "../../../../contexts/ProductContext";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import styles from "./productCard.module.css";
import { MdEdit, MdDelete } from "react-icons/md";
import { FaBox } from "react-icons/fa6";

interface ProductCardProps {
  product: Product;
  handleActiveView: (view: ActiveViewProps, data?: any) => void;
}

export default function ProductCard({
  product,
  handleActiveView,
}: ProductCardProps) {
  const { deleteProduct } = useProduct();
  const [deleting, setDeleting] = useState(false);

  const profit = product.salePrice - product.costPrice;
  const margin =
    product.costPrice > 0
      ? ((profit / product.costPrice) * 100).toFixed(1)
      : "0";

  const stock = product.stock ?? 0;
  const stockStatus = stock === 0 ? "out" : stock <= 10 ? "low" : "ok";
  const stockLabel =
    stock === 0
      ? "Sem estoque"
      : stock <= 10
      ? `Baixo — ${stock} unid.`
      : `${stock} unid.`;

  const handleDelete = async () => {
    if (!confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`))
      return;
    setDeleting(true);
    try {
      await deleteProduct(product.id!);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className={`${styles.card} ${
        stockStatus === "out" ? styles.cardOut : ""
      }`}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.nameBlock}>
          <div className={styles.name}>{product.name}</div>
          <div className={styles.code}>#{product.code}</div>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => handleActiveView("new-product", product)}
            title="Editar produto"
          >
            <MdEdit />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionDelete}`}
            onClick={handleDelete}
            disabled={deleting}
            title="Excluir produto"
          >
            <MdDelete />
          </button>
        </div>
      </div>

      {product.description && (
        <p className={styles.description}>{product.description}</p>
      )}

      {/* Price grid */}
      <div className={styles.priceGrid}>
        <div className={styles.priceItem}>
          <div className={styles.priceLabel}>Custo</div>
          <div className={`${styles.priceValue} ${styles.priceCost}`}>
            {formatCurrency(product.costPrice)}
          </div>
        </div>
        <div className={styles.priceItem}>
          <div className={styles.priceLabel}>Venda</div>
          <div className={`${styles.priceValue} ${styles.priceSale}`}>
            {formatCurrency(product.salePrice)}
          </div>
        </div>
        <div className={styles.priceItem}>
          <div className={styles.priceLabel}>Lucro</div>
          <div
            className={`${styles.priceValue} ${
              profit >= 0 ? styles.priceProfit : styles.priceLoss
            }`}
          >
            {margin}%
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div
          className={`${styles.stockPill} ${styles["stock_" + stockStatus]}`}
        >
          <div className={styles.stockDot} />
          {stockLabel}
        </div>
        {product.supplier && product.supplier !== "Desconhecido" && (
          <div className={styles.supplier}>
            <FaBox />
            {product.supplier}
          </div>
        )}
      </div>
    </div>
  );
}
