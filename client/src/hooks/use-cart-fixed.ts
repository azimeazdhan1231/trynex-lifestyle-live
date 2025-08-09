import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  quantity: number;
  customization?: any;
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
}

const CART_STORAGE_KEY = 'trynex_cart';

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          console.log('Cart loaded from localStorage:', parsedCart);
          setCart(parsedCart);
        } else {
          console.warn('Invalid cart data in localStorage, clearing...');
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        console.log('Cart saved to localStorage:', cart);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    console.log('Adding item to cart:', newItem);
    
    setCart(prevCart => {
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
        console.log('Updated existing item quantity');
      } else {
        // Add new item with proper quantity and data
        const itemToAdd: CartItem = {
          ...newItem,
          quantity: newItem.quantity || 1,
          price: Number(newItem.price) || 0,
          image_url: newItem.image_url || newItem.image
        };
        updatedCart = [...prevCart, itemToAdd];
        console.log('Added new item to cart');
      }

      console.log('Cart after addition:', updatedCart);
      return updatedCart;
    });
  };

  const removeFromCart = (id: string) => {
    console.log('Removing item from cart:', id);
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== id);
      console.log('Cart after removal:', updatedCart);
      return updatedCart;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    console.log('Updating quantity for item:', id, 'to:', quantity);
    
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      console.log('Cart after quantity update:', updatedCart);
      return updatedCart;
    });
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCart([]);
  };

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

  // Log cart state for debugging
  useEffect(() => {
    if (isLoaded) {
      console.log('useCart state:', {
        cartItemsCount: cart.length,
        totalItems,
        totalPrice,
        cart: cart.map(item => ({ 
          id: item.id, 
          name: item.name, 
          quantity: item.quantity,
          price: item.price 
        }))
      });
    }
  }, [cart, totalItems, totalPrice, isLoaded]);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    isLoaded
  };
}