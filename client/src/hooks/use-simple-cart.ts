import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  image?: string;
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

const CART_STORAGE_KEY = 'ecommerce-cart';

// Global cart state to ensure synchronization across components
let globalCart: CartItem[] = [];
const cartListeners: ((cart: CartItem[]) => void)[] = [];

// Load initial cart from localStorage
try {
  const savedCart = localStorage.getItem(CART_STORAGE_KEY);
  if (savedCart) {
    const parsedCart = JSON.parse(savedCart);
    if (Array.isArray(parsedCart)) {
      globalCart = parsedCart;
    }
  }
} catch (error) {
  console.error('Error loading cart from localStorage:', error);
  globalCart = [];
}

// Save to localStorage whenever cart changes
const saveToLocalStorage = (cart: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

// Notify all listeners when cart changes
const notifyListeners = (cart: CartItem[]) => {
  cartListeners.forEach(listener => listener(cart));
};

// Update global cart and notify all listeners
const updateGlobalCart = (updater: (cart: CartItem[]) => CartItem[]) => {
  globalCart = updater(globalCart);
  saveToLocalStorage(globalCart);
  notifyListeners(globalCart);
};

export function useSimpleCart() {
  const [cart, setCart] = useState<CartItem[]>(globalCart);

  // Subscribe to global cart changes
  useEffect(() => {
    const listener = (newCart: CartItem[]) => {
      setCart(newCart);
    };
    cartListeners.push(listener);

    // Set initial state
    setCart(globalCart);

    return () => {
      const index = cartListeners.indexOf(listener);
      if (index > -1) {
        cartListeners.splice(index, 1);
      }
    };
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    console.log('🛒 Adding item to cart:', item);
    updateGlobalCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(cartItem =>
        cartItem.id === item.id &&
        JSON.stringify(cartItem.customization || {}) === JSON.stringify(item.customization || {})
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + (item.quantity || 1)
        };
        console.log('🛒 Updated existing item, new cart:', updatedCart);
        return updatedCart;
      } else {
        // Add new item
        const newCart = [...prevCart, { ...item, quantity: item.quantity || 1 }];
        console.log('🛒 Added new item, new cart:', newCart);
        return newCart;
      }
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    console.log('🛒 Removing item:', id);
    updateGlobalCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== id);
      console.log('🛒 After removal, new cart:', newCart);
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    console.log('🛒 Updating quantity:', id, quantity);
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    updateGlobalCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      console.log('🛒 After quantity update, new cart:', newCart);
      return newCart;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => {
    console.log('🛒 Clearing cart');
    updateGlobalCart(() => {
      console.log('🛒 Cart cleared');
      return [];
    });
  }, []);

  const getTotalItems = useCallback(() => {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    console.log('🛒 Total items:', total);
    return total;
  }, [cart]);

  const getTotalPrice = useCallback(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('🛒 Total price:', total);
    return total;
  }, [cart]);

  const updateItemCustomization = useCallback((itemId: string, customization: any) => {
    console.log('🛒 Updating item customization:', itemId, customization);
    updateGlobalCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === itemId ? { ...item, customization } : item
      );
      console.log('🛒 After customization update, new cart:', newCart);
      return newCart;
    });
  }, []);

  return {
    items: cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isLoaded: true,
    refreshCart: () => setCart(globalCart),
    updateItemCustomization,
  };
}