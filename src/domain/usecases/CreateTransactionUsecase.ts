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

      const validTypes = [
        "purchase",
        "sale",
        "aporte",
        "service",
        "payment",
        "credit_sale",
      ];
      if (!validTypes.includes(type)) {
        throw new Error(
          "Invalid transaction type. Must be: purchase, payment, sale, service, aporte or credit_sale"
        );
      }

      if (type === "aporte" || type === "service" || type === "payment") {
        return this.transactionRepository.save(transaction);
      }

      // Venda normal e venda fiado: ambas descontam o estoque
      if (type === "sale" || type === "credit_sale" || type === "purchase") {
        for (const item of items) {
          const product = await this.productRepository.getById(item.productId);

          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }

          // Para compra aumenta, para venda (normal ou fiado) diminui
          product.updateStock(
            item.quantity,
            type === "purchase" ? "purchase" : "sale"
          );

          await this.productRepository.update(product);
        }
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
