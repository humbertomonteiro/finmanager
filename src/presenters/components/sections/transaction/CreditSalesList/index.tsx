// src/presenters/components/sections/transaction/CreditSalesList/index.tsx
import { useState, useMemo, useEffect } from "react";
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const credits = useMemo(
    () =>
      transactions.filter(
        (t) => t.type === "credit_sale" || t.type === "credit_service"
      ),
    [transactions]
  );

  const pending = useMemo(() => credits.filter((t) => !t.isPaid), [credits]);
  const paid = useMemo(() => credits.filter((t) => t.isPaid), [credits]);

  // Lista filtrada por aba + busca
  const displayed = useMemo(() => {
    let list =
      activeTab === "pending" ? pending : activeTab === "paid" ? paid : credits;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        (t.customerName || "").toLowerCase().includes(q)
      );
    }

    return [...list].sort(
      (a, b) =>
        new Date(b.date as Date).getTime() - new Date(a.date as Date).getTime()
    );
  }, [activeTab, pending, paid, credits, search]);

  // Totais calculados sobre a lista visível (reagem à busca)
  const displayedPending = useMemo(
    () => displayed.filter((t) => !t.isPaid),
    [displayed]
  );
  const displayedPaid = useMemo(
    () => displayed.filter((t) => t.isPaid),
    [displayed]
  );

  const totalPending = useMemo(
    () => displayedPending.reduce((s, t) => s + t.value, 0),
    [displayedPending]
  );
  const totalPaid = useMemo(
    () => displayedPaid.reduce((s, t) => s + t.value, 0),
    [displayedPaid]
  );
  const totalAll = totalPending + totalPaid;

  // ── Seleção múltipla ──────────────────────────────────────────────────────
  const pendingDisplayedIds = useMemo(
    () => displayedPending.map((t) => t.id!).filter(Boolean),
    [displayedPending]
  );

  const allSelected =
    pendingDisplayedIds.length > 0 &&
    pendingDisplayedIds.every((id) => selectedIds.has(id));

  const selectedTotal = useMemo(
    () =>
      displayed
        .filter((t) => t.id && selectedIds.has(t.id))
        .reduce((s, t) => s + t.value, 0),
    [displayed, selectedIds]
  );

  // Limpa seleção quando o filtro de busca muda
  useEffect(() => {
    setSelectedIds(new Set());
  }, [search]);

  const enterSelectionMode = () => {
    setSelectionMode(true);
    setSelectedIds(new Set());
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingDisplayedIds));
    }
  };

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

  const handleMarkSelectedPaid = async () => {
    if (selectedIds.size === 0) return;
    // Segurança: só processa IDs que estão visíveis na tela agora
    const visiblePendingIds = new Set(displayedPending.map((t) => t.id).filter(Boolean));
    const safeIds = new Set([...selectedIds].filter((id) => visiblePendingIds.has(id)));
    if (safeIds.size === 0) return;

    const safeTotal = displayedPending
      .filter((t) => t.id && safeIds.has(t.id))
      .reduce((s, t) => s + t.value, 0);

    if (
      !confirm(
        `Confirmar recebimento de ${safeIds.size} ${
          safeIds.size === 1 ? "fiado" : "fiados"
        } totalizando ${formatCurrency(safeTotal)}?`
      )
    )
      return;
    setBulkLoading(true);
    try {
      const toUpdate = transactions.filter(
        (t) => t.id && safeIds.has(t.id) && !t.isPaid
      );
      for (const t of toUpdate) {
        t.markAsPaid();
        await updateTransaction(t);
      }
      exitSelectionMode();
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setBulkLoading(false);
    }
  };

  const fmtDate = (d?: Date) =>
    d ? new Date(d).toLocaleDateString("pt-BR") : "—";

  // Maiores devedores calculados sobre a lista pendente visível
  const byCustomer = useMemo(() => {
    return displayedPending.reduce<
      Record<string, { total: number; count: number }>
    >((acc, t) => {
      const name = t.customerName || "Sem nome";
      if (!acc[name]) acc[name] = { total: 0, count: 0 };
      acc[name].total += t.value;
      acc[name].count += 1;
      return acc;
    }, {});
  }, [displayedPending]);

  const isFiltering = search.trim().length > 0;

  return (
    <div className={styles.container}>
      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.summaryPending}`}>
          <div className={styles.summaryLabel}>
            Pendentes{isFiltering ? " (filtrado)" : ""}
          </div>
          <div className={`${styles.summaryCount} ${styles.countPending}`}>
            {displayedPending.length}
          </div>
          <div className={styles.summaryAmount}>
            {formatCurrency(totalPending)}
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryPaid}`}>
          <div className={styles.summaryLabel}>
            Recebidas{isFiltering ? " (filtrado)" : ""}
          </div>
          <div className={`${styles.summaryCount} ${styles.countPaid}`}>
            {displayedPaid.length}
          </div>
          <div className={styles.summaryAmount}>
            {formatCurrency(totalPaid)}
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>
            Total{isFiltering ? " (filtrado)" : " geral"}
          </div>
          <div className={styles.summaryCount}>{displayed.length}</div>
          <div className={styles.summaryAmount}>{formatCurrency(totalAll)}</div>
        </div>
      </div>

      {/* Maiores devedores */}
      {activeTab === "pending" && Object.keys(byCustomer).length > 0 && (
        <div className={styles.debtorsSection}>
          <div className={styles.sectionTitle}>
            Maiores devedores{isFiltering ? " (resultado da busca)" : ""}
          </div>
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
                      {data.count}{" "}
                      {data.count === 1 ? "pendência" : "pendências"}
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

      {/* Tabs + search + botão selecionar */}
      <div className={styles.controls}>
        <div className={styles.tabs}>
          {(["pending", "paid", "all"] as CreditTab[]).map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => {
                setActiveTab(tab);
                exitSelectionMode();
              }}
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
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }}
              aria-label="Limpar busca"
            >
              ×
            </button>
          )}
        </div>

        {/* Botão Selecionar — só na aba pendentes */}
        {activeTab === "pending" && displayedPending.length > 0 && (
          <button
            className={`${styles.btnSelect} ${selectionMode ? styles.btnSelectActive : ""}`}
            onClick={selectionMode ? exitSelectionMode : enterSelectionMode}
          >
            {selectionMode ? "Cancelar" : "Selecionar"}
          </button>
        )}
      </div>

      {/* Barra de seleção múltipla */}
      {selectionMode && (
        <div className={styles.selectionBar}>
          <div className={styles.selectionBarLeft}>
            <button
              className={`${styles.checkboxBtn} ${allSelected ? styles.checkboxChecked : ""}`}
              onClick={toggleSelectAll}
              aria-label={allSelected ? "Desmarcar todos" : "Selecionar todos"}
            >
              {allSelected ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
            </button>
            <span className={styles.selectionInfo}>
              {selectedIds.size === 0
                ? "Nenhum selecionado"
                : `${selectedIds.size} selecionado${selectedIds.size > 1 ? "s" : ""}`}
            </span>
            {selectedIds.size > 0 && (
              <span className={styles.selectionTotal}>
                {formatCurrency(selectedTotal)}
              </span>
            )}
          </div>

          <button
            className={styles.btnBulkPay}
            onClick={handleMarkSelectedPaid}
            disabled={selectedIds.size === 0 || bulkLoading}
          >
            {bulkLoading
              ? "Processando…"
              : `✓ Confirmar ${selectedIds.size > 0 ? selectedIds.size : ""} recebimento${selectedIds.size > 1 ? "s" : ""}`}
          </button>
        </div>
      )}

      {/* List */}
      {displayed.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>💸</div>
          <div className={styles.emptyTitle}>
            {isFiltering
              ? `Nenhum resultado para "${search}"`
              : activeTab === "pending"
              ? "Nenhuma pendência"
              : "Nenhum registro encontrado"}
          </div>
          <div className={styles.emptySub}>
            {isFiltering
              ? "Tente buscar por outro nome."
              : activeTab === "pending"
              ? "Todas as contas estão em dia!"
              : ""}
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {displayed.map((sale) => {
            const isSelected = !!sale.id && selectedIds.has(sale.id);
            const isSelectablePending = selectionMode && !sale.isPaid;

            return (
              <div
                key={sale.id}
                className={`${styles.card} ${
                  sale.isPaid ? styles.cardPaid : styles.cardPending
                } ${isSelected ? styles.cardSelected : ""} ${
                  isSelectablePending ? styles.cardSelectable : ""
                }`}
                onClick={
                  isSelectablePending && sale.id
                    ? () => toggleSelect(sale.id!)
                    : undefined
                }
              >
                <div className={styles.cardHeader}>
                  {/* Checkbox de seleção */}
                  {isSelectablePending && (
                    <div className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ""}`}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  )}

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

                  <div className={`${styles.amount} ${sale.isPaid ? styles.amountPaid : styles.amountPending}`}>
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
                    selectionMode ? (
                      <span className={styles.selectionHint}>
                        {isSelected ? "✓ Selecionado" : "Clique para selecionar"}
                      </span>
                    ) : (
                      <button
                        className={styles.btnPay}
                        onClick={() => handleMarkPaid(sale)}
                        disabled={loading === sale.id}
                      >
                        {loading === sale.id ? "Processando…" : "✓ Confirmar recebimento"}
                      </button>
                    )
                  ) : (
                    <span className={styles.paidBadge}>
                      ✓ Pago em {sale.paidAt ? fmtDate(sale.paidAt) : "—"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
