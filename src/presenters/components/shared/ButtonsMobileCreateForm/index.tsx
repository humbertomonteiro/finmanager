import styles from "./buttonsMobileCreateForm.module.css";
import { useState } from "react";
import { FaPlus, FaMinus, FaBox } from "react-icons/fa6";
import { GrTransaction } from "react-icons/gr";

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
    setShowButtons(false);
    setActiveView("new-product");
  };

  const handleShowCreateTransaction = () => {
    setShowButtons(false);
    setActiveView("new-transaction");
  };
  return (
    <div className={styles.container}>
      <button
        className={styles.mainButton}
        onClick={() => setShowButtons(!showButtons)}
      >
        {showButtons ? <FaMinus /> : <FaPlus />}
      </button>
      {showButtons && (
        <div className={styles.buttons}>
          <button onClick={handleShowCreateProduct}>
            Cadastrar novo Produto
            <FaBox />
          </button>
          <button onClick={handleShowCreateTransaction}>
            Adicionar Transação
            <GrTransaction />
          </button>
        </div>
      )}
    </div>
  );
}
