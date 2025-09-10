// src/components/sections/Metrics.tsx
import styles from "./metrics.module.css";
import { formatBRL } from "../../../../utils/formatCurrency";
import { useMemo } from "react";
import { Transaction } from "../../../../domain/entities/Transaction";
import { FaBalanceScale } from "react-icons/fa";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";

interface MetricsProps {
  filteredTransactions: Transaction[];
}

export default function Metrics({ filteredTransactions }: MetricsProps) {
  const metrics = useMemo(() => {
    const totals = filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "sale") {
          acc.sales += transaction.value;
        } else if (transaction.type === "purchase") {
          acc.purchases += transaction.value;
        } else if (transaction.type === "aporte") {
          acc.aportes += transaction.value;
        } else if (transaction.type === "payment") {
          acc.payments += transaction.value;
        } else if (transaction.type === "service") {
          acc.services += transaction.value;
        }
        return acc;
      },
      { sales: 0, purchases: 0, aportes: 0, payments: 0, services: 0 }
    );

    const revenues = totals.sales + totals.aportes + totals.services;
    const expenses = totals.purchases + totals.payments;
    const balance = revenues - expenses;
    const operationalResult = balance - totals.aportes;

    // Calcular margem de lucro (evitando divisão por zero)
    const profitMargin =
      revenues > 0
        ? (operationalResult / (totals.sales + totals.services)) * 100
        : 0;

    return {
      totals,
      revenues,
      expenses,
      balance,
      operationalResult,
      profitMargin,
    };
  }, [filteredTransactions]);

  return (
    <section aria-label="Métricas financeiras" className={styles.metrics}>
      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>
          <GiReceiveMoney /> Receitas
        </h3>
        <p className={styles.metricValue}>{formatBRL(metrics.revenues)}</p>
        <div className={styles.breakdown}>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Vendas:</span>
            <span className={styles.breakdownValue}>
              {formatBRL(metrics.totals.sales)}
            </span>
          </div>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Aportes:</span>
            <span className={styles.breakdownValue}>
              {formatBRL(metrics.totals.aportes)}
            </span>
          </div>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Serviços:</span>
            <span className={styles.breakdownValue}>
              {formatBRL(metrics.totals.services)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>
          <GiPayMoney /> Despesas
        </h3>
        <p className={`${styles.metricValue} ${styles.expense}`}>
          {formatBRL(metrics.expenses)}
        </p>
        <div className={styles.breakdown}>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Compras:</span>
            <span className={styles.breakdownValue}>
              {formatBRL(metrics.totals.purchases)}
            </span>
          </div>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Pagamentos:</span>
            <span className={styles.breakdownValue}>
              {formatBRL(metrics.totals.payments)}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>
          <FaBalanceScale /> Balanço
        </h3>
        <p
          className={`${styles.metricValue} ${
            metrics.balance >= 0 ? styles.positive : styles.negative
          }`}
        >
          {formatBRL(metrics.balance)}
        </p>
        <div className={styles.breakdown}>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>
              Resultado Operacional:
            </span>
            <span
              className={`${styles.breakdownValue} ${
                metrics.operationalResult >= 0
                  ? styles.positive
                  : styles.negative
              }`}
            >
              {formatBRL(metrics.operationalResult)}
            </span>
          </div>
          <div className={styles.breakdownItem}>
            <span className={styles.breakdownLabel}>Margem de Lucro:</span>
            <span
              className={`${styles.breakdownValue} ${
                metrics.profitMargin >= 0 ? styles.positive : styles.negative
              }`}
            >
              {metrics.profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
