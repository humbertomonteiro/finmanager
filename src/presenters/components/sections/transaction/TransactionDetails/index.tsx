// src/presenters/components/sections/transaction/TransactionDetails/index.tsx
import React, { useState } from "react";
import { Transaction } from "../../../../../domain/entities/Transaction";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import styles from "./transactionDetails.module.css";
import { IoClose } from "react-icons/io5";
import { MdEdit, MdDelete } from "react-icons/md";

interface TransactionDetailsProps {
  transaction: Transaction;
  handleActiveView: (view: ActiveViewProps, data?: any) => void;
  onClose: () => void;
}

function getTypeConfig(type: string) {
  const map: Record<string, { label: string; variant: string }> = {
    sale:        { label: "Venda",      variant: "sale" },
    credit_sale: { label: "Fiado",      variant: "credit" },
    purchase:    { label: "Compra",     variant: "purchase" },
    payment:     { label: "Pagamento",  variant: "payment" },
    aporte:      { label: "Aporte",     variant: "aporte" },
    service:     { label: "Serviço",    variant: "service" },
  };
  return map[type] ?? { label: type, variant: "default" };
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  handleActiveView,
  onClose,
}) => {
  const { deleteTransaction, updateTransaction } = useTransaction();
  const [loading, setLoading] = useState(false);
  const cfg = getTypeConfig(transaction.type);

  const fmtDate = (d?: Date) =>
    d ? new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) : "—";

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.")) return;
    setLoading(true);
    try {
      await deleteTransaction(transaction);
      onClose();
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!confirm(`Confirmar recebimento de ${transaction.customerName}?`)) return;
    setLoading(true);
    try {
      transaction.markAsPaid();
      await updateTransaction(transaction);
      onClose();
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isPending = transaction.type === "credit_sale" && !transaction.isPaid;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={`${styles.typeBadge} ${styles[cfg.variant]}`}>
              {cfg.label}
            </div>
            {transaction.type === "credit_sale" && (
              <span className={`${styles.statusBadge} ${isPending ? styles.statusPending : styles.statusPaid}`}>
                {isPending ? "⏳ Pendente" : "✓ Pago"}
              </span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
            <IoClose />
          </button>
        </div>

        {/* Amount hero */}
        <div className={styles.amountHero}>
          <div className={`${styles.amountValue} ${isPending ? styles.amountPending : ""}`}>
            {formatCurrency(transaction.value)}
          </div>
          {transaction.discount && transaction.discount > 0 && (
            <div className={styles.amountDiscount}>
              Desconto de {formatCurrency(transaction.discount)} aplicado
            </div>
          )}
        </div>

        {/* Details */}
        <div className={styles.body}>
          {transaction.customerName && (
            <div className={styles.customerRow}>
              <div className={styles.customerAvatar}>
                {transaction.customerName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className={styles.customerName}>{transaction.customerName}</div>
                <div className={styles.customerLabel}>Cliente — venda fiado</div>
              </div>
            </div>
          )}

          <div className={styles.rows}>
            <div className={styles.row}>
              <span className={styles.rowKey}>Data</span>
              <span className={styles.rowVal}>{fmtDate(transaction.date)}</span>
            </div>
            {transaction.description && (
              <div className={styles.row}>
                <span className={styles.rowKey}>Descrição</span>
                <span className={styles.rowVal}>{transaction.description}</span>
              </div>
            )}
            {transaction.isPaid && transaction.paidAt && (
              <div className={styles.row}>
                <span className={styles.rowKey}>Pago em</span>
                <span className={styles.rowVal}>{fmtDate(transaction.paidAt)}</span>
              </div>
            )}
          </div>

          {/* Items */}
          {transaction.items && transaction.items.length > 0 && (
            <div className={styles.itemsSection}>
              <div className={styles.itemsTitle}>
                {transaction.items.length} {transaction.items.length === 1 ? "item" : "itens"}
              </div>
              <div className={styles.itemsList}>
                {transaction.items.map((item, i) => (
                  <div key={i} className={styles.itemRow}>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQty}>× {item.quantity}</span>
                    </div>
                    <span className={styles.itemTotal}>
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className={styles.footer}>
          {isPending && (
            <button
              className={styles.btnPay}
              onClick={handleMarkPaid}
              disabled={loading}
            >
              ✓ Confirmar recebimento
            </button>
          )}
          <button
            className={styles.btnEdit}
            onClick={() => { onClose(); handleActiveView("new-transaction", transaction); }}
          >
            <MdEdit /> Editar
          </button>
          <button
            className={styles.btnDelete}
            onClick={handleDelete}
            disabled={loading}
          >
            <MdDelete /> {loading ? "…" : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
};
