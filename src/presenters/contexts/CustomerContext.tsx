import React, { createContext, useContext, useState, useEffect } from "react";
import { CustomerService } from "../../domain/services/CustomerService";
import { CustomerRepository } from "../../infrastructure/repositories/FirebaseCustomerRepository";
import { Customer } from "../../domain/entities/Customer";

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

type CustomerContextType = {
  customers: Customer[];
  fetchCustomers: () => Promise<void>;
  createCustomer: (customer: Customer) => Promise<string>;
  updateCustomer: (customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
};

export const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async () => {
    try {
      const result = await customerService.getAll();
      setCustomers(result);
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const createCustomer = async (customer: Customer): Promise<string> => {
    try {
      const id = await customerService.save(customer);
      await fetchCustomers();
      return id;
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const updateCustomer = async (customer: Customer): Promise<void> => {
    try {
      await customerService.update(customer);
      await fetchCustomers();
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  const deleteCustomer = async (id: string): Promise<void> => {
    try {
      await customerService.delete(id);
      await fetchCustomers();
    } catch (error) {
      throw new Error(`${error}`);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <CustomerContext.Provider
      value={{ customers, fetchCustomers, createCustomer, updateCustomer, deleteCustomer }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) throw new Error("useCustomer must be used within a CustomerProvider");
  return context;
};
