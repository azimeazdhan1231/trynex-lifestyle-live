import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  image_url?: string;
  customization?: {
    color?: string;
    size?: string;
    text?: string;
    [key: string]: any;
  };
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

const CART_STORAGE_KEY = 'shopping-cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    console.log('🛒 Adding to cart:', item);
    setCart(prevCart => {
      console.log('🛒 Previous cart:', prevCart);
      const existingItemIndex = prevCart.findIndex(cartItem =>
        cartItem.id === item.id &&
        JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
      );

      let newCart;
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + (item.quantity || 1)
        };
        newCart = updatedCart;
        console.log('🛒 Updated existing item in cart:', newCart);
      } else {
        newCart = [...prevCart, { ...item, quantity: item.quantity || 1 }];
        console.log('🛒 Added new item to cart:', newCart);
      }
      return newCart;
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

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    totalPrice,
    totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
}