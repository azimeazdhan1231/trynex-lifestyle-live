import { useState } from "react";
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

  const handleCheckout = () => {
    onClose();
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              আপনার কার্ট
            </DialogTitle>
            <DialogDescription>
              আপনার নির্বাচিত পণ্যসমূহ দেখুন এবং চেকআউট করুন
            </DialogDescription>
          </DialogHeader>

          {cart.length === 0 ? (
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
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{item.name}</h5>
                      <p className="text-gray-600 text-sm">{formatPrice(item.price)} প্রতিটি</p>
                    </div>
                    <div className="flex items-center space-x-2">
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
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">মোট:</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                </div>

                <Button onClick={handleCheckout} className="w-full" size="lg">
                  চেকআউট করুন ({totalItems} টি পণ্য)
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