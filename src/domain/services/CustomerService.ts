import { Customer } from "../entities/Customer";
import { ICustomerRepository } from "../interfaces/ICustomerRepository";

export class CustomerService {
  constructor(private readonly repo: ICustomerRepository) {}

  async getAll(): Promise<Customer[]> {
    return this.repo.getAll();
  }

  async getById(id: string): Promise<Customer | null> {
    return this.repo.getById(id);
  }

  async save(customer: Customer): Promise<string> {
    return this.repo.save(customer);
  }

  async update(customer: Customer): Promise<void> {
    return this.repo.update(customer);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
