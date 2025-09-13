// src/components/sections/ProductCard.tsx
import { Product } from "../../../../../domain/entities/Product";
import styles from "./productCard.module.css";
import { useProduct } from "../../../../contexts/ProductContext";
import { useState } from "react";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { ActiveViewProps } from "../../../../pages/Dashboard";

interface ProductCardProps {
  product: Product;
  handleActiveView: (activeView: ActiveViewProps, dataEditing?: any) => void;
}

export default function ProductCard({
  product,
  handleActiveView,
}: ProductCardProps) {
  const { deleteProduct } = useProduct();
  const [error, setError] = useState<string | null>(null);
  const profit = product.salePrice - product.costPrice;
  const profitMargin =
    product.costPrice > 0 ? (profit / product.costPrice) * 100 : 0;

  const handleDelete = async () => {
    try {
      const productId = product.id;
      if (!productId) {
        throw new Error("Product id not found");
      }
      deleteProduct(productId);
    } catch (error) {
      setError(`${error}`);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.actions}>
          <button
            className={styles.editButton}
            onClick={() => handleActiveView("new-product", product)}
            aria-label="Editar produto"
          >
            <MdModeEdit />
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            aria-label="Excluir produto"
          >
            <MdDelete />
          </button>
        </div>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <p className={styles.description}>
        {product.description || "Sem descrição"}
      </p>

      <div className={styles.details}>
        <div className={styles.detailRow}>
          <span className={styles.label}>Código:</span>
          <span className={styles.value}>{product.code}</span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Custo:</span>
          <span className={styles.costPrice}>
            R$ {product.costPrice.toFixed(2)}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Venda:</span>
          <span className={styles.salePrice}>
            R$ {product.salePrice.toFixed(2)}
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Lucro:</span>
          <span className={profit > 0 ? styles.profit : styles.loss}>
            R$ {profit.toFixed(2)} ({profitMargin.toFixed(1)}%)
          </span>
        </div>

        <div className={styles.detailRow}>
          <span className={styles.label}>Estoque:</span>
          <span
            className={
              product.stock && product.stock > 10
                ? styles.stockOk
                : styles.stockLow
            }
          >
            {product.stock} unid.
          </span>
        </div>

        {product.supplier && (
          <div className={styles.detailRow}>
            <span className={styles.label}>Fornecedor:</span>
            <span className={styles.supplier}>{product.supplier}</span>
          </div>
        )}
      </div>
    </div>
  );
}
