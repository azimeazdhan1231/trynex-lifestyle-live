import { IStorage } from "./storage";
import type { Admin, Category, Offer, CustomOrder, InsertAdmin, InsertCategory, InsertOffer, InsertCustomOrder } from "@shared/schema";

export interface IAdminStorage extends IStorage {
  // Admin management
  getAdminByEmail(email: string): Promise<Admin | null>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Category management
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Offer management
  getOffers(): Promise<Offer[]>;
  createOffer(offer: InsertOffer): Promise<Offer>;
  updateOffer(id: string, updates: Partial<Offer>): Promise<Offer>;
  deleteOffer(id: string): Promise<void>;
  
  // Order status management
  updateOrderStatus(id: string, status: string): Promise<any>;
}