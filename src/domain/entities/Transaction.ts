export type TransactionType =
  | "sale"
  | "purchase"
  | "aporte"
  | "service"
  | "payment"
  | "credit_sale"
  | "credit_service"
  | "adjustment";

export interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface TransactionProps {
  id?: string;
  type: TransactionType;
  description?: string;
  value: number;
  items?: TransactionItem[];
  discount?: number;
  date?: Date;
  updatedAt?: Date;
  // Campos para venda fiado
  customerName?: string;
  isPaid?: boolean;
  paidAt?: Date;
}

export class Transaction {
  private readonly props: TransactionProps;

  constructor(props: TransactionProps) {
    this.props = {
      ...props,
      date: props.date || new Date(),
      updatedAt: props.updatedAt || new Date(),
      isPaid:
        props.type === "credit_sale" || props.type === "credit_service"
          ? props.isPaid ?? false
          : true,
    };
    this.validate();
  }

  private validate() {
    if (this.props.type !== "adjustment" && this.props.value <= 0) {
      throw new Error("Value must be greater than 0");
    }

    if (
      ![
        "sale",
        "purchase",
        "aporte",
        "service",
        "payment",
        "credit_service",
        "credit_sale",
        "adjustment",
      ].includes(this.props.type)
    ) {
      throw new Error("Invalid transaction type. ");
    }

    if (
      this.props.type === "credit_sale" &&
      (!this.props.customerName || this.props.customerName.trim().length < 2)
    ) {
      throw new Error("Nome do cliente é obrigatório para venda fiado.");
    }

    if (
      this.props.type === "credit_service" &&
      (!this.props.description || this.props.description.trim().length < 3)
    ) {
      throw new Error("Descrição do serviço é obrigatória.");
    }

    if (
      (this.props.type === "sale" || this.props.type === "credit_sale") &&
      this.props.items &&
      this.props.items.length <= 0
    ) {
      throw new Error("Transaction items cannot be empty");
    }

    if (
      (this.props.type === "sale" || this.props.type === "credit_sale") &&
      (!this.props.items || this.props.items.length === 0)
    ) {
      throw new Error("Transaction items cannot be empty");
    }
  }

  get id() {
    return this.props.id;
  }
  get type() {
    return this.props.type;
  }
  get value() {
    return this.props.value;
  }
  get description() {
    return this.props.description;
  }
  get items() {
    return this.props.items || [];
  }
  get discount() {
    return this.props.discount;
  }
  get date() {
    return this.props.date;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get customerName() {
    return this.props.customerName;
  }
  get isPaid() {
    return this.props.isPaid;
  }
  get paidAt() {
    return this.props.paidAt;
  }

  public markAsPaid() {
    if (
      this.props.type !== "credit_sale" &&
      this.props.type !== "credit_service"
    ) {
      throw new Error("Apenas vendas fiado podem ser marcadas como pagas.");
    }
    this.props.isPaid = true;
    this.props.paidAt = new Date();
    this.props.updatedAt = new Date();
  }

  public toDTO(): TransactionProps {
    return this.props;
  }
}
