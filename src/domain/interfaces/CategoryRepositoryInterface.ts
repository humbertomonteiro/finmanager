import { Category } from "../entities/Category";

export interface ICategoryRepository {
  save(category: Category): Promise<string>;
  getById(id: string): Promise<Category | null>;
  getAll(): Promise<Category[]>;
  update(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
}
