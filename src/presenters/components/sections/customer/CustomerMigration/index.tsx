import React, { useState, useMemo } from "react";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { useCustomer } from "../../../../contexts/CustomerContext";
import { Customer } from "../../../../../domain/entities/Customer";
import { Transaction } from "../../../../../domain/entities/Transaction";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import styles from "./customerMigration.module.css";

interface GroupAction {
  status: "idle" | "loading" | "done" | "error";
  message?: string;
}

export const CustomerMigration: React.FC = () => {
  const { transactions, updateTransaction } = useTransaction();
  const { customers, createCustomer, fetchCustomers } = useCustomer();
  const [actions, setActions] = useState<Record<string, GroupAction>>({});
  const [linkTarget, setLinkTarget] = useState<Record<string, string>>({});

  // Fiados sem customerId vinculado
  const orphanCredits = useMemo(
    () =>
      transactions.filter(
        (t) =>
          (t.type === "credit_sale" || t.type === "credit_service") &&
          !t.customerId
      ),
    [transactions]
  );

  // Agrupa por customerName (case-insensitive normalizado)
  const groups = useMemo(() => {
    const map = new Map<string, { displayName: string; txs: Transaction[] }>();
    for (const t of orphanCredits) {
      const key = (t.customerName || "Sem nome").trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, { displayName: (t.customerName || "Sem nome").trim(), txs: [] });
      }
      map.get(key)!.txs.push(t);
    }
    return Array.from(map.entries())
      .map(([key, val]) => ({ key, ...val }))
      .sort((a, b) =>
        b.txs.reduce((s, t) => s + t.value, 0) - a.txs.reduce((s, t) => s + t.value, 0)
      );
  }, [orphanCredits]);

  const setAction = (key: string, action: GroupAction) => {
    setActions((prev) => ({ ...prev, [key]: action }));
  };

  const assignTransactions = async (txs: Transaction[], customerId: string, customerName: string) => {
    for (const t of txs) {
      const updated = new Transaction({
        ...t.toDTO(),
        customerId,
        customerName,
      });
      await updateTransaction(updated);
    }
  };

  const handleCreateAndAssign = async (group: { key: string; displayName: string; txs: Transaction[] }) => {
    setAction(group.key, { status: "loading" });
    try {
      const newCustomer = new Customer({ name: group.displayName });
      const id = await createCustomer(newCustomer);
      await assignTransactions(group.txs, id, group.displayName);
      await fetchCustomers();
      setAction(group.key, { status: "done", message: `Cliente criado e ${group.txs.length} transação(ões) vinculada(s).` });
    } catch (err: any) {
      setAction(group.key, { status: "error", message: err.message });
    }
  };

  const handleLinkExisting = async (group: { key: string; displayName: string; txs: Transaction[] }) => {
    const targetId = linkTarget[group.key];
    if (!targetId) return;
    const customer = customers.find((c) => c.id === targetId);
    if (!customer) return;
    setAction(group.key, { status: "loading" });
    try {
      await assignTransactions(group.txs, customer.id!, customer.name);
      setAction(group.key, { status: "done", message: `${group.txs.length} transação(ões) vinculada(s) a "${customer.name}".` });
    } catch (err: any) {
      setAction(group.key, { status: "error", message: err.message });
    }
  };

  const totalOrphans = orphanCredits.length;
  const doneCount = Object.values(actions).filter((a) => a.status === "done").length;

  if (totalOrphans === 0) {
    return (
      <div className={styles.allDone}>
        <div className={styles.allDoneIcon}>✅</div>
        <div className={styles.allDoneTitle}>Tudo migrado!</div>
        <div className={styles.allDoneSub}>
          Todas as transações fiado já estão vinculadas a um cliente.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>Migração de Clientes Fiado</div>
        <div className={styles.headerSub}>
          {totalOrphans} transação(ões) sem cliente vinculado, agrupadas por nome.
          Crie um cliente ou vincule a um existente para cada grupo.
        </div>
        {doneCount > 0 && (
          <div className={styles.progressBadge}>
            {doneCount}/{groups.length} grupos migrados
          </div>
        )}
      </div>

      <div className={styles.groupList}>
        {groups.map((group) => {
          const action = actions[group.key];
          const isDone = action?.status === "done";
          const isLoading = action?.status === "loading";
          const totalValue = group.txs.reduce((s, t) => s + t.value, 0);
          const pendingCount = group.txs.filter((t) => !t.isPaid).length;

          return (
            <div key={group.key} className={`${styles.group} ${isDone ? styles.groupDone : ""}`}>
              <div className={styles.groupHeader}>
                <div className={styles.groupAvatar}>
                  {group.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.groupInfo}>
                  <div className={styles.groupName}>{group.displayName}</div>
                  <div className={styles.groupMeta}>
                    {group.txs.length} fiado{group.txs.length > 1 ? "s" : ""}
                    {" · "}
                    {pendingCount > 0 ? (
                      <span className={styles.metaPending}>{pendingCount} pendente{pendingCount > 1 ? "s" : ""}</span>
                    ) : (
                      <span className={styles.metaPaid}>todos pagos</span>
                    )}
                    {" · "}
                    <span className={styles.metaTotal}>{formatCurrency(totalValue)}</span>
                  </div>
                </div>
              </div>

              {isDone ? (
                <div className={styles.doneMsg}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {action?.message}
                </div>
              ) : (
                <div className={styles.groupActions}>
                  {/* Create new customer */}
                  <button
                    className={styles.btnCreate}
                    onClick={() => handleCreateAndAssign(group)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando…" : `✦ Criar cliente "${group.displayName}"`}
                  </button>

                  {/* Link to existing */}
                  {customers.length > 0 && (
                    <div className={styles.linkRow}>
                      <select
                        className={styles.select}
                        value={linkTarget[group.key] || ""}
                        onChange={(e) =>
                          setLinkTarget((prev) => ({ ...prev, [group.key]: e.target.value }))
                        }
                        disabled={isLoading}
                      >
                        <option value="">Vincular a cliente existente...</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className={styles.btnLink}
                        onClick={() => handleLinkExisting(group)}
                        disabled={!linkTarget[group.key] || isLoading}
                      >
                        Vincular
                      </button>
                    </div>
                  )}

                  {action?.status === "error" && (
                    <div className={styles.errorMsg}>{action.message}</div>
                  )}
                </div>
              )}

              {/* Preview transactions */}
              <details className={styles.txPreview}>
                <summary className={styles.txPreviewSummary}>
                  Ver transações ({group.txs.length})
                </summary>
                <div className={styles.txPreviewList}>
                  {group.txs.map((t) => (
                    <div key={t.id} className={styles.txPreviewItem}>
                      <span className={t.isPaid ? styles.paidDot : styles.pendingDot}>
                        {t.isPaid ? "✓" : "⏳"}
                      </span>
                      <span className={styles.txPreviewDate}>
                        {t.date ? new Date(t.date).toLocaleDateString("pt-BR") : "—"}
                      </span>
                      <span className={styles.txPreviewValue}>{formatCurrency(t.value)}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
};
