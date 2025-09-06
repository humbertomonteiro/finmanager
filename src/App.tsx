import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./infrastructure/routes/RoutesApp";
import { ProductProvider } from "./presenters/contexts/ProductContext";
import { TransactionProvider } from "./presenters/contexts/TransactionContext";

export default function App() {
  return (
    <BrowserRouter>
      <TransactionProvider>
        <ProductProvider>
          <RoutesApp />
        </ProductProvider>
      </TransactionProvider>
    </BrowserRouter>
  );
}
