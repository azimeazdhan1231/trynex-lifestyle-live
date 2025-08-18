
import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  ArrowRight,
  Package2
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UltraResponsiveCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function UltraResponsiveCartModal({ 
  isOpen, 
  onClose, 
  onCheckout 
}: UltraResponsiveCartModalProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleQuantityChange = useCallback((id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  }, [updateQuantity]);

  const handleRemoveItem = useCallback((id: string) => {
    removeItem(id);
    toast({
      title: "পণ্য সরানো হয়েছে",
      description: "পণ্যটি কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  }, [removeItem, toast]);

  const handleClearCart = useCallback(() => {
    clearCart();
    toast({
      title: "কার্ট খালি করা হয়েছে",
      description: "সব পণ্য কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  }, [clearCart, toast]);

  const total = getTotalPrice();
  const deliveryFee = total >= 1600 ? 0 : 120;
  const grandTotal = total + deliveryFee;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-md w-full mx-auto bg-white border-0 shadow-xl",
          isMobile 
            ? "h-[95vh] max-h-[95vh] w-[95vw] rounded-lg" 
            : "max-h-[90vh] rounded-xl"
        )}
        data-testid="cart-modal"
      >
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                আপনার কার্ট
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {items.length} টি পণ্য
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full h-8 w-8 p-0"
            data-testid="close-cart"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">আপনার কার্ট খালি</h3>
              <p className="text-gray-600 mb-4">কেনাকাটা শুরু করতে পণ্য যোগ করুন</p>
              <Button onClick={onClose} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                কেনাকাটা চালিয়ে যান
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg border"
                      data-testid={`cart-item-${item.id}`}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border flex-shrink-0">
                        <img
                          src={item.image_url || item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                          {item.name}
                        </h4>
                        <p className="font-bold text-orange-600 text-sm mb-2">
                          {formatPrice(item.price)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-6 w-6 p-0 rounded-full"
                              data-testid={`decrease-quantity-${item.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Badge variant="secondary" className="px-2 py-0 text-xs min-w-[32px] justify-center">
                              {item.quantity}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="h-6 w-6 p-0 rounded-full"
                              data-testid={`increase-quantity-${item.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-6 w-6 p-0 rounded-full"
                            data-testid={`remove-item-${item.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="text-right mt-1">
                          <span className="font-bold text-gray-900 text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t bg-white p-4">
                {items.length > 0 && (
                  <div className="mb-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 text-xs"
                      data-testid="clear-cart"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      কার্ট খালি করুন
                    </Button>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>সাবটোটাল:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>ডেলিভারি ফি:</span>
                    <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600">🎉 ১৬০০+ টাকার অর্ডারে ফ্রি ডেলিভারি!</p>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-gray-900">
                    <span>মোট:</span>
                    <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={onCheckout}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-semibold h-12"
                    data-testid="checkout-button"
                  >
                    চেকআউট করুন
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full h-10"
                    data-testid="continue-shopping"
                  >
                    কেনাকাটা চালিয়ে যান
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
