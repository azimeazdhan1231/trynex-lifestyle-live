import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import CheckoutModal from "@/components/checkout-modal";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModalFixed({ isOpen, onClose }: CartModalProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart, isLoaded } = useCart();

  // Local cart state for immediate display
  const [localCart, setLocalCart] = useState(cart);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCheckout = () => {
    const currentCart = localCart.length > 0 ? localCart : cart;
    if (currentCart.length === 0) {
      return;
    }
    onClose();
    setIsCheckoutOpen(true);
  };

  // Force cart state sync when modal opens or cart changes
  useEffect(() => {
    if (isOpen) {
      setRefreshKey(prev => prev + 1);
      // Force re-read from localStorage when modal opens
      const savedCart = localStorage.getItem('trynex_cart');
      let freshCart = [];
      try {
        if (savedCart) {
          freshCart = JSON.parse(savedCart);
        }
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
      
      // Always use fresh cart data from localStorage
      setLocalCart(freshCart);
      
      // Debug info removed for production
    }
  }, [isOpen, cart, isLoaded]);

  // Update local cart when global cart changes
  useEffect(() => {
    setLocalCart(cart);
  }, [cart]);

  // Show loading state until cart is loaded
  if (!isLoaded) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-6">
          <DialogHeader className="flex-shrink-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              🛒 আপনার কার্ট 
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-1">
              কার্ট লোড হচ্ছে...
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
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
        <DialogContent 
          className="w-[95vw] max-w-lg sm:max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-6"
          data-testid="cart-modal"
        >
          <DialogHeader className="flex-shrink-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
              🛒 আপনার কার্ট 
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-sm font-medium">
                {(localCart.length > 0 ? localCart : cart).length}টি পণ্য
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-1">
              আপনার শপিং কার্টে থাকা পণ্যসমূহ দেখুন এবং পরিচালনা করুন
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            {(() => {
              const currentCart = localCart.length > 0 ? localCart : cart;
              return (!currentCart || !Array.isArray(currentCart) || currentCart.length === 0) ? (
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
                    {currentCart.map((item) => (
                    <div
                      key={`${item.id}-${JSON.stringify(item.customization)}`}
                      className="flex items-start gap-3 p-3 sm:p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200"
                      data-testid={`cart-item-${item.id}`}
                    >
                      {/* Product Image */}
                      {(item.image_url || item.image) && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image_url || item.image}
                            alt={item.name}
                            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 leading-tight">
                          {item.name}
                        </h5>
                        <p className="text-primary font-medium text-sm sm:text-base mt-1">
                          {formatPrice(item.price)} প্রতিটি
                        </p>

                        {/* Customization Display */}
                        {item.customization && (
                          <div className="mt-2 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg text-xs sm:text-sm border border-blue-100">
                            <p className="font-semibold text-blue-800 mb-1 sm:mb-2">কাস্টমাইজেশন:</p>
                            <div className="space-y-1">
                              {item.customization.size && (
                                <p className="text-blue-700">সাইজ: {item.customization.size}</p>
                              )}
                              {item.customization.color && (
                                <p className="text-blue-700">রং: {item.customization.color}</p>
                              )}
                              {item.customization.printArea && (
                                <p className="text-blue-700">প্রিন্ট এরিয়া: {item.customization.printArea}</p>
                              )}
                              {item.customization.customText && item.customization.customText.trim() && (
                                <p className="text-blue-700">কাস্টম টেক্সট: {item.customization.customText.trim()}</p>
                              )}
                              {item.customization.specialInstructions && item.customization.specialInstructions.trim() && (
                                <p className="text-blue-700">বিশেষ নির্দেশনা: {item.customization.specialInstructions.trim()}</p>
                              )}
                              {item.customization.customImage && (
                                <div className="mt-2">
                                  <p className="mb-1 text-blue-700">কাস্টম ছবি:</p>
                                  <img 
                                    src={typeof item.customization.customImage === 'string' 
                                      ? item.customization.customImage 
                                      : URL.createObjectURL(item.customization.customImage)}
                                    alt="Custom upload"
                                    className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md border border-blue-200"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Quantity Controls - Mobile Optimized */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 p-0 hover:bg-gray-200"
                            disabled={item.quantity <= 1}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <span className="w-8 sm:w-10 text-center text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 p-0 hover:bg-gray-200"
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300"
                          title="পণ্য মুছুন"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Cart Summary */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 sm:p-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">মোট পণ্য:</span>
                      <span className="text-sm font-medium text-gray-900">{totalItems} টি</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg sm:text-xl font-bold text-gray-800">সর্বমোট:</span>
                      <span className="text-xl sm:text-2xl font-bold text-emerald-600 flex items-center">
                        {formatPrice(totalPrice)}
                        <span className="text-sm font-normal text-gray-500 ml-1">৳</span>
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckout} 
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-4 sm:py-5 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl" 
                    size="lg"
                    disabled={cart.length === 0 || totalItems === 0}
                    data-testid="button-checkout"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    চেকআউট করুন ({totalItems} টি পণ্য)
                  </Button>
                </div>
              </div>
            );
            })()}
          </div>
          
          {/* Footer Actions - Mobile Optimized */}
          {cart.length > 0 && (
            <div className="flex-shrink-0 border-t bg-gray-50/80 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm('সব পণ্য মুছে ফেলতে চান?')) {
                      clearCart();
                    }
                  }}
                  className="flex-1 sm:flex-none"
                  size="sm"
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  সব মুছুন
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="sm"
                  data-testid="button-continue-shopping"
                >
                  কেনাকাটা চালিয়ে যান
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onOrderComplete={() => {
          clearCart();
          setIsCheckoutOpen(false);
        }}
      />
    </>
  );
}