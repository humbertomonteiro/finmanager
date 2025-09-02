import { BrowserRouter } from "react-router-dom";
import RoutesApp from "./infrastructure/routes/RoutesApp";
import { ProductProvider } from "./presenters/contexts/ProductContext";

export default function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <RoutesApp />
      </ProductProvider>
    </BrowserRouter>
  );
}
