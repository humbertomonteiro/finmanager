export interface CategoryProps {
  id?: string;
  name: string;
  code?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Category {
  constructor(private readonly props: CategoryProps) {
    this.props = {
      ...props,
      code: props.code || this.generateCode(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  private generateCode() {
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    const formattedCode = randomNum.toString().padStart(4, "0");
    return parseInt(formattedCode, 10);
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
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }

  toDTO() {
    return this.props;
  }
}
