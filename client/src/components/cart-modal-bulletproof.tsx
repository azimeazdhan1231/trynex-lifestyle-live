import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, Palette } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart-bulletproof";
import CheckoutModal from "@/components/checkout-modal";
import PerfectCustomizeModal from "@/components/perfect-customize-modal";
import type { Product } from "@shared/schema";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModalBulletproof({ isOpen, onClose }: CartModalProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [selectedItemForCustomize, setSelectedItemForCustomize] = useState<Product | null>(null);
  const [selectedCartItemId, setSelectedCartItemId] = useState<string>('');
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart, isLoaded, refreshCart, updateCartItemCustomization } = useCart();

  // Force cart refresh when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen, refreshCart]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    onClose();
    setIsCheckoutOpen(true);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCustomizeCartItem = (cartItem: any) => {
    // Convert cart item to product format for customize modal
    const productForCustomize: Product = {
      id: cartItem.id.split('-')[0], // Remove unique cart identifier
      name: cartItem.name.replace(' (কাস্টমাইজড)', ''), // Remove customized suffix
      price: cartItem.price.toString(),
      image_url: cartItem.image_url || cartItem.image,
      description: '',
      category: '',
      stock: 10,
      created_at: new Date(),
      is_featured: false,
      is_latest: false,
      is_best_selling: false
    };
    
    setSelectedItemForCustomize(productForCustomize);
    setSelectedCartItemId(cartItem.id);
    setIsCustomizeOpen(true);
  };

  const handleCustomizeAddToCart = (product: Product, customization: any) => {
    // Update existing cart item with new customization
    updateCartItemCustomization(selectedCartItemId, customization);
    setIsCustomizeOpen(false);
    setSelectedItemForCustomize(null);
    setSelectedCartItemId('');
  };

  if (!isLoaded) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-4 py-4 border-b">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🛒 আপনার কার্ট 
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              কার্ট লোড হচ্ছে...
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl lg:max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-4 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🛒 আপনার কার্ট 
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-medium">
                {cart.length}টি পণ্য
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              আপনার শপিং কার্টে থাকা পণ্যসমূহ দেখুন এবং পরিচালনা করুন
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">আপনার কার্ট খালি</p>
                <p className="text-gray-400 text-sm mb-6">কোন পণ্য যুক্ত করা হয়নি</p>
                <Button onClick={onClose} variant="outline">
                  কেনাকাটা শুরু করুন
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cart Items */}
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.id}-${JSON.stringify(item.customization)}`}
                      className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Product Image */}
                      {(item.image_url || item.image) && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image_url || item.image}
                            alt={item.name}
                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-base text-gray-900 line-clamp-2">
                          {item.name}
                        </h5>
                        <p className="text-primary font-medium text-base mt-1">
                          {formatPrice(item.price)} প্রতিটি
                        </p>

                        {/* Customization Display */}
                        {item.customization && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm border border-blue-100">
                            <p className="font-semibold text-blue-800 mb-1">কাস্টমাইজেশন:</p>
                            <div className="space-y-1">
                              {item.customization.size && (
                                <p className="text-blue-700">সাইজ: {item.customization.size}</p>
                              )}
                              {item.customization.color && (
                                <p className="text-blue-700">রং: {item.customization.color}</p>
                              )}
                              {item.customization.customText && (
                                <p className="text-blue-700">কাস্টম টেক্সট: {item.customization.customText}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Customize Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCustomizeCartItem(item)}
                          className="mt-2 h-8 px-3 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                        >
                          <Palette className="w-3 h-3 mr-1" />
                          কাস্টমাইজ করুন
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="w-8 h-8 p-0 hover:bg-gray-200"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 p-0 hover:bg-gray-200"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <p className="text-primary font-semibold text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Cart Summary */}
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">মোট পণ্য:</span>
                    <span className="font-semibold">{totalItems}টি</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold text-gray-800">মোট মূল্য:</span>
                    <span className="font-bold text-primary text-xl">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1"
                    >
                      কার্ট পরিষ্কার করুন
                    </Button>
                    
                    <Button
                      onClick={handleCheckout}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      চেকআউট
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderComplete={() => {
          clearCart();
          setIsCheckoutOpen(false);
        }}
      />

      {/* Customize Modal */}
      {selectedItemForCustomize && (
        <PerfectCustomizeModal
          isOpen={isCustomizeOpen}
          onClose={() => {
            setIsCustomizeOpen(false);
            setSelectedItemForCustomize(null);
            setSelectedCartItemId('');
          }}
          product={selectedItemForCustomize}
          onAddToCart={handleCustomizeAddToCart}
        />
      )}
    </>
  );
}