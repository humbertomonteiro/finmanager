// src/components/sections/TransactionDetails.tsx
import React, { useState } from "react";
import { Transaction } from "../../../../domain/entities/Transaction";
import { formatBRL } from "../../../../utils/formatCurrency";
import styles from "./transactionDetails.module.css";
import { useTransaction } from "../../../contexts/TransactionContext";

interface TransactionDetailsProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onClose: () => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  onEdit,
  // onDelete,
  onClose,
}) => {
  const { deleteTransaction } = useTransaction();
  const [error, setError] = useState<null | string>(null);
  const getTypeConfig = (type: string) => {
    switch (type) {
      case "sale":
        return { label: "Venda", color: "success", icon: "💰" };
      case "purchase":
        return { label: "Compra", color: "warning", icon: "🛒" };
      case "aporte":
        return { label: "Aporte", color: "primary", icon: "💎" };
      default:
        return { label: "Transação", color: "secondary", icon: "📊" };
    }
  };

  const typeConfig = getTypeConfig(transaction.type);
  const date = new Date(transaction.date).toLocaleDateString("pt-BR");
  const time = new Date(transaction.date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await deleteTransaction(transaction);
        setError(null);
      } catch (error) {
        setError(`${error}`);
        console.log(error);
      }
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.detailsContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Detalhes da Transação</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Cabeçalho */}
          <div className={`${styles.section} ${styles[typeConfig.color]}`}>
            <div className={styles.typeHeader}>
              <span className={styles.typeIcon}>{typeConfig.icon}</span>
              <span className={styles.typeLabel}>{typeConfig.label}</span>
            </div>
            <div className={styles.dateInfo}>
              <span className={styles.date}>{date}</span>
              <span className={styles.time}>{time}</span>
            </div>
          </div>

          {/* Informações básicas */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Informações</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Valor Total:</span>
                <span className={styles.infoValue}>
                  {formatBRL(transaction.value)}
                </span>
              </div>
              {transaction.discount && transaction.discount > 0 && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Desconto:</span>
                  <span className={styles.infoValueDiscount}>
                    -{formatBRL(transaction.discount)}
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

          {/* Itens da transação */}
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

          {/* Informações adicionais */}
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
                  {new Date(transaction.date).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Ações */}
        <div className={styles.actions}>
          <button
            className={styles.editButton}
            onClick={() => onEdit(transaction)}
          >
            ✏️ Editar
          </button>
          <button className={styles.deleteButton} onClick={handleDelete}>
            🗑️ Excluir
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
