import { ProductRepository } from "../../infrastructure/repositories/FirebaseProductRepository";
import { TransactionRepository } from "../../infrastructure/repositories/FirebaseTransactionRepository";
import { Transaction } from "../entities/Transaction";

export class CreateTransactionUsecase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(transaction: Transaction) {
    try {
      const { items, type } = transaction;

      if (type !== "purchase" && type !== "sale" && type !== "aporte") {
        throw new Error(
          "Invalid transaction type. Must be: purchase, sale, or aporte"
        );
      }

      if (type === "aporte") {
        return this.transactionRepository.save(transaction);
      }

      for (const item of items) {
        const product = await this.productRepository.getById(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        product.updateStock(item.quantity, type);

        await this.productRepository.update(product);
      }

      return this.transactionRepository.save(transaction);
    } catch (error) {
      throw new Error(
        `Error creating transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
