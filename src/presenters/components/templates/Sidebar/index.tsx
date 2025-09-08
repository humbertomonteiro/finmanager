import React from "react";
import styles from "./sidebar.module.css";

import { IoClose } from "react-icons/io5";

interface SidebarItem {
  id: string;
  label: string;
  icon?: any;
  onClick: () => void;
}

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  items: SidebarItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, items }) => {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>FinManager</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <span className={styles.closeIcon}>
              <IoClose />
            </span>
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {items.map((item) => (
              <li key={item.id} className={styles.navItem} onClick={onClose}>
                <button className={styles.navButton} onClick={item.onClick}>
                  {item.icon && (
                    <span className={styles.navIcon}>{item.icon}</span>
                  )}
                  <span className={styles.navLabel}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}></div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>Admin</p>
              <p className={styles.userRole}>Administrador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
