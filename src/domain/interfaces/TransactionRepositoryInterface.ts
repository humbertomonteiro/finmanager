import { Transaction } from "../entities/Transaction";

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<string>;
  getById(id: string): Promise<Transaction | null>;
  getAll(): Promise<Transaction[] | undefined>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
