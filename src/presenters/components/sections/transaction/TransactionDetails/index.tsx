// src/components/sections/TransactionDetails.tsx
import React, { useState } from "react";
import { Transaction } from "../../../../../domain/entities/Transaction";
import { formatBRL } from "../../../../../utils/formatCurrency";
import styles from "./transactionDetails.module.css";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { useProduct } from "../../../../contexts/ProductContext";
import { TbMoneybag, TbReportMoney } from "react-icons/tb";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import { MdDelete, MdModeEdit } from "react-icons/md";
import {
  FaHandshake,
  FaMoneyBillTransfer,
  FaPersonDigging,
  FaCheck,
} from "react-icons/fa6";
import { ActiveViewProps } from "../../../../pages/Dashboard";

interface TransactionDetailsProps {
  transaction: Transaction;
  handleActiveView: (activeView: ActiveViewProps, dataEditing?: any) => void;
  onClose: () => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  handleActiveView,
  onClose,
}) => {
  const { deleteTransaction, markAsPaid } = useTransaction();
  const { fetchProducts } = useProduct();
  const [error, setError] = useState<null | string>(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "sale":
        return { label: "Venda", color: "success", icon: <TbMoneybag /> };
      case "credit_sale":
        return { label: "Venda Fiado", color: "credit", icon: <FaHandshake /> };
      case "purchase":
        return { label: "Compra", color: "warning", icon: <IoCartOutline /> };
      case "payment":
        return {
          label: "Pagamento",
          color: "warning",
          icon: <FaMoneyBillTransfer />,
        };
      case "aporte":
        return { label: "Aporte", color: "primary", icon: <TbReportMoney /> };
      case "service":
        return {
          label: "Serviço",
          color: "success",
          icon: <FaPersonDigging />,
        };
      default:
        return {
          label: "Transação",
          color: "secondary",
          icon: <GrTransaction />,
        };
    }
  };

  const typeConfig = getTypeConfig(transaction.type);
  const date = new Date(transaction.date!).toLocaleDateString("pt-BR");
  const time = new Date(transaction.date!).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isCreditSale = transaction.type === "credit_sale";
  const isPending = isCreditSale && !transaction.isPaid;

  const handleDelete = async () => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta transação?\nO estoque será revertido."
      )
    ) {
      try {
        await deleteTransaction(transaction);
        fetchProducts();
        setError(null);
        onClose();
      } catch (error) {
        setError(`${error}`);
      }
    }
  };

  const handleMarkAsPaid = async () => {
    if (
      window.confirm(
        `Confirmar recebimento de ${formatBRL(transaction.value)} de ${
          transaction.customerName
        }?`
      )
    ) {
      setMarkingPaid(true);
      try {
        await markAsPaid(transaction.id!);
        setError(null);
        onClose();
      } catch (err) {
        setError(`${err}`);
      } finally {
        setMarkingPaid(false);
      }
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.detailsContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Detalhes da Transação</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className={styles.content}>
          {/* Cabeçalho com tipo */}
          <div className={`${styles.section} ${styles[typeConfig.color]}`}>
            <div className={styles.typeHeader}>
              <span className={styles.typeIcon}>{typeConfig.icon}</span>
              <span className={styles.typeLabel}>{typeConfig.label}</span>
              {isCreditSale && (
                <span
                  className={`${styles.paymentStatusBadge} ${
                    transaction.isPaid ? styles.paidBadge : styles.pendingBadge
                  }`}
                >
                  {transaction.isPaid ? "✓ Pago" : "⏳ Pendente"}
                </span>
              )}
            </div>
            <div className={styles.dateInfo}>
              <span className={styles.date}>{date}</span>
              <span className={styles.time}>{time}</span>
            </div>
          </div>

          {/* Bloco de cliente para fiado */}
          {isCreditSale && (
            <div className={`${styles.section} ${styles.creditSection}`}>
              <h3 className={styles.sectionTitle}>Venda Fiado</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Cliente:</span>
                  <span className={styles.infoValueHighlight}>
                    {transaction.customerName}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status:</span>
                  <span
                    className={
                      transaction.isPaid
                        ? styles.infoValuePaid
                        : styles.infoValuePending
                    }
                  >
                    {transaction.isPaid ? "Pago" : "Aguardando pagamento"}
                  </span>
                </div>
                {transaction.isPaid && transaction.paidAt && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Pago em:</span>
                    <span className={styles.infoValue}>
                      {new Date(transaction.paidAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Informações financeiras */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Informações</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Valor Total:</span>
                <span className={styles.infoValue}>
                  {formatBRL(transaction.value)}
                </span>
              </div>
              {transaction.discount! > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Desconto:</span>
                  <span className={styles.infoValueDiscount}>
                    -{formatBRL(transaction.discount!)}
                  </span>
                </div>
              )}
              {transaction.description && (
                <div className={styles.infoItemFull}>
                  <span className={styles.infoLabel}>Descrição:</span>
                  <span className={styles.infoValue}>
                    {transaction.description}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itens */}
          {transaction.items && transaction.items.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Itens ({transaction.items.length})
              </h3>
              <div className={styles.itemsList}>
                {transaction.items.map((item, index) => (
                  <div key={index} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemTotal}>
                        {formatBRL(item.quantity * item.unitPrice)}
                      </span>
                    </div>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemQuantity}>
                        {item.quantity} × {formatBRL(item.unitPrice)}
                      </span>
                      <span className={styles.itemUnitPrice}>
                        {formatBRL(item.unitPrice)}/un
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalhes técnicos */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Detalhes Técnicos</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>ID:</span>
                <span className={styles.infoValueSmall}>{transaction.id}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Data de Criação:</span>
                <span className={styles.infoValue}>
                  {new Date(transaction.date!).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Ações */}
        <div className={styles.actions}>
          {isPending && (
            <button
              className={styles.markPaidButton}
              onClick={handleMarkAsPaid}
              disabled={markingPaid}
            >
              <FaCheck />
              {markingPaid ? "Registrando..." : "Marcar como Pago"}
            </button>
          )}
          <button
            className={styles.editButton}
            onClick={() => handleActiveView("new-transaction", transaction)}
          >
            <MdModeEdit /> Editar
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            <MdDelete /> Excluir
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            <IoClose /> Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
