import { useState, useEffect, useCallback } from 'react';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
  stock: number;
  added_at: number;
}

const WISHLIST_STORAGE_KEY = 'trynex_wishlist';

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        const items = JSON.parse(saved);
        setWishlistItems(items);
      }
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  const saveWishlist = useCallback((items: WishlistItem[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save wishlist:', error);
    }
  }, []);

  // Add item to wishlist
  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlistItems(prevItems => {
      const existingIndex = prevItems.findIndex(existing => existing.id === item.id);
      if (existingIndex >= 0) {
        // Item already exists, update it
        const newItems = [...prevItems];
        newItems[existingIndex] = { ...item, added_at: Date.now() };
        saveWishlist(newItems);
        return newItems;
      } else {
        // Add new item
        const newItems = [...prevItems, { ...item, added_at: Date.now() }];
        saveWishlist(newItems);
        return newItems;
      }
    });
  }, [saveWishlist]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback((itemId: string) => {
    setWishlistItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      saveWishlist(newItems);
      return newItems;
    });
  }, [saveWishlist]);

  // Check if item is in wishlist
  const isInWishlist = useCallback((itemId: string) => {
    return wishlistItems.some(item => item.id === itemId);
  }, [wishlistItems]);

  // Clear entire wishlist
  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
    }
  }, []);

  // Get wishlist count
  const getWishlistCount = useCallback(() => {
    return wishlistItems.length;
  }, [wishlistItems]);

  // Toggle item in wishlist
  const toggleWishlist = useCallback((item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getWishlistCount,
    toggleWishlist,
  };
}