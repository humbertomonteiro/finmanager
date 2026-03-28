// src/presenters/components/sections/transaction/TransactionCard/index.tsx
import React, { useState } from "react";
import { Transaction } from "../../../../../domain/entities/Transaction";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { TransactionDetails } from "../TransactionDetails";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import styles from "./transactionCard.module.css";

import { TbMoneybag, TbReportMoney } from "react-icons/tb";
import { IoCartOutline } from "react-icons/io5";
import { FaHandshake, FaMoneyBillTransfer } from "react-icons/fa6";
import { FaPersonDigging } from "react-icons/fa6";
import { GrTransaction } from "react-icons/gr";

interface TransactionCardProps {
  transaction: Transaction;
  handleActiveView: (view: ActiveViewProps, data?: any) => void;
}

function getTypeConfig(type: string) {
  switch (type) {
    case "sale":
      return { label: "Venda", variant: "sale", icon: <TbMoneybag />, sign: 1 };
    case "credit_sale":
      return {
        label: "Fiado",
        variant: "credit",
        icon: <FaHandshake />,
        sign: 0,
      };
    case "purchase":
      return {
        label: "Compra",
        variant: "purchase",
        icon: <IoCartOutline />,
        sign: -1,
      };
    case "payment":
      return {
        label: "Pagamento",
        variant: "payment",
        icon: <FaMoneyBillTransfer />,
        sign: -1,
      };
    case "aporte":
      return {
        label: "Aporte",
        variant: "aporte",
        icon: <TbReportMoney />,
        sign: 1,
      };
    case "service":
      return {
        label: "Serviço",
        variant: "service",
        icon: <FaPersonDigging />,
        sign: 1,
      };
    case "credit_service":
      return {
        label: "Serviço fiado",
        variant: "credit_service",
        icon: <FaPersonDigging />,
        sign: 1,
      };
    default:
      return {
        label: "Transação",
        variant: "default",
        icon: <GrTransaction />,
        sign: 1,
      };
  }
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  handleActiveView,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const cfg = getTypeConfig(transaction.type);
  const isPending =
    (transaction.type === "credit_sale" && !transaction.isPaid) ||
    (transaction.type === "credit_service" && !transaction.isPaid);

  const date = new Date(transaction.date as Date);
  const dateStr = date.toLocaleDateString("pt-BR");
  const timeStr = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Build description line
  const desc = transaction.customerName
    ? transaction.customerName
    : transaction.description ||
      (transaction.items?.length
        ? transaction.items.map((i) => i.name).join(", ")
        : cfg.label);

  const amountClass =
    cfg.sign > 0
      ? isPending
        ? styles.amountPending
        : styles.amountPositive
      : styles.amountNegative;

  const tagLabel =
    transaction.type === "credit_sale"
      ? transaction.isPaid
        ? "Pago"
        : "Pendente"
      : cfg.label;

  return (
    <>
      <div
        className={`${styles.card} ${isPending ? styles.cardPending : ""}`}
        onClick={() => setShowDetails(true)}
      >
        {/* Type badge */}
        <div className={`${styles.badge} ${styles[cfg.variant]}`}>
          {cfg.icon}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.name} title={desc}>
            {transaction.customerName && (
              <span className={styles.customerIcon}>👤 </span>
            )}
            {desc}
          </div>
          <div className={styles.meta}>
            {dateStr} · {timeStr}
            {transaction.items?.length
              ? ` · ${transaction.items.length} ${
                  transaction.items.length === 1 ? "item" : "itens"
                }`
              : ""}
          </div>
        </div>

        {/* Right side */}
        <div className={styles.right}>
          <span
            className={`${styles.tag} ${styles["tag_" + cfg.variant]} ${
              isPending ? styles.tagPending : ""
            }`}
          >
            {tagLabel}
          </span>
          <div>
            <div className={`${styles.amount} ${amountClass}`}>
              {cfg.sign < 0 && "− "}
              {formatCurrency(transaction.value)}
            </div>
            {transaction.discount && transaction.discount > 0 ? (
              <div className={styles.discount}>
                -{formatCurrency(transaction.discount)} desc.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showDetails && (
        <TransactionDetails
          transaction={transaction}
          handleActiveView={handleActiveView}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default TransactionCard;
