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
import { db } from "../../infrastructure/config/firebaseConfig";
import type { ITransactionRepository } from "../../domain/interfaces/TransactionRepositoryInterface";
import {
  Transaction,
  type TransactionProps,
} from "../../domain/entities/Transaction";

export class TransactionRepository implements ITransactionRepository {
  private readonly collectionName: string;
  constructor() {
    this.collectionName = "transactions";
  }

  cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    ) as Partial<T>;
  }

  async save(transaction: Transaction) {
    try {
      const transactionDTO = transaction.toDTO();

      const docRef = transaction.id
        ? doc(db, this.collectionName, transaction.id)
        : doc(collection(db, this.collectionName));

      const cleanedTransaction = this.cleanObject(transactionDTO);

      await setDoc(docRef, cleanedTransaction, { merge: true });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar transaction:", error);
      throw new Error("Error creating transaction");
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return this.mapTransactionData(data, docSnap.id);
    } catch (error) {
      console.log(`Erro ao buscar documento: ${id}, erro: ${error}`);
      throw new Error("Error fetching transaction");
    }
  }

  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return this.mapTransactionData(data, doc.id);
      });
    } catch (error) {
      console.log(`Erro so buscar transactions, erro: ${error}`);
      throw new Error(`${error}`);
    }
  }

  async update(transaction: Transaction): Promise<void> {
    try {
      if (!transaction.id)
        throw new Error("Transaction ID is required for update");
      const transactionDTO = transaction.toDTO();

      const docRef = doc(db, this.collectionName, transaction.id);

      const cleanedDTO = this.cleanObject(transactionDTO);
      await updateDoc(docRef, cleanedDTO);
    } catch (error) {
      console.error(`Error updating transaction ${transaction.id}:`, error);
      throw new Error("Error updating transaction");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting transaction ${id}:`, error);
      throw new Error("Error deleting transaction");
    }
  }

  private mapTransactionData(data: any, id: string): Transaction {
    const date =
      data.date instanceof Timestamp
        ? data.date.toDate()
        : new Date(data.date ?? Date.now());
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt ?? Date.now());

    const updatedAt =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(data.updatedAt ?? Date.now());

    return new Transaction({
      ...data,
      id,
      date,
      createdAt,
      updatedAt,
    } as TransactionProps);
  }
}
