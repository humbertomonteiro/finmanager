// domain/usecases/AdjustStockUsecase.ts
import { ProductRepository } from "../../infrastructure/repositories/FirebaseProductRepository";
import { TransactionRepository } from "../../infrastructure/repositories/FirebaseTransactionRepository";
import { Transaction } from "../entities/Transaction";

export interface StockAdjustment {
  productId: string;
  newStock: number;
  reason?: string;
}

export class AdjustStockUsecase {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  async execute(adjustment: StockAdjustment): Promise<void> {
    try {
      const product = await this.productRepository.getById(
        adjustment.productId
      );

      if (!product) {
        throw new Error("Product not found");
      }

      const oldStock = product.stock || 0;

      // Atualizar o estoque usando o método setStock
      product.setStock(adjustment.newStock);
      await this.productRepository.update(product);

      // Criar uma transação de ajuste (tipo especial que não afeta o caixa)
      const adjustmentTransaction = new Transaction({
        type: "adjustment" as any, // Vamos adicionar esse tipo
        description: `Ajuste de estoque: ${product.name}. ${
          adjustment.reason ? `Motivo: ${adjustment.reason}` : ""
        }. Estoque anterior: ${oldStock}, Novo estoque: ${adjustment.newStock}`,
        value: 0, // Não afeta o caixa
        items: [
          {
            productId: product.id!,
            name: product.name,
            quantity: adjustment.newStock - oldStock,
            unitPrice: 0,
          },
        ],
        discount: 0,
      });

      await this.transactionRepository.save(adjustmentTransaction);
    } catch (error) {
      throw new Error(
        `Error adjusting stock: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  // Ajuste em lote
  async executeBatch(adjustments: StockAdjustment[]): Promise<void> {
    try {
      for (const adjustment of adjustments) {
        await this.execute(adjustment);
      }
    } catch (error) {
      throw new Error(
        `Error in batch stock adjustment: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
