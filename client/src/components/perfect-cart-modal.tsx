import { useState } from "react";
import PerfectModalBase from "./perfect-modal-base";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  Package,
  ArrowRight,
  MessageCircle,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  customization?: any;
}

interface PerfectCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export default function PerfectCartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout
}: PerfectCartModalProps) {
  const { toast } = useToast();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal >= 2000 ? 0 : 120;
  const total = subtotal + deliveryFee;

  const createWhatsAppUrl = () => {
    const phoneNumber = "8801765555593";
    const itemsText = cartItems.map(item => 
      `${item.name} - ৳${item.price} × ${item.quantity} = ৳${item.price * item.quantity}`
    ).join('\n');

    const message = `আসসালামু আলাইকুম! আমি অর্ডার দিতে চাই।

পণ্যসমূহ:
${itemsText}

সাবটোটাল: ৳${subtotal}
ডেলিভারি: ৳${deliveryFee}
মোট: ৳${total}

দয়া করে অর্ডার কনফার্ম করুন।`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleQuantityChange = (id: string, change: number) => {
    const item = cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + change);
      onUpdateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    onRemoveItem(id);
    toast({
      title: "পণ্য সরানো হয়েছে",
      description: "পণ্যটি কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  const handleClearCart = () => {
    onClearCart();
    toast({
      title: "কার্ট খালি করা হয়েছে",
      description: "সব পণ্য কার্ট থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  if (cartItems.length === 0) {
    return (
      <PerfectModalBase
        isOpen={isOpen}
        onClose={onClose}
        title="কার্ট খালি"
        description="আপনার কার্টে কোন পণ্য নেই"
        maxWidth="md"
        data-testid="modal-empty-cart"
      >
        <div className="text-center py-8">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            আপনার কার্ট খালি
          </h3>
          <p className="text-gray-600 mb-6">
            কেনাকাটা শুরু করতে পণ্য যোগ করুন
          </p>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            কেনাকাটা চালিয়ে যান
          </Button>
        </div>
      </PerfectModalBase>
    );
  }

  return (
    <PerfectModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={`কার্ট (${cartItems.length} টি পণ্য)`}
      description="আপনার নির্বাচিত পণ্যসমূহ"
      maxWidth="4xl"
      data-testid="modal-cart"
    >
      <div className="space-y-6">
        {/* Cart Items */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {cartItems.map((item, index) => (
            <Card key={item.id || index} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  )}

                  {/* Product Details */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                    
                    {/* Customization Info */}
                    {item.customization && (
                      <div className="mb-2">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                          কাস্টমাইজড
                        </Badge>
                        {item.customization.color && (
                          <span className="text-xs text-gray-600 ml-2">
                            রং: {item.customization.color_name}
                          </span>
                        )}
                        {item.customization.text && (
                          <span className="text-xs text-gray-600 ml-2">
                            টেক্সট: "{item.customization.text}"
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-green-600">
                        ৳{item.price}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0"
                          data-testid={`button-decrease-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="h-8 w-8 p-0"
                          data-testid={`button-increase-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                          data-testid={`button-remove-${item.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right text-sm font-medium text-gray-900 mt-2">
                      মোট: ৳{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Cart Summary */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              অর্ডার সারাংশ
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>পণ্যের দাম:</span>
                <span>৳{subtotal}</span>
              </div>
              
              <div className="flex justify-between text-gray-700">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{deliveryFee}</span>
              </div>
              
              {subtotal >= 2000 && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
                  <span className="text-green-800 font-medium">
                    🎉 আপনি ফ্রি ডেলিভারি পেয়েছেন!
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>সর্বমোট:</span>
                <span className="text-green-600">৳{total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={onCheckout}
              className="bg-green-600 hover:bg-green-700 text-white py-3"
              data-testid="button-checkout"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              চেকআউট (৳{total})
            </Button>

            <Button
              onClick={() => window.open(createWhatsAppUrl(), '_blank')}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50 py-3"
              data-testid="button-whatsapp-order"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              হোয়াটসঅ্যাপে অর্ডার
            </Button>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              data-testid="button-continue-shopping"
            >
              কেনাকাটা চালিয়ে যান
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={handleClearCart}
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="button-clear-cart"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              কার্ট খালি করুন
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
          <span>কোন সমস্যা হলে হোয়াটসঅ্যাপে যোগাযোগ করুন। আমরা ২৪/৭ সেবা প্রদান করি।</span>
        </div>
      </div>
    </PerfectModalBase>
  );
}