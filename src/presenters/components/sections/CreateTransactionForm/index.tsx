// src/components/sections/CreateTransactionForm.tsx
import React, { useState } from "react";
import { useTransaction } from "../../../contexts/TransactionContext";
import { useProduct } from "../../../contexts/ProductContext";
import {
  Transaction,
  TransactionItem,
  TransactionType,
} from "../../../../domain/entities/Transaction";
import styles from "./createTransactionForm.module.css";
import { ProductSearchInput } from "../ProductSearchInput";
import { TransactionItemsList } from "../TransactionItemsList";

interface CreateTransactionFormProps {
  onClose: () => void;
}

export const CreateTransactionForm: React.FC<CreateTransactionFormProps> = ({
  onClose,
}) => {
  const { createTransaction } = useTransaction();
  const { products, fetchProducts } = useProduct();

  const [type, setType] = useState<TransactionType>("sale");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState<number | string>("");
  const [discount, setDiscount] = useState<number | string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validar estoque para vendas
      if (type === "sale") {
        for (const item of items) {
          const product = products.find((p) => p.id === item.productId);
          if (product && product.stock && product.stock < item.quantity) {
            throw new Error(
              `Estoque insuficiente para ${product.name}. ` +
                `Disponível: ${product.stock}, Solicitado: ${item.quantity}`
            );
          }
        }
      }

      const transaction = new Transaction({
        type,
        description: description || undefined,
        value:
          type === "aporte"
            ? Number(value)
            : items.reduce(
                (acc, item) => acc + item.quantity * item.unitPrice,
                0
              ) - Number(discount || 0),
        date: new Date(date),
        items: type === "aporte" ? [] : items,
        discount: Number(discount),
      });

      await createTransaction(transaction);
      await fetchProducts();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleProductSelect = (product: any) => {
    if (type === "aporte") {
      setError("Transações de aporte não podem ter itens de produto");
      return;
    }

    const unitPrice = type === "sale" ? product.salePrice : product.costPrice;

    const newItem: TransactionItem = {
      productId: product.id!,
      name: product.name,
      quantity: quantity,
      unitPrice: unitPrice,
    };

    setItems((prev) => [newItem, ...prev]);
    setQuantity(1);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);

    // Limpa itens e valores quando muda o tipo
    if (newType === "aporte") {
      setItems([]);
      setDiscount("");
    } else {
      setValue("");
    }
  };

  // Calcular valores
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const totalValue =
    type === "aporte" ? Number(value) : subtotal - Number(discount || 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>Nova Transação</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >
            <span className={styles.closeIcon}>×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="type" className={styles.label}>
                Tipo de Transação *
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as TransactionType)
                }
                className={styles.select}
                required
              >
                <option value="sale">Venda</option>
                <option value="purchase">Compra</option>
                <option value="aporte">Aporte</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date" className={styles.label}>
                Data *
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            {type !== "aporte" && (
              <div className={styles.formGroup}>
                <label htmlFor="discount" className={styles.label}>
                  Desconto (R$)
                </label>
                <input
                  type="number"
                  id="discount"
                  placeholder="0,00"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className={styles.input}
                  step="0.01"
                  min="0"
                />
              </div>
            )}

            {type === "aporte" && (
              <div className={styles.formGroup}>
                <label htmlFor="value" className={styles.label}>
                  Valor do Aporte (R$) *
                </label>
                <input
                  type="number"
                  id="value"
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={styles.input}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            )}

            {type !== "aporte" && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="product" className={styles.label}>
                    Produto
                  </label>
                  <ProductSearchInput
                    products={products}
                    onProductSelect={handleProductSelect}
                    type={type}
                    placeholder="Digite o nome ou código do produto..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="quantity" className={styles.label}>
                    Quantidade Inicial
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    placeholder="Quantidade"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className={styles.input}
                  />
                </div>

                <TransactionItemsList
                  items={items}
                  products={products}
                  transactionType={type}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              </>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Descrição
              </label>
              <textarea
                id="description"
                placeholder="Descrição da transação (opcional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          <div className={styles.summary}>
            {type !== "aporte" && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal:</span>
                <span className={styles.summaryValue}>
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>
            )}

            {type !== "aporte" && Number(discount) > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Desconto:</span>
                <span className={styles.summaryDiscount}>
                  -R$ {Number(discount).toFixed(2)}
                </span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>
                {type === "aporte" ? "Valor do Aporte:" : "Valor Total:"}
              </span>
              <span className={styles.summaryTotal}>
                R$ {totalValue.toFixed(2)}
              </span>
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || (type !== "aporte" && items.length === 0)}
            >
              {loading ? "Processando..." : "Criar Transação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
