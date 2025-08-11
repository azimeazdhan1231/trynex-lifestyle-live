import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, Plus, Minus, Package, CreditCard } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import { useLocation } from "wouter";
import PerfectModalBase from "./perfect-modal-base";
import PerfectCheckoutModal from "./perfect-checkout-modal";

interface PerfectCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PerfectCartModal({ isOpen, onClose }: PerfectCartModalProps) {
  const { cart, updateQuantity, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    onClose();
    setShowCheckout(true);
  };

  const handleContinueShopping = () => {
    onClose();
    setLocation('/products');
  };

  const handleOrderComplete = () => {
    clearCart();
    setShowCheckout(false);
  };

  return (
    <>
      <PerfectModalBase
        isOpen={isOpen}
        onClose={onClose}
        title="আপনার কার্ট"
        maxWidth="max-w-lg"
      >
        {cart.length === 0 ? (
          /* Empty Cart */
          <div className="flex flex-col items-center justify-center p-6 min-h-[300px]">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              আপনার কার্ট খালি
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              কিছু পণ্য যোগ করুন এবং কেনাকাটা শুরু করুন
            </p>
            <Button
              onClick={handleContinueShopping}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Package className="w-4 h-4 mr-2" />
              পণ্য দেখুন
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="p-4 space-y-3 flex-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-orange-600 text-sm">
                        {formatPrice(item.price)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-6 h-6 p-0"
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-6 h-6 p-0"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 ml-1"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Actions */}
            <div className="border-t bg-white p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">মোট পণ্য:</span>
                <span className="font-medium">{totalItems}টি</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ডেলিভারি:</span>
                <span className="font-medium text-orange-600">ফ্রি</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>মোট:</span>
                <span className="text-orange-600">{formatPrice(totalPrice)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleContinueShopping}
                  size="sm"
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <Package className="w-4 h-4 mr-1" />
                  আরো কিনুন
                </Button>
                <Button
                  onClick={handleCheckout}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  চেকআউট
                </Button>
              </div>

              {cart.length > 0 && (
                <div className="text-center pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-6"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    কার্ট খালি করুন
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </PerfectModalBase>

      <PerfectCheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        onOrderComplete={handleOrderComplete}
      />
    </>
  );
}