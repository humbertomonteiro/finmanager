// src/components/sections/ProductSearchInput.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Product } from "../../../../domain/entities/Product";
import { formatBRL } from "../../../../utils/formatCurrency";
import styles from "./productSearchInput.module.css";

interface ProductSearchInputProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  type: "sale" | "purchase";
  placeholder?: string;
}

export const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  products,
  onProductSelect,
  type,
  placeholder = "Buscar produto por nome ou código...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const ignoreBlurRef = useRef(false);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products.slice(0, 10);
    }

    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.toString().includes(searchTerm)
      )
      .slice(0, 10);
  }, [products, searchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
    setSelectedIndex(-1);
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setSearchTerm("");
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus(); // Volta o foco para o input
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || filteredProducts.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredProducts.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredProducts.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
          handleProductSelect(filteredProducts[selectedIndex]);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    if (ignoreBlurRef.current) {
      ignoreBlurRef.current = false;
      return;
    }

    if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleItemMouseDown = (product: Product) => {
    ignoreBlurRef.current = true;
    handleProductSelect(product);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.searchContainer}>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className={styles.searchInput}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
      />

      {isDropdownOpen && filteredProducts.length > 0 && (
        <div ref={dropdownRef} className={styles.dropdown}>
          <ul className={styles.dropdownList} role="listbox">
            {filteredProducts.map((product, index) => (
              <li
                key={product.id}
                role="option"
                aria-selected={index === selectedIndex}
                className={`${styles.dropdownItem} ${
                  index === selectedIndex ? styles.selected : ""
                }`}
                onMouseDown={() => handleItemMouseDown(product)} // Handle selection on mousedown
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{product.name}</span>
                  <span className={styles.productCode}>
                    Cód: {product.code}
                  </span>
                </div>
                <div className={styles.productDetails}>
                  <span className={styles.productPrice}>
                    {type === "purchase"
                      ? formatBRL(product.costPrice)
                      : formatBRL(product.salePrice)}
                  </span>
                  <span className={styles.productStock}>
                    {product.stock} uni
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isDropdownOpen && searchTerm && filteredProducts.length === 0 && (
        <div ref={dropdownRef} className={styles.dropdown}>
          <div className={styles.noResults}>
            Nenhum produto encontrado para "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
};
