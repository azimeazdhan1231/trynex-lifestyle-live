import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { Link, useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Truck, 
  Gift,
  CreditCard,
  CheckCircle,
  ArrowRight,
  Trash2,
  ShoppingBag,
  Package
} from "lucide-react";

import PerfectCheckoutPage from "./PerfectCheckoutPage";

export default function PerfectCartPage() {
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
    toast({
      title: "অর্ডার সফল!",
      description: `অর্ডার নং: ${orderId}`,
      duration: 5000,
    });
    setLocation(`/track/${orderId}`);
  };

  if (showCheckout) {
    return (
      <PerfectCheckoutPage 
        onSuccess={handleCheckoutSuccess}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-400" />
          <h1 className="text-3xl font-bold mb-4">আপনার কার্ট খালি</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            কেনাকাটা শুরু করতে আমাদের দুর্দান্ত পণ্যগুলো দেখুন
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/products">
              <Button size="lg">
                <ShoppingCart className="w-5 h-5 mr-2" />
                কেনাকাটা শুরু করুন
              </Button>
            </Link>
            <Link href="/custom">
              <Button variant="outline" size="lg">
                <Package className="w-5 h-5 mr-2" />
                কাস্টম অর্ডার
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            আপনার কার্ট ({getTotalItems()} টি পণ্য)
          </h1>
          <p className="text-gray-600">
            চেকআউট করার আগে আপনার অর্ডার পর্যালোচনা করুন
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">কার্ট আইটেম</h2>
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                সব পণ্য মুছুন
              </Button>
            </div>

            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.image_url || item.image || '/placeholder-product.png'}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.png';
                            }}
                          />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-xl font-bold text-orange-600 mb-3">
                            {formatPrice(item.price)} / টি
                          </p>
                          
                          {/* Customization Display */}
                          {item.customization && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="w-4 h-4 text-blue-600" />
                                <Badge variant="outline" className="bg-white text-blue-800 border-blue-300">
                                  কাস্টমাইজড
                                </Badge>
                              </div>
                              <div className="text-sm text-blue-700 space-y-1">
                                {item.customization.text && (
                                  <p><strong>টেক্সট:</strong> "{item.customization.text}"</p>
                                )}
                                {item.customization.color && (
                                  <p><strong>রং:</strong> {item.customization.color}</p>
                                )}
                                {item.customization.size && (
                                  <p><strong>সাইজ:</strong> {item.customization.size}</p>
                                )}
                                {item.customization.instructions && (
                                  <p><strong>বিশেষ নির্দেশনা:</strong> {item.customization.instructions}</p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-green-600">
                              সাবটোটাল: {formatPrice(item.price * item.quantity)}
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <span className="w-12 text-center font-bold text-lg">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue Shopping */}
            <div className="pt-4">
              <Link href="/products">
                <Button variant="outline" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  আরও কেনাকাটা করুন
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="sticky top-8">
              <Card className="bg-gradient-to-r from-gray-50 to-orange-50 border-2 border-orange-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-orange-600" />
                    <span className="text-lg">অর্ডার সারাংশ</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>পণ্যের মূল্য ({getTotalItems()} টি):</span>
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
                      <div className="text-sm text-orange-700 bg-orange-100 p-4 rounded-lg border border-orange-300">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-4 h-4" />
                          <span>আরও {formatPrice(deliveryThreshold - subtotal)} কিনলে ফ্রি ডেলিভারি!</span>
                        </div>
                        <div className="bg-orange-200 rounded-full h-3">
                          <div 
                            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((subtotal / deliveryThreshold) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Free Delivery Achieved */}
                    {deliveryCharge === 0 && subtotal > 0 && (
                      <div className="text-sm text-green-700 bg-green-100 p-4 rounded-lg border border-green-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">🎉 অভিনন্দন! ফ্রি ডেলিভারি পেয়েছেন!</span>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span className="text-gray-900">সর্বমোট:</span>
                      <span className="text-green-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button 
                    onClick={handleCheckout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    চেকআউট করুন
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  {/* Quick Actions */}
                  <div className="space-y-2 pt-2">
                    <Link href="/custom" className="block">
                      <Button variant="outline" className="w-full" size="sm">
                        <Package className="w-4 h-4 mr-2" />
                        কাস্টম অর্ডার
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => setShowClearConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      কার্ট খালি করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Clear Cart Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm mx-4 shadow-xl">
              <h3 className="font-semibold text-lg mb-2">কার্ট খালি করবেন?</h3>
              <p className="text-gray-600 mb-6">
                এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না। সব পণ্য কার্ট থেকে মুছে যাবে।
              </p>
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
      </div>
    </div>
  );
}