// src/components/sections/Metrics.tsx
import styles from "./metrics.module.css";
import { formatBRL } from "../../../../../utils/formatCurrency";
import { useMemo, useState } from "react";
import { Transaction } from "../../../../../domain/entities/Transaction";
import { FaBalanceScale, FaHandshake } from "react-icons/fa";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { TbPigMoney } from "react-icons/tb";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";

interface MetricsProps {
  filteredTransactions: Transaction[];
  transactions: Transaction[];
}

export default function Metrics({
  filteredTransactions,
  transactions,
}: MetricsProps) {
  const [showDetailsExpense, setShowDetailsExpense] = useState(false);
  const [showDetailsRevenue, setShowDetailsRevenue] = useState(false);
  const [showDetailsBalance, setShowDetailsBalance] = useState(false);
  const [showDetailsCredit, setShowDetailsCredit] = useState(false);

  const metrics = useMemo(() => {
    const totals = filteredTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "sale") {
          acc.sales += transaction.value;
        } else if (transaction.type === "credit_sale") {
          // Fiado: só soma nas receitas se já foi pago
          if (transaction.isPaid) {
            acc.creditPaid += transaction.value;
          } else {
            acc.creditPending += transaction.value;
          }
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

    const revenues =
      totals.sales + totals.aportes + totals.services + totals.creditPaid;
    const expenses = totals.purchases + totals.payments;
    const balance = revenues - expenses;
    const operationalResult = balance - totals.aportes;

    const profitMargin =
      revenues > 0
        ? (operationalResult /
            (totals.sales + totals.services + totals.creditPaid)) *
          100
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

  // Totais gerais sem filtro de data
  const totalInCash = useMemo(() => {
    const totalsNoFiltersDate = transactions.reduce(
      (acc, transaction) => {
        if (
          transaction.type === "sale" ||
          transaction.type === "aporte" ||
          transaction.type === "service"
        ) {
          acc.revenues += transaction.value;
        } else if (transaction.type === "credit_sale") {
          if (transaction.isPaid) {
            acc.revenues += transaction.value;
          } else {
            acc.creditPending += transaction.value;
          }
        } else if (
          transaction.type === "purchase" ||
          transaction.type === "payment"
        ) {
          acc.expenses += transaction.value;
        }

        return acc;
      },
      { revenues: 0, expenses: 0, creditPending: 0 }
    );

    const balance = totalsNoFiltersDate.revenues - totalsNoFiltersDate.expenses;

    return {
      revenues: totalsNoFiltersDate.revenues,
      expenses: totalsNoFiltersDate.expenses,
      balance,
      creditPending: totalsNoFiltersDate.creditPending,
    };
  }, [transactions]);

  // Fiados pendentes para o período filtrado (com detalhes por cliente)
  const creditDetails = useMemo(() => {
    const pending = filteredTransactions.filter(
      (t) => t.type === "credit_sale" && !t.isPaid
    );

    // Agrupar por cliente
    const byCustomer = pending.reduce<Record<string, number>>((acc, t) => {
      const name = t.customerName || "Sem nome";
      acc[name] = (acc[name] || 0) + t.value;
      return acc;
    }, {});

    return {
      total: metrics.totals.creditPending,
      count: pending.length,
      byCustomer,
    };
  }, [filteredTransactions, metrics.totals.creditPending]);

  function showDetails(details: string) {
    switch (details) {
      case "revenue":
        setShowDetailsRevenue(!showDetailsRevenue);
        break;
      case "expense":
        setShowDetailsExpense(!showDetailsExpense);
        break;
      case "balance":
        setShowDetailsBalance(!showDetailsBalance);
        break;
      case "credit":
        setShowDetailsCredit(!showDetailsCredit);
        break;
    }
  }

  return (
    <section aria-label="Métricas financeiras" className={styles.metrics}>
      {/* Valor em caixa */}
      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>
          <TbPigMoney /> Valor em caixa
        </h3>
        <p className={styles.metricValue}>{formatBRL(totalInCash.balance)}</p>
      </div>

      {/* Total receitas */}
      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>
          <TbPigMoney /> Todas as receitas
        </h3>
        <p className={styles.metricValue}>{formatBRL(totalInCash.revenues)}</p>
      </div>

      {/* Total despesas */}
      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>
          <TbPigMoney /> Todas as despesas
        </h3>
        <p className={styles.metricValue}>{formatBRL(totalInCash.expenses)}</p>
      </div>

      {/* A receber (fiados pendentes) — card de destaque */}
      <div
        className={`${styles.metricCard} ${styles.creditCard} ${
          totalInCash.creditPending > 0 ? styles.creditCardActive : ""
        }`}
      >
        <h3 className={`${styles.metricTitle} ${styles.creditTitle}`}>
          <FaHandshake /> A receber (fiado)
        </h3>
        <p className={`${styles.metricValue} ${styles.creditValue}`}>
          {formatBRL(totalInCash.creditPending)}
        </p>
        {totalInCash.creditPending > 0 && (
          <p className={styles.creditSubtitle}>valor pendente no total</p>
        )}
      </div>

      {/* Receitas do período */}
      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>
          <GiReceiveMoney /> Receitas
        </h3>
        <p className={styles.metricValue}>{formatBRL(metrics.revenues)}</p>
        <div
          className={styles.showBreakdown}
          onClick={() => showDetails("revenue")}
        >
          Detalhes {showDetailsRevenue ? <BsArrowUp /> : <BsArrowDown />}
        </div>
        {showDetailsRevenue && (
          <div className={styles.breakdown}>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>Vendas:</span>
              <span className={styles.breakdownValue}>
                {formatBRL(metrics.totals.sales)}
              </span>
            </div>
            <div className={styles.breakdownItem}>
              <span className={styles.breakdownLabel}>Fiado recebido:</span>
              <span className={styles.breakdownValue}>
                {formatBRL(metrics.totals.creditPaid)}
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
        )}
      </div>

      {/* Despesas do período */}
      <div className={styles.metricCard}>
        <h3 className={styles.metricTitle}>
          <GiPayMoney /> Despesas
        </h3>
        <p className={`${styles.metricValue} ${styles.expense}`}>
          {formatBRL(metrics.expenses)}
        </p>
        <div
          className={styles.showBreakdown}
          onClick={() => showDetails("expense")}
        >
          Detalhes {showDetailsExpense ? <BsArrowUp /> : <BsArrowDown />}
        </div>
        {showDetailsExpense && (
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
        )}
      </div>

      {/* Balanço */}
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
        <div
          className={styles.showBreakdown}
          onClick={() => showDetails("balance")}
        >
          Detalhes {showDetailsBalance ? <BsArrowUp /> : <BsArrowDown />}
        </div>
        {showDetailsBalance && (
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
            {metrics.totals.creditPending > 0 && (
              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Fiado pendente:</span>
                <span
                  className={`${styles.breakdownValue} ${styles.creditPendingValue}`}
                >
                  +{formatBRL(metrics.totals.creditPending)} (não contabilizado)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fiado do período (detalhado por cliente) */}
      {creditDetails.total > 0 && (
        <div className={`${styles.metricCard} ${styles.creditCardPeriod}`}>
          <h3 className={`${styles.metricTitle} ${styles.creditTitle}`}>
            <FaHandshake /> Fiado pendente no período
          </h3>
          <p className={`${styles.metricValue} ${styles.creditValue}`}>
            {formatBRL(creditDetails.total)}
          </p>
          <p className={styles.creditSubtitle}>
            {creditDetails.count} venda(s) em aberto
          </p>
          <div
            className={styles.showBreakdown}
            onClick={() => showDetails("credit")}
          >
            Por cliente {showDetailsCredit ? <BsArrowUp /> : <BsArrowDown />}
          </div>
          {showDetailsCredit && (
            <div className={styles.breakdown}>
              {Object.entries(creditDetails.byCustomer).map(([name, value]) => (
                <div key={name} className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>{name}:</span>
                  <span
                    className={`${styles.breakdownValue} ${styles.creditPendingValue}`}
                  >
                    {formatBRL(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
