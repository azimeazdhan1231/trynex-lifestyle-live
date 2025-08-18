import { useSimpleCart } from './use-simple-cart';

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
  const simpleCart = useSimpleCart();

  return {
    items: simpleCart.items,
    addItem: simpleCart.addItem,
    removeItem: simpleCart.removeItem,
    updateQuantity: simpleCart.updateQuantity,
    clearCart: simpleCart.clearCart,
    getTotalItems: simpleCart.getTotalItems,
    getTotalPrice: simpleCart.getTotalPrice,
    isLoaded: simpleCart.isLoaded,
    refreshCart: simpleCart.refreshCart,
    updateItemCustomization: simpleCart.updateItemCustomization,
  };
}