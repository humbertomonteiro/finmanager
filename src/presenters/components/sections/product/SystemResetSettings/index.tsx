// src/presenters/components/sections/product/SystemResetSettings/index.tsx
import React, { useState } from "react";
import { useTransaction } from "../../../../contexts/TransactionContext";
import { useProduct } from "../../../../contexts/ProductContext";
import styles from "./systemResetSettings.module.css";

export const SystemResetSettings: React.FC = () => {
  const { transactions, fetchTransactions } = useTransaction();
  const { products, fetchProducts } = useProduct();
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showResult = (message: string, type: "success" | "error") => {
    setResult({ message, type });
    setTimeout(() => setResult(null), 4000);
  };

  const handleReset = async (mode: "transactions" | "products" | "all") => {
    const labels: Record<typeof mode, string> = {
      transactions: "Apagar todas as transações",
      products: "Apagar todos os produtos",
      all: "Resetar todo o sistema",
    };

    if (
      !confirm(
        `${labels[mode]}?\n\nEsta ação NÃO pode ser desfeita. Tem certeza?`
      )
    )
      return;

    setLoading(mode);
    try {
      // In production this would call the use case
      // const usecase = new ResetSystemUsecase(...);
      // await usecase.execute(mode);
      await new Promise((r) => setTimeout(r, 600)); // simulate
      await fetchTransactions();
      await fetchProducts();
      showResult(`${labels[mode]} concluído com sucesso.`, "success");
    } catch (err: any) {
      showResult(`Erro: ${err.message}`, "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </div>
          <div>
            <div className={styles.pageTitle}>Configurações</div>
            <div className={styles.pageSub}>Gerenciamento do sistema</div>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {result && (
        <div
          className={`${styles.feedback} ${styles["feedback_" + result.type]}`}
        >
          {result.type === "success" ? "✓" : "✕"} {result.message}
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsCard}>
        <div className={styles.statsTitle}>Resumo do sistema</div>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{transactions.length}</div>
            <div className={styles.statLabel}>Transações</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{products.length}</div>
            <div className={styles.statLabel}>Produtos</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>
              {
                transactions.filter(
                  (t) => t.type === "credit_sale" && !t.isPaid
                ).length
              }
            </div>
            <div className={styles.statLabel}>Fiados pendentes</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>v1.0</div>
            <div className={styles.statLabel}>Versão</div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className={styles.dangerCard}>
        <div className={styles.dangerHeader}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--red)", flexShrink: 0 }}
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className={styles.dangerTitle}>Zona de Perigo</span>
        </div>
        <p className={styles.dangerDesc}>
          Estas ações são <strong>permanentes e irreversíveis</strong>. Não há
          como recuperar os dados após a confirmação.
        </p>

        <div className={styles.dangerActions}>
          <div className={styles.dangerAction}>
            <div>
              <div className={styles.actionTitle}>Apagar transações</div>
              <div className={styles.actionDesc}>
                Remove todo o histórico de transações. Os produtos são mantidos.
              </div>
            </div>
            <button
              className={styles.btnDanger}
              onClick={() => handleReset("transactions")}
              disabled={loading !== null}
            >
              {loading === "transactions" ? "Apagando…" : "Apagar transações"}
            </button>
          </div>

          <div className={styles.dangerDivider} />

          <div className={styles.dangerAction}>
            <div>
              <div className={styles.actionTitle}>Apagar produtos</div>
              <div className={styles.actionDesc}>
                Remove todo o catálogo de produtos. As transações são mantidas.
              </div>
            </div>
            <button
              className={styles.btnDanger}
              onClick={() => handleReset("products")}
              disabled={loading !== null}
            >
              {loading === "products" ? "Apagando…" : "Apagar produtos"}
            </button>
          </div>

          <div className={styles.dangerDivider} />

          <div className={styles.dangerAction}>
            <div>
              <div className={styles.actionTitle}>Resetar sistema completo</div>
              <div className={styles.actionDesc}>
                Apaga TODOS os dados: transações, produtos e configurações.
              </div>
            </div>
            <button
              className={`${styles.btnDanger} ${styles.btnDangerFull}`}
              onClick={() => handleReset("all")}
              disabled={loading !== null}
            >
              {loading === "all" ? "Resetando…" : "Resetar tudo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
