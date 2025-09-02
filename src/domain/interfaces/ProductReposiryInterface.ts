import { Product } from "../entities/Product";

export interface IProductRepository {
  save(product: Product): Promise<string>;
  getById(id: string): Promise<Product | null>;
  getAll(): Promise<Product[]>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}
