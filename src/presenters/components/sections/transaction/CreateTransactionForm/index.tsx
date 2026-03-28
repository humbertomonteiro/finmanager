// src/presenters/components/sections/transaction/CreateTransactionForm/index.tsx
import React, { useState, useEffect } from "react";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { useProduct } from "../../../../contexts/ProductContext";
import {
  Transaction,
  TransactionItem,
  TransactionType,
} from "../../../../../domain/entities/Transaction";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { ProductSearchInput } from "../../product/ProductSearchInput";
import { TransactionItemsList } from "../TransactionItemsList";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import styles from "./createTransactionForm.module.css";

import { GrTransaction } from "react-icons/gr";
import { IoClose } from "react-icons/io5";
import { TbMoneybag, TbReportMoney } from "react-icons/tb";
import { IoCartOutline } from "react-icons/io5";
import {
  FaHandshake,
  FaMoneyBillTransfer,
  FaPersonDigging,
} from "react-icons/fa6";

interface Props {
  transaction?: Transaction;
  handleActiveView: (view: ActiveViewProps, data?: any) => void;
  onClose?: () => void;
}

const parseMoneyInput = (value: string): number => {
  if (!value) return 0;
  let c = value.trim().replace(/R\$\s?/g, "");
  const dots = (c.match(/\./g) || []).length;
  const commas = (c.match(/,/g) || []).length;
  if (dots > 0 && commas > 0) {
    if (c.lastIndexOf(".") > c.lastIndexOf(","))
      c = c.replace(/\./g, "").replace(",", ".");
    else c = c.replace(/,/g, "");
  } else if (commas === 1 && c.split(",")[1]?.length <= 2) {
    c = c.replace(",", ".");
  } else if (commas > 1) {
    c = c.replace(/,/g, "");
  }
  return parseFloat(c) || 0;
};

const TYPE_OPTIONS: {
  value: TransactionType;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    value: "sale",
    label: "Venda",
    icon: <TbMoneybag />,
    desc: "Venda com produtos",
  },
  {
    value: "credit_sale",
    label: "Fiado",
    icon: <FaHandshake />,
    desc: "Pagar depois",
  },
  {
    value: "credit_service",
    label: "Serviço Fiado",
    icon: <FaHandshake />,
    desc: "Pagar depois",
  },
  {
    value: "purchase",
    label: "Compra",
    icon: <IoCartOutline />,
    desc: "Entrada de produtos",
  },
  {
    value: "aporte",
    label: "Aporte",
    icon: <TbReportMoney />,
    desc: "Entrada de capital",
  },
  {
    value: "service",
    label: "Serviço",
    icon: <FaPersonDigging />,
    desc: "Prestação de serviço",
  },
  {
    value: "payment",
    label: "Pagamento",
    icon: <FaMoneyBillTransfer />,
    desc: "Saída de caixa",
  },
];

