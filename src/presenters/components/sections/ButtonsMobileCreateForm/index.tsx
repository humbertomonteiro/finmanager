import styles from "./buttonsMobileCreateForm.module.css";
import { useState } from "react";

interface ButtonMobileCreateFormProps {
  setActiveView: React.Dispatch<
    React.SetStateAction<
      | "dashboard"
      | "transactions"
      | "products"
      | "new-transaction"
      | "new-product"
    >
  >;
}

export function ButtonsMobileCreateForm({
  setActiveView,
}: ButtonMobileCreateFormProps) {
  const [showButtons, setShowButtons] = useState(false);

  const handleShowCreateProduct = () => {
    setActiveView("new-product");
  };

  const handleShowCreateTransaction = () => {
    setActiveView("new-transaction");
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
          <button onClick={handleShowCreateProduct}>
            Cadastrar novo Produto
          </button>
          <button onClick={handleShowCreateTransaction}>
            Adicionar Transação
          </button>
        </div>
      )}
    </div>
  );
}
