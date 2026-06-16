import { Product } from "../entities/Product";

export interface IProductRepository {
  save(product: Product): Promise<string>;
  getById(id: string): Promise<Product | null>;
  getAll(): Promise<Product[]>;
  update(product: Product): Promise<void>;
  updatePricesOnly(id: string, costPrice: number, salePrice: number): Promise<void>;
  delete(id: string): Promise<void>;
}
