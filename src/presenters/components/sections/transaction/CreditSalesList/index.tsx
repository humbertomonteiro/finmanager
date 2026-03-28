// src/presenters/components/sections/transaction/CreditSalesList/index.tsx
import React, { useState, useMemo } from "react";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { Transaction } from "../../../../../domain/entities/Transaction";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import styles from "./creditSalesList.module.css";

type CreditTab = "pending" | "paid" | "all";

export const CreditSalesList: React.FC = () => {
  const { transactions, updateTransaction } = useTransaction();
  const [activeTab, setActiveTab] = useState<CreditTab>("pending");
  const [loading, setLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const credits = useMemo(
    () =>
      transactions.filter(
        (t) => t.type === "credit_sale" || t.type === "credit_service"
      ),
    [transactions]
  );

  const pending = useMemo(() => credits.filter((t) => !t.isPaid), [credits]);
  const paid = useMemo(() => credits.filter((t) => t.isPaid), [credits]);

  const totalPending = useMemo(
    () => pending.reduce((s, t) => s + t.value, 0),
    [pending]
  );
  const totalPaid = useMemo(
    () => paid.reduce((s, t) => s + t.value, 0),
    [paid]
  );

  const displayed = useMemo(() => {
    let list =
      activeTab === "pending" ? pending : activeTab === "paid" ? paid : credits;
    if (search.trim()) {
      list = list.filter((t) =>
        (t.customerName || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.date as Date).getTime() - new Date(a.date as Date).getTime()
    );
  }, [activeTab, pending, paid, credits, search]);

  const handleMarkPaid = async (t: Transaction) => {
    if (
      !confirm(
        `Confirmar recebimento de ${formatCurrency(t.value)} de ${
          t.customerName
        }?`
      )
    )
      return;
    setLoading(t.id ?? null);
    try {
      t.markAsPaid();
      await updateTransaction(t);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const fmtDate = (d?: Date) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  // Group pending by customer
  const byCustomer = useMemo(() => {
    return pending.reduce<Record<string, { total: number; count: number }>>(
      (acc, t) => {
        const name = t.customerName || "Sem nome";
        if (!acc[name]) acc[name] = { total: 0, count: 0 };
        acc[name].total += t.value;
        acc[name].count += 1;
        return acc;
      },
      {}
    );
  }, [pending]);

  return (
    <div className={styles.container}>
      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.summaryPending}`}>
          <div className={styles.summaryLabel}>Pendentes</div>
          <div className={`${styles.summaryCount} ${styles.countPending}`}>
            {pending.length}
          </div>
          <div className={styles.summaryAmount}>
            {formatCurrency(totalPending)}
          </div>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryPaid}`}>
          <div className={styles.summaryLabel}>Recebidas</div>
          <div className={`${styles.summaryCount} ${styles.countPaid}`}>
            {paid.length}
          </div>
          <div className={styles.summaryAmount}>
            {formatCurrency(totalPaid)}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total geral</div>
          <div className={styles.summaryCount}>{credits.length}</div>
          <div className={styles.summaryAmount}>
            {formatCurrency(totalPending + totalPaid)}
          </div>
        </div>
      </div>

      {/* Top debtors (only when on pending tab) */}
      {activeTab === "pending" && Object.keys(byCustomer).length > 0 && (
        <div className={styles.debtorsSection}>
          <div className={styles.sectionTitle}>Maiores devedores</div>
          <div className={styles.debtorsList}>
            {Object.entries(byCustomer)
              .sort((a, b) => b[1].total - a[1].total)
              .slice(0, 4)
              .map(([name, data]) => (
                <div key={name} className={styles.debtorChip}>
                  <div className={styles.debtorAvatar}>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.debtorName}>{name}</div>
                    <div className={styles.debtorMeta}>
                      {data.count} {data.count === 1 ? "venda" : "vendas"}
                    </div>
                  </div>
                  <div className={styles.debtorAmount}>
                    {formatCurrency(data.total)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tabs + search */}
      <div className={styles.controls}>
        <div className={styles.tabs}>
          {(["pending", "paid", "all"] as CreditTab[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${
                activeTab === tab ? styles.tabActive : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "pending"
                ? `⏳ Pendentes (${pending.length})`
                : tab === "paid"
                ? `✓ Pagas (${paid.length})`
                : `Todas (${credits.length})`}
            </button>
          ))}
        </div>
        <div className={styles.searchBox}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💸</div>
          <div className={styles.emptyTitle}>
            {activeTab === "pending"
              ? "Nenhuma venda pendente"
              : "Nenhuma venda encontrada"}
          </div>
          <div className={styles.emptySub}>
            {activeTab === "pending" ? "Todas as contas estão em dia!" : ""}
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {displayed.map((sale) => (
            <div
              key={sale.id}
              className={`${styles.card} ${
                sale.isPaid ? styles.cardPaid : styles.cardPending
              }`}
            >
              <div className={styles.cardHeader}>
                <div className={styles.customerInfo}>
                  <div className={styles.avatar}>
                    {(sale.customerName || "?").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.customerName}>
                      {sale.customerName || "Sem nome"}
                    </div>
                    <div className={styles.cardDate}>{fmtDate(sale.date)}</div>
                  </div>
                </div>
                <div
                  className={`${styles.amount} ${
                    sale.isPaid ? styles.amountPaid : styles.amountPending
                  }`}
                >
                  {formatCurrency(sale.value)}
                </div>
              </div>

              {sale.items && sale.items.length > 0 && (
                <div className={styles.itemsRow}>
                  {sale.items.map((item, i) => (
                    <span key={i} className={styles.itemChip}>
                      {item.name} ×{item.quantity}
                    </span>
                  ))}
                </div>
              )}

              {sale.description && (
                <p className={styles.description}>{sale.description}</p>
              )}

              <div className={styles.cardFooter}>
                {!sale.isPaid ? (
                  <button
                    className={styles.btnPay}
                    onClick={() => handleMarkPaid(sale)}
                    disabled={loading === sale.id}
                  >
                    {loading === sale.id
                      ? "Processando…"
                      : "✓ Confirmar recebimento"}
                  </button>
                ) : (
                  <span className={styles.paidBadge}>
                    ✓ Pago em {sale.paidAt ? fmtDate(sale.paidAt) : "—"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
