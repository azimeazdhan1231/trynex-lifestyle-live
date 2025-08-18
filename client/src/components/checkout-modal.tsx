import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatPrice } from '@/lib/constants';
import { Upload, Phone, MapPin, User, MessageSquare, CreditCard, CheckCircle } from 'lucide-react';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'নাম কমপক্ষে ২টি অক্ষর হতে হবে'),
  customerPhone: z.string().min(11, 'সঠিক ফোন নম্বর দিন'),
  customerAddress: z.string().min(10, 'সম্পূর্ণ ঠিকানা দিন'),
  district: z.string().min(2, 'জেলা নির্বাচন করুন'),
  thana: z.string().min(2, 'থানা নির্বাচন করুন'),
  customInstructions: z.string().optional(),
  paymentMethod: z.enum(['bkash', 'nagad', 'upay']),
  paymentAmount: z.number().min(100, 'ন্যূনতম ১০০ টাকা পেমেন্ট করতে হবে'),
  transactionId: z.string().min(4, 'ট্রানজেকশন আইডি বা শেষ ৪ ডিজিট দিন'),
  paymentScreenshot: z.any().optional()
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (orderId: string) => void;
}

export default function CheckoutModal({ isOpen, onClose, onOrderComplete }: CheckoutModalProps) {
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'info' | 'payment' | 'confirm'>('info');
  const [customPhoto, setCustomPhoto] = useState<File | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      district: '',
      thana: '',
      customInstructions: '',
      paymentMethod: 'bkash',
      paymentAmount: Math.max(100, getTotalPrice()),
      transactionId: ''
    }
  });

  const totalPrice = getTotalPrice();
  const minimumPayment = 100;
  const suggestedPayment = Math.max(minimumPayment, totalPrice);

  const paymentNumbers = {
    bkash: '01765555593',
    nagad: '01765555593', 
    upay: '01765555593'
  };

  const handleCustomPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomPhoto(file);
    }
  };

  const handlePaymentScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentScreenshot(file);
      form.setValue('paymentScreenshot', file);
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      // Generate unique tracking ID
      const trackingId = `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Prepare order data matching the schema
      const orderData = {
        tracking_id: trackingId,
        customer_name: data.customerName,
        district: data.district,
        thana: data.thana,
        address: data.customerAddress,
        phone: data.customerPhone,
        payment_info: {
          method: data.paymentMethod,
          transaction_id: data.transactionId,
          amount: data.paymentAmount,
          screenshot: paymentScreenshot ? 'uploaded' : null
        },
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url
        })),
        total: (getTotalPrice() + (getTotalPrice() >= 1600 ? 0 : 120)).toString(),
        custom_instructions: data.customInstructions || null,
        custom_images: customPhoto ? ['uploaded'] : [],
        status: 'pending'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Order submission failed');
      }

      const result = await response.json();
      
      // Prepare comprehensive order details for the success modal
      const orderDetails = {
        tracking_id: result.tracking_id || trackingId,
        customer_name: data.customerName,
        phone: data.customerPhone,
        total: (getTotalPrice() + (getTotalPrice() >= 1600 ? 0 : 120)).toString(),
        address: data.customerAddress,
        district: data.district,
        thana: data.thana,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      clearCart();
      
      // Pass complete order details to parent instead of just tracking ID
      onOrderComplete(orderDetails);
      onClose();
      
      // Remove toast since the enhanced modal will show instead
      // Enhanced modal provides much better user experience

    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: 'অর্ডার ব্যর্থ',
        description: error instanceof Error ? error.message : 'আবার চেষ্টা করুন',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'info':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  সম্পূর্ণ নাম *
                </Label>
                <Input
                  id="customerName"
                  placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                  {...form.register('customerName')}
                  data-testid="input-customer-name"
                />
                {form.formState.errors.customerName && (
                  <p className="text-sm text-red-500">{form.formState.errors.customerName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  মোবাইল নম্বর *
                </Label>
                <Input
                  id="customerPhone"
                  placeholder="01XXXXXXXXX"
                  {...form.register('customerPhone')}
                  data-testid="input-customer-phone"
                />
                {form.formState.errors.customerPhone && (
                  <p className="text-sm text-red-500">{form.formState.errors.customerPhone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">জেলা *</Label>
                <Input
                  id="district"
                  placeholder="আপনার জেলার নাম"
                  {...form.register('district')}
                  data-testid="input-district"
                />
                {form.formState.errors.district && (
                  <p className="text-sm text-red-500">{form.formState.errors.district.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="thana">থানা/উপজেলা *</Label>
                <Input
                  id="thana"
                  placeholder="আপনার থানার নাম"
                  {...form.register('thana')}
                  data-testid="input-thana"
                />
                {form.formState.errors.thana && (
                  <p className="text-sm text-red-500">{form.formState.errors.thana.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerAddress" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                সম্পূর্ণ ঠিকানা *
              </Label>
              <Textarea
                id="customerAddress"
                placeholder="বাসা/রোড নম্বর, এলাকার নাম, ল্যান্ডমার্ক"
                rows={3}
                {...form.register('customerAddress')}
                data-testid="input-customer-address"
              />
              {form.formState.errors.customerAddress && (
                <p className="text-sm text-red-500">{form.formState.errors.customerAddress.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customInstructions" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                বিশেষ নির্দেশনা (ঐচ্ছিক)
              </Label>
              <Textarea
                id="customInstructions"
                placeholder="কাস্টমাইজেশন বা বিশেষ কোন নির্দেশনা থাকলে লিখুন"
                rows={3}
                {...form.register('customInstructions')}
                data-testid="input-custom-instructions"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                কাস্টম ডিজাইনের ছবি (ঐচ্ছিক)
              </Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleCustomPhotoUpload}
                data-testid="input-custom-photo"
              />
              {customPhoto && (
                <p className="text-sm text-green-600">✓ ছবি আপলোড হয়েছে: {customPhoto.name}</p>
              )}
            </div>
          </div>
        );

      case 'payment':
        const selectedPaymentMethod = form.watch('paymentMethod');
        
        return (
          <div className="space-y-6">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-yellow-800">
                  পেমেন্ট করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {(['bkash', 'nagad', 'upay'] as const).map((method) => (
                    <Button
                      key={method}
                      type="button"
                      variant={selectedPaymentMethod === method ? "default" : "outline"}
                      className={`h-16 ${
                        selectedPaymentMethod === method 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => form.setValue('paymentMethod', method)}
                      data-testid={`button-payment-${method}`}
                    >
                      <div className="text-center">
                        <div className="text-sm font-semibold capitalize">{method}</div>
                        <div className="text-xs opacity-70">{paymentNumbers[method]}</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-lg border space-y-3">
                  <div className="text-sm font-medium text-gray-700">পেমেন্ট তথ্য:</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>মোট অর্ডার:</span>
                      <span className="font-semibold">৳{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ন্যূনতম পেমেন্ট:</span>
                      <span className="font-semibold text-red-600">৳{formatPrice(minimumPayment)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>প্রস্তাবিত পেমেন্ট:</span>
                      <span className="font-bold text-green-600">৳{formatPrice(suggestedPayment)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="paymentAmount">পেমেন্ট পরিমাণ (টাকা) *</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    min={minimumPayment}
                    placeholder={`ন্যূনতম ${minimumPayment} টাকা`}
                    {...form.register('paymentAmount', { valueAsNumber: true })}
                    data-testid="input-payment-amount"
                  />
                  {form.formState.errors.paymentAmount && (
                    <p className="text-sm text-red-500">{form.formState.errors.paymentAmount.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="transactionId">ট্রানজেকশন ID বা শেষ ৪ ডিজিট *</Label>
                  <Input
                    id="transactionId"
                    placeholder="TXN123456789 বা 6789"
                    {...form.register('transactionId')}
                    data-testid="input-transaction-id"
                  />
                  {form.formState.errors.transactionId && (
                    <p className="text-sm text-red-500">{form.formState.errors.transactionId.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    পেমেন্টের স্ক্রিনশট (ঐচ্ছিক)
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentScreenshotUpload}
                    data-testid="input-payment-screenshot"
                  />
                  {paymentScreenshot && (
                    <p className="text-sm text-green-600">✓ স্ক্রিনশট আপলোড হয়েছে: {paymentScreenshot.name}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'confirm':
        const formData = form.getValues();
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  অর্ডার সম্পূর্ণ করুন
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>নাম:</strong> {formData.customerName}
                  </div>
                  <div>
                    <strong>ফোন:</strong> {formData.customerPhone}
                  </div>
                  <div className="col-span-2">
                    <strong>ঠিকানা:</strong> {formData.customerAddress}
                  </div>
                  <div>
                    <strong>পেমেন্ট পদ্ধতি:</strong> {formData.paymentMethod?.toUpperCase()}
                  </div>
                  <div>
                    <strong>পেমেন্ট পরিমাণ:</strong> ৳{formatPrice(formData.paymentAmount)}
                  </div>
                  <div className="col-span-2">
                    <strong>ট্রানজেকশন ID:</strong> {formData.transactionId}
                  </div>
                </div>

                <Separator />

                <div>
                  <strong>অর্ডার আইটেমস:</strong>
                  <div className="mt-2 space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>৳{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                    <span>মোট:</span>
                    <span>৳{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (step) {
      case 'info':
        return form.watch('customerName') && form.watch('customerPhone') && form.watch('customerAddress');
      case 'payment':
        return form.watch('paymentAmount') >= minimumPayment && form.watch('transactionId');
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (step === 'info') setStep('payment');
    else if (step === 'payment') setStep('confirm');
    else if (step === 'confirm') form.handleSubmit(onSubmit)();
  };

  const handleBack = () => {
    if (step === 'payment') setStep('info');
    else if (step === 'confirm') setStep('payment');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            অর্ডার সম্পূর্ণ করুন
          </DialogTitle>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 'info' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className="w-8 h-1 bg-gray-200">
              <div className={`h-full transition-all duration-300 ${
                ['payment', 'confirm'].includes(step) ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 'payment' ? 'bg-blue-500 text-white' : 
              step === 'confirm' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              2
            </div>
            <div className="w-8 h-1 bg-gray-200">
              <div className={`h-full transition-all duration-300 ${
                step === 'confirm' ? 'bg-blue-500 w-full' : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === 'confirm' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              3
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 mt-2">
            {step === 'info' && 'তথ্য পূরণ করুন'}
            {step === 'payment' && 'পেমেন্ট সম্পূর্ণ করুন'}
            {step === 'confirm' && 'অর্ডার নিশ্চিত করুন'}
          </div>
        </DialogHeader>

        <form className="space-y-6">
          {renderStepContent()}

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={step === 'info' ? onClose : handleBack}
              disabled={isSubmitting}
              data-testid="button-back"
            >
              {step === 'info' ? 'বাতিল' : 'পূর্ববর্তী'}
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={!canProceedToNext() || isSubmitting}
              data-testid="button-next"
            >
              {isSubmitting ? 'অপেক্ষা করুন...' : (
                step === 'confirm' ? 'অর্ডার সম্পূর্ণ করুন' : 'পরবর্তী'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}