import { useState, useEffect, useCallback } from 'react';

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
    customText?: string;
    font?: string;
    instructions?: string;
    specialInstructions?: string;
    custom_images?: string[];
    uploaded_images?: any[];
    customizationImages?: any[];
    customizationInstructions?: string;
    [key: string]: any;
  };
  customizationCost?: number;
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

const CART_STORAGE_KEY = 'trynex_cart';

// Global cart state for instant updates across components
let globalCartState: CartItem[] = [];
let globalCartListeners: Array<(cart: CartItem[]) => void> = [];

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount and setup global listeners
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart && savedCart.trim() !== '') {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          globalCartState = parsedCart;
          setCart(parsedCart);
        } else {
          console.warn('Invalid cart data structure, clearing cart');
          localStorage.removeItem(CART_STORAGE_KEY);
          globalCartState = [];
          setCart([]);
        }
      } else {
        globalCartState = [];
        setCart([]);
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
      globalCartState = [];
      setCart([]);
    } finally {
      setIsLoaded(true);
    }

    // Subscribe to global cart changes
    const listener = (newCart: CartItem[]) => {
      setCart([...newCart]);
    };
    globalCartListeners.push(listener);

    // Cleanup listener on unmount
    return () => {
      globalCartListeners = globalCartListeners.filter(l => l !== listener);
    };
  }, []);

  // No longer needed - global state handles localStorage automatically

  const updateGlobalCart = useCallback((updater: (cart: CartItem[]) => CartItem[]) => {
    globalCartState = updater(globalCartState);

    // Save to localStorage immediately
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(globalCartState));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }

    // Notify all listeners
    globalCartListeners.forEach(listener => listener(globalCartState));
  }, []);

  const addToCart = useCallback((newItem: CartItem) => {
    updateGlobalCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => 
        item.id === newItem.id && 
        JSON.stringify(item.customization) === JSON.stringify(newItem.customization)
      );

      let updatedCart;
      if (existingItemIndex > -1) {
        // Update existing item quantity
        updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: (updatedCart[existingItemIndex].quantity || 0) + (newItem.quantity || 1)
        };
      } else {
        // Add new item with proper quantity and data
        const itemToAdd: CartItem = {
          ...newItem,
          quantity: newItem.quantity || 1,
          price: Number(newItem.price) || 0,
          image_url: newItem.image_url || newItem.image
        };
        updatedCart = [...prevCart, itemToAdd];
      }

      return updatedCart;
    });
  }, [updateGlobalCart]);

  const removeFromCart = useCallback((id: string) => {
    updateGlobalCart(prevCart => prevCart.filter(item => item.id !== id));
  }, [updateGlobalCart]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    updateGlobalCart(prevCart => {
      return prevCart.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      );
    });
  }, [updateGlobalCart, removeFromCart]);

  const clearCart = useCallback(() => {
    updateGlobalCart(() => []);
  }, [updateGlobalCart]);

  const refreshCart = useCallback(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          globalCartState = parsedCart;
          setCart([...parsedCart]);
        }
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  }, []);

  // Calculate totals with proper error handling
  const totalItems = cart.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    return sum + quantity;
  }, 0);

  const totalPrice = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return sum + (price * quantity);
  }, 0);

  // Cart state tracking silently
  useEffect(() => {
    // Cart updates handled silently
  }, [cart.length, totalPrice, isLoaded]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoaded,
    refreshCart
  };
}