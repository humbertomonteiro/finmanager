// src/presenters/components/sections/transaction/Metrics/index.tsx
import { useMemo, useState } from "react";
import { Transaction } from "../../../../../domain/entities/Transaction";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import styles from "./metrics.module.css";

interface MetricsProps {
  filteredTransactions: Transaction[];
  transactions: Transaction[];
  onCreditClick?: () => void;
}

export default function Metrics({
  filteredTransactions,
  transactions,
  onCreditClick,
}: MetricsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const totals = filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === "sale") acc.sales += t.value;
        else if (t.type === "credit_sale") {
          if (t.isPaid) acc.creditPaid += t.value;
          else acc.creditPending += t.value;
        } else if (t.type === "purchase") acc.purchases += t.value;
        else if (t.type === "aporte") acc.aportes += t.value;
        else if (t.type === "payment") acc.payments += t.value;
        else if (t.type === "service") acc.services += t.value;
        return acc;
      },
      {
        sales: 0,
        purchases: 0,
        aportes: 0,
        payments: 0,
        services: 0,
        creditPaid: 0,
        creditPending: 0,
      }
    );

    const revenue =
      totals.sales + totals.aportes + totals.services + totals.creditPaid;
    const expenses = totals.purchases + totals.payments;
    const balance = revenue - expenses;
    const creditPendingTotal = transactions
      .filter((t) => t.type === "credit_sale" && !t.isPaid)
      .reduce((s, t) => s + t.value, 0);

    return { totals, revenue, expenses, balance, creditPendingTotal };
  }, [filteredTransactions, transactions]);

  const cards = [
    {
      id: "revenue",
      label: "Receitas",
      value: metrics.revenue,
      variant: "green",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      ),
      details: [
        { label: "Vendas", value: metrics.totals.sales },
        { label: "Serviços", value: metrics.totals.services },
        { label: "Aportes", value: metrics.totals.aportes },
        { label: "Fiado recebido", value: metrics.totals.creditPaid },
      ],
    },
    {
      id: "expenses",
      label: "Despesas",
      value: metrics.expenses,
      variant: "red",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      ),
      details: [
        { label: "Compras", value: metrics.totals.purchases },
        { label: "Pagamentos", value: metrics.totals.payments },
      ],
    },
    {
      id: "balance",
      label: "Saldo",
      value: metrics.balance,
      variant: metrics.balance >= 0 ? "green" : "red",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      ),
      details: [
        { label: "Receitas", value: metrics.revenue },
        { label: "Despesas", value: -metrics.expenses },
      ],
    },
    {
      id: "credit",
      label: "Fiado pendente",
      value: metrics.creditPendingTotal,
      variant: "amber",
      clickable: true,
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
        </svg>
      ),
      details: [],
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div
          key={card.id}
          className={`${styles.card} ${styles[card.variant]} ${
            card.clickable ? styles.clickable : ""
          }`}
          onClick={() => {
            if (card.clickable && onCreditClick) {
              onCreditClick();
              return;
            }
            setExpanded(expanded === card.id ? null : card.id);
          }}
        >
          <div className={styles.cardTop}>
            <div className={styles.label}>{card.label}</div>
            <div className={styles.iconBg}>{card.icon}</div>
          </div>
          <div className={`${styles.value} ${styles[card.variant]}`}>
            {formatCurrency(card.value)}
          </div>
          {card.details.length > 0 && (
            <div
              className={`${styles.details} ${
                expanded === card.id ? styles.open : ""
              }`}
            >
              {card.details.map((d) => (
                <div key={d.label} className={styles.detailRow}>
                  <span className={styles.detailLabel}>{d.label}</span>
                  <span
                    className={`${styles.detailValue} ${
                      d.value < 0 ? styles.red : ""
                    }`}
                  >
                    {formatCurrency(Math.abs(d.value))}
                  </span>
                </div>
              ))}
            </div>
          )}
          {card.clickable && (
            <div className={styles.clickHint}>Ver detalhes →</div>
          )}
        </div>
      ))}
    </div>
  );
}
