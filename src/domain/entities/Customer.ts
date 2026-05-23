export interface CustomerProps {
  id?: string;
  name: string;
  phone?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Customer {
  private readonly props: CustomerProps;

  constructor(props: CustomerProps) {
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
    this.validate();
  }

  private validate() {
    if (!this.props.name || this.props.name.trim().length < 2) {
      throw new Error("Nome do cliente deve ter ao menos 2 caracteres.");
    }
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get phone() { return this.props.phone; }
  get notes() { return this.props.notes; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  public toDTO(): CustomerProps {
    return this.props;
  }
}
