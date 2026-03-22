// domain/usecases/ResetSystemUsecase.ts
import { ProductRepository } from "../../infrastructure/repositories/FirebaseProductRepository";
import { TransactionRepository } from "../../infrastructure/repositories/FirebaseTransactionRepository";

export type ResetType =
  | "full" // Apaga tudo (produtos + transações)
  | "transactions" // Apaga apenas transações
  | "transactions_keep_stock"; // Apaga transações mas mantém stock atual

export class ResetSystemUsecase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(resetType: ResetType): Promise<void> {
    try {
      switch (resetType) {
        case "full":
          await this.fullReset();
          break;
        case "transactions":
          await this.resetTransactionsAndStock();
          break;
        case "transactions_keep_stock":
          await this.resetTransactionsOnly();
          break;
        default:
          throw new Error("Invalid reset type");
      }
    } catch (error) {
      throw new Error(
        `Error resetting system: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Reset completo: apaga produtos e transações
  private async fullReset(): Promise<void> {
    const products = await this.productRepository.getAll();
    const transactions = await this.transactionRepository.getAll();

    // Apagar todas as transações
    for (const transaction of transactions) {
      if (transaction.id) {
        await this.transactionRepository.delete(transaction.id);
      }
    }

    // Apagar todos os produtos
    for (const product of products) {
      if (product.id) {
        await this.productRepository.delete(product.id);
      }
    }
  }

  // Apaga transações e zera stocks
  private async resetTransactionsAndStock(): Promise<void> {
    const products = await this.productRepository.getAll();
    const transactions = await this.transactionRepository.getAll();

    // Apagar todas as transações
    for (const transaction of transactions) {
      if (transaction.id) {
        await this.transactionRepository.delete(transaction.id);
      }
    }

    // Zerar o estoque de todos os produtos
    for (const product of products) {
      product.setStock(0);
      await this.productRepository.update(product);
    }
  }

  // Apaga apenas transações, mantém produtos com stock atual
  private async resetTransactionsOnly(): Promise<void> {
    const transactions = await this.transactionRepository.getAll();

    // Apagar todas as transações
    for (const transaction of transactions) {
      if (transaction.id) {
        await this.transactionRepository.delete(transaction.id);
      }
    }
  }
}
