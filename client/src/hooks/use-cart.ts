import { useCart as useBulletproofCart } from './use-cart-bulletproof';

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

export interface UseCartReturn {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isLoaded: boolean;
  refreshCart: () => void;
  updateItemCustomization: (itemId: string, customization: any) => void;
}

export function useCart(): UseCartReturn {
  const bulletproofCart = useBulletproofCart();

  return {
    items: bulletproofCart.cart || [],
    addItem: bulletproofCart.addToCart,
    removeItem: bulletproofCart.removeFromCart,
    updateQuantity: bulletproofCart.updateQuantity,
    clearCart: bulletproofCart.clearCart,
    getTotalItems: () => bulletproofCart.totalItems || 0,
    getTotalPrice: () => bulletproofCart.totalPrice || 0,
    isLoaded: bulletproofCart.isLoaded,
    refreshCart: bulletproofCart.refreshCart,
    updateItemCustomization: bulletproofCart.updateCartItemCustomization,
  };
}