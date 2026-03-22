// src/presenters/components/templates/Sidebar/index.tsx
import React from "react";
import styles from "./sidebar.module.css";
import { IoClose } from "react-icons/io5";
import { useTransaction } from "../../../contexts/TransactionContext";
import { ActiveViewProps } from "../../../pages/Dashboard";

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  group?: string;
  onClick: () => void;
  showBadge?: boolean;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
  activeView: ActiveViewProps;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  items,
  activeView,
}) => {
  const { transactions } = useTransaction();
  const pendingCredit = transactions.filter(
    (t) => t.type === "credit_sale" && !t.isPaid
  ).length;

  // Group items
  const groups = items.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    const g = item.group || "Menu";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div className={styles.logoText}>FinManager</div>
          <div className={styles.logoSub}>Gestão Financeira</div>
        </div>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Fechar menu"
        >
          <IoClose />
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {Object.entries(groups).map(([groupName, groupItems]) => (
          <div key={groupName} className={styles.navGroup}>
            <div className={styles.navGroupLabel}>{groupName}</div>
            {groupItems.map((item) => {
              const isActive =
                activeView === item.id ||
                (item.id === "dashboard" && activeView === "dashboard") ||
                (item.id === "transactions" && activeView === "transactions");

              const badge =
                item.showBadge && pendingCredit > 0 ? pendingCredit : null;

              return (
                <button
                  key={item.id}
                  className={`${styles.navBtn} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={item.onClick}
                >
                  {item.icon && (
                    <span className={styles.navIcon}>{item.icon}</span>
                  )}
                  <span className={styles.navLabel}>{item.label}</span>
                  {badge !== null && (
                    <span className={styles.badge}>{badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.userRow}>
          <div className={styles.userAvatar}>AD</div>
          <div>
            <div className={styles.userName}>Administrador</div>
            <div className={styles.userRole}>Acesso total</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
