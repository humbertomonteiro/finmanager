import React, { createContext, useContext, useState, useEffect } from "react";
import { ProductService } from "../../domain/services/ProductService";
import { ProductRepository } from "../../infrastructure/repositories/FirebaseProductRepository";
import { Product } from "../../domain/entities/Product";

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

type ProductContextType = {
  products: Product[];
  fetchProducts: () => Promise<void>;
  createProduct: (product: Product) => Promise<string>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
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
      fetchProducts();
      return productId;
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      const productId = await productService.update(product);
      fetchProducts();
      return productId;
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      fetchProducts();
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
      }}
    >
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
