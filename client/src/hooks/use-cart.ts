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
}

export function useCart(): UseCartReturn {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('trynex_cart'); // Changed from 'cart' to 'trynex_cart' to match original
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error); // Changed log message to match original
      localStorage.removeItem('trynex_cart'); // Changed from 'cart' to 'trynex_cart' to match original
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('trynex_cart', JSON.stringify(cart)); // Changed from 'cart' to 'trynex_cart' to match original
        console.log('useCart returning:', { // Keeping original console log for return data
          cart,
          totalItems: cart.reduce((sum, item) => sum + (item.quantity || 0), 0),
          totalPrice: cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0)
        });
      } catch (error) {
        console.error('Error saving cart:', error); // Keeping error log message
      }
    }
  }, [cart, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    console.log('Adding new item to cart:', newItem);
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === newItem.id);

      if (existingItemIndex > -1) {
        // Update existing item quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity = (updatedCart[existingItemIndex].quantity || 0) + (newItem.quantity || 1);
        return updatedCart;
      } else {
        // Add new item with proper quantity
        return [...prevCart, { ...newItem, quantity: newItem.quantity || 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };
}