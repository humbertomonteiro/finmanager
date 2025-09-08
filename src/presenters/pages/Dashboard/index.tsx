// src/pages/Dashboard.tsx
import React, { useState } from "react";
import Header from "../../components/templates/Header";
import Sidebar from "../../components/templates/Sidebar";
import ProductList from "../../components/sections/ProductList";
import { CreateTransactionForm } from "../../components/sections/CreateTransactionForm";
import TransactionList from "../../components/sections/TransactionList";
import styles from "./dashboard.module.css";
import { ButtonsMobileCreateForm } from "../../components/sections/ButtonsMobileCreateForm";
import { CreateProductForm } from "../../components/sections/CreateProductForm";

import { MdDashboard } from "react-icons/md";
import { FaBox } from "react-icons/fa6";
import { GrTransaction } from "react-icons/gr";
import { FaPlus } from "react-icons/fa6";

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

  const handleFormCreate = (activeView: ActiveViewProps, dataEditing?: any) => {
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
      onClick: () => handleFormCreate("dashboard"),
    },
    {
      id: "products",
      label: "Produtos",
      icon: <FaBox />,
      onClick: () => handleFormCreate("products"),
    },
    {
      id: "new-transaction",
      label: "Nova Transação",
      icon: <GrTransaction />,
      onClick: () => handleFormCreate("new-transaction"),
    },
    {
      id: "new-product",
      label: "Novo Produto",
      icon: <FaPlus />,
      onClick: () => handleFormCreate("new-product"),
    },
  ];

  return (
    <div className={styles.dashboard}>
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        handleFormCreate={handleFormCreate}
      />

      <div className={styles.layout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          items={sidebarItems}
        />

        <main className={styles.content}>
          {activeView === "dashboard" && <TransactionList />}
          {activeView === "products" && (
            <ProductList handleFormCreate={handleFormCreate} />
          )}
          {activeView === "new-transaction" && <CreateTransactionForm />}
          {activeView === "new-product" && (
            <CreateProductForm
              product={dataEditing}
              handleFormCreate={handleFormCreate}
            />
          )}
        </main>

        <ButtonsMobileCreateForm setActiveView={setActiveView} />
      </div>
    </div>
  );
};

export default Dashboard;
