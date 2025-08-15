import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@shared/schema';

interface UseWishlistReturn {
  items: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

const WISHLIST_STORAGE_KEY = 'trynex_wishlist';

export function useWishlist(): UseWishlistReturn {
  const [items, setItems] = useState<Product[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          setItems(parsedWishlist);
        }
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error);
    }
  }, [items]);

  const addToWishlist = useCallback(async (product: Product) => {
    setItems(prevItems => {
      // Check if product is already in wishlist
      if (prevItems.some(item => item.id === product.id)) {
        return prevItems; // Already exists
      }
      return [...prevItems, product];
    });
  }, []);

  const removeFromWishlist = useCallback(async (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const getWishlistCount = useCallback(() => {
    return items.length;
  }, [items]);

  return {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
  };
}