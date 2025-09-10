import { Transaction } from "../entities/Transaction";
import type { ITransactionRepository } from "../interfaces/TransactionRepositoryInterface";

export class TransactionService {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async getId(id: string): Promise<Transaction> {
    try {
      const transaction = await this.transactionRepository.getById(id);

      if (!transaction) {
        throw new Error("Transaction not found!");
      }

      return transaction;
    } catch (error) {
      console.log("Error ao buscar transações, erro: " + error);
      throw new Error(`${error}`);
    }
  }

  async getAll(): Promise<Transaction[]> {
    try {
      const transactions = await this.transactionRepository.getAll();

      if (!transactions) {
        throw new Error("Transactions not found");
      }

      return transactions!;
    } catch (error) {
      console.log("Error ao buscar transações, erro: " + error);
      throw new Error(`${error}`);
    }
  }

  async update(transaction: Transaction) {
    try {
      await this.transactionRepository.update(transaction);
    } catch (error) {
      console.log("Error ao editar transações, erro: " + error);
      throw new Error(`${error}`);
    }
  }
}
