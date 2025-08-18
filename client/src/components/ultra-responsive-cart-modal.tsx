
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
        className="p-0 gap-0 border-0 shadow-2xl overflow-hidden w-screen h-screen max-w-none max-h-none rounded-none fixed inset-0 z-50"
        data-testid="cart-modal"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b bg-gradient-to-r from-orange-50 to-red-50 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                আপনার কার্ট
              </DialogTitle>
              <DialogDescription className="text-lg text-gray-600">
                {items.length} টি পণ্য নির্বাচিত
              </DialogDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="rounded-full h-12 w-12 p-0 hover:bg-white/50"
            data-testid="close-cart"
          >
            <X className="h-6 w-6" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <div className="flex flex-1 min-h-0 h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8 shadow-lg">
                <Package2 className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">আপনার কার্ট খালি</h3>
              <p className="text-xl text-gray-600 mb-8 max-w-md">
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
              {/* Cart Items - Left Side (Takes 70% of screen) */}
              <div className="flex-1 bg-gray-50 p-8 overflow-hidden">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">নির্বাচিত পণ্যসমূহ</h2>
                  {items.length > 0 && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      data-testid="clear-cart"
                    >
                      <Trash2 className="w-5 h-5 mr-2" />
                      সব সরান
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[calc(100vh-200px)] pr-6">
                  <div className="space-y-8">
                    {items.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 p-8"
                        data-testid={`cart-item-${item.id}`}
                      >
                        <div className="flex gap-8">
                          {/* Product Image */}
                          <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-2 flex-shrink-0">
                            <img
                              src={item.image_url || item.image || '/placeholder.png'}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="font-bold text-orange-600 text-xl mb-6">
                              {formatPrice(item.price)} প্রতিটি
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-6 mb-6">
                              <span className="text-lg font-semibold text-gray-700">পরিমাণ:</span>
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="h-12 w-12 p-0 rounded-full border-2"
                                  data-testid={`decrease-quantity-${item.id}`}
                                >
                                  <Minus className="h-6 w-6" />
                                </Button>
                                <Badge variant="secondary" className="px-6 py-2 text-xl min-w-[60px] justify-center">
                                  {item.quantity}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="h-12 w-12 p-0 rounded-full border-2"
                                  data-testid={`increase-quantity-${item.id}`}
                                >
                                  <Plus className="h-6 w-6" />
                                </Button>
                              </div>
                            </div>

                            {/* Subtotal & Remove */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-lg text-gray-600">সাবটোটাল: </span>
                                <span className="font-bold text-gray-900 text-xl">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="lg"
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-12 px-6"
                                data-testid={`remove-item-${item.id}`}
                              >
                                <Trash2 className="h-5 w-5 mr-2" />
                                সরান
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Order Summary - Right Side (Takes 30% of screen) */}
              <div className="w-[480px] bg-white border-l-2 flex flex-col">
                <div className="p-8 border-b-2">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">অর্ডার সারসংক্ষেপ</h2>
                  
                  <div className="space-y-6">
                    <div className="flex justify-between text-xl">
                      <span className="text-gray-600">সাবটোটাল:</span>
                      <span className="font-bold">{formatPrice(total)}</span>
                    </div>
                    
                    <div className="flex justify-between text-xl">
                      <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                      <span className={cn(
                        "font-bold",
                        deliveryFee === 0 ? "text-green-600" : "text-gray-900"
                      )}>
                        {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
                      </span>
                    </div>
                    
                    {deliveryFee === 0 && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-green-700 font-bold text-lg">
                          🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন
                        </p>
                      </div>
                    )}
                    
                    {deliveryFee > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <p className="text-blue-700 text-lg">
                          আরও {formatPrice(1600 - total)} কিনলে ফ্রি ডেলিভারি পাবেন!
                        </p>
                      </div>
                    )}
                    
                    <Separator className="my-6" />
                    
                    <div className="flex justify-between text-2xl font-bold">
                      <span>মোট:</span>
                      <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex-1 flex flex-col justify-end p-8 space-y-6">
                  <Button
                    onClick={onCheckout}
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-bold text-xl h-16"
                    data-testid="checkout-button"
                  >
                    চেকআউট করুন
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onClose}
                    className="w-full text-xl h-14 border-2"
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
