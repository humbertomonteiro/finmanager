// src/presenters/components/contents/DashboardContent/index.tsx
import { useMemo, useState } from "react";
import { useTransaction } from "../../../contexts/TransactionContext";
import { useProduct } from "../../../contexts/ProductContext";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { ActiveViewProps } from "../../../pages/Dashboard";
import styles from "./dashboardContent.module.css";

type Period = "today" | "week" | "month" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hoje",
  week: "7 dias",
  month: "Este mês",
  all: "Tudo",
};

function filterByPeriod<T extends { date?: Date }>(
  items: T[],
  period: Period
): T[] {
  if (period === "all") return items;
  const now = new Date();
  const start = new Date();
  if (period === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (period === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  return items.filter((t) => t.date && new Date(t.date) >= start);
}

interface DashboardContentProps {
  handleActiveView: (view: ActiveViewProps) => void;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  handleActiveView,
}) => {
  const { transactions } = useTransaction();
  const { products } = useProduct();
  const [period, setPeriod] = useState<Period>("month");

  // Mapa produtoId -> custo para cálculo de lucro
  const costMap = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, p) => {
      if (p.id) acc[p.id] = p.costPrice;
      return acc;
    }, {});
  }, [products]);

  const filtered = useMemo(
    () => filterByPeriod(transactions, period),
    [transactions, period]
  );

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    let revenue = 0;
    let grossProfit = 0;
    let saleCount = 0;

    for (const t of filtered) {
      const isSale = t.type === "sale";
      const isCreditSale = t.type === "credit_sale" && t.isPaid;
      const isService = t.type === "service";
      const isCreditService = t.type === "credit_service" && t.isPaid;

      if (isSale || isCreditSale || isService || isCreditService) {
        revenue += t.value;
      }

      if (isSale || isCreditSale) {
        saleCount += 1;
        // Lucro bruto: receita - custo dos itens vendidos
        if (t.items && t.items.length > 0) {
          for (const item of t.items) {
            const cost = costMap[item.productId] ?? 0;
            grossProfit += (item.unitPrice - cost) * item.quantity;
          }
        } else {
          // Venda sem itens detalhados: não conseguimos calcular custo
          grossProfit += t.value;
        }
      }

      if (isService || isCreditService) {
        grossProfit += t.value; // serviço: lucro = valor integral
      }
    }

    const avgTicket = saleCount > 0 ? revenue / saleCount : 0;
    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return { revenue, grossProfit, avgTicket, saleCount, margin };
  }, [filtered, costMap]);

  // ── Saldo em Caixa (sempre sobre TODAS as transações, sem filtro) ─────────
  const caixa = useMemo(() => {
    let vendas = 0;
    let servicos = 0;
    let aportes = 0;
    let fiadosRecebidos = 0;
    let compras = 0;
    let pagamentos = 0;

    for (const t of transactions) {
      switch (t.type) {
        case "sale":                                    vendas          += t.value; break;
        case "service":                                 servicos        += t.value; break;
        case "aporte":                                  aportes         += t.value; break;
        case "purchase":                                compras         += t.value; break;
        case "payment":                                 pagamentos      += t.value; break;
        case "credit_sale":
        case "credit_service":
          if (t.isPaid)                                 fiadosRecebidos += t.value;
          break;
      }
    }

    const entradas = vendas + servicos + aportes + fiadosRecebidos;
    const saidas   = compras + pagamentos;
    const saldo    = entradas - saidas;

    return { saldo, entradas, saidas, vendas, servicos, aportes, fiadosRecebidos, compras, pagamentos };
  }, [transactions]);

  // ── Estoque ───────────────────────────────────────────────────────────────
  const stockInfo = useMemo(() => {
    const outOfStock = products.filter((p) => (p.stock ?? 0) === 0);
    const lowStock = products.filter(
      (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10
    );
    const totalValue = products.reduce(
      (s, p) => s + p.costPrice * (p.stock ?? 0),
      0
    );
    return { outOfStock, lowStock, totalValue };
  }, [products]);

  // ── Fiado ─────────────────────────────────────────────────────────────────
  const creditInfo = useMemo(() => {
    const pending = transactions.filter(
      (t) =>
        (t.type === "credit_sale" || t.type === "credit_service") && !t.isPaid
    );
    const totalPending = pending.reduce((s, t) => s + t.value, 0);
    const byCustomer = pending.reduce<Record<string, number>>((acc, t) => {
      const name = t.customerName || "Sem nome";
      acc[name] = (acc[name] ?? 0) + t.value;
      return acc;
    }, {});
    const topDebtors = Object.entries(byCustomer)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
    const uniqueCustomers = Object.keys(byCustomer).length;
    return { totalPending, topDebtors, uniqueCustomers, count: pending.length };
  }, [transactions]);

  const hasStockAlerts =
    stockInfo.outOfStock.length > 0 || stockInfo.lowStock.length > 0;

  return (
    <div className={styles.container}>
      {/* ── Cabeçalho ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageSubtitle}>Visão geral da sua loja</p>
        </div>
        <div className={styles.periodTabs}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              className={`${styles.periodBtn} ${
                period === p ? styles.periodActive : ""
              }`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Saldo em Caixa ── */}
      <CaixaCard caixa={caixa} creditPending={creditInfo.totalPending} />

      {/* ── KPI Cards ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Financeiro</h2>
        <div className={styles.kpiGrid}>
          <KpiCard
            label="Faturamento"
            value={formatCurrency(kpis.revenue)}
            variant="green"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            }
            subtitle={`${kpis.saleCount} ${kpis.saleCount === 1 ? "venda" : "vendas"}`}
          />
          <KpiCard
            label="Lucro Bruto"
            value={formatCurrency(kpis.grossProfit)}
            variant={kpis.grossProfit >= 0 ? "green" : "red"}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            }
            subtitle={`Margem ${kpis.margin.toFixed(1)}%`}
          />
          <KpiCard
            label="Ticket Médio"
            value={formatCurrency(kpis.avgTicket)}
            variant="accent"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            }
            subtitle="por venda"
          />
          <KpiCard
            label="Nº de Vendas"
            value={String(kpis.saleCount)}
            variant="purple"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            }
            subtitle={PERIOD_LABELS[period].toLowerCase()}
            isCount
          />
        </div>
      </section>

      {/* ── Estoque ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Estoque</h2>
          <button
            className={styles.sectionLink}
            onClick={() => handleActiveView("products")}
          >
            Ver todos →
          </button>
        </div>

        <div className={styles.stockGrid}>
          {/* Valor total */}
          <div className={`${styles.stockCard} ${styles.stockCardAccent}`}>
            <div className={styles.stockCardLabel}>Valor em estoque</div>
            <div className={styles.stockCardValue}>
              {formatCurrency(stockInfo.totalValue)}
            </div>
            <div className={styles.stockCardSub}>
              {products.length} {products.length === 1 ? "produto" : "produtos"} cadastrados
            </div>
          </div>

          {/* Sem estoque */}
          <div
            className={`${styles.stockCard} ${
              stockInfo.outOfStock.length > 0
                ? styles.stockCardRed
                : styles.stockCardOk
            }`}
          >
            <div className={styles.stockCardLabel}>Sem estoque</div>
            <div className={styles.stockCardBigNum}>
              {stockInfo.outOfStock.length}
            </div>
            <div className={styles.stockCardSub}>
              {stockInfo.outOfStock.length === 0
                ? "Tudo em estoque"
                : `${stockInfo.outOfStock.length === 1 ? "produto" : "produtos"} esgotado${stockInfo.outOfStock.length > 1 ? "s" : ""}`}
            </div>
            {stockInfo.outOfStock.length > 0 && (
              <div className={styles.stockList}>
                {stockInfo.outOfStock.slice(0, 3).map((p) => (
                  <div key={p.id} className={styles.stockItem}>
                    <span className={styles.stockDot} data-variant="red" />
                    <span className={styles.stockName}>{p.name}</span>
                  </div>
                ))}
                {stockInfo.outOfStock.length > 3 && (
                  <div className={styles.stockMore}>
                    +{stockInfo.outOfStock.length - 3} mais
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Estoque baixo */}
          <div
            className={`${styles.stockCard} ${
              stockInfo.lowStock.length > 0
                ? styles.stockCardAmber
                : styles.stockCardOk
            }`}
          >
            <div className={styles.stockCardLabel}>Estoque baixo</div>
            <div className={styles.stockCardBigNum}>
              {stockInfo.lowStock.length}
            </div>
            <div className={styles.stockCardSub}>
              {stockInfo.lowStock.length === 0
                ? "Níveis adequados"
                : `${stockInfo.lowStock.length === 1 ? "produto" : "produtos"} com ≤10 un.`}
            </div>
            {stockInfo.lowStock.length > 0 && (
              <div className={styles.stockList}>
                {stockInfo.lowStock
                  .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
                  .slice(0, 3)
                  .map((p) => (
                    <div key={p.id} className={styles.stockItem}>
                      <span className={styles.stockDot} data-variant="amber" />
                      <span className={styles.stockName}>{p.name}</span>
                      <span className={styles.stockQty}>{p.stock} un.</span>
                    </div>
                  ))}
                {stockInfo.lowStock.length > 3 && (
                  <div className={styles.stockMore}>
                    +{stockInfo.lowStock.length - 3} mais
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {!hasStockAlerts && (
          <div className={styles.allGood}>
            <span className={styles.allGoodIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            Nenhum alerta de estoque
          </div>
        )}
      </section>

      {/* ── Fiado ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Vendas Fiado</h2>
          <button
            className={styles.sectionLink}
            onClick={() => handleActiveView("credit-sales")}
          >
            Ver todos →
          </button>
        </div>

        <div className={styles.creditGrid}>
          <div className={`${styles.creditSummaryCard} ${creditInfo.totalPending > 0 ? styles.creditCardAmber : styles.creditCardOk}`}>
            <div className={styles.creditSummaryTop}>
              <div>
                <div className={styles.creditLabel}>Total pendente</div>
                <div className={styles.creditValue}>
                  {formatCurrency(creditInfo.totalPending)}
                </div>
              </div>
              <div className={styles.creditBadge}>
                {creditInfo.count}
              </div>
            </div>
            <div className={styles.creditMeta}>
              {creditInfo.uniqueCustomers === 0
                ? "Nenhum fiado em aberto"
                : `${creditInfo.uniqueCustomers} ${
                    creditInfo.uniqueCustomers === 1 ? "cliente" : "clientes"
                  } com débito pendente`}
            </div>
          </div>

          {creditInfo.topDebtors.length > 0 && (
            <div className={styles.debtorsCard}>
              <div className={styles.debtorsTitle}>Maiores devedores</div>
              <div className={styles.debtorsList}>
                {creditInfo.topDebtors.map(([name, total], i) => (
                  <div key={name} className={styles.debtorRow}>
                    <div className={styles.debtorRank}>{i + 1}</div>
                    <div className={styles.debtorAvatar}>
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className={styles.debtorName}>{name}</div>
                    <div className={styles.debtorAmount}>
                      {formatCurrency(total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {creditInfo.topDebtors.length === 0 && (
            <div className={styles.creditEmpty}>
              <span className={styles.allGoodIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              Nenhum fiado pendente
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// ── Componente CaixaCard ──────────────────────────────────────────────────
interface CaixaCardProps {
  caixa: {
    saldo: number;
    entradas: number;
    saidas: number;
    vendas: number;
    servicos: number;
    aportes: number;
    fiadosRecebidos: number;
    compras: number;
    pagamentos: number;
  };
  creditPending: number;
}

function CaixaCard({ caixa, creditPending }: CaixaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isPositive = caixa.saldo >= 0;

  return (
    <div className={`${styles.caixaCard} ${isPositive ? styles.caixaPositive : styles.caixaNegative}`}>
      <div className={styles.caixaTop}>
        <div className={styles.caixaLeft}>
          <div className={styles.caixaLabel}>Saldo em Caixa</div>
          <div className={`${styles.caixaValue} ${isPositive ? styles.caixaValuePositive : styles.caixaValueNegative}`}>
            {formatCurrency(caixa.saldo)}
          </div>
          <div className={styles.caixaMeta}>Acumulado total · todas as transações</div>
        </div>

        <div className={styles.caixaRight}>
          <div className={styles.caixaSummaryRow}>
            <span className={styles.caixaSummaryLabel}>
              <span className={styles.dotGreen} /> Entradas
            </span>
            <span className={styles.caixaSummaryValue}>{formatCurrency(caixa.entradas)}</span>
          </div>
          <div className={styles.caixaDivider} />
          <div className={styles.caixaSummaryRow}>
            <span className={styles.caixaSummaryLabel}>
              <span className={styles.dotRed} /> Saídas
            </span>
            <span className={`${styles.caixaSummaryValue} ${styles.caixaSummaryRed}`}>
              − {formatCurrency(caixa.saidas)}
            </span>
          </div>
          {creditPending > 0 && (
            <>
              <div className={styles.caixaDivider} />
              <div className={styles.caixaSummaryRow}>
                <span className={styles.caixaSummaryLabel}>
                  <span className={styles.dotAmber} /> A receber (fiado)
                </span>
                <span className={styles.caixaSummaryAmber}>{formatCurrency(creditPending)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detalhamento expandível */}
      <button className={styles.caixaToggle} onClick={() => setExpanded((v) => !v)}>
        {expanded ? "Ocultar detalhes ▲" : "Ver detalhamento ▼"}
      </button>

      {expanded && (
        <div className={styles.caixaDetail}>
          <div className={styles.caixaDetailCol}>
            <div className={styles.caixaDetailTitle}>Entradas</div>
            <DetailRow label="Vendas"            value={caixa.vendas}           color="green" />
            <DetailRow label="Serviços"          value={caixa.servicos}         color="green" />
            <DetailRow label="Aportes"           value={caixa.aportes}          color="green" />
            <DetailRow label="Fiados recebidos"  value={caixa.fiadosRecebidos}  color="green" />
          </div>
          <div className={styles.caixaDetailDivider} />
          <div className={styles.caixaDetailCol}>
            <div className={styles.caixaDetailTitle}>Saídas</div>
            <DetailRow label="Compras"    value={caixa.compras}    color="red" />
            <DetailRow label="Pagamentos" value={caixa.pagamentos} color="red" />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: number; color: "green" | "red" }) {
  if (value === 0) return null;
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={`${styles.detailValue} ${color === "red" ? styles.detailRed : styles.detailGreen}`}>
        {color === "red" ? "− " : "+ "}{formatCurrency(value)}
      </span>
    </div>
  );
}

// ── Componente auxiliar KpiCard ────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string;
  subtitle: string;
  variant: "green" | "red" | "amber" | "accent" | "purple";
  icon: React.ReactNode;
  isCount?: boolean;
}

function KpiCard({ label, value, subtitle, variant, icon, isCount }: KpiCardProps) {
  return (
    <div className={`${styles.kpiCard} ${styles[`kpi_${variant}`]}`}>
      <div className={styles.kpiTop}>
        <span className={styles.kpiLabel}>{label}</span>
        <span className={styles.kpiIcon}>{icon}</span>
      </div>
      <div className={`${styles.kpiValue} ${isCount ? styles.kpiValueCount : ""}`}>
        {value}
      </div>
      <div className={styles.kpiSub}>{subtitle}</div>
    </div>
  );
}
