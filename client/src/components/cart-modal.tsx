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

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();

  // Debug cart state
  console.log('CartModal cart state:', { cart, totalItems, totalPrice });

  // Force re-render when modal opens to ensure cart state is fresh
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      return;
    }
    onClose();
    setIsCheckoutOpen(true);
  };

  // Force cart state sync when modal opens
  useEffect(() => {
    if (isOpen) {
      setRefreshKey(prev => prev + 1);
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg lg:max-w-2xl xl:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-4 border-b">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-800">
              🛒 আপনার কার্ট ({cart.length}টি পণ্য)
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1">
              আপনার শপিং কার্টে থাকা পণ্যসমূহ দেখুন এবং পরিচালনা করুন
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">

          {!cart || !Array.isArray(cart) || cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">আপনার কার্ট খালি</p>
              <Button onClick={onClose} variant="outline">
                কেনাকাটা করুন
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex items-start gap-3 mb-2">
                      {/* Product Image */}
                      {item.image_url && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm md:text-base line-clamp-2">{item.name}</h5>
                        <p className="text-gray-600 text-sm">{formatPrice(item.price)} প্রতিটি</p>

                        {/* Customization Display */}
                        {item.customization && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-md text-xs">
                            <p className="font-medium text-blue-800 mb-1">কাস্টমাইজেশন:</p>
                            {item.customization.size && <p>সাইজ: {item.customization.size}</p>}
                            {item.customization.color && <p>রং: {item.customization.color}</p>}
                            {item.customization.printArea && <p>প্রিন্ট এরিয়া: {item.customization.printArea}</p>}
                            {item.customization.customText && item.customization.customText.trim() && (
                              <p>কাস্টম টেক্সট: {item.customization.customText.trim()}</p>
                            )}
                            {item.customization.specialInstructions && item.customization.specialInstructions.trim() && (
                              <p>বিশেষ নির্দেশনা: {item.customization.specialInstructions.trim()}</p>
                            )}
                            {item.customization.customImage && (
                              <div className="mt-2">
                                <p className="mb-1">কাস্টম ছবি:</p>
                                <img 
                                  src={typeof item.customization.customImage === 'string' ? item.customization.customImage : URL.createObjectURL(item.customization.customImage)}
                                  alt="Custom upload"
                                  className="w-12 h-12 object-cover rounded border"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Quantity Controls - Mobile Optimized */}
                      <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 p-0"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <Badge variant="secondary" className="w-8 sm:w-10 text-center text-sm font-semibold">
                            {item.quantity}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 sm:w-8 sm:h-8 p-0"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 p-0"
                          title="পণ্য মুছুন"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <span className="text-base sm:text-lg font-semibold text-gray-800">মোট:</span>
                  <span className="text-xl sm:text-2xl font-bold text-green-600">{formatPrice(totalPrice)}</span>
                </div>

                <Button 
                  onClick={handleCheckout} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                  size="lg"
                  disabled={cart.length === 0 || totalItems === 0}
                >
                  চেকআউট করুন ({totalItems} টি পণ্য)
                </Button>
              </div>
            </div>
          )}
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
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  সব মুছুন
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  size="sm"
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