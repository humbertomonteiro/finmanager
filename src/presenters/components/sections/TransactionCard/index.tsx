// src/components/sections/TransactionCard.tsx
import React, { useState } from "react";
import { Transaction } from "../../../../domain/entities/Transaction";
import styles from "./transactionCard.module.css";
import { formatBRL } from "../../../../utils/formatCurrency";
import { TransactionDetails } from "../TransactionDetails";
import { TbMoneybag, TbReportMoney } from "react-icons/tb";
import { IoCartOutline } from "react-icons/io5";
import { GrTransaction } from "react-icons/gr";
import { ActiveViewProps } from "../../../pages/Dashboard";

interface TransactionCardProps {
  transaction: Transaction;
  handleFormCreate: (activeView: ActiveViewProps, dataEditing?: any) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  handleFormCreate,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "sale":
        return { label: "Venda", color: "success", icon: <TbMoneybag /> };
      case "purchase":
        return { label: "Compra", color: "warning", icon: <IoCartOutline /> };
      case "aporte":
        return { label: "Aporte", color: "primary", icon: <TbReportMoney /> };
      default:
        return {
          label: "Transação",
          color: "secondary",
          icon: <GrTransaction />,
        };
    }
  };

  const typeConfig = getTypeConfig(transaction.type);
  const date = new Date(transaction.date).toLocaleDateString("pt-BR");
  const time = new Date(transaction.date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  return (
    <>
      <div className={`${styles.card} ${styles[typeConfig.color]}`}>
        <div className={styles.cardHeader}>
          <div className={styles.typeBadge}>
            <span className={styles.typeIcon}>{typeConfig.icon}</span>
            <span className={styles.typeLabel}>{typeConfig.label}</span>
          </div>

          <div className={styles.transactionInfo}>
            <span className={styles.date}>{date}</span>
            <span className={styles.time}>{time}</span>
          </div>
        </div>

        <div className={styles.cardContent}>
          {transaction.description && (
            <p className={styles.description}>{transaction.description}</p>
          )}

          <div className={styles.details}>
            {transaction.items && transaction.items.length > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Itens:</span>
                <span className={styles.itemsCount}>
                  {transaction.items.length}
                </span>
              </div>
            )}

            {transaction.discount! > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Desconto:</span>
                <span className={styles.discount}>
                  -{formatBRL(transaction.discount!)}
                </span>
              </div>
            )}

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Valor:</span>
              <span className={styles.amount}>
                {formatBRL(transaction.value)}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <button className={styles.detailsButton} onClick={handleViewDetails}>
            Ver Detalhes
          </button>
        </div>
      </div>

      {showDetails && (
        <TransactionDetails
          transaction={transaction}
          handleFormCreate={handleFormCreate}
          // onDelete={onDelete}
          onClose={handleCloseDetails}
        />
      )}
    </>
  );
};

export default TransactionCard;
