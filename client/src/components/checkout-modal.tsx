import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DISTRICTS, THANAS_BY_DISTRICT, formatPrice, calculateDeliveryFee } from "@/lib/constants";
import OrderSuccessModal from "@/components/order-success-modal";
import { trackInitiateCheckout, trackPurchase } from "@/lib/analytics";
import type { Order } from "@shared/schema";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onOrderComplete: () => void;
}

export default function CheckoutModal({ isOpen, onClose, cart, onOrderComplete }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    district: "",
    thana: "",
    address: "",
    payment_number: "",
    trx_id: "",
  });
  const [deliveryFee, setDeliveryFee] = useState(80);
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Check if this is a custom order from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isCustomOrder = urlParams.get('customOrder') === 'true';
  const customAdvancePayment = urlParams.get('advancePayment') ? parseInt(urlParams.get('advancePayment')!) : 100;

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalPrice = subtotal + deliveryFee;

  // Update delivery fee and available thanas when district changes
  useEffect(() => {
    if (formData.district) {
      const fee = calculateDeliveryFee(formData.district);
      setDeliveryFee(fee);
      setAvailableThanas(THANAS_BY_DISTRICT[formData.district] || []);
      // Reset thana when district changes
      setFormData(prev => ({ ...prev, thana: "" }));
    } else {
      setAvailableThanas([]);
      setDeliveryFee(80);
    }
  }, [formData.district]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      try {
        const response = await apiRequest("POST", "/api/orders", orderData);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Order creation failed: ${errorData}`);
        }
        const result = await response.json();
        return result;
      } catch (error) {
        console.error('Order submission error:', error);
        throw error;
      }
    },
    onSuccess: (orderResponse: any) => {
      console.log('Order response:', orderResponse);
      
      if (orderResponse && orderResponse.success) {
        // Track successful purchase
        if (orderResponse.tracking_id) {
          trackPurchase(Number(totalPrice), orderResponse.tracking_id);
        }

        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
        
        // Create order object for success modal
        const orderForModal = {
          id: orderResponse.order_id,
          tracking_id: orderResponse.tracking_id,
          total: totalPrice.toString(),
          items: cart,
          customer_name: formData.customer_name,
          phone: formData.phone,
          district: formData.district,
          thana: formData.thana,
          address: formData.address,
          status: 'pending',
          created_at: new Date().toISOString()
        };
        
        setCompletedOrder(orderForModal);
        setShowSuccessModal(true);
        onClose(); // Close checkout modal
        onOrderComplete();
        
        // Reset form
        setFormData({
          customer_name: "",
          phone: "",
          district: "",
          thana: "",
          address: "",
          payment_number: "",
          trx_id: "",
        });

        toast({
          title: "অর্ডার সফল!",
          description: `আপনার অর্ডার নিশ্চিত হয়েছে। ট্র্যাকিং আইডি: ${orderResponse.tracking_id}`,
        });
      } else {
        throw new Error('Invalid order response');
      }
    },
    onError: (error: any) => {
      console.error('Order creation error:', error);
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "অর্ডার প্রক্রিয়ায় সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.phone || !formData.district || !formData.thana) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "কার্ট খালি",
        description: "অর্ডার করার জন্য কার্টে পণ্য যোগ করুন।",
        variant: "destructive",
      });
      return;
    }

    // Track checkout initiation
    trackInitiateCheckout(totalPrice, cart.length);

    // Convert File objects to base64 for order items
    const processedItems = await Promise.all(cart.map(async (item: any) => {
      const processedItem = { ...item, delivery_fee: deliveryFee };

      if (item.customization && item.customization.customImage) {
        try {
          let base64Image = null;

          if (item.customization.customImage instanceof File) {
            base64Image = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(item.customization.customImage);
            });
          } else if (typeof item.customization.customImage === 'string') {
            // Already base64 encoded
            base64Image = item.customization.customImage;
          }

          processedItem.customization = {
            ...item.customization,
            customImage: base64Image,
            customImageName: item.customization.customImageName || item.customization.customImage?.name || 'custom-image.jpg'
          };
        } catch (error) {
          console.error('Error processing custom image:', error);
          // Keep other customization data even if image fails
          processedItem.customization = {
            ...item.customization,
            customImage: null
          };
        }
      }

      return processedItem;
    }));

    // Collect payment info
    const paymentInfo = {
      payment_number: formData.payment_number,
      trx_id: formData.trx_id,
      payment_method: "bKash/Nagad",
      amount_paid: isCustomOrder ? customAdvancePayment : totalPrice,
    };

    const orderData = {
      ...formData,
      items: processedItems,
      total: totalPrice.toString(),
      delivery_fee: deliveryFee,
      payment_info: paymentInfo,
    };

    console.log('Submitting order with processed items:', orderData);
    createOrderMutation.mutate(orderData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col m-2 sm:m-6">
        <DialogHeader className="flex-shrink-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
            অর্ডার সম্পূর্ণ করুন
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
            আপনার অর্ডার সম্পূর্ণ করতে প্রয়োজনীয় তথ্য প্রদান করুন
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="customer_name">পূর্ণ নাম *</Label>
              <Input
                id="customer_name"
                type="text"
                value={formData.customer_name}
                onChange={(e) => handleInputChange("customer_name", e.target.value)}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">মোবাইল নম্বর *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="০১৭xxxxxxxx"
                required
              />
            </div>

            <div>
              <Label htmlFor="district">জেলা *</Label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">জেলা নির্বাচন করুন</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="thana">থানা *</Label>
              <select
                id="thana"
                value={formData.thana}
                onChange={(e) => handleInputChange("thana", e.target.value)}
                disabled={!formData.district}
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">{formData.district ? "থানা নির্বাচন করুন" : "প্রথমে জেলা নির্বাচন করুন"}</option>
                {availableThanas.map((thana) => (
                  <option key={thana} value={thana}>
                    {thana}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="address">সম্পূর্ণ ঠিকানা</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="বিস্তারিত ঠিকানা লিখুন"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold">অর্ডার সারসংক্ষেপ</h4>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span>পণ্যের মূল্য:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>ডেলিভারি চার্জ:</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center font-semibold">
              <span>মোট পরিমাণ:</span>
              <span className="text-lg text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-700 font-medium mb-3">
                অর্ডার নিশ্চিত করতে পেমেন্ট করুন:
              </p>
              <p className="text-orange-900 font-bold text-lg mb-2">
                bKash/Nagad: 01747292277
              </p>
              <div className="bg-orange-100 p-3 rounded-md mb-3">
                <p className="text-orange-800 font-semibold text-sm mb-1">
                  পেমেন্ট অপশন:
                </p>
                {isCustomOrder ? (
                  <div className="space-y-1">
                    <p className="text-orange-700 text-xs font-bold">
                      🎯 কাস্টম অর্ডার অগ্রিম: {formatPrice(customAdvancePayment)}
                    </p>
                    <p className="text-orange-600 text-xs">
                      বাকি টাকা পণ্য পাওয়ার সময় পরিশোধ করুন
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-orange-700 text-xs mb-1">
                      • সর্বনিম্ন: {formatPrice(deliveryFee)} (শুধু ডেলিভারি চার্জ)
                    </p>
                    <p className="text-orange-700 text-xs">
                      • সুপারিশকৃত: {formatPrice(totalPrice)} (সম্পূর্ণ অর্ডার পরিমাণ)
                    </p>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="payment_number" className="text-xs text-orange-700">পেমেন্ট নম্বরের শেষ ৪ সংখ্যা</Label>
                  <Input
                    id="payment_number"
                    type="text"
                    maxLength={4}
                    value={formData.payment_number}
                    onChange={(e) => handleInputChange("payment_number", e.target.value)}
                    placeholder="যেমন: 2277"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="trx_id" className="text-xs text-orange-700">ট্রানজেকশন আইডি</Label>
                  <Input
                    id="trx_id"
                    type="text"
                    value={formData.trx_id}
                    onChange={(e) => handleInputChange("trx_id", e.target.value)}
                    placeholder="TrxID12345"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="payment_screenshot" className="text-xs text-orange-700">পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)</Label>
                  <Input
                    id="payment_screenshot"
                    type="file"
                    accept="image/*"
                    className="text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-orange-600 mt-3 border-t border-orange-200 pt-2">
                পেমেন্ট করার পর ট্রানজেকশন তথ্য সহ WhatsApp করুন: 01747292277
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? "অর্ডার প্রক্রিয়াধীন..." : "অর্ডার নিশ্চিত করুন"}
          </Button>
        </form>
        </div>
      </DialogContent>

      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        order={completedOrder}
      />
    </Dialog>
  );
}