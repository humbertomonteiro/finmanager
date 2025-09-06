import { Product } from "../entities/Product";
import type { IProductRepository } from "../interfaces/ProductReposiryInterface";

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async save(product: Product) {
    try {
      const productId = await this.productRepository.save(product);

      return productId;
    } catch (error) {
      console.log("Error ao salvar transação");
      throw new Error(`${error}`);
    }
  }

  async getId(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.getById(id);

      if (!product) {
        throw new Error("Product not found!");
      }

      return product;
    } catch (error) {
      console.log("Error ao buscar pordutos, erro: " + error);
      throw new Error(`${error}`);
    }
  }

  async getAll(): Promise<Product[]> {
    try {
      const products = await this.productRepository.getAll();

      if (!products) {
        throw new Error("Products not found");
      }

      return products;
    } catch (error) {
      console.log("Error ao buscar produtos, erro: " + error);
      throw new Error(`${error}`);
    }
  }

  async update(product: Product) {
    try {
      await this.productRepository.update(product);
    } catch (error) {
      console.log("Error ao editar produtos, erro: " + error);
      throw new Error(`${error}`);
    }
  }

  async delete(id: string) {
    try {
      await this.productRepository.delete(id);
    } catch (error) {
      console.log("Error ao deletar produtos, erro: " + error);
      throw new Error(`${error}`);
    }
  }
}
