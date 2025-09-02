// ProductContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { ProductService } from "../../infrastructure/services/ProductService";
import { ProductRepository } from "../../infrastructure/repositories/FirebaseProductRepository";
import { Product } from "../../domain/entities/Product";

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

type ProductContextType = {
  products: Product[];
  fetchProducts: () => Promise<void>;
  createProduct: (product: Product) => Promise<string>;
};

export const ProductContext = createContext<ProductContextType | undefined>(
  undefined
);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const result = await productService.getAll();
      setProducts(result);
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const createProduct = async (product: Product) => {
    try {
      const productId = await productService.save(product);
      return productId;
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, fetchProducts, createProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context)
    throw new Error("useProduct must be used within a ProductProvider");
  return context;
};
