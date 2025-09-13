// src/components/sections/CreateProductForm.tsx
import React, { useState, useEffect } from "react";
import { useProduct } from "../../../../contexts/ProductContext";
import { Product } from "../../../../../domain/entities/Product";
import styles from "./createProductForm.module.css";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import { FaBox } from "react-icons/fa6";

interface CreateProductFormProps {
  product?: Product;
  handleActiveView: (activeView: ActiveViewProps, dataEditing?: any) => void;
}

export const CreateProductForm: React.FC<CreateProductFormProps> = ({
  product,
  handleActiveView,
}) => {
  const { createProduct, updateProduct } = useProduct();

  const [name, setName] = useState("");
  const [code, setCode] = useState<number | "">("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [salePrice, setSalePrice] = useState<number | "">("");
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCode(product.code);
      setCostPrice(product.costPrice);
      setSalePrice(product.salePrice);
      setSupplier(product.supplier || "");
      setDescription(product.description || "");
    } else {
      setName("");
      setCode("");
      setCostPrice("");
      setSalePrice("");
      setSupplier("");
      setDescription("");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const productData = new Product({
        id: isEditing ? product.id : undefined,
        name,
        code: Number(code),
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        supplier: supplier || null,
        description: description || undefined,
      });

      if (isEditing) {
        await updateProduct(productData);
      } else {
        await createProduct(productData);
      }
      handleActiveView("products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = () => {
    if (costPrice && salePrice) {
      const profit = Number(salePrice) - Number(costPrice);
      const margin =
        Number(costPrice) > 0 ? (profit / Number(costPrice)) * 100 : 0;
      return { profit, margin };
    }
    return { profit: 0, margin: 0 };
  };

  const { profit, margin } = calculateProfit();

  return (
    <div className={styles.overlay}>
      <div className={styles.formContainer}>
        <div className={styles.formHeader}>
          <h2 className={styles.formTitle}>
            <FaBox />
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Nome do Produto *
              </label>
              <input
                type="text"
                id="name"
                placeholder="Ex: Notebook Dell Inspiron"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="costPrice" className={styles.label}>
                Preço de Custo (R$) *
              </label>
              <input
                type="number"
                id="costPrice"
                placeholder="0,00"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) =>
                  setCostPrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="salePrice" className={styles.label}>
                Preço de Venda (R$) *
              </label>
              <input
                type="number"
                id="salePrice"
                placeholder="0,00"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={(e) =>
                  setSalePrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="supplier" className={styles.label}>
                Fornecedor
              </label>
              <input
                type="text"
                id="supplier"
                placeholder="Ex: Fornecedor XYZ"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className={styles.input}
              />
            </div>

            {costPrice && salePrice && (
              <div className={styles.profitSummary}>
                <div className={styles.profitRow}>
                  <span className={styles.profitLabel}>Lucro:</span>
                  <span
                    className={
                      profit >= 0 ? styles.profitValue : styles.lossValue
                    }
                  >
                    R$ {profit.toFixed(2)}
                  </span>
                </div>
                <div className={styles.profitRow}>
                  <span className={styles.profitLabel}>Margem:</span>
                  <span
                    className={
                      margin >= 0 ? styles.profitValue : styles.lossValue
                    }
                  >
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            <div className={styles.formGroupFull}>
              <label htmlFor="description" className={styles.label}>
                Descrição
              </label>
              <textarea
                id="description"
                placeholder="Descrição detalhada do produto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
                rows={4}
              />
            </div>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.formActions}>
            <button
              onClick={() => handleActiveView("products")}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? "Salvando..."
                : isEditing
                ? "Atualizar Produto"
                : "Criar Produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
