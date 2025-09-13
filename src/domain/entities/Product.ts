export interface ProductProps {
  id?: string;
  name: string;
  code: number;
  costPrice: number;
  salePrice: number;
  lastSalePrice?: number;
  supplier: string | null;
  description?: string;
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private readonly props: ProductProps;

  constructor(props: ProductProps) {
    this.props = {
      ...props,
      code: props.code || this.generateCode(),
      stock: props.stock || 0,
      supplier: props.supplier || "Desconhecido",
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

    if (this.stock && this.stock < 0) {
      throw new Error("Stock cannot be negative.");
    }
  }

  private generateCode() {
    const randomNum = Math.floor(Math.random() * 100000) + 1;
    const formattedCode = randomNum.toString().padStart(6, "0");
    return parseInt(formattedCode, 10);
  }

  public updateStock(amount: number, type: "purchase" | "sale") {
    if (type === "purchase") {
      this.props.stock = (this.props.stock || 0) + amount;
    } else if (type === "sale") {
      const currentStock = this.props.stock || 0;
      if (currentStock < amount) {
        throw new Error(
          `Larger quantity than is in stock, product: ${this.props.name}, stock = ${this.props.stock}`
        );
      }
      this.props.stock = currentStock - amount;
    }

    this.props.updatedAt = new Date();
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
  get stock() {
    return this.props.stock;
  }
  get supplier() {
    return this.props.supplier;
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
