import React, { useState, useMemo } from "react";
import { useCustomer } from "../../../../contexts/CustomerContext";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { Customer } from "../../../../../domain/entities/Customer";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { CreateCustomerForm } from "../CreateCustomerForm";
import styles from "./customersList.module.css";
import { FaUserPlus } from "react-icons/fa6";

export const CustomersList: React.FC = () => {
  const { customers, deleteCustomer } = useCustomer();
  const { transactions } = useTransaction();
  const [search, setSearch] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const credits = useMemo(
    () => transactions.filter((t) => t.type === "credit_sale" || t.type === "credit_service"),
    [transactions]
  );

  // Build stats per customer (by customerId when available, else by customerName)
  const customerStats = useMemo(() => {
    return customers.map((c) => {
      const linked = credits.filter(
        (t) => t.customerId === c.id || (!t.customerId && t.customerName === c.name)
      );
      const pending = linked.filter((t) => !t.isPaid);
      const paid = linked.filter((t) => t.isPaid);
      return {
        customer: c,
        totalPending: pending.reduce((s, t) => s + t.value, 0),
        totalPaid: paid.reduce((s, t) => s + t.value, 0),
        pendingCount: pending.length,
        paidCount: paid.length,
        transactions: linked,
      };
    });
  }, [customers, credits]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customerStats.sort((a, b) => b.totalPending - a.totalPending);
    return customerStats
      .filter(
        (s) =>
          s.customer.name.toLowerCase().includes(q) ||
          (s.customer.phone || "").includes(q)
      )
      .sort((a, b) => b.totalPending - a.totalPending);
  }, [customerStats, search]);

  const totalPendingAll = useMemo(
    () => customerStats.reduce((s, c) => s + c.totalPending, 0),
    [customerStats]
  );
  const totalDebtors = useMemo(
    () => customerStats.filter((c) => c.pendingCount > 0).length,
    [customerStats]
  );

  const handleDelete = async (customer: Customer) => {
    const stats = customerStats.find((s) => s.customer.id === customer.id);
    if (stats && stats.pendingCount > 0) {
      alert(`${customer.name} tem ${stats.pendingCount} pendência(s) em aberto. Quite antes de remover.`);
      return;
    }
    if (!confirm(`Remover cliente "${customer.name}"?`)) return;
    try {
      await deleteCustomer(customer.id!);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const fmtDate = (d?: Date) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  if (showCreateForm || editingCustomer) {
    return (
      <div className={styles.formWrapper}>
        <CreateCustomerForm
          customer={editingCustomer || undefined}
          onClose={() => { setShowCreateForm(false); setEditingCustomer(null); }}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Summary */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Clientes cadastrados</div>
          <div className={styles.summaryCount}>{customers.length}</div>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryDebt}`}>
          <div className={styles.summaryLabel}>Com pendências</div>
          <div className={`${styles.summaryCount} ${styles.countDebt}`}>{totalDebtors}</div>
          <div className={styles.summaryAmount}>{formatCurrency(totalPendingAll)}</div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className={styles.clearSearch}>×</button>
          )}
        </div>
        <button className={styles.btnNew} onClick={() => setShowCreateForm(true)}>
          <FaUserPlus />
          Novo Cliente
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>👤</div>
          <div className={styles.emptyTitle}>
            {search ? `Nenhum resultado para "${search}"` : "Nenhum cliente cadastrado"}
          </div>
          <div className={styles.emptySub}>
            {!search && "Cadastre clientes para vincular nas vendas fiado."}
          </div>
          {!search && (
            <button className={styles.btnNew} onClick={() => setShowCreateForm(true)} style={{ marginTop: 12 }}>
              <FaUserPlus />
              Cadastrar primeiro cliente
            </button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(({ customer, totalPending, totalPaid, pendingCount, paidCount, transactions: txs }) => {
            const isExpanded = expandedId === customer.id;
            return (
              <div key={customer.id} className={`${styles.card} ${pendingCount > 0 ? styles.cardDebt : ""}`}>
                <div
                  className={styles.cardHeader}
                  onClick={() => setExpandedId(isExpanded ? null : customer.id!)}
                  role="button"
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.avatar}>
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={styles.customerInfo}>
                    <div className={styles.customerName}>{customer.name}</div>
                    {customer.phone && <div className={styles.customerPhone}>{customer.phone}</div>}
                  </div>
                  <div className={styles.cardRight}>
                    {pendingCount > 0 ? (
                      <div className={styles.debtInfo}>
                        <div className={styles.debtAmount}>{formatCurrency(totalPending)}</div>
                        <div className={styles.debtCount}>{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</div>
                      </div>
                    ) : (
                      <div className={styles.okBadge}>✓ Quitado</div>
                    )}
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ color: "var(--text-3)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.expanded}>
                    {/* Stats row */}
                    <div className={styles.statsRow}>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Pendente</span>
                        <span className={`${styles.statValue} ${styles.statPending}`}>{formatCurrency(totalPending)}</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Recebido</span>
                        <span className={`${styles.statValue} ${styles.statPaid}`}>{formatCurrency(totalPaid)}</span>
                      </div>
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Total fiados</span>
                        <span className={styles.statValue}>{pendingCount + paidCount}</span>
                      </div>
                    </div>

                    {/* Transactions */}
                    {txs.length > 0 ? (
                      <div className={styles.txList}>
                        {[...txs]
                          .sort((a, b) => new Date(b.date as Date).getTime() - new Date(a.date as Date).getTime())
                          .map((t) => (
                            <div key={t.id} className={`${styles.txItem} ${t.isPaid ? styles.txPaid : styles.txPending}`}>
                              <div className={styles.txLeft}>
                                <span className={`${styles.txStatus} ${t.isPaid ? styles.txStatusPaid : styles.txStatusPending}`}>
                                  {t.isPaid ? "✓" : "⏳"}
                                </span>
                                <div>
                                  <div className={styles.txDesc}>
                                    {t.items && t.items.length > 0
                                      ? t.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")
                                      : t.description || "Serviço fiado"}
                                  </div>
                                  <div className={styles.txDate}>{fmtDate(t.date)}</div>
                                </div>
                              </div>
                              <div className={`${styles.txAmount} ${t.isPaid ? styles.txAmountPaid : styles.txAmountPending}`}>
                                {formatCurrency(t.value)}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className={styles.noTx}>Nenhuma transação registrada</div>
                    )}

                    {/* Notes */}
                    {customer.notes && (
                      <div className={styles.notes}>
                        <span className={styles.notesLabel}>Obs:</span> {customer.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className={styles.cardActions}>
                      <button
                        className={styles.btnEdit}
                        onClick={() => setEditingCustomer(customer)}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(customer)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
