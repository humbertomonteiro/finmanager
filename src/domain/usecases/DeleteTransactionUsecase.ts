import { ProductRepository } from "../../infrastructure/repositories/FirebaseProductRepository";
import { TransactionRepository } from "../../infrastructure/repositories/FirebaseTransactionRepository";
import { Transaction } from "../entities/Transaction";

export class DeleteTransactionUsecase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async execute(transaction: Transaction) {
    try {
      const transactionId = transaction.id;
      if (!transactionId) {
        throw new Error("Transaction ID is required for deletion");
      }

      const { items, type } = transaction;

      if (
        type !== "purchase" &&
        type !== "payment" &&
        type !== "sale" &&
        type !== "service" &&
        type !== "aporte"
      ) {
        throw new Error(
          "Invalid transaction type. Must be: purchase, payment, sale, service or aporte"
        );
      }

      for (const item of items) {
        const product = await this.productRepository.getById(item.productId);

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        const quantityChange =
          type === "purchase" ? -item.quantity : item.quantity;
        const quantityCurrentStock = product.stock || 0;

        if (quantityChange > quantityCurrentStock && type === "purchase") {
          throw new Error(
            "Stock cannot be negative. Please verify the sales with the product(s) in the transaction."
          );
        }

        product.updateStock(quantityChange, "purchase");

        await this.productRepository.update(product);

        await this.productRepository.update(product);
      }

      return this.transactionRepository.delete(transactionId);
    } catch (error) {
      throw new Error(
        `Error deleting transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
