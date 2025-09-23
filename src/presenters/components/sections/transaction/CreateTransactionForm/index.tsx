// src/components/sections/CreateTransactionForm.tsx
import React, { useState, useEffect } from "react";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { useProduct } from "../../../../contexts/ProductContext";
import {
  Transaction,
  TransactionItem,
  TransactionType,
} from "../../../../../domain/entities/Transaction";
import styles from "./createTransactionForm.module.css";
import { ProductSearchInput } from "../../product/ProductSearchInput";
import { TransactionItemsList } from "../TransactionItemsList";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import { GrTransaction } from "react-icons/gr";

interface CreateTransactionFormProps {
  transaction?: Transaction;
  handleActiveView: (activeView: ActiveViewProps, dataEditing?: any) => void;
}

export const CreateTransactionForm = ({
  transaction,
  handleActiveView,
}: CreateTransactionFormProps) => {
  const { createTransaction, updateTransaction } = useTransaction();
  const { products, fetchProducts } = useProduct();

  const [type, setType] = useState<TransactionType>("sale");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState<number | string>("");
  const [discount, setDiscount] = useState<number | string>("");
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  const isEditing = !!transaction;

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description || "");
      setValue(transaction.value);
      setDiscount(transaction.discount || "");
      setItems(transaction.items || []);
    } else {
      setType("sale");
      setDescription("");
      setValue("");
      setDiscount("");
      setItems([]);
    }
  }, [transaction]);

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

      const transactionData = new Transaction({
        id: isEditing ? transaction.id : undefined,
        type,
        description: description || undefined,
        value:
          type === "aporte" || type === "service" || type === "payment"
            ? Number(value) - Number(discount || 0)
            : items.reduce(
                (acc, item) => acc + item.quantity * item.unitPrice,
                0
              ) - Number(discount || 0),
        items: type === "aporte" || type === "service" ? [] : items,
        discount: Number(discount),
      });

      if (isEditing) {
        await updateTransaction(transactionData);
      } else {
        await createTransaction(transactionData);
      }

      await fetchProducts();
      handleActiveView("dashboard");
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
    if (type === "aporte" || type === "service") {
      setError("Transações de aporte e serviço não podem ter itens de produto");
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

    setItems([]);
    setDiscount("");
    setValue("");
  };

  // Calcular valores - CORRIGIDO
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );
  const totalValue =
    type === "aporte" || type === "service"
      ? Number(value) - Number(discount || 0)
      : subtotal - Number(discount || 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            <GrTransaction />{" "}
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            {!isEditing && (
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
                  <option value="service">Serviço</option>
                  <option value="payment">Pagamento</option>
                </select>
              </div>
            )}

            {(type === "aporte" ||
              type === "service" ||
              type === "payment") && (
              <div className={styles.formGroup}>
                <label htmlFor="value" className={styles.label}>
                  Valor do{" "}
                  {type === "service"
                    ? "Serviço"
                    : type === "aporte"
                    ? "Aporte"
                    : "Pagemento"}{" "}
                  (R$) *
                </label>
                <input
                  type="number"
                  id="value"
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={styles.input}
                  min="0"
                  required
                />
              </div>
            )}

            {/* Mostrar campos de produtos apenas para vendas e compras */}
            {(type === "sale" || type === "purchase") && !isEditing && (
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

            {/* Permitir desconto para todos os tipos exceto os que não fazem sentido */}
            {(type === "sale" || type === "purchase" || type === "service") && (
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
                  min="0"
                  // step="0.01"
                />
              </div>
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
            {/* Mostrar subtotal apenas para vendas e compras */}
            {(type === "sale" || type === "purchase") && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal:</span>
                <span className={styles.summaryValue}>
                  R$ {subtotal.toFixed(2)}
                </span>
              </div>
            )}

            {/* Mostrar desconto apenas se houver e for aplicável */}
            {Number(discount) > 0 && type !== "aporte" && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Desconto:</span>
                <span className={styles.summaryDiscount}>
                  -R$ {Number(discount).toFixed(2)}
                </span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Valor Total:</span>
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
              onClick={() => handleActiveView("dashboard")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={
                loading ||
                (type !== "aporte" &&
                  type !== "service" &&
                  type !== "payment" &&
                  items.length === 0)
              }
            >
              {loading
                ? "Processando..."
                : (isEditing ? "Atualizar" : "Criar") + " Transação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
