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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-white",
          isMobile 
            ? "w-full h-full max-w-none max-h-none rounded-none m-0 fixed inset-0" 
            : "max-w-2xl w-[95vw] max-h-[95vh] rounded-xl"
        )}
        data-testid="cart-modal"
      >
        {/* Header - Ultra responsive */}
        <DialogHeader className={cn(
          "flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-red-50",
          isMobile ? "px-4 py-3" : "px-6 py-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white">
              <ShoppingCart className={cn("w-4 h-4", isMobile ? "w-4 h-4" : "w-5 h-5")} />
            </div>
            <div>
              <DialogTitle className={cn("text-lg font-bold text-gray-900", isMobile ? "text-base" : "text-xl")}>
                আপনার কার্ট
              </DialogTitle>
              <DialogDescription className={cn("text-gray-600", isMobile ? "text-xs" : "text-sm")}>
                {items.length} টি পণ্য
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            onClick={onClose}
            className="rounded-full h-8 w-8 p-0"
            data-testid="close-cart"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Content Area - Fully responsive */}
        <div className={cn(
          "flex flex-col",
          isMobile ? "h-[calc(100vh-80px)]" : "h-[calc(95vh-120px)] max-h-[600px]"
        )}>
          {items.length === 0 ? (
            // Empty Cart State
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package2 className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">আপনার কার্ট খালি</h3>
              <p className="text-gray-600 mb-6">কেনাকাটা শুরু করতে পণ্য যোগ করুন</p>
              <Button onClick={onClose} className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                কেনাকাটা চালিয়ে যান
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items - Responsive scrollable area */}
              <ScrollArea className={cn("flex-1", isMobile ? "px-4" : "px-6")}>
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow"
                      data-testid={`cart-item-${item.id}`}
                    >
                      {/* Product Image */}
                      <div className={cn("rounded-lg overflow-hidden bg-white border flex-shrink-0", isMobile ? "w-16 h-16" : "w-20 h-20")}>
                        <img
                          src={item.image_url || item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn("font-semibold text-gray-900 line-clamp-2", isMobile ? "text-sm" : "text-base")}>
                          {item.name}
                        </h4>
                        <p className={cn("font-bold text-orange-600 mt-1", isMobile ? "text-sm" : "text-base")}>
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls - Mobile optimized */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className={cn("h-8 w-8 p-0 rounded-full", isMobile ? "h-7 w-7" : "h-8 w-8")}
                              data-testid={`decrease-quantity-${item.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Badge variant="secondary" className={cn("px-3 py-1 font-bold min-w-[40px] justify-center", isMobile ? "px-2" : "px-3")}>
                              {item.quantity}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className={cn("h-8 w-8 p-0 rounded-full", isMobile ? "h-7 w-7" : "h-8 w-8")}
                              data-testid={`increase-quantity-${item.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                            data-testid={`remove-item-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Item Total */}
                        <div className={cn("text-right mt-2", isMobile ? "text-sm" : "text-base")}>
                          <span className="font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer - Order Summary & Actions */}
              <div className={cn("border-t bg-white", isMobile ? "p-4" : "p-6")}>
                {/* Clear Cart Button */}
                {items.length > 0 && (
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      data-testid="clear-cart"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      কার্ট খালি করুন
                    </Button>
                  </div>
                )}

                {/* Order Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>সাবটোটাল:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ডেলিভারি ফি:</span>
                    <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee === 0 && (
                    <p className="text-xs text-green-600">🎉 ১৬০০+ টাকার অর্ডারে ফ্রি ডেলিভারি!</p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>মোট:</span>
                    <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Action Buttons - Mobile responsive */}
                <div className={cn("space-y-3", isMobile ? "space-y-2" : "space-y-3")}>
                  <Button
                    onClick={onCheckout}
                    className={cn(
                      "w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-semibold",
                      isMobile ? "h-12 text-base" : "h-14 text-lg"
                    )}
                    data-testid="checkout-button"
                  >
                    চেকআউট করুন
                    <ArrowRight className={cn("ml-2", isMobile ? "w-4 h-4" : "w-5 h-5")} />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className={cn("w-full", isMobile ? "h-10" : "h-12")}
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