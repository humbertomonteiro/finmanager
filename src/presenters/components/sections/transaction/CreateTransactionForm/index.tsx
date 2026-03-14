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

const parseMoneyInput = (value: string): number => {
  if (!value) return 0;
  let cleaned = value.trim();
  cleaned = cleaned.replace(/R\$\s?/g, "");
  const dotCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;
  if (dotCount > 0 && commaCount > 0) {
    const lastDot = cleaned.lastIndexOf(".");
    const lastComma = cleaned.lastIndexOf(",");
    if (lastDot > lastComma) {
      cleaned = cleaned.replace(/\./g, "").replace(",", ".");
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  } else if (commaCount > 0) {
    if (commaCount === 1) {
      const parts = cleaned.split(",");
      if (parts[1] && parts[1].length <= 2) {
        cleaned = cleaned.replace(",", ".");
      } else {
        cleaned = cleaned.replace(/,/g, "");
      }
    } else {
      cleaned = cleaned.replace(/,/g, "");
    }
  }
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
  const [customerName, setCustomerName] = useState("");

  const isEditing = !!transaction;

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description || "");
      setValue(transaction.value.toString());
      setDiscount(transaction.discount ? transaction.discount.toString() : "");
      setItems(transaction.items || []);
      setCustomerName(transaction.customerName || "");
    } else {
      setType("sale");
      setDescription("");
      setValue("");
      setDiscount("");
      setItems([]);
      setCustomerName("");
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (type === "sale" || type === "credit_sale") {
        for (const item of items) {
          const product = products.find((p) => p.id === item.productId);
          if (
            product &&
            product.stock !== undefined &&
            product.stock < item.quantity
          ) {
            throw new Error(
              `Estoque insuficiente para ${product.name}. ` +
                `Disponível: ${product.stock}, Solicitado: ${item.quantity}`
            );
          }
        }
      }

      if (type === "credit_sale" && customerName.trim().length < 2) {
        throw new Error("Nome do cliente é obrigatório para venda fiado.");
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
        customerName: type === "credit_sale" ? customerName.trim() : undefined,
        isPaid: type === "credit_sale" ? false : true,
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

    const unitPrice =
      type === "sale" || type === "credit_sale"
        ? product.salePrice
        : product.costPrice;

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
    setCustomerName("");
  };

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

  const isSaleType = type === "sale" || type === "credit_sale";
  const hasProducts =
    type === "sale" || type === "credit_sale" || type === "purchase";

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
                  <option value="credit_sale">Venda Fiado</option>
                  <option value="purchase">Compra</option>
                  <option value="aporte">Aporte</option>
                  <option value="service">Serviço</option>
                  <option value="payment">Pagamento</option>
                </select>
              </div>
            )}

            {/* Nome do cliente — apenas para fiado */}
            {type === "credit_sale" && (
              <div className={styles.formGroup}>
                <label htmlFor="customerName" className={styles.label}>
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  id="customerName"
                  placeholder="Nome de quem vai pagar depois"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={styles.input}
                  required
                />
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

            {hasProducts && !isEditing && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="product" className={styles.label}>
                    Produto
                  </label>
                  <ProductSearchInput
                    products={products}
                    onProductSelect={handleProductSelect}
                    type={isSaleType ? "sale" : (type as any)}
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
                  transactionType={isSaleType ? "sale" : (type as any)}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              </>
            )}

            {(isSaleType || type === "purchase" || type === "service") && (
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
            {hasProducts && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal:</span>
                <span className={styles.summaryValue}>
                  R$ {subtotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}

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

            {type === "credit_sale" && (
              <div className={styles.creditSaleNotice}>
                ⚠️ Esta venda será registrada como <strong>fiado</strong> — o
                estoque será descontado agora, mas o valor ficará{" "}
                <strong>pendente de recebimento</strong>.
              </div>
            )}
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
