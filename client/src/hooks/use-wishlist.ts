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
          setWishlist(parsedWishlist);
        }
      }
    } catch (error) {
      console.error('Failed to load wishlist from storage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      } catch (error) {
        console.error('Failed to save wishlist to storage:', error);
      }
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlist(prev => {
      // Check if item already exists
      if (prev.some(existingItem => existingItem.id === item.id)) {
        return prev; // Don't add duplicate
      }
      return [...prev, { ...item, added_at: Date.now() }];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  }, []);

  const isInWishlist = useCallback((id: string) => {
    return wishlist.some(item => item.id === id);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

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