import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: any;
}

const CART_STORAGE_KEY = 'trynex-cart';

// Create a global cart state that persists across components
let globalCart: CartItem[] = [];
const cartListeners = new Set<(cart: CartItem[]) => void>();

const getStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored && stored !== 'undefined') {
      const parsedCart = JSON.parse(stored);
      return Array.isArray(parsedCart) ? parsedCart : [];
    }
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    localStorage.removeItem(CART_STORAGE_KEY);
  }
  return [];
};

const saveCartToStorage = (cart: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const updateGlobalCart = (newCart: CartItem[]): void => {
  globalCart = newCart;
  saveCartToStorage(newCart);
  cartListeners.forEach(listener => listener(newCart));
};

// Initialize global cart on first load
if (typeof window !== 'undefined' && globalCart.length === 0) {
  globalCart = getStoredCart();
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(globalCart);

  // Subscribe to cart changes
  useEffect(() => {
    const listener = (newCart: CartItem[]) => {
      setCart([...newCart]); // Force re-render with new array reference
    };
    cartListeners.add(listener);
    
    // Sync with current global state immediately
    setCart([...globalCart]);
    
    return () => {
      cartListeners.delete(listener);
    };
  }, []);

  // Additional effect to ensure cart is always in sync
  useEffect(() => {
    setCart([...globalCart]);
  }, [globalCart.length]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    const newCart = [...globalCart];
    const existingItem = newCart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newCart.push({ ...item, quantity: 1 });
    }
    
    updateGlobalCart(newCart);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const newCart = globalCart.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    
    updateGlobalCart(newCart);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const newCart = globalCart.filter(item => item.id !== id);
    updateGlobalCart(newCart);
  }, []);

  const clearCart = useCallback(() => {
    updateGlobalCart([]);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  };
}