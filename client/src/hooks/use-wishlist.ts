import { useState, useEffect, useCallback } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
  stock: number;
  added_at: number;
}

interface UseWishlistReturn {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  totalItems: number;
  isLoaded: boolean;
}

const WISHLIST_STORAGE_KEY = 'trynex_wishlist_v1';

export function useWishlist(): UseWishlistReturn {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);
        if (Array.isArray(parsedWishlist)) {
          // Validate and clean wishlist data
          const validWishlist = parsedWishlist.filter(item => 
            item && 
            item.id && 
            item.name && 
            typeof item.price === 'number' &&
            typeof item.stock === 'number'
          );
          setWishlist(validWishlist);
        }
      }
    } catch (error) {
      console.error('Failed to load wishlist from storage:', error);
      // Reset to empty array on error
      setWishlist([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes (debounced)
  useEffect(() => {
    if (isLoaded) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
          console.log(`💖 Wishlist saved: ${wishlist.length} items`);
        } catch (error) {
          console.error('Failed to save wishlist to storage:', error);
        }
      }, 100); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist(prev => {
      // Check if item already exists
      const existingIndex = prev.findIndex(existingItem => existingItem.id === item.id);
      if (existingIndex >= 0) {
        // Update existing item with latest data
        const updated = [...prev];
        updated[existingIndex] = { ...item, added_at: prev[existingIndex].added_at };
        return updated;
      }
      // Add new item
      const newItem = { ...item, added_at: Date.now() };
      console.log(`💖 Added to wishlist: ${item.name}`);
      return [...prev, newItem];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist(prev => {
      const filtered = prev.filter(item => item.id !== id);
      if (filtered.length !== prev.length) {
        console.log(`💔 Removed from wishlist: ${id}`);
      }
      return filtered;
    });
  }, []);

  const isInWishlist = useCallback((id: string) => {
    return wishlist.some(item => item.id === id);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    console.log(`💔 Cleared wishlist: ${wishlist.length} items removed`);
    setWishlist([]);
  }, [wishlist.length]);

  const totalItems = wishlist.length;

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    totalItems,
    isLoaded
  };
}