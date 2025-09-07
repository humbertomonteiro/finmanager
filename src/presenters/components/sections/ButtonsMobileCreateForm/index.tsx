import styles from "./buttonsMobileCreateForm.module.css";
import { useState } from "react";
import { CreateProductForm } from "../CreateProductForm";
import { CreateTransactionForm } from "../CreateTransactionForm";

export function ButtonsMobileCreateForm() {
  const [showButtons, setShowButtons] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showCreateTransaction, setShowCreateTransaction] = useState(false);

  const handleShowCreateProduct = () => {
    setShowCreateProduct(false);
  };

  const handleShowCreateTransaction = () => {
    setShowCreateTransaction(false);
  };
  return (
    <div className={styles.container}>
      <button
        className={styles.mainButton}
        onClick={() => setShowButtons(!showButtons)}
      >
        +
      </button>
      {showButtons && (
        <div className={styles.buttons}>
          <button onClick={() => setShowCreateProduct(true)}>
            Cadastrar novo Produto
          </button>
          <button onClick={() => setShowCreateTransaction(true)}>
            Adicionar Transação
          </button>
        </div>
      )}
      {showCreateProduct && (
        <CreateProductForm onClose={handleShowCreateProduct} />
      )}
      {showCreateTransaction && (
        <CreateTransactionForm onClose={handleShowCreateTransaction} />
      )}
    </div>
  );
}
