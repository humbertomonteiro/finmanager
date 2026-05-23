import React, { useState, useMemo, useRef, useEffect } from "react";
import { Customer } from "../../../../../domain/entities/Customer";
import styles from "./customerSearchInput.module.css";

interface CustomerSearchInputProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onCustomerSelect: (customer: Customer) => void;
  onCreateNew?: (name: string) => void;
  placeholder?: string;
}

export const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({
  customers,
  selectedCustomer,
  onCustomerSelect,
  onCreateNew,
  placeholder = "Buscar cliente cadastrado...",
}) => {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const ignoreBlur = useRef(false);

  // When a customer is already selected, show their name in the input
  useEffect(() => {
    if (selectedCustomer && !open) {
      setTerm(selectedCustomer.name);
    }
  }, [selectedCustomer, open]);

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone || "").includes(q)
      )
      .slice(0, 8);
  }, [customers, term]);

  const showCreateOption =
    onCreateNew &&
    term.trim().length >= 2 &&
    !filtered.some((c) => c.name.toLowerCase() === term.trim().toLowerCase());

  useEffect(() => {
    if (idx >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-item]");
      items[idx]?.scrollIntoView({ block: "nearest" });
    }
  }, [idx]);

  const totalItems = filtered.length + (showCreateOption ? 1 : 0);

  const select = (c: Customer) => {
    onCustomerSelect(c);
    setTerm(c.name);
    setOpen(false);
    setIdx(-1);
  };

  const handleCreateNew = () => {
    if (onCreateNew && term.trim().length >= 2) {
      onCreateNew(term.trim());
      setOpen(false);
      setIdx(-1);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key !== "Escape") setOpen(true);
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIdx((i) => (i < totalItems - 1 ? i + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setIdx((i) => (i > 0 ? i - 1 : totalItems - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (idx >= 0 && idx < filtered.length) {
          select(filtered[idx]);
        } else if (idx === filtered.length && showCreateOption) {
          handleCreateNew();
        }
        break;
      case "Escape":
        setOpen(false);
        setIdx(-1);
        if (selectedCustomer) setTerm(selectedCustomer.name);
        break;
    }
  };

  const handleFocus = () => {
    setOpen(true);
    if (selectedCustomer) setTerm("");
  };

  const handleBlur = () => {
    if (!ignoreBlur.current) {
      setOpen(false);
      if (selectedCustomer) setTerm(selectedCustomer.name);
      else setTerm("");
    }
    ignoreBlur.current = false;
  };

  const isSelected = !!selectedCustomer;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.inputBox} ${open ? styles.inputBoxOpen : ""} ${isSelected ? styles.inputBoxSelected : ""}`}>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{ color: "var(--text-3)", flexShrink: 0 }}
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={term}
          placeholder={isSelected ? selectedCustomer!.name : placeholder}
          onChange={(e) => { setTerm(e.target.value); setOpen(true); setIdx(-1); }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKey}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {isSelected && (
          <button
            className={styles.clearBtn}
            title="Remover cliente selecionado"
            onMouseDown={(e) => {
              e.preventDefault();
              onCustomerSelect(null as any);
              setTerm("");
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </div>

      {isSelected && (
        <div className={styles.selectedBadge}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {selectedCustomer!.name}
          {selectedCustomer!.phone && <span className={styles.selectedPhone}> · {selectedCustomer!.phone}</span>}
        </div>
      )}

      {open && (filtered.length > 0 || showCreateOption) && (
        <div
          ref={listRef}
          className={styles.dropdown}
          onMouseDown={() => { ignoreBlur.current = true; }}
        >
          {filtered.map((c, i) => (
            <div
              key={c.id}
              data-item
              className={`${styles.item} ${i === idx ? styles.itemActive : ""}`}
              onClick={() => select(c)}
              onMouseEnter={() => setIdx(i)}
              role="option"
              aria-selected={i === idx}
            >
              <div className={styles.avatar}>
                {c.name.slice(0, 2).toUpperCase()}
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{c.name}</div>
                {c.phone && <div className={styles.itemPhone}>{c.phone}</div>}
              </div>
            </div>
          ))}

          {showCreateOption && (
            <div
              data-item
              className={`${styles.createOption} ${idx === filtered.length ? styles.itemActive : ""}`}
              onClick={handleCreateNew}
              onMouseEnter={() => setIdx(filtered.length)}
              role="option"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Criar cliente "{term.trim()}"
            </div>
          )}

          {term.trim() && filtered.length === 0 && !showCreateOption && (
            <div className={styles.noResults}>
              Nenhum cliente encontrado para "{term}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
