import { useState, useEffect, useCallback, useRef } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  quantity: number;
  customization?: {
    color?: string;
    size?: string;
    text?: string;
    font?: string;
    instructions?: string;
    custom_images?: string[];
    uploaded_images?: string[];
    [key: string]: any;
  };
}

interface UseCartReturn {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoaded: boolean;
  refreshCart: () => void;
}

const CART_STORAGE_KEY = 'trynex_cart_v2';

// Global cart state with bulletproof synchronization
class CartManager {
  private static instance: CartManager;
  private cart: CartItem[] = [];
  private listeners: Array<(cart: CartItem[]) => void> = [];
  private isInitialized = false;

  static getInstance(): CartManager {
    if (!CartManager.instance) {
      CartManager.instance = new CartManager();
    }
    return CartManager.instance;
  }

  private constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart && savedCart.trim() !== '') {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          this.cart = parsedCart.map(item => ({
            ...item,
            quantity: Math.max(1, Number(item.quantity) || 1),
            price: Number(item.price) || 0
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
      this.cart = [];
    }
    this.isInitialized = true;
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cart));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.cart]);
      } catch (error) {
        console.error('Error notifying cart listener:', error);
      }
    });
  }

  addListener(listener: (cart: CartItem[]) => void): () => void {
    this.listeners.push(listener);
    
    // Immediately notify new listener of current state
    if (this.isInitialized) {
      listener([...this.cart]);
    }
    
    // Return cleanup function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getCart(): CartItem[] {
    return [...this.cart];
  }

  addItem(newItem: CartItem): void {
    const existingItemIndex = this.cart.findIndex(item => 
      item.id === newItem.id && 
      JSON.stringify(item.customization || {}) === JSON.stringify(newItem.customization || {})
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      this.cart[existingItemIndex] = {
        ...this.cart[existingItemIndex],
        quantity: (this.cart[existingItemIndex].quantity || 0) + (newItem.quantity || 1)
      };
    } else {
      // Add new item
      const itemToAdd: CartItem = {
        id: newItem.id,
        name: newItem.name,
        price: Number(newItem.price) || 0,
        quantity: Math.max(1, Number(newItem.quantity) || 1),
        image_url: newItem.image_url || newItem.image,
        customization: newItem.customization
      };
      this.cart.push(itemToAdd);
    }

    this.saveToStorage();
    this.notifyListeners();
  }

  removeItem(id: string): void {
    this.cart = this.cart.filter(item => item.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  updateItemQuantity(id: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }

    const itemIndex = this.cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
      this.cart[itemIndex] = {
        ...this.cart[itemIndex],
        quantity: Math.max(1, Number(quantity))
      };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  clearCart(): void {
    this.cart = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  getTotalItems(): number {
    return this.cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  }

  getTotalPrice(): number {
    return this.cart.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  }

  refresh(): void {
    this.loadFromStorage();
    this.notifyListeners();
  }
}

const cartManager = CartManager.getInstance();

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to cart changes
    const cleanup = cartManager.addListener((newCart) => {
      setCart(newCart);
      if (!isLoaded) {
        setIsLoaded(true);
      }
    });
    
    cleanupRef.current = cleanup;
    
    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [isLoaded]);

  const addToCart = useCallback((item: CartItem) => {
    cartManager.addItem(item);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    cartManager.removeItem(id);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    cartManager.updateItemQuantity(id, quantity);
  }, []);

  const clearCart = useCallback(() => {
    cartManager.clearCart();
  }, []);

  const refreshCart = useCallback(() => {
    cartManager.refresh();
  }, []);

  const totalItems = cartManager.getTotalItems();
  const totalPrice = cartManager.getTotalPrice();

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoaded,
    refreshCart,
  };
}