import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import { useLocation } from "wouter";
import DynamicCheckoutModal from "./dynamic-checkout-modal";

interface EnhancedCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedCartModal({ isOpen, onClose }: EnhancedCartModalProps) {
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    onClose();
    setShowCheckout(true);
  };

  const handleOrderComplete = () => {
    clearCart();
    setShowCheckout(false);
  };

  const handleContinueShopping = () => {
    onClose();
    setLocation('/products');
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ShoppingCart className="w-6 h-6 text-orange-500" />
              আপনার কার্ট
              {totalItems > 0 && (
                <Badge className="bg-orange-500 text-white ml-2">
                  {totalItems}টি পণ্য
                </Badge>
              )}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Cart Content */}
        <div className="flex flex-col h-full max-h-[calc(85vh-120px)]">
          {cart.length === 0 ? (
            /* Empty Cart State */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  আপনার কার্ট খালি
                </h3>
                <p className="text-gray-600 mb-6">
                  কিছু পণ্য যোগ করুন এবং কেনাকাটা শুরু করুন
                </p>
                <Button
                  onClick={handleContinueShopping}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Package className="w-4 h-4 mr-2" />
                  কেনাকাটা করুন
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <ScrollArea className="flex-1 px-6">
                <div className="py-4 space-y-4">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`}>
                      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
                          <img
                            src={item.image_url || '/placeholder-product.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 line-clamp-2">
                            {item.name}
                          </h4>
                          
                          {/* Customization Badge */}
                          {item.customization && Object.keys(item.customization).length > 0 && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              কাস্টমাইজড
                            </Badge>
                          )}
                          
                          {/* Price */}
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-orange-600">
                              {formatPrice(item.price)}
                            </span>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-8 h-8 p-0"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Item Total */}
                          <div className="text-right mt-1">
                            <span className="text-sm text-gray-600">
                              মোট: <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Cart Summary & Actions */}
              <div className="border-t bg-white p-6 space-y-4">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">মোট পণ্য:</span>
                    <span className="font-medium">{totalItems}টি</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">সাব-টোটাল:</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                    <span className="font-medium text-orange-600">ফ্রি</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>মোট:</span>
                    <span className="text-orange-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleContinueShopping}
                    className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    আরো কিনুন
                  </Button>
                  
                  <Button
                    onClick={handleCheckout}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    চেকআউট করুন
                  </Button>
                </div>

                {/* Clear Cart */}
                {cart.length > 0 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      কার্ট খালি করুন
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Dynamic Checkout Modal */}
    <DynamicCheckoutModal
      isOpen={showCheckout}
      onClose={() => setShowCheckout(false)}
      cart={cart}
      onOrderComplete={handleOrderComplete}
    />
  </>
);
}