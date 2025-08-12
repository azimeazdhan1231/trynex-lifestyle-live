import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Plus,
  Minus,
  Trash2, 
  ShoppingBag, 
  X,
  Heart,
  MessageCircle,
  CreditCard,
  Package,
  Truck,
  Gift
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import EnhancedCheckoutModal from "./enhanced-checkout-modal";
import CartItemCard from "./cart-item-card";
import CartSummary from "./cart-summary";

interface UnifiedCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UnifiedCartModal({ isOpen, onClose }: UnifiedCartModalProps) {
  const { 
    cart: items, 
    totalPrice, 
    totalItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    isLoaded 
  } = useCart();
  
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Calculate delivery and totals
  const deliveryThreshold = 1000;
  const deliveryCharge = totalPrice >= deliveryThreshold ? 0 : 60;
  const finalTotal = totalPrice + deliveryCharge;

  // WhatsApp integration
  const createWhatsAppUrl = () => {
    const phoneNumber = "8801765555593";
    const itemsText = items.map(item => 
      `${item.name} - ৳${item.price} × ${item.quantity} = ৳${item.price * item.quantity}`
    ).join('\n');

    const message = `আসসালামু আলাইকুম! আমি অর্ডার দিতে চাই।

📦 পণ্যসমূহ:
${itemsText}

💰 সাবটোটাল: ৳${totalPrice}
🚚 ডেলিভারি: ৳${deliveryCharge}
💳 মোট: ৳${finalTotal}

দয়া করে অর্ডার কনফার্ম করুন।`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast({
      title: "পণ্য সরানো হয়েছে",
      description: "পণ্যটি আপনার কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  const handleClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    toast({
      title: "কার্ট খালি করা হয়েছে",
      description: "সব পণ্য কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    onClose();
    setIsCheckoutOpen(true);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              আপনার কার্ট
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">কার্ট লোড হচ্ছে...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                আপনার কার্ট
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
                data-testid="button-close-cart"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-16">
            <div className="relative mb-6">
              <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto" />
              <div className="absolute -bottom-2 -right-2 bg-orange-100 rounded-full p-2">
                <Gift className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">কার্ট খালি</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              আপনার কার্টে এখনো কোনো পণ্য নেই। আমাদের বিশেষ কালেকশন দেখুন এবং পছন্দের পণ্য যোগ করুন।
            </p>
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8 py-3"
              data-testid="button-continue-shopping"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              কেনাকাটা শুরু করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">আপনার কার্ট</h2>
                  <p className="text-sm text-gray-600">{totalItems} টি পণ্য নির্বাচিত</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                data-testid="button-close-cart"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item: any) => (
                <CartItemCard
                  key={`${item.id}-${JSON.stringify(item.customization)}`}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            <Separator className="my-6" />

            {/* Cart Summary */}
            <CartSummary
              totalPrice={totalPrice}
              deliveryCharge={deliveryCharge}
              deliveryThreshold={deliveryThreshold}
              finalTotal={finalTotal}
            />

            {/* Action Buttons */}
            <div className="space-y-4 mt-6">
              {/* Primary Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-lg font-semibold"
                  data-testid="button-proceed-checkout"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  চেকআউট ({formatPrice(finalTotal)})
                </Button>

                <Button
                  onClick={() => window.open(createWhatsAppUrl(), '_blank')}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50 py-4 text-lg font-semibold border-2"
                  data-testid="button-whatsapp-order"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  হোয়াটসঅ্যাপে অর্ডার
                </Button>
              </div>

              {/* Secondary Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 py-3"
                  data-testid="button-continue-shopping"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  আরো কেনাকাটা
                </Button>

                <Button
                  onClick={() => setShowClearConfirm(true)}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 py-3 px-6"
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  কার্ট খালি করুন
                </Button>
              </div>

              {/* Clear Cart Confirmation */}
              {showClearConfirm && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-red-800 mb-3 font-medium">
                      আপনি কি সত্যিই সব পণ্য কার্ট থেকে সরাতে চান?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleClearCart}
                        variant="destructive"
                        size="sm"
                        data-testid="button-confirm-clear"
                      >
                        হ্যাঁ, খালি করুন
                      </Button>
                      <Button
                        onClick={() => setShowClearConfirm(false)}
                        variant="outline"
                        size="sm"
                        data-testid="button-cancel-clear"
                      >
                        বাতিল
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Trust Indicators */}
              <div className="text-center pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>১০০% নিরাপদ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span>দ্রুত ডেলিভারি</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span>২৪/৭ সাপোর্ট</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Checkout Modal */}
      <EnhancedCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={(orderId) => {
          setIsCheckoutOpen(false);
          // Navigate to tracking or order success page
          window.location.href = `/tracking?id=${orderId}`;
        }}
      />
    </>
  );
}