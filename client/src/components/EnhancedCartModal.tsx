import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Truck, 
  Gift,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Trash2
} from "lucide-react";

import PerfectCheckoutPage from "./PerfectCheckoutPage";

interface EnhancedCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedCartModal({ isOpen, onClose }: EnhancedCartModalProps) {
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCart();
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Calculate delivery and totals
  const subtotal = getTotalPrice();
  const deliveryThreshold = 1600;
  const deliveryCharge = subtotal >= deliveryThreshold ? 0 : 60;
  const total = subtotal + deliveryCharge;

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
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
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (orderId: string) => {
    setShowCheckout(false);
    onClose();
    toast({
      title: "অর্ডার সফল!",
      description: `অর্ডার নং: ${orderId}`,
      duration: 5000,
    });
    setLocation(`/track/${orderId}`);
  };

  if (showCheckout) {
    return (
      <Dialog open={true} onOpenChange={() => setShowCheckout(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <PerfectCheckoutPage 
            onSuccess={handleCheckoutSuccess}
            onBack={() => setShowCheckout(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>আপনার কার্ট ({getTotalItems()})</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">আপনার কার্ট খালি</h3>
              <p className="text-gray-600 mb-6">কেনাকাটা শুরু করতে কিছু পণ্য যোগ করুন</p>
              <Button onClick={onClose}>কেনাকাটা শুরু করুন</Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={item.image_url || item.image || '/placeholder-product.png'}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg border"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-product.png';
                                }}
                              />
                            </div>
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.name}
                              </h4>
                              <p className="text-lg font-bold text-orange-600 mb-2">
                                {formatPrice(item.price)} / টি
                              </p>
                              
                              {/* Customization Display */}
                              {item.customization && (
                                <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                  <Badge variant="outline" className="mb-1 text-xs">
                                    কাস্টমাইজড
                                  </Badge>
                                  <div className="text-xs text-blue-700 space-y-1">
                                    {item.customization.text && (
                                      <p><strong>টেক্সট:</strong> "{item.customization.text}"</p>
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
                              
                              <p className="text-sm font-semibold text-green-600">
                                সাবটোটাল: {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              
                              <span className="w-8 text-center font-medium text-sm">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Separator />

              {/* Order Summary */}
              <Card className="bg-gradient-to-r from-gray-50 to-orange-50 border border-orange-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>পণ্যের মূল্য:</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-700">
                      <span className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        ডেলিভারি চার্জ:
                      </span>
                      <span className={`font-semibold ${deliveryCharge === 0 ? "text-green-600" : ""}`}>
                        {deliveryCharge === 0 ? "ফ্রি!" : formatPrice(deliveryCharge)}
                      </span>
                    </div>

                    {/* Free Delivery Progress */}
                    {subtotal < deliveryThreshold && (
                      <div className="text-xs text-orange-700 bg-orange-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-4 h-4" />
                          <span>আরও {formatPrice(deliveryThreshold - subtotal)} কিনলে ফ্রি ডেলিভারি!</span>
                        </div>
                        <div className="bg-orange-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((subtotal / deliveryThreshold) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Free Delivery Achieved */}
                    {deliveryCharge === 0 && subtotal > 0 && (
                      <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-semibold">🎉 অভিনন্দন! ফ্রি ডেলিভারি!</span>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-gray-900">সর্বমোট:</span>
                      <span className="text-green-600">{formatPrice(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowClearConfirm(true)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  কার্ট খালি করুন
                </Button>
                
                <Button 
                  onClick={handleCheckout}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  চেকআউট
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onClose();
                    setLocation('/products');
                  }}
                  className="flex-1"
                >
                  আরও কেনাকাটা
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    onClose();
                    setLocation('/custom');
                  }}
                  className="flex-1"
                >
                  কাস্টম অর্ডার
                </Button>
              </div>

              {/* Clear Cart Confirmation */}
              {showClearConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
                    <h3 className="font-semibold mb-2">কার্ট খালি করবেন?</h3>
                    <p className="text-gray-600 mb-4">এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1"
                      >
                        বাতিল
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleClearCart}
                        className="flex-1"
                      >
                        হ্যাঁ, খালি করুন
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}