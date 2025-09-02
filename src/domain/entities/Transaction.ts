export type TransactionType = "sale" | "purchase" | "aporte";

export interface TransactionItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface TransactionProps {
  id?: string;
  type: TransactionType;
  description?: string;
  value: number;
  date: Date;
  items: TransactionItem[];
  discount?: number;
}

export class Transaction {
  private readonly props: TransactionProps;

  constructor(props: TransactionProps) {
    this.props = {
      ...props,
      date: props.date || new Date(),
    };

    this.validate();
  }

  private validate() {
    if (this.props.value <= 0) {
      throw new Error("Value must be greater than 0");
    }

    if (!["sale", "purchase", "aporte"].includes(this.props.type)) {
      throw new Error("Invalid transaction type. ");
    }

    if (this.props.items.length <= 0) {
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
  get date() {
    return this.props.date;
  }
  get items() {
    return this.props.items || [];
  }
  get discount() {
    return this.props.discount;
  }

  public toDTO(): TransactionProps {
    return this.props;
  }
}
