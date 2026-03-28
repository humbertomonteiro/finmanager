// src/presenters/pages/Dashboard/index.tsx
// FinManager Pro — Redesign completo
import React, { useState, useCallback } from "react";
import Sidebar from "../../components/templates/Sidebar";
import Header from "../../components/templates/Header";
import TransactionContent from "../../components/contents/TransactionContent";
import ProductContent from "../../components/contents/ProductContent";
import { CreateTransactionForm } from "../../components/sections/transaction/CreateTransactionForm";
import { CreateProductForm } from "../../components/sections/product/CreateProductForm";
import { StockAdjustmentForm } from "../../components/sections/product/StockAdjustmentForm";
import { CreditSalesList } from "../../components/sections/transaction/CreditSalesList";
import { SystemResetSettings } from "../../components/sections/product/SystemResetSettings";
import styles from "./dashboard.module.css";

// import { MdDashboard, MdSettings } from "react-icons/md";
import { MdSettings } from "react-icons/md";
import { FaBox, FaBoxes, FaUsers } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";

export type ActiveViewProps =
  | "dashboard"
  | "transactions"
  | "products"
  | "new-transaction"
  | "new-product"
  | "adjust-stock"
  | "credit-sales"
  | "system-settings";

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveViewProps>("transactions");
  const [dataEditing, setDataEditing] = useState<any>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelType, setPanelType] = useState<"transaction" | "product" | null>(
    null
  );

  const handleActiveView = useCallback((view: ActiveViewProps, data?: any) => {
    setActiveView(view);
    setDataEditing(data ?? null);

    // Views que abrem como panel lateral
    if (view === "new-transaction") {
      setPanelType("transaction");
      setPanelOpen(true);
      return;
    }
    if (view === "new-product") {
      setPanelType("product");
      setPanelOpen(true);
      return;
    }
  }, []);

  const closePanel = useCallback(() => {
    setPanelOpen(false);
    setPanelType(null);
    setDataEditing(null);
    // Retorna ao view anterior relevante
    setActiveView((prev) =>
      prev === "new-transaction"
        ? "transactions"
        : prev === "new-product"
        ? "products"
        : prev
    );
  }, []);

  const sidebarItems = [
    // {
    //   id: "dashboard",
    //   label: "Dashboard",
    //   icon: <MdDashboard />,
    //   group: "Principal",
    //   onClick: () => {
    //     setActiveView("dashboard");
    //     setIsSidebarOpen(false);
    //   },
    // },
    {
      id: "transactions",
      label: "Transações",
      icon: <GrTransaction />,
      group: "Principal",
      onClick: () => {
        setActiveView("transactions");
        setIsSidebarOpen(false);
      },
    },
    {
      id: "products",
      label: "Produtos",
      icon: <FaBox />,
      group: "Produtos",
      onClick: () => {
        setActiveView("products");
        setIsSidebarOpen(false);
      },
    },
    {
      id: "adjust-stock",
      label: "Estoque",
      icon: <FaBoxes />,
      group: "Produtos",
      onClick: () => {
        setActiveView("adjust-stock");
        setIsSidebarOpen(false);
      },
    },
    {
      id: "credit-sales",
      label: "Vendas Fiado",
      icon: <FaUsers />,
      group: "Finanças",
      onClick: () => {
        setActiveView("credit-sales");
        setIsSidebarOpen(false);
      },
      showBadge: true,
    },
    {
      id: "system-settings",
      label: "Configurações",
      icon: <MdSettings />,
      group: "Sistema",
      onClick: () => {
        setActiveView("system-settings");
        setIsSidebarOpen(false);
      },
    },
  ];

  const renderMainContent = () => {
    switch (activeView) {
      // case "dashboard":
      //   return <TransactionContent handleActiveView={handleActiveView} />;
      case "transactions":
        return (
          <TransactionContent handleActiveView={handleActiveView} showAll />
        );
      case "products":
        return <ProductContent handleActiveView={handleActiveView} />;
      case "adjust-stock":
        return (
          <StockAdjustmentForm onClose={() => setActiveView("products")} />
        );
      case "credit-sales":
        return <CreditSalesList />;
      case "system-settings":
        return <SystemResetSettings />;
      default:
        return <TransactionContent handleActiveView={handleActiveView} />;
    }
  };

  return (
    <div className={styles.app}>
      {/* Sidebar overlay (mobile) */}
      {isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={sidebarItems}
        activeView={activeView}
      />

      <div className={styles.main}>
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          handleActiveView={handleActiveView}
          activeView={activeView}
        />

        <main className={styles.content}>
          <div className={`${styles.view} fadeUp`} key={activeView}>
            {renderMainContent()}
          </div>
        </main>
      </div>

      {/* Panel overlay */}
      {panelOpen && (
        <div
          className={styles.panelOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) closePanel();
          }}
        >
          <div className={`${styles.panel} slideIn`}>
            {panelType === "transaction" && (
              <CreateTransactionForm
                transaction={dataEditing}
                handleActiveView={(v) => {
                  closePanel();
                  setActiveView(v);
                }}
                onClose={closePanel}
              />
            )}
            {panelType === "product" && (
              <CreateProductForm
                product={dataEditing}
                handleActiveView={(v) => {
                  closePanel();
                  setActiveView(v);
                }}
                onClose={closePanel}
              />
            )}
          </div>
        </div>
      )}

      {/* FAB mobile */}
      <button
        className={styles.fab}
        onClick={() => handleActiveView("new-transaction")}
        aria-label="Nova Transação"
      >
        <FaPlus />
      </button>
    </div>
  );
};

export default Dashboard;
