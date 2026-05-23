import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { Customer, type CustomerProps } from "../../domain/entities/Customer";
import type { ICustomerRepository } from "../../domain/interfaces/ICustomerRepository";

export class CustomerRepository implements ICustomerRepository {
  private readonly collectionName = "customers";

  cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    ) as Partial<T>;
  }

  async save(customer: Customer): Promise<string> {
    try {
      const dto = customer.toDTO();
      const docRef = customer.id
        ? doc(db, this.collectionName, customer.id)
        : doc(collection(db, this.collectionName));

      const cleaned = this.cleanObject({
        ...dto,
        createdAt: dto.createdAt ? dto.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: dto.updatedAt ? dto.updatedAt.toISOString() : new Date().toISOString(),
      });

      await setDoc(docRef, cleaned, { merge: true });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      throw new Error("Error saving customer");
    }
  }

  async getById(id: string): Promise<Customer | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return this.mapData(snap.data(), snap.id);
    } catch (error) {
      throw new Error(`Error fetching customer: ${error}`);
    }
  }

  async getAll(): Promise<Customer[]> {
    try {
      const snap = await getDocs(collection(db, this.collectionName));
      return snap.docs.map((d) => this.mapData(d.data(), d.id));
    } catch (error) {
      throw new Error(`Error fetching customers: ${error}`);
    }
  }

  async update(customer: Customer): Promise<void> {
    try {
      if (!customer.id) throw new Error("Customer ID is required for update");
      const dto = customer.toDTO();
      const docRef = doc(db, this.collectionName, customer.id);
      const cleaned = this.cleanObject({
        ...dto,
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(docRef, cleaned);
    } catch (error) {
      throw new Error(`Error updating customer: ${error}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      throw new Error(`Error deleting customer: ${error}`);
    }
  }

  private mapData(data: any, id: string): Customer {
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt ?? Date.now());

    const updatedAt =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(data.updatedAt ?? Date.now());

    return new Customer({
      ...data,
      id,
      createdAt,
      updatedAt,
    } as CustomerProps);
  }
}
