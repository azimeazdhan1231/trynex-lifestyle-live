
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

  // Debug cart items when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🛒 Cart modal opened with items:', items);
      console.log('🛒 Total items:', items.length);
      console.log('🛒 Total price:', getTotalPrice());
    }
  }, [isOpen, items, getTotalPrice]);

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
          "p-0 gap-0 border-0 shadow-2xl overflow-hidden",
          isMobile 
            ? "w-screen h-screen max-w-none max-h-none rounded-none" 
            : "w-[95vw] h-[95vh] max-w-7xl max-h-[95vh] rounded-2xl"
        )}
        data-testid="cart-modal"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-orange-50 to-red-50 sticky top-0 z-10">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                আপনার কার্ট
              </DialogTitle>
              <DialogDescription className="text-base sm:text-lg text-gray-600">
                {items.length} টি পণ্য নির্বাচিত
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="rounded-full h-10 w-10 sm:h-12 sm:w-12 p-0 hover:bg-white/50"
            data-testid="close-cart"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className={cn(
          "flex flex-1 min-h-0",
          isMobile ? "flex-col" : "flex-row"
        )}>
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-gray-50">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-lg">
                <Package2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">আপনার কার্ট খালি</h3>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-md">
                কেনাকাটা শুরু করতে আমাদের দুর্দান্ত পণ্যগুলি দেখুন এবং কার্টে যোগ করুন
              </p>
              <Button 
                onClick={onClose} 
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-lg px-8 py-4 h-auto"
              >
                কেনাকাটা শুরু করুন
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items - Left/Top Side */}
              <div className={cn(
                "bg-gray-50 p-4 sm:p-6",
                isMobile ? "flex-1 max-h-[60vh]" : "flex-1"
              )}>
                <div className="mb-4 sm:mb-6 flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">নির্বাচিত পণ্যসমূহ</h2>
                  {items.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      data-testid="clear-cart"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">সব সরান</span>
                      <span className="sm:hidden">সরান</span>
                    </Button>
                  )}
                </div>

                <ScrollArea className={cn(
                  "pr-2 sm:pr-4",
                  isMobile ? "h-full" : "h-full"
                )}>
                  <div className="space-y-3 sm:space-y-6">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className={cn(
                          "bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow",
                          isMobile ? "p-4 flex gap-4" : "p-6 flex gap-6"
                        )}
                        data-testid={`cart-item-${item.id}`}
                      >
                        {/* Product Image */}
                        <div className={cn(
                          "rounded-xl overflow-hidden bg-gray-100 border flex-shrink-0",
                          isMobile ? "w-20 h-20" : "w-24 h-24"
                        )}>
                          <img
                            src={item.image_url || item.image || '/placeholder.png'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-semibold text-gray-900 mb-2 line-clamp-2",
                            isMobile ? "text-base" : "text-lg"
                          )}>
                            {item.name}
                          </h4>
                          <p className={cn(
                            "font-bold text-orange-600 mb-3 sm:mb-4",
                            isMobile ? "text-base" : "text-lg"
                          )}>
                            {formatPrice(item.price)} প্রতিটি
                          </p>

                          {/* Quantity Controls */}
                          <div className={cn(
                            "flex items-center mb-3 sm:mb-4",
                            isMobile ? "gap-2" : "gap-4"
                          )}>
                            <span className="text-xs sm:text-sm font-medium text-gray-700">পরিমাণ:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={cn(
                                  "p-0 rounded-full",
                                  isMobile ? "h-7 w-7" : "h-8 w-8"
                                )}
                                data-testid={`decrease-quantity-${item.id}`}
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Badge variant="secondary" className={cn(
                                "justify-center",
                                isMobile ? "px-3 py-1 text-sm min-w-[40px]" : "px-4 py-1 text-base min-w-[48px]"
                              )}>
                                {item.quantity}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className={cn(
                                  "p-0 rounded-full",
                                  isMobile ? "h-7 w-7" : "h-8 w-8"
                                )}
                                data-testid={`increase-quantity-${item.id}`}
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Subtotal & Remove */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-xs sm:text-sm text-gray-600">সাবটোটাল: </span>
                              <span className={cn(
                                "font-bold text-gray-900",
                                isMobile ? "text-base" : "text-lg"
                              )}>
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className={cn(
                                "text-red-500 hover:text-red-600 hover:bg-red-50",
                                isMobile ? "h-8 px-2" : "h-10 px-4"
                              )}
                              data-testid={`remove-item-${item.id}`}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">সরান</span>
                              <span className="sm:hidden text-xs">সরান</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Order Summary - Right/Bottom Side */}
              <div className={cn(
                "bg-white flex flex-col",
                isMobile ? "border-t p-4" : "w-96 border-l"
              )}>
                <div className={cn(
                  "border-b",
                  isMobile ? "p-4 pb-4" : "p-6"
                )}>
                  <h2 className={cn(
                    "font-bold text-gray-900 mb-4",
                    isMobile ? "text-lg" : "text-xl"
                  )}>অর্ডার সারসংক্ষেপ</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className={cn(
                      "flex justify-between",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      <span className="text-gray-600">সাবটোটাল:</span>
                      <span className="font-semibold">{formatPrice(total)}</span>
                    </div>
                    
                    <div className={cn(
                      "flex justify-between",
                      isMobile ? "text-base" : "text-lg"
                    )}>
                      <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                      <span className={cn(
                        "font-semibold",
                        deliveryFee === 0 ? "text-green-600" : "text-gray-900"
                      )}>
                        {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    
                    {deliveryFee === 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className={cn(
                          "text-green-700 font-medium",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন
                        </p>
                      </div>
                    )}
                    
                    {deliveryFee > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className={cn(
                          "text-blue-700",
                          isMobile ? "text-xs" : "text-sm"
                        )}>
                          আরও {formatPrice(1600 - total)} কিনলে ফ্রি ডেলিভারি পাবেন!
                        </p>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className={cn(
                      "flex justify-between font-bold",
                      isMobile ? "text-lg" : "text-xl"
                    )}>
                      <span>মোট:</span>
                      <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={cn(
                  "flex flex-col space-y-3 sm:space-y-4",
                  isMobile ? "flex-1 justify-end p-4" : "flex-1 justify-end p-6"
                )}>
                  <Button
                    onClick={onCheckout}
                    size="lg"
                    className={cn(
                      "w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold",
                      isMobile ? "text-base h-12" : "text-lg h-14"
                    )}
                    data-testid="checkout-button"
                  >
                    চেকআউট করুন
                    <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onClose}
                    className={cn(
                      "w-full",
                      isMobile ? "text-base h-10" : "text-lg h-12"
                    )}
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
