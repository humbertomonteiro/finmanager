// src/components/templates/Header.tsx
import React from "react";
import styles from "./header.module.css";

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerStart}>
        <button
          className={styles.menuButton}
          onClick={onToggleSidebar}
          aria-label="Abrir menu"
        >
          <span className={styles.menuIcon}>☰</span>
        </button>
        <h1 className={styles.title}>FinManager</h1>
      </div>

      <div className={styles.headerEnd}>
        <button className={styles.notificationButton} aria-label="Notificações">
          <span className={styles.notificationIcon}>🔔</span>
          <span className={styles.notificationBadge}>3</span>
        </button>

        <div className={styles.userMenu}>
          <div className={styles.userAvatar}></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
