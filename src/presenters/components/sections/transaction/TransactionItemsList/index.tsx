// src/components/sections/TransactionItemsList.tsx
import React from "react";
import { TransactionItem } from "../../../../../domain/entities/Transaction";
import { Product } from "../../../../../domain/entities/Product";
import styles from "./transactionItemsList.module.css";
import { formatBRL } from "../../../../../utils/formatCurrency";
import { FaPlus } from "react-icons/fa";
import { FaMinus } from "react-icons/fa6";

interface TransactionItemsListProps {
  items: TransactionItem[];
  products: Product[];
  transactionType: "sale" | "purchase" | "aporte";
  onUpdateQuantity: (index: number, newQuantity: number) => void;
  onRemoveItem: (index: number) => void;
}

export const TransactionItemsList: React.FC<TransactionItemsListProps> = ({
  items,
  products,
  transactionType,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  const getProduct = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  const handleQuantityChange = (index: number, change: number) => {
    const currentItem = items[index];
    const newQuantity = currentItem.quantity + change;

    if (newQuantity > 0) {
      onUpdateQuantity(index, newQuantity);
    } else if (newQuantity === 0) {
      onRemoveItem(index);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue > 0) {
      onUpdateQuantity(index, numericValue);
    } else if (value === "") {
      onUpdateQuantity(index, 1);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Nenhum item adicionado à transação</p>
      </div>
    );
  }

  return (
    <div className={styles.itemsSection}>
      <h3 className={styles.itemsTitle}>
        {transactionType === "sale" && "Itens de Venda"}
        {transactionType === "purchase" && "Itens de Compra"}
        {transactionType === "aporte" && "Itens de Aporte"}
      </h3>

      <ul className={styles.itemsList}>
        {items.map((item, index) => {
          const product = getProduct(item.productId);
          const totalPrice = item.quantity * item.unitPrice;

          return (
            <li key={index} className={styles.item}>
              <div className={styles.itemMain}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>
                    {product?.name || item.name}
                  </span>
                  <span className={styles.itemUnitPrice}>
                    R$ {formatBRL(item.unitPrice)}/un
                  </span>
                  {product && (
                    <span className={styles.stockInfo}>
                      Estoque: {product.stock} uni
                      {transactionType === "sale" &&
                        product.stock &&
                        product.stock < item.quantity && (
                          <span className={styles.stockWarning}>
                            ⚠️ Estoque insuficiente
                          </span>
                        )}
                    </span>
                  )}
                </div>

                <div className={styles.quantityControls}>
                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(index, -1)}
                    aria-label="Reduzir quantidade"
                  >
                    <FaMinus />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className={styles.quantityInput}
                    aria-label="Quantidade"
                  />

                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(index, 1)}
                    aria-label="Aumentar quantidade"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              <div className={styles.itemFooter}>
                <span className={styles.itemTotal}>
                  R$ {totalPrice.toFixed(2)}
                </span>

                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => onRemoveItem(index)}
                  aria-label="Remover item"
                >
                  🗑️ Remover
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className={styles.itemsSummary}>
        <div className={styles.summaryRow}>
          <span>Subtotal:</span>
          <span>
            R${" "}
            {items
              .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
              .toFixed(2)}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span>Total de itens:</span>
          <span>
            {items.reduce((sum, item) => sum + item.quantity, 0)} unidades
          </span>
        </div>
      </div>
    </div>
  );
};
