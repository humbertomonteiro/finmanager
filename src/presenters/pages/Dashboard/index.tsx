// src/pages/Dashboard.tsx
import React, { useState } from "react";
import Header from "../../components/templates/Header";
import Sidebar from "../../components/templates/Sidebar";
import ProductList from "../../components/sections/ProductList";
import { CreateTransactionForm } from "../../components/sections/CreateTransactionForm";
import TransactionList from "../../components/sections/TransactionList";
import styles from "./dashboard.module.css";

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    "dashboard" | "transactions" | "products"
  >("dashboard");
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  const sidebarItems = [
    // {
    //   id: "dashboard",
    //   label: "Dashboard",
    //   icon: "📊",
    //   onClick: () => setActiveView("dashboard"),
    // },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      onClick: () => setActiveView("dashboard"),
    },
    {
      id: "products",
      label: "Produtos",
      icon: "📦",
      onClick: () => setActiveView("products"),
    },
    {
      id: "new-transaction",
      label: "Nova Transação",
      icon: "➕",
      onClick: () => setShowTransactionForm(true),
    },
  ];

  return (
    <div className={styles.dashboard}>
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={styles.layout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          items={sidebarItems}
        />

        <main className={styles.content}>
          {/* {activeView === "dashboard" && <DashboardMetrics />} */}
          {activeView === "dashboard" && <TransactionList />}
          {activeView === "products" && <ProductList />}
        </main>

        {showTransactionForm && (
          <CreateTransactionForm
            onClose={() => setShowTransactionForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
