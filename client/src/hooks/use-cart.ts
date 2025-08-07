import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
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
    // Validate cart data before saving
    const validCart = cart.filter(item => 
      item && 
      typeof item.id === 'string' && item.id.length > 0 &&
      typeof item.name === 'string' && item.name.length > 0 &&
      typeof item.price === 'number' && item.price > 0 &&
      typeof item.quantity === 'number' && item.quantity > 0
    );
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validCart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (clearError) {
      console.error('Error clearing cart from localStorage:', clearError);
    }
  }
};

const updateGlobalCart = (newCart: CartItem[]): void => {
  try {
    // Validate and sanitize cart items
    const sanitizedCart = newCart.filter(item => {
      if (!item || typeof item !== 'object') return false;
      if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') return false;
      if (item.quantity <= 0 || isNaN(item.price) || isNaN(item.quantity)) return false;
      return true;
    }).map(item => ({
      ...item,
      price: Number(item.price) || 0,
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1))
    }));

    globalCart = sanitizedCart;
    saveCartToStorage(sanitizedCart);
    
    // Notify listeners with error handling
    cartListeners.forEach(listener => {
      try {
        listener(sanitizedCart);
      } catch (error) {
        console.error('Error in cart listener:', error);
      }
    });
  } catch (error) {
    console.error('Error updating global cart:', error);
  }
};

// Initialize global cart on first load
if (typeof window !== 'undefined' && globalCart.length === 0) {
  globalCart = getStoredCart();
}

interface UseCartReturn {
  cart: CartItem[];
  addToCart: (product: any, customization?: any) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>(() => globalCart);

  // Subscribe to global cart changes
  useEffect(() => {
    const updateCart = (newCart: CartItem[]) => {
      setCart(newCart);
    };
    
    cartListeners.add(updateCart);
    setCart(globalCart); // Sync on mount
    
    return () => {
      cartListeners.delete(updateCart);
    };
  }, []);

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

    // Check if the same product with same customization already exists
    const existingItemIndex = globalCart.findIndex(item => {
      const sameProduct = item.name === product.name && item.price === parseFloat(product.price.toString());
      
      // If no customization for both items, they're the same
      if (!processedCustomization && !item.customization) {
        return sameProduct;
      }
      
      // If one has customization and other doesn't, they're different
      if ((!processedCustomization && item.customization) || (processedCustomization && !item.customization)) {
        return false;
      }
      
      // If both have customization, compare them
      if (processedCustomization && item.customization) {
        return sameProduct && 
               processedCustomization.size === item.customization.size &&
               processedCustomization.color === item.customization.color &&
               processedCustomization.printArea === item.customization.printArea &&
               processedCustomization.customText === item.customization.customText &&
               processedCustomization.specialInstructions === item.customization.specialInstructions;
      }
      
      return sameProduct;
    });

    if (existingItemIndex !== -1) {
      // Update quantity of existing item
      const newCart = [...globalCart];
      newCart[existingItemIndex].quantity += processedCustomization?.quantity || 1;
      updateGlobalCart(newCart);
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        id: crypto.randomUUID(),
        name: product.name,
        price: parseFloat(product.price.toString()),
        image_url: product.image_url || product.image,
        quantity: processedCustomization?.quantity || 1,
        customization: processedCustomization,
      };

      console.log('Adding new item to cart:', cartItem);
      
      const newCart = [...globalCart, cartItem];
      updateGlobalCart(newCart);
    }
  };

  const updateQuantity = useCallback((id: string, quantity: number) => {
    console.log('Updating quantity for item:', id, 'to:', quantity);
    
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    const newCart = globalCart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    );

    updateGlobalCart(newCart);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    console.log('Removing item from cart:', id);
    
    const newCart = globalCart.filter(item => item.id !== id);
    updateGlobalCart(newCart);
  }, []);

  const clearCart = useCallback(() => {
    console.log('Clearing cart');
    updateGlobalCart([]);
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);

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