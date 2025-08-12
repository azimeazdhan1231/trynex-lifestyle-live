import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, Plus, Minus, Trash2, 
  ShoppingBag, X, Heart
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import EnhancedCheckoutModal from "./enhanced-checkout-modal";

interface EnhancedCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedCartModal({ isOpen, onClose }: EnhancedCartModalProps) {
  const { cart: items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = React.useState(false);

  const deliveryCharge = totalPrice > 1000 ? 0 : 60;
  const finalTotal = totalPrice + deliveryCharge;

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast({
      title: "পণ্য সরানো হয়েছে",
      description: "পণ্যটি আপনার কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "কার্ট খালি করা হয়েছে",
      description: "সব পণ্য কার্ট থেকে সরানো হয়েছে",
    });
  };

  const handleCheckout = () => {
    onClose();
    setIsCheckoutOpen(true);
  };

  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              আপনার কার্ট
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-12">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-700 mb-3">কার্ট খালি</h3>
            <p className="text-gray-500 mb-6">আপনার কার্টে কোনো পণ্য নেই</p>
            <Button 
              onClick={onClose}
              className="bg-primary hover:bg-primary/90"
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                আপনার কার্ট ({totalItems} টি পণ্য)
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

          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item: any) => (
                <Card key={`${item.id}-${JSON.stringify(item.customization)}`} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image_url || item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.png';
                        }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                        
                        {item.customization && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              কাস্টমাইজড
                            </Badge>
                            <div className="text-xs text-blue-600 mt-1 space-y-0.5">
                              {item.customization.text && (
                                <p><strong>টেক্সট:</strong> {item.customization.text}</p>
                              )}
                              {item.customization.color && (
                                <p><strong>রং:</strong> {item.customization.color}</p>
                              )}
                              {item.customization.size && (
                                <p><strong>সাইজ:</strong> {item.customization.size}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 border rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="h-6 w-6 p-0"
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-700 h-6 p-1"
                            data-testid={`button-remove-${item.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Cart Summary */}
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>পণ্যের মূল্য:</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
                    {deliveryCharge === 0 ? "ফ্রি ডেলিভারি!" : formatPrice(deliveryCharge)}
                  </span>
                </div>

                {totalPrice < 1000 && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    আরও {formatPrice(1000 - totalPrice)} কিনলে ফ্রি ডেলিভারি পাবেন!
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>সর্বমোট:</span>
                  <span className="text-green-600">{formatPrice(finalTotal)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-300"
                  data-testid="button-continue-shopping"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  আরো কিনুন
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  data-testid="button-clear-cart"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  কার্ট খালি করুন
                </Button>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                data-testid="button-proceed-checkout"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                চেকআউট করুন ({formatPrice(finalTotal)})
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 text-red-500" />
                  ১০০% নিরাপদ ও সুরক্ষিত লেনদেন
                </p>
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