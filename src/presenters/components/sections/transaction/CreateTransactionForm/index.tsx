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

// Função auxiliar para converter entrada monetária
const parseMoneyInput = (value: string): number => {
  if (!value) return 0;

  // Remove espaços em branco
  let cleaned = value.trim();

  // Remove o símbolo R$ se existir
  cleaned = cleaned.replace(/R\$\s?/g, "");

  // Conta quantos pontos e vírgulas existem
  const dotCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;

  // Se tem vírgula e ponto, determina qual é o separador decimal
  if (dotCount > 0 && commaCount > 0) {
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");

    if (lastDot > lastComma) {
      // Formato: 1.234,56 -> remove pontos (milhares) e troca vírgula por ponto
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      // Formato: 1,234.56 -> remove vírgulas (milhares)
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (commaCount > 0) {
    // Só tem vírgulas
    if (commaCount === 1) {
      // Pode ser decimal brasileiro (10,50) ou milhares americano (1,234)
      const parts = cleaned.split(",");
      if (parts[1] && parts[1].length <= 2) {
        // Provavelmente decimal brasileiro
        cleaned = cleaned.replace(",", ".");
      } else {
        // Provavelmente separador de milhares
        cleaned = cleaned.replace(/,/g, "");
      }
    } else {
      // Múltiplas vírgulas = separador de milhares
      cleaned = cleaned.replace(/,/g, "");
    }
  }
  // Se só tem pontos, mantém como está (formato americano padrão)

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const CreateTransactionForm = ({
  transaction,
  handleActiveView,
}: CreateTransactionFormProps) => {
  const { createTransaction, updateTransaction } = useTransaction();
  const { products, fetchProducts } = useProduct();

  const [type, setType] = useState<TransactionType>("sale");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  const isEditing = !!transaction;

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description || "");
      setValue(transaction.value.toString());
      setDiscount(transaction.discount ? transaction.discount.toString() : "");
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

      const parsedValue = parseMoneyInput(value);
      const parsedDiscount = parseMoneyInput(discount);

      const transactionData = new Transaction({
        id: isEditing ? transaction.id : undefined,
        type,
        description: description || "",
        value:
          type === "aporte" || type === "service" || type === "payment"
            ? parsedValue - parsedDiscount
            : items.reduce(
                (acc, item) => acc + item.quantity * item.unitPrice,
                0
              ) - parsedDiscount,
        items: type === "aporte" || type === "service" ? [] : items,
        discount: parsedDiscount,
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

  // Calcular valores
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0
  );

  const parsedValue = parseMoneyInput(value);
  const parsedDiscount = parseMoneyInput(discount);

  const totalValue =
    type === "aporte" || type === "service" || type === "payment"
      ? parsedValue - parsedDiscount
      : subtotal - parsedDiscount;

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
                    : "Pagamento"}{" "}
                  (R$) *
                </label>
                <input
                  type="text"
                  id="value"
                  placeholder="0,00 ou 0.00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className={styles.input}
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
                  type="text"
                  id="discount"
                  placeholder="0,00 ou 0.00"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className={styles.input}
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
                  R$ {subtotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}

            {/* Mostrar desconto apenas se houver e for aplicável */}
            {parsedDiscount > 0 && type !== "aporte" && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Desconto:</span>
                <span className={styles.summaryDiscount}>
                  -R$ {parsedDiscount.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}

            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Valor Total:</span>
              <span className={styles.summaryTotal}>
                R$ {totalValue.toFixed(2).replace(".", ",")}
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
