// src/presenters/components/sections/product/CreateProductForm/index.tsx
import React, { useState, useEffect } from "react";
import { useProduct } from "../../../../contexts/ProductContext";
import { Product } from "../../../../../domain/entities/Product";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { ActiveViewProps } from "../../../../pages/Dashboard";
import styles from "./createProductForm.module.css";
import { IoClose } from "react-icons/io5";
import { FaBox } from "react-icons/fa6";

interface Props {
  product?: Product;
  handleActiveView: (view: ActiveViewProps, data?: any) => void;
  onClose?: () => void;
}

function parseMoney(v: string): number {
  if (!v) return 0;
  let c = v.trim().replace(/R\$\s?/g, "");
  const dots = (c.match(/\./g) || []).length;
  const commas = (c.match(/,/g) || []).length;
  if (dots > 0 && commas > 0) {
    c = c.lastIndexOf(".") > c.lastIndexOf(",")
      ? c.replace(/\./g, "").replace(",", ".")
      : c.replace(/,/g, "");
  } else if (commas === 1 && c.split(",")[1]?.length <= 2) {
    c = c.replace(",", ".");
  } else if (commas > 1) {
    c = c.replace(/,/g, "");
  }
  return parseFloat(c) || 0;
}

export const CreateProductForm: React.FC<Props> = ({
  product,
  handleActiveView,
  onClose,
}) => {
  const { createProduct, updateProduct } = useProduct();

  const [name, setName]         = useState("");
  const [code, setCode]         = useState("");
  const [supplier, setSupplier] = useState("");
  const [description, setDesc]  = useState("");
  const [costPrice, setCost]    = useState("");
  const [salePrice, setSale]    = useState("");
  const [stock, setStock]       = useState("0");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCode(String(product.code || ""));
      setSupplier(product.supplier || "");
      setDesc(product.description || "");
      setCost(product.costPrice.toString());
      setSale(product.salePrice.toString());
      setStock(String(product.stock ?? 0));
    }
  }, [product]);

  const cost   = parseMoney(costPrice);
  const sale   = parseMoney(salePrice);
  const profit = sale - cost;
  const margin = cost > 0 ? ((profit / cost) * 100).toFixed(1) : null;
  const showProfit = cost > 0 && sale > 0;

  const handleClose = () => {
    onClose ? onClose() : handleActiveView("products");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!name.trim() || name.trim().length < 2) throw new Error("Nome deve ter ao menos 2 caracteres.");
      if (cost <= 0)  throw new Error("Preço de custo deve ser maior que zero.");
      if (sale <= 0)  throw new Error("Preço de venda deve ser maior que zero.");
      if (sale < cost) throw new Error("Preço de venda não pode ser menor que o preço de custo.");

      const stockNum = parseInt(stock) || 0;
      if (stockNum < 0) throw new Error("Estoque não pode ser negativo.");

      const newProduct = new Product({
        id: isEditing ? product!.id : undefined,
        name:        name.trim(),
        code:        parseInt(code) || 0,
        costPrice:   cost,
        salePrice:   sale,
        supplier:    supplier.trim() || null,
        description: description.trim() || undefined,
        stock:       stockNum,
      });

      if (isEditing) {
        await updateProduct(newProduct);
      } else {
        await createProduct(newProduct);
      }

      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <FaBox />
          </div>
          <div>
            <div className={styles.title}>{isEditing ? "Editar Produto" : "Novo Produto"}</div>
            <div className={styles.sub}>{isEditing ? "Atualize as informações" : "Preencha os dados do produto"}</div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={handleClose}>
          <IoClose />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Identity */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Identificação</div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nome do produto *</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Ex: Refrigerante 2L"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Código</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Gerado automaticamente"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Fornecedor</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Nome do fornecedor"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Descrição</label>
            <textarea
              className={styles.textarea}
              placeholder="Descrição opcional do produto..."
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Prices */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Preços e Estoque</div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Preço de custo (R$) *</label>
              <input
                className={styles.input}
                type="text"
                placeholder="0,00"
                value={costPrice}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Preço de venda (R$) *</label>
              <input
                className={styles.input}
                type="text"
                placeholder="0,00"
                value={salePrice}
                onChange={(e) => setSale(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Profit preview */}
          {showProfit && (
            <div className={`${styles.profitBox} ${profit < 0 ? styles.profitNeg : ""}`}>
              <div className={styles.profitItem}>
                <span className={styles.profitLabel}>Lucro unitário</span>
                <span className={`${styles.profitValue} ${profit < 0 ? styles.profitValNeg : ""}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
              <div className={styles.profitDivider} />
              <div className={styles.profitItem}>
                <span className={styles.profitLabel}>Margem</span>
                <span className={`${styles.profitValue} ${profit < 0 ? styles.profitValNeg : ""}`}>
                  {margin}%
                </span>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Estoque inicial</label>
            <input
              className={styles.input}
              type="number"
              placeholder="0"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>
        </div>

        {/* Error */}
        {error && <div className={styles.error}>{error}</div>}

        {/* Actions */}
        <div className={styles.actions}>
          <button type="button" className={styles.btnCancel} onClick={handleClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? "Salvando…" : isEditing ? "Atualizar Produto" : "Salvar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
};
