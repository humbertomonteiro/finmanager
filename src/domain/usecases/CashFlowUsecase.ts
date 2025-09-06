import type { ITransactionRepository } from "../interfaces/TransactionRepositoryInterface";

export interface CashFlowMetrics {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}

export class CashFlowUsecase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async getMetrics(): Promise<CashFlowMetrics> {
    try {
      const transactions = await this.transactionRepository.getAll();
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const metrics = transactions.reduce(
        (acc, transaction) => {
          const transactionDate = new Date(transaction.date);
          const isCurrentMonth =
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear;

          if (transaction.type === "sale" || transaction.type === "aporte") {
            acc.totalRevenue += transaction.value;
            if (isCurrentMonth) {
              acc.monthlyRevenue += transaction.value;
            }
          } else if (transaction.type === "purchase") {
            acc.totalExpenses += transaction.value;
            if (isCurrentMonth) {
              acc.monthlyExpenses += transaction.value;
            }
          }

          return acc;
        },
        {
          totalRevenue: 0,
          totalExpenses: 0,
          balance: 0,
          monthlyRevenue: 0,
          monthlyExpenses: 0,
        }
      );

      metrics.balance = metrics.totalRevenue - metrics.totalExpenses;

      return metrics;
    } catch (error) {
      console.log("Erro ao calcular métricas de fluxo de caixa:", error);
      throw new Error(`${error}`);
    }
  }
}
