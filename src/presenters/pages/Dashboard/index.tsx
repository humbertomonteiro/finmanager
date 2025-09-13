// src/pages/Dashboard.tsx
import React, { useState } from "react";
import Header from "../../components/templates/Header";
import Sidebar from "../../components/templates/Sidebar";
import { CreateTransactionForm } from "../../components/sections/transaction/CreateTransactionForm";
import styles from "./dashboard.module.css";
import { ButtonsMobileCreateForm } from "../../components/shared/ButtonsMobileCreateForm";
import { CreateProductForm } from "../../components/sections/product/CreateProductForm";

import { MdDashboard } from "react-icons/md";
import { FaBox } from "react-icons/fa6";
import { GrTransaction } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";

import TransactionContent from "../../components/contents/TransactionContent";
import ProductContent from "../../components/contents/ProductContent";

export type ActiveViewProps =
  | "dashboard"
  | "transactions"
  | "products"
  | "new-transaction"
  | "new-product";

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveViewProps>("dashboard");
  const [dataEditing, setDataEditing] = useState<any>();

  const handleActiveView = (activeView: ActiveViewProps, dataEditing?: any) => {
    setActiveView(activeView);
    if (dataEditing) {
      setDataEditing(dataEditing);
    } else {
      setDataEditing(null);
    }
  };

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <MdDashboard />,
      onClick: () => handleActiveView("dashboard"),
    },
    {
      id: "products",
      label: "Produtos",
      icon: <FaBox />,
      onClick: () => handleActiveView("products"),
    },
    {
      id: "new-transaction",
      label: "Nova Transação",
      icon: <GrTransaction />,
      onClick: () => handleActiveView("new-transaction"),
    },
    {
      id: "new-product",
      label: "Novo Produto",
      icon: <FaPlus />,
      onClick: () => handleActiveView("new-product"),
    },
  ];

  return (
    <div className={styles.dashboard}>
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        handleActiveView={handleActiveView}
      />

      <div className={styles.layout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          items={sidebarItems}
        />

        <main className={styles.content}>
          {activeView === "dashboard" && (
            <TransactionContent handleActiveView={handleActiveView} />
          )}
          {activeView === "products" && (
            <ProductContent handleActiveView={handleActiveView} />
          )}
          {activeView === "new-transaction" && (
            <CreateTransactionForm
              transaction={dataEditing}
              handleActiveView={handleActiveView}
            />
          )}
          {activeView === "new-product" && (
            <CreateProductForm
              product={dataEditing}
              handleActiveView={handleActiveView}
            />
          )}
        </main>

        <ButtonsMobileCreateForm setActiveView={setActiveView} />
      </div>
    </div>
  );
};

export default Dashboard;
