export interface ProductProps {
  id?: string;
  name: string;
  code: number;
  costPrice: number;
  salePrice: number;
  lastSalePrice?: number;
  supplier: string | null;
  description?: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private readonly props: ProductProps;

  constructor(props: ProductProps) {
    this.props = {
      ...props,
      supplier: props.supplier || null,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };

    this.validate();
  }

  private validate() {
    if (this.name.length <= 1) {
      throw new Error("Name must be more than 2 characters.");
    }

    if (this.costPrice <= 0) {
      throw new Error("Cost price must be greater than 0.");
    }

    if (this.salePrice <= 0) {
      throw new Error("Sale price must be greater than 0.");
    }

    if (this.salePrice < this.costPrice) {
      throw new Error("Sale price cannot be less than cost price.");
    }

    if (!this.code || this.code <= 0 || this.code.toString().length < 2) {
      throw new Error(
        "Code cannot be empty, negative, and must have at least 2 digits."
      );
    }
  }

  public updateQuantity(amount: number) {
    if (amount < 0) throw new Error("Quantity cannot be negative.");
    this.props.quantity = amount;
  }

  public changeSalePrice(newPrice: number) {
    if (newPrice <= 0) throw new Error("Sale price must be greater than 0.");
    this.props.lastSalePrice = this.props.salePrice;
    this.props.salePrice = newPrice;
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get code() {
    return this.props.code;
  }
  get costPrice() {
    return this.props.costPrice;
  }
  get salePrice() {
    return this.props.salePrice;
  }
  get lastSalePrice() {
    return this.props.lastSalePrice;
  }
  get description() {
    return this.props.description;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updateAt() {
    return this.props.updatedAt;
  }

  public toDTO(): ProductProps {
    return this.props;
  }
}
