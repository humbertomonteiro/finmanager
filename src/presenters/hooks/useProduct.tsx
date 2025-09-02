import { useContext } from "react";
import { ProductContext } from "../contexts/ProductContext";

export default function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("productUser deve ser usado dentro de um ProductProvider");
  }
  return context;
}
