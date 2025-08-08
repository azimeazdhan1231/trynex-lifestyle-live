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
        <DialogContent className="modal-container">
          <div className="modal-content">
            <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              🛒 আপনার কার্ট ({cart.length}টি পণ্য)
            </DialogTitle>
            <DialogDescription className="sr-only">
              আপনার শপিং কার্টে থাকা পণ্যসমূহ দেখুন এবং পরিচালনা করুন
            </DialogDescription>
          </DialogHeader>

          {!cart || cart.length === 0 ? (
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
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.name}</h5>
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
                      <div className="flex items-center space-x-2 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Badge variant="secondary" className="w-8 text-center">
                          {item.quantity}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 p-0 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">মোট:</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>

                <Button 
                  onClick={handleCheckout} 
                  className="w-full" 
                  size="lg"
                  disabled={cart.length === 0 || totalItems === 0}
                >
                  চেকআউট করুন ({totalItems} টি পণ্য)
                </Button>
              </div>
            </div>
          )}
          </div>
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