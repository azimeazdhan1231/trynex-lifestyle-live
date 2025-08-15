import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  ArrowRight,
  Heart
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  customization?: {
    size: string;
    color: string;
    material: string;
    customText: string;
    customImage: string;
    customizationFee: number;
  };
}

interface PerfectCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerfectCartModal({ isOpen, onClose }: PerfectCartModalProps) {
  // Mock cart data - in real app this would come from useCart hook
  const cartItems: CartItem[] = [
    {
      id: 1,
      name: "Custom Lifestyle T-Shirt",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop",
      quantity: 2,
      customization: {
        size: "L",
        color: "Navy",
        material: "100% Cotton",
        customText: "My Custom Text",
        customImage: "custom-design.jpg",
        customizationFee: 5.99
      }
    },
    {
      id: 2,
      name: "Personalized Coffee Mug",
      price: 19.99,
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=100&h=100&fit=crop",
      quantity: 1,
      customization: {
        size: "Standard",
        color: "White",
        material: "Ceramic",
        customText: "Coffee Lover",
        customImage: "",
        customizationFee: 5.99
      }
    }
  ];

  const updateQuantity = (itemId: number, newQuantity: number) => {
    // In real app, this would call useCart hook
    console.log(`Update quantity for item ${itemId} to ${newQuantity}`);
  };

  const removeItem = (itemId: number) => {
    // In real app, this would call useCart hook
    console.log(`Remove item ${itemId}`);
  };

  const moveToWishlist = (item: CartItem) => {
    // In real app, this would call useWishlist hook
    console.log(`Move ${item.name} to wishlist`);
  };

  const getItemTotal = (item: CartItem) => {
    const basePrice = item.price;
    const customizationFee = item.customization?.customizationFee || 0;
    return (basePrice + customizationFee) * item.quantity;
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + getItemTotal(item), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            Shopping Cart ({getTotalItems()})
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
            <Button onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-white">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    
                    {/* Customization Details */}
                    {item.customization && (
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-2">
                          {item.customization.size && (
                            <Badge variant="outline" className="text-xs">
                              Size: {item.customization.size}
                            </Badge>
                          )}
                          {item.customization.color && (
                            <Badge variant="outline" className="text-xs">
                              Color: {item.customization.color}
                            </Badge>
                          )}
                          {item.customization.material && (
                            <Badge variant="outline" className="text-xs">
                              {item.customization.material}
                            </Badge>
                          )}
                        </div>
                        {item.customization.customText && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Text: "{item.customization.customText}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-blue-600">
                        ${getItemTotal(item).toFixed(2)}
                      </span>
                      {item.customization?.customizationFee && (
                        <span className="text-sm text-gray-500">
                          (Base: ${item.price} + Custom: ${item.customization.customizationFee})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveToWishlist(item)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Move to wishlist"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">Order Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items):</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${(getCartTotal() * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    ${(getCartTotal() * 1.08).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Free shipping on orders over $50</p>
              <p>30-day money back guarantee</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}