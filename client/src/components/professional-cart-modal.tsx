import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  Heart,
  MessageCircle,
  CreditCard,
  Package,
  Truck,
  Gift,
  ArrowRight
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
// import ProfessionalCheckoutModal from "./professional-checkout-modal";

interface ProfessionalCartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfessionalCartModal({ isOpen, onClose }: ProfessionalCartModalProps) {
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
      description: "পণ্যটি কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "কার্ট খালি করা হয়েছে",
      description: "সব পণ্য কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    // Temporarily show toast instead of opening checkout
    toast({
      title: "চেকআউট বৈশিষ্ট্য",
      description: "চেকআউট বৈশিষ্ট্য শীঘ্রই উপলব্ধ হবে। এখনও হোয়াটসঅ্যাপে অর্ডার করুন।",
    });
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
        <DialogContent className="w-[95vw] max-w-2xl h-[60vh] max-h-[600px] p-0 flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b p-4">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              আপনার কার্ট
            </DialogTitle>
            <DialogDescription>
              কার্ট লোড হচ্ছে...
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center">
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
        <DialogContent className="w-[95vw] max-w-2xl h-[70vh] max-h-[700px] p-0 flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b p-4">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              আপনার কার্ট
            </DialogTitle>
            <DialogDescription>
              আপনার কার্টে কোনো পণ্য নেই
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="relative mb-6">
                <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto" />
                <div className="absolute -bottom-1 -right-1 bg-orange-100 rounded-full p-2">
                  <Gift className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">কার্ট খালি</h3>
              <p className="text-gray-600 mb-6">
                আপনার কার্টে এখনো কোনো পণ্য নেই। কেনাকাটা শুরু করুন।
              </p>
              <Button 
                onClick={onClose}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                data-testid="button-continue-shopping"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                কেনাকাটা শুরু করুন
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[900px] p-0 flex flex-col">
          <DialogHeader className="flex-shrink-0 border-b p-4">
            <DialogTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">আপনার কার্ট</h2>
                <p className="text-sm text-gray-600 font-normal">{totalItems} টি পণ্য নির্বাচিত</p>
              </div>
            </DialogTitle>
            <DialogDescription>
              আপনার নির্বাচিত পণ্যসমূহ দেখুন এবং চেকআউট করুন
            </DialogDescription>
          </DialogHeader>

          {/* Cart Content - Two Column Layout for Big Screens */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-6 p-4">
            
            {/* LEFT COLUMN: Cart Items */}
            <div className="flex-1 lg:w-2/3 min-h-0">
              <div className="h-full overflow-y-auto pr-2">
                <div className="space-y-3">
                  {items.map((item: any) => (
                    <Card key={`${item.id}-${JSON.stringify(item.customization)}`} className="border-l-4 border-l-orange-500">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.image_url || item.image}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder-product.png';
                              }}
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                              {item.name}
                            </h4>
                            <p className="text-base font-bold text-orange-600 mb-1">
                              {formatPrice(item.price)} / টি
                            </p>
                            
                            {/* Customization Display */}
                            {item.customization && (
                              <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="flex items-center gap-1 mb-1">
                                  <Package className="w-3 h-3 text-blue-600" />
                                  <Badge variant="outline" className="text-xs bg-white text-blue-800 border-blue-300">
                                    কাস্টমাইজড
                                  </Badge>
                                </div>
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

                            {/* Item Total */}
                            <p className="text-sm font-bold text-green-600">
                              মোট: {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>

                          {/* Quantity Controls & Actions */}
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1"
                              data-testid={`button-remove-${item.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            
                            <div className="flex items-center gap-1 bg-gray-50 rounded border">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="w-7 h-7 p-0 hover:bg-gray-200"
                                data-testid={`button-decrease-${item.id}`}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              
                              <span className="w-6 text-center font-bold text-sm">
                                {item.quantity}
                              </span>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-7 h-7 p-0 hover:bg-gray-200"
                                data-testid={`button-increase-${item.id}`}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Summary & Actions */}
            <div className="lg:w-1/3 lg:min-w-[320px] flex flex-col">
              {/* Cart Summary */}
              <Card className="bg-gradient-to-r from-gray-50 to-orange-50 border-orange-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-orange-600" />
                    <h3 className="font-bold text-gray-900">অর্ডার সারাংশ</h3>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>পণ্যের মূল্য:</span>
                      <span className="font-semibold">{formatPrice(totalPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between text-gray-700">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        ডেলিভারি চার্জ:
                      </span>
                      <span className={`font-semibold ${deliveryCharge === 0 ? "text-green-600" : ""}`}>
                        {deliveryCharge === 0 ? "ফ্রি!" : formatPrice(deliveryCharge)}
                      </span>
                    </div>

                    {totalPrice < deliveryThreshold && (
                      <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded border border-orange-300">
                        <div className="flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          <span>আরও {formatPrice(deliveryThreshold - totalPrice)} কিনলে ফ্রি ডেলিভারি!</span>
                        </div>
                      </div>
                    )}

                    {deliveryCharge === 0 && (
                      <div className="text-xs text-green-700 bg-green-100 p-2 rounded border border-green-300">
                        <div className="flex items-center gap-1">
                          <Gift className="w-3 h-3" />
                          <span className="font-semibold">🎉 ফ্রি ডেলিভারি পেয়েছেন!</span>
                        </div>
                      </div>
                    )}
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span className="text-gray-900">সর্বমোট:</span>
                      <span className="text-green-600">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3 flex-1 flex flex-col justify-end">
                {/* Primary Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 text-base font-semibold"
                  data-testid="button-proceed-checkout"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  চেকআউট করুন ({formatPrice(finalTotal)})
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => window.open(createWhatsAppUrl(), '_blank')}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                    data-testid="button-whatsapp-order"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    হোয়াটসঅ্যাপ
                  </Button>

                  <Button
                    onClick={handleClearCart}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    data-testid="button-clear-cart"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    খালি করুন
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="text-center pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>১০০% নিরাপদ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Truck className="w-3 h-3 text-blue-500" />
                      <span>দ্রুত ডেলিভারি</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Professional Checkout Modal - Temporarily disabled */}
      {/*<ProfessionalCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={items}
        totalAmount={finalTotal}
        onOrderComplete={() => {
          clearCart();
          setIsCheckoutOpen(false);
        }}
      />*/}
    </>
  );
}