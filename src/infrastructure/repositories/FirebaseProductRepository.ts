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
import { Product, type ProductProps } from "../../domain/entities/Product";
import type { IProductRepository } from "../../domain/interfaces/ProductReposiryInterface";

export class ProductRepository implements IProductRepository {
  private readonly collectionName: string;
  constructor() {
    this.collectionName = "products";
  }

  cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    ) as Partial<T>;
  }

  async save(product: Product) {
    try {
      const productDTO = product.toDTO();

      const docRef = product.id
        ? doc(db, this.collectionName, product.id)
        : doc(collection(db, this.collectionName));

      const cleanedDTO = this.cleanObject(productDTO);
      await setDoc(docRef, cleanedDTO, { merge: true });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      throw new Error("Error creating produto");
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return this.mapProductData(data, docSnap.id);
    } catch (error) {
      console.log(`Erro ao buscar documento: ${id}, erro: ${error}`);
      throw new Error("Error fetching product");
    }
  }

  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return this.mapProductData(data, doc.id);
      });
    } catch (error) {
      console.log(`Erro so buscar produtos, erro: ${error}`);
      throw new Error(`${error}`);
    }
  }

  async update(product: Product): Promise<void> {
    try {
      if (!product.id) throw new Error("Product ID is required for update");
      const productDTO = product.toDTO();

      const docRef = doc(db, this.collectionName, product.id);

      const cleanedDTO = this.cleanObject(productDTO);
      await updateDoc(docRef, cleanedDTO);
    } catch (error) {
      console.error(`Error updating product ${product.id}:`, error);
      throw new Error("Error updating product");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw new Error("Error deleting product");
    }
  }

  private mapProductData(data: any, id: string): Product {
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt ?? Date.now());

    const updatedAt =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(data.updatedAt ?? Date.now());

    return new Product({
      ...data,
      id,
      createdAt,
      updatedAt,
    } as ProductProps);
  }
}
