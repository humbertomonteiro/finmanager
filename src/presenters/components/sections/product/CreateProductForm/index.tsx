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

// Funções auxiliares para manipulação de valores monetários
const parseMoneyInput = (value: string): number => {
  if (!value) return 0;
  
  // Remove espaços em branco
  let cleaned = value.trim();
  
  // Remove o símbolo R$ se existir
  cleaned = cleaned.replace(/R\$\s?/g, '');
  
  // Conta quantos pontos e vírgulas existem
  const dotCount = (cleaned.match(/\./g) || []).length;
  const commaCount = (cleaned.match(/,/g) || []).length;
  
  // Se tem vírgula e ponto, determina qual é o separador decimal
  if (dotCount > 0 && commaCount > 0) {
    // Se o ponto vem depois da vírgula, vírgula é separador de milhares
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    
    if (lastDot > lastComma) {
      // Formato: 1.234,56 -> remove pontos (milhares) e troca vírgula por ponto
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Formato: 1,234.56 -> remove vírgulas (milhares)
      cleaned = cleaned.replace(/,/g, '');
    }
  } else if (commaCount > 0) {
    // Só tem vírgulas
    if (commaCount === 1) {
      // Pode ser decimal brasileiro (10,50) ou milhares americano (1,234)
      const parts = cleaned.split(',');
      if (parts[1] && parts[1].length <= 2) {
        // Provavelmente decimal brasileiro
        cleaned = cleaned.replace(',', '.');
      } else {
        // Provavelmente separador de milhares
        cleaned = cleaned.replace(/,/g, '');
      }
    } else {
      // Múltiplas vírgulas = separador de milhares
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  // Se só tem pontos, mantém como está (formato americano padrão)
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const formatMoneyDisplay = (value: number | ""): string => {
  if (value === "") return "";
  return value.toString();
};

export const CreateProductForm: React.FC<CreateProductFormProps> = ({
  product,
  handleActiveView,
}) => {
  const { createProduct, updateProduct } = useProduct();

  const [name, setName] = useState("");
  const [code, setCode] = useState<number | "">("");
  const [costPrice, setCostPrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [supplier, setSupplier] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCode(product.code);
      setCostPrice(product.costPrice.toString());
      setSalePrice(product.salePrice.toString());
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
        costPrice: parseMoneyInput(costPrice),
        salePrice: parseMoneyInput(salePrice),
        supplier: supplier || null,
        stock: isEditing ? product.stock : 0,
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
    const cost = parseMoneyInput(costPrice);
    const sale = parseMoneyInput(salePrice);
    
    if (cost && sale) {
      const profit = sale - cost;
      const margin = cost > 0 ? (profit / cost) * 100 : 0;
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
                type="text"
                id="costPrice"
                placeholder="0,00 ou 0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="salePrice" className={styles.label}>
                Preço de Venda (R$) *
              </label>
              <input
                type="text"
                id="salePrice"
                placeholder="0,00 ou 0.00"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
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
                    R$ {profit.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className={styles.profitRow}>
                  <span className={styles.profitLabel}>Margem:</span>
                  <span
                    className={
                      margin >= 0 ? styles.profitValue : styles.lossValue
                    }
                  >
                    {margin.toFixed(1).replace('.', ',')}%
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