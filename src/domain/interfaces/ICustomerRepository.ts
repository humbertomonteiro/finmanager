import { Customer } from "../entities/Customer";

export interface ICustomerRepository {
  save(customer: Customer): Promise<string>;
  getById(id: string): Promise<Customer | null>;
  getAll(): Promise<Customer[]>;
  update(customer: Customer): Promise<void>;
  delete(id: string): Promise<void>;
}
