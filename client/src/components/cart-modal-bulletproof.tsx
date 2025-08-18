import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart-bulletproof";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, Plus, Minus, Trash2, 
  ShoppingBag, X, Heart, Package, CreditCard,
  ArrowRight, Star
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useLocation } from "wouter";

interface CartModalBulletproofProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModalBulletproof({ isOpen, onClose }: CartModalBulletproofProps) {
  const { cart: items, totalPrice, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
    setLocation('/checkout');
  };

  const handleContinueShopping = () => {
    onClose();
    setLocation('/products');
  };

  // Empty cart state
  if (!items || items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md w-[95vw] sm:w-[90vw] rounded-xl bg-white dark:bg-gray-900 border-0 shadow-2xl">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="flex items-center justify-center gap-3 text-xl font-bold text-gray-900 dark:text-white">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              আপনার কার্ট
            </DialogTitle>
            <DialogDescription className="sr-only">আপনার কার্ট খালি আছে</DialogDescription>
          </DialogHeader>

          <div className="text-center py-8 px-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              কার্ট খালি
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              আপনার কার্টে কোনো পণ্য নেই। কেনাকাটা শুরু করুন!
            </p>
            <Button 
              onClick={handleContinueShopping}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
              size="lg"
            >
              <Package className="w-5 h-5 mr-2" />
              পণ্য দেখুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] lg:w-[85vw] max-h-[95vh] rounded-xl bg-white dark:bg-gray-900 border-0 shadow-2xl p-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  আপনার কার্ট
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalItems} টি পণ্য
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </Button>
          </DialogTitle>
          <DialogDescription className="sr-only">আপনার কার্টে {totalItems} টি পণ্য আছে</DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex flex-col h-full">

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-h-[50vh]">
            {items.map((item: any, index: number) => (
              <Card key={`${item.id}-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">

                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_url || item.image || '/placeholder-product.png'}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.png';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-base truncate mb-1">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        একক মূল্য: {formatPrice(item.price)}
                      </p>

                      {/* Customization Info */}
                      {item.customization && (
                        <div className="mb-3">
                          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                            কাস্টমাইজড
                          </Badge>
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            {item.customization.color && (
                              <p><span className="font-medium">রং:</span> {item.customization.color}</p>
                            )}
                            {item.customization.size && (
                              <p><span className="font-medium">সাইজ:</span> {item.customization.size}</p>
                            )}
                            {item.customization.text && (
                              <p><span className="font-medium">টেক্সট:</span> "{item.customization.text}"</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center text-sm font-medium py-1 px-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 p-0 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg text-orange-600 dark:text-orange-400">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          {/* Summary Section */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
            <Card className="border-0 bg-white dark:bg-gray-900 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">পণ্যের মূল্য:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(totalPrice)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">ডেলিভারি চার্জ:</span>
                  <span className={`font-medium ${deliveryCharge === 0 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                    {deliveryCharge === 0 ? "ফ্রি ডেলিভারি!" : formatPrice(deliveryCharge)}
                  </span>
                </div>

                {totalPrice < 1000 && (
                  <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
                    <p className="font-medium">
                      আরও {formatPrice(1000 - totalPrice)} কিনলে ফ্রি ডেলিভারি পাবেন! 🚚
                    </p>
                  </div>
                )}

                <Separator className="bg-gray-200 dark:bg-gray-700" />

                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">সর্বমোট:</span>
                  <span className="text-2xl text-green-600 dark:text-green-400">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleContinueShopping}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                আরো কিনুন
              </Button>

              <Button
                variant="outline"
                onClick={handleClearCart}
                className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                কার্ট খালি করুন
              </Button>
            </div>

            <Button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              size="lg"
            >
              <CreditCard className="w-5 h-5 mr-3" />
              চেকআউট করুন
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                <Heart className="w-3 h-3 text-red-500" />
                ১০০% নিরাপদ ও সুরক্ষিত লেনদেন
                <Star className="w-3 h-3 text-yellow-500" />
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}