export const CreateTransactionForm: React.FC<Props> = ({
  transaction,
  handleActiveView,
  onClose,
}) => {
  const { createTransaction, updateTransaction } = useTransaction();
  const { products, fetchProducts } = useProduct();

  const [type, setType] = useState<TransactionType>("sale");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [discount, setDiscount] = useState("");
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!transaction;
  const hasProducts = ["sale", "credit_sale", "purchase"].includes(type);
  const needsValue = [
    "aporte",
    "service",
    "payment",
    "credit_service",
  ].includes(type);
  const isSaleType = type === "sale" || type === "credit_sale";

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setDescription(transaction.description || "");
      setValue(transaction.value.toString());
      setDiscount(transaction.discount ? transaction.discount.toString() : "");
      setItems(transaction.items || []);
      setCustomerName(transaction.customerName || "");
    }
  }, [transaction]);

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const parsedDiscount = parseMoneyInput(discount);
  const parsedValue = parseMoneyInput(value);
  const totalValue = needsValue
    ? parsedValue - parsedDiscount
    : subtotal - parsedDiscount;

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setItems([]);
    setDiscount("");
    setValue("");
    setCustomerName("");
    setError("");
  };

  const handleProductSelect = (product: any) => {
    const unitPrice = isSaleType ? product.salePrice : product.costPrice;
    const existing = items.findIndex((i) => i.productId === product.id);
    if (existing >= 0) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === existing
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setItems((prev) => [
        { productId: product.id!, name: product.name, quantity, unitPrice },
        ...prev,
      ]);
    }
    setQuantity(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Stock validation
      if (isSaleType) {
        for (const item of items) {
          const prod = products.find((p) => p.id === item.productId);
          if (prod && (prod.stock ?? 0) < item.quantity) {
            throw new Error(
              `Estoque insuficiente para "${prod.name}". Disponível: ${prod.stock}, Solicitado: ${item.quantity}`
            );
          }
        }
      }

      if (
        (type === "credit_sale" && customerName.trim().length < 2) ||
        (type === "credit_sale" && customerName.trim().length < 2)
      ) {
        throw new Error("Nome do cliente é obrigatório (mínimo 2 caracteres).");
      }

      const finalValue = needsValue
        ? parsedValue - parsedDiscount
        : subtotal - parsedDiscount;

      if (finalValue <= 0 && type !== "adjustment") {
        throw new Error("O valor total deve ser maior que zero.");
      }

      const tx = new Transaction({
        id: isEditing ? transaction!.id : undefined,
        type,
        description: description || "",
        value: finalValue,
        items: hasProducts ? items : [],
        discount: parsedDiscount || 0,
        customerName:
          type === "credit_sale" || type === "credit_service"
            ? customerName.trim()
            : undefined,
        isPaid:
          type === "credit_sale" || type === "credit_service" ? false : true,
      });

      if (isEditing) {
        await updateTransaction(tx);
      } else {
        await createTransaction(tx);
      }

      await fetchProducts();
      onClose ? onClose() : handleActiveView("dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose ? onClose() : handleActiveView("dashboard");
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div className={styles.panelHeaderLeft}>
          <div className={styles.headerIcon}>
            <GrTransaction />
          </div>
          <div>
            <div className={styles.panelTitle}>
              {isEditing ? "Editar Transação" : "Nova Transação"}
            </div>
            <div className={styles.panelSub}>
              {isEditing
                ? "Atualize os dados abaixo"
                : "Preencha os dados da transação"}
            </div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={handleClose}>
          <IoClose />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Type selector */}
        {!isEditing && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Tipo de transação</div>
            <div className={styles.typePills}>
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.typePill} ${
                    type === opt.value ? styles.typePillActive : ""
                  }`}
                  onClick={() => handleTypeChange(opt.value)}
                >
                  <span className={styles.pillIcon}>{opt.icon}</span>
                  <span className={styles.pillLabel}>{opt.label}</span>
                  <span className={styles.pillDesc}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Customer name (credit_sale) */}
        {(type === "credit_sale" || type === "credit_service") && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Cliente</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome do cliente *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Nome de quem vai pagar depois..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Value (aporte / service / payment) */}
        {needsValue && (
          <div className={styles.section}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Valor do{" "}
                {type === "service"
                  ? "Serviço"
                  : type === "aporte"
                  ? "Aporte"
                  : type === "credit_service"
                  ? "Serviço fiado"
                  : "Pagamento"}{" "}
                (R$) *
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Products section */}
        {hasProducts && !isEditing && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Produtos</div>
            <div className={styles.formRow}>
              <div className={styles.formGroup} style={{ flex: 3 }}>
                <label className={styles.label}>Buscar produto</label>
                <ProductSearchInput
                  products={products}
                  onProductSelect={handleProductSelect}
                  type={isSaleType ? "sale" : (type as any)}
                  placeholder="Nome ou código do produto..."
                />
              </div>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Qtd</label>
                <input
                  type="number"
                  className={styles.input}
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>
            </div>
            {items.length > 0 && (
              <TransactionItemsList
                items={items}
                products={products}
                transactionType={isSaleType ? "sale" : (type as any)}
                onUpdateQuantity={(idx, qty) =>
                  setItems((prev) =>
                    prev.map((it, i) =>
                      i === idx ? { ...it, quantity: qty } : it
                    )
                  )
                }
                onRemoveItem={(idx) =>
                  setItems((prev) => prev.filter((_, i) => i !== idx))
                }
              />
            )}
          </div>
        )}

        {/* Discount + description */}
        <div className={styles.section}>
          {["sale", "credit_sale", "purchase", "service"].includes(type) && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Desconto (R$)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="0,00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.label}>Descrição (opcional)</label>
            <textarea
              className={styles.textarea}
              placeholder="Anotações sobre a transação..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Summary */}
        {(hasProducts ? items.length > 0 : parsedValue > 0) && (
          <div className={styles.summary}>
            {hasProducts && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Subtotal</span>
                <span className={styles.summaryValue}>
                  {formatCurrency(subtotal)}
                </span>
              </div>
            )}
            {parsedDiscount > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Desconto</span>
                <span className={`${styles.summaryValue} ${styles.discount}`}>
                  − {formatCurrency(parsedDiscount)}
                </span>
              </div>
            )}
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span className={styles.summaryLabel}>Total</span>
              <span className={styles.summaryValueTotal}>
                {formatCurrency(totalValue)}
              </span>
            </div>
          </div>
        )}

        {/* Fiado notice */}
        {type === "credit_sale" && (
          <div className={styles.notice}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Venda registrada como <strong>fiado</strong> — estoque debitado
            agora, recebimento pendente.
          </div>
        )}

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={handleClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={
              loading ||
              (hasProducts && items.length === 0) ||
              (needsValue && !parsedValue)
            }
          >
            {loading
              ? "Processando…"
              : isEditing
              ? "Atualizar Transação"
              : "Criar Transação"}
          </button>
        </div>
      </form>
    </div>
  );
};
