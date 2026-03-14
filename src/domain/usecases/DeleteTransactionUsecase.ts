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
      const { items, type } = transaction;

      // Reverter estoque para vendas (normal e fiado) e compras
      if (
        (type === "sale" || type === "credit_sale" || type === "purchase") &&
        items.length > 0
      ) {
        for (const item of items) {
          const product = await this.productRepository.getById(item.productId);

          if (!product) continue;

          // Reverter: venda devolve ao estoque, compra retira do estoque
          if (type === "sale" || type === "credit_sale") {
            product.updateStock(item.quantity, "purchase");
          } else {
            product.updateStock(item.quantity, "sale");
          }

          await this.productRepository.update(product);
        }
      }

      await this.transactionRepository.delete(transaction.id!);
    } catch (error) {
      throw new Error(
        `Error deleting transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
