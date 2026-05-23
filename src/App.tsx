import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./infrastructure/routes/RoutesApp";
import { ProductProvider } from "./presenters/contexts/ProductContext";
import { TransactionProvider } from "./presenters/contexts/TransactionContext";
import { CustomerProvider } from "./presenters/contexts/CustomerContext";

export default function App() {
  return (
    <BrowserRouter>
      <TransactionProvider>
        <ProductProvider>
          <CustomerProvider>
            <RoutesApp />
          </CustomerProvider>
        </ProductProvider>
      </TransactionProvider>
    </BrowserRouter>
  );
}
