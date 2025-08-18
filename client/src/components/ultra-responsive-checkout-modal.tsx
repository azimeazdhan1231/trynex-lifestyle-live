import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  X, 
  CreditCard, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  Smartphone
} from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  transactionId?: string;
  lastFourDigits?: string;
  notes?: string;
}

interface UltraResponsiveCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (trackingId: string) => void;
}

export default function UltraResponsiveCheckoutModal({ 
  isOpen, 
  onClose, 
  onOrderComplete 
}: UltraResponsiveCheckoutModalProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormData>({
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      paymentMethod: 'cash_on_delivery',
      transactionId: '',
      lastFourDigits: '',
      notes: ''
    }
  });

  const paymentMethod = form.watch('paymentMethod');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const total = getTotalPrice();
  const deliveryFee = total >= 1600 ? 0 : 120;
  const grandTotal = total + deliveryFee;

  // Payment method options with Bengali Mobile Banking
  const paymentOptions = [
    {
      value: 'bkash_cod',
      label: 'bKash + ক্যাশ অন ডেলিভারি',
      description: '৫০% এখন bKash এ, বাকি ডেলিভারিতে',
      number: '01747292277',
      icon: '📱',
      color: 'bg-pink-50 border-pink-200',
      amount: Math.round(grandTotal * 0.5)
    },
    {
      value: 'nagad_cod',
      label: 'Nagad + ক্যাশ অন ডেলিভারি',
      description: '৫০% এখন Nagad এ, বাকি ডেলিভারিতে',
      number: '01747292277',
      icon: '🟠',
      color: 'bg-orange-50 border-orange-200',
      amount: Math.round(grandTotal * 0.5)
    },
    {
      value: 'upay_cod',
      label: 'Upay + ক্যাশ অন ডেলিভারি',
      description: '৫০% এখন Upay তে, বাকি ডেলিভারিতে',
      number: '01747292277',
      icon: '🟣',
      color: 'bg-purple-50 border-purple-200',
      amount: Math.round(grandTotal * 0.5)
    },
    {
      value: 'cash_on_delivery',
      label: 'ক্যাশ অন ডেলিভারি',
      description: 'পণ্য হাতে পেয়ে পেমেন্ট করুন',
      icon: '💵',
      color: 'bg-green-50 border-green-200',
      amount: grandTotal
    }
  ];

  const selectedPaymentOption = paymentOptions.find(opt => opt.value === paymentMethod);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ফাইল সাইজ বেশি",
          description: "৫ MB এর চেয়ে ছোট ফাইল আপলোড করুন",
          variant: "destructive",
        });
        return;
      }
      setScreenshot(file);
      toast({
        title: "স্ক্রিনশট আপলোড হয়েছে",
        description: "পেমেন্ট স্ক্রিনশট সফলভাবে আপলোড করা হয়েছে",
      });
    }
  }, [toast]);

  const onSubmit = useCallback(async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate mobile payment requirements
      if (paymentMethod !== 'cash_on_delivery') {
        if (!data.transactionId && !data.lastFourDigits) {
          toast({
            title: "তথ্য অসম্পূর্ণ",
            description: "ট্রানজেকশন আইডি অথবা শেষ ৪ সংখ্যা দিন",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        if (!screenshot) {
          toast({
            title: "স্ক্রিনশট প্রয়োজন",
            description: "পেমেন্টের স্ক্রিনশট আপলোড করুন",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Generate tracking ID
      const trackingId = `TNX${Date.now().toString().slice(-8)}`;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and close modal
      clearCart();
      onOrderComplete(trackingId);
      onClose();
      
      toast({
        title: "অর্ডার সফল!",
        description: `আপনার অর্ডার নম্বর: ${trackingId}`,
      });

    } catch (error) {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "আবার চেষ্টা করুন অথবা কাস্টমার সার্ভিসে যোগাযোগ করুন",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [paymentMethod, screenshot, clearCart, onOrderComplete, onClose, toast]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-white",
          isMobile 
            ? "w-full h-full max-w-none max-h-none rounded-none m-0 fixed inset-0" 
            : "max-w-4xl w-[95vw] max-h-[95vh] rounded-xl"
        )}
        data-testid="checkout-modal"
      >
        {/* Header */}
        <DialogHeader className={cn(
          "flex-row items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-red-50",
          isMobile ? "px-4 py-3" : "px-6 py-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white">
              <CreditCard className={cn("w-4 h-4", isMobile ? "w-4 h-4" : "w-5 h-5")} />
            </div>
            <div>
              <DialogTitle className={cn("text-lg font-bold text-gray-900", isMobile ? "text-base" : "text-xl")}>
                চেকআউট
              </DialogTitle>
              <p className={cn("text-gray-600", isMobile ? "text-xs" : "text-sm")}>
                অর্ডার সম্পূর্ণ করুন
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "default"}
            onClick={onClose}
            className="rounded-full h-8 w-8 p-0"
            data-testid="close-checkout"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Content */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-[calc(100%-80px)]">
          <ScrollArea className={cn("flex-1", isMobile ? "px-4" : "px-6")}>
            <div className={cn("py-6 space-y-6", isMobile ? "space-y-4" : "space-y-6")}>
              
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 border">
                <h3 className="font-semibold mb-3 text-gray-900">অর্ডার সামারি</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1">{item.name} × {item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>সাবটোটাল:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ডেলিভারি:</span>
                    <span className={deliveryFee === 0 ? "text-green-600" : ""}>
                      {deliveryFee === 0 ? "ফ্রি" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-orange-600 pt-2 border-t">
                    <span>মোট:</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">পেমেন্ট মাধ্যম</h3>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value) => form.setValue('paymentMethod', value)}
                  className="space-y-3"
                >
                  {paymentOptions.map((option) => (
                    <div key={option.value}>
                      <Label
                        htmlFor={option.value}
                        className={cn(
                          "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          paymentMethod === option.value 
                            ? `${option.color} border-current` 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{option.icon}</span>
                            <span className="font-semibold">{option.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                          
                          {option.value !== 'cash_on_delivery' && (
                            <div className="bg-white/50 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">পেমেন্ট পরিমাণ:</span>
                                <span className="font-bold text-orange-600">{formatPrice(option.amount)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">নম্বর:</span>
                                <span className="font-mono text-sm bg-white px-2 py-1 rounded border">{option.number}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">ডেলিভারিতে:</span>
                                <span className="font-bold text-green-600">{formatPrice(grandTotal - option.amount)}</span>
                              </div>
                            </div>
                          )}
                          
                          {option.value === 'cash_on_delivery' && (
                            <div className="bg-white/50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">ডেলিভারিতে পেমেন্ট:</span>
                                <span className="font-bold text-green-600">{formatPrice(option.amount)}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </Label>

                      {/* Mobile Payment Details */}
                      {paymentMethod === option.value && option.value !== 'cash_on_delivery' && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-blue-900">
                                পেমেন্ট সম্পূর্ণ করার পর:
                              </p>
                              <ul className="text-sm text-blue-800 space-y-1">
                                <li>• ট্রানজেকশন আইডি অথবা শেষ ৪ সংখ্যা দিন</li>
                                <li>• পেমেন্টের স্ক্রিনশট আপলোড করুন</li>
                                <li>• বাকি টাকা পণ্য পেয়ে দিন</li>
                              </ul>
                            </div>
                          </div>

                          {/* Transaction ID Input */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="transactionId" className="text-sm font-medium">
                                ট্রানজেকশন আইডি (ঐচ্ছিক)
                              </Label>
                              <Input
                                id="transactionId"
                                placeholder="TxnID123456..."
                                {...form.register('transactionId')}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastFourDigits" className="text-sm font-medium">
                                শেষ ৪ সংখ্যা (ঐচ্ছিক)
                              </Label>
                              <Input
                                id="lastFourDigits"
                                placeholder="1234"
                                maxLength={4}
                                {...form.register('lastFourDigits')}
                                className="mt-1"
                              />
                            </div>
                          </div>

                          {/* Screenshot Upload */}
                          <div>
                            <Label htmlFor="screenshot" className="text-sm font-medium mb-2 block">
                              পেমেন্ট স্ক্রিনশট *
                            </Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                              <input
                                type="file"
                                id="screenshot"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                              <Label htmlFor="screenshot" className="cursor-pointer">
                                <div className="space-y-2">
                                  {screenshot ? (
                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                      <CheckCircle2 className="w-6 h-6" />
                                      <span className="font-medium">{screenshot.name}</span>
                                    </div>
                                  ) : (
                                    <>
                                      <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                                      <div className="text-sm">
                                        <span className="font-medium text-blue-600">ছবি আপলোড করুন</span>
                                        <p className="text-gray-500">অথবা টেনে এনে ছাড়ুন</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </Label>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG (সর্বোচ্চ ৫MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">ক্রেতার তথ্য</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName" className="text-sm font-medium">
                      পূর্ণ নাম *
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="customerName"
                        placeholder="আপনার নাম লিখুন"
                        {...form.register('customerName', { required: true })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="customerPhone" className="text-sm font-medium">
                      ফোন নম্বর *
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="customerPhone"
                        placeholder="01xxxxxxxxx"
                        {...form.register('customerPhone', { required: true })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="customerAddress" className="text-sm font-medium">
                    ডেলিভারি ঠিকানা *
                  </Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Textarea
                      id="customerAddress"
                      placeholder="সম্পূর্ণ ঠিকানা লিখুন (বাসা, রাস্তা, এলাকা, জেলা)"
                      {...form.register('customerAddress', { required: true })}
                      className="pl-10 min-h-[80px]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    অতিরিক্ত নির্দেশনা (ঐচ্ছিক)
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন..."
                    {...form.register('notes')}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer - Action Buttons */}
          <div className={cn("border-t bg-white p-4", isMobile ? "p-4" : "p-6")}>
            <div className={cn("space-y-3", isMobile ? "space-y-2" : "space-y-3")}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 font-semibold",
                  isMobile ? "h-12 text-base" : "h-14 text-lg"
                )}
                data-testid="place-order"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>অর্ডার করা হচ্ছে...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>অর্ডার সম্পূর্ণ করুন</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className={cn("w-full", isMobile ? "h-10" : "h-12")}
                data-testid="cancel-checkout"
              >
                বাতিল করুন
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}