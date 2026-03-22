// src/presenters/components/templates/Header/index.tsx
import React from "react";
import styles from "./header.module.css";
import { RxHamburgerMenu } from "react-icons/rx";
import { ActiveViewProps } from "../../../pages/Dashboard";
import { GrTransaction } from "react-icons/gr";
import { FaBox } from "react-icons/fa6";

interface HeaderProps {
  onToggleSidebar: () => void;
  handleActiveView: (view: ActiveViewProps, data?: any) => void;
  activeView: ActiveViewProps;
}

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  transactions: "Transações",
  products: "Produtos",
  "adjust-stock": "Estoque",
  "credit-sales": "Vendas Fiado",
  "system-settings": "Configurações",
  "new-transaction": "Nova Transação",
  "new-product": "Novo Produto",
};

const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  handleActiveView,
  activeView,
}) => {
  return (
    <header className={styles.header}>
      {/* Left */}
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          aria-label="Abrir menu"
        >
          <RxHamburgerMenu />
        </button>
        <span className={styles.pageTitle}>
          {VIEW_TITLES[activeView] ?? "FinManager"}
        </span>
      </div>

      {/* Right */}
      <div className={styles.right}>
        <button
          className={styles.quickBtn}
          onClick={() => handleActiveView("new-transaction")}
          title="Nova Transação"
        >
          <GrTransaction />
          <span className={styles.quickLabel}>Nova Transação</span>
        </button>
        <button
          className={styles.quickBtn}
          onClick={() => handleActiveView("new-product")}
          title="Novo Produto"
        >
          <FaBox />
          <span className={styles.quickLabel}>Produto</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
