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
import type { ICategoryRepository } from "../../domain/interfaces/CategoryRepositoryInterface";
import { Category, type CategoryProps } from "../../domain/entities/Category";

export class CategoryRepository implements ICategoryRepository {
  private readonly collectionName: string;
  constructor() {
    this.collectionName = "categories";
  }

  cleanObject<T extends Record<string, any>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null)
    ) as Partial<T>;
  }

  async save(caegory: Category) {
    try {
      const caegoryDTO = caegory.toDTO();

      const docRef = caegory.id
        ? doc(db, this.collectionName, caegory.id)
        : doc(collection(db, this.collectionName));

      const cleanedcaegory = this.cleanObject(caegoryDTO);

      await setDoc(docRef, cleanedcaegory, { merge: true });
      return docRef.id;
    } catch (error) {
      console.error("Erro ao criar caegory:", error);
      throw new Error("Error creating caegory");
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return this.mapCategoryData(data, docSnap.id);
    } catch (error) {
      console.log(`Erro ao buscar documento: ${id}, erro: ${error}`);
      throw new Error("Error fetching caegory");
    }
  }

  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return this.mapCategoryData(data, doc.id);
      });
    } catch (error) {
      console.log(`Erro so buscar caegorys, erro: ${error}`);
      throw new Error(`${error}`);
    }
  }

  async update(caegory: Category): Promise<void> {
    try {
      if (!caegory.id) throw new Error("Category ID is required for update");
      const caegoryDTO = caegory.toDTO();

      const docRef = doc(db, this.collectionName, caegory.id);

      const cleanedDTO = this.cleanObject(caegoryDTO);
      await updateDoc(docRef, cleanedDTO);
    } catch (error) {
      console.error(`Error updating caegory ${caegory.id}:`, error);
      throw new Error("Error updating caegory");
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting caegory ${id}:`, error);
      throw new Error("Error deleting caegory");
    }
  }

  private mapCategoryData(data: any, id: string): Category {
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date(data.createdAt ?? Date.now());

    const updatedAt =
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : new Date(data.updatedAt ?? Date.now());

    return new Category({
      ...data,
      id,
      createdAt,
      updatedAt,
    } as CategoryProps);
  }
}
