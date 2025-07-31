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

interface UseCartReturn {
  cart: CartItem[];
  addToCart: (product: Product, customization?: any) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addToCart = async (product: any, customization?: any) => {
    // Process custom image if it's a File object
    let processedCustomization = { ...customization };

    if (customization?.customImage && customization.customImage instanceof File) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(customization.customImage);
        });

        processedCustomization = {
          ...customization,
          customImage: base64,
          customImageName: customization.customImage.name
        };
      } catch (error) {
        console.error('Error converting image to base64:', error);
      }
    }

    const cartItem: CartItem = {
      id: crypto.randomUUID(),
      name: product.name,
      price: parseFloat(product.price.toString()),
      image_url: product.image_url,
      quantity: processedCustomization?.quantity || 1,
      customization: processedCustomization,
    };

    setCart(prev => {
      const updated = [...prev, cartItem];
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

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