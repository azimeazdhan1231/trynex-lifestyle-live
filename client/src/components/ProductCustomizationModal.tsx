import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, X, Eye, Palette, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@shared/schema';

const customOrderSchema = z.object({
  customerName: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  customerPhone: z.string().min(11, 'ফোন নম্বর কমপক্ষে ১১ সংখ্যার হতে হবে'),
  customerEmail: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  customerAddress: z.string().min(10, 'ঠিকানা কমপক্ষে ১০ অক্ষরের হতে হবে'),
  district: z.string().min(2, 'জেলা নির্বাচন করুন'),
  thana: z.string().min(2, 'থানা নির্বাচন করুন'),
  customizationInstructions: z.string().min(10, 'কাস্টমাইজেশন নির্দেশনা কমপক্ষে ১০ অক্ষরের হতে হবে'),
  paymentMethod: z.enum(['cash_on_delivery', 'bkash', 'nagad', 'rocket']).default('cash_on_delivery'),
});

type CustomOrderFormData = z.infer<typeof customOrderSchema>;

interface ProductCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onOrderPlaced: (orderId: string) => void;
}

const bangladeshDistricts = [
  'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ', 'খুলনা',
  'গাজীপুর', 'নারায়ণগঞ্জ', 'কুমিল্লা', 'কক্সবাজার', 'যশোর', 'পাবনা', 'নোয়াখালী'
];

export default function ProductCustomizationModal({ 
  isOpen, 
  onClose, 
  product, 
  onOrderPlaced 
}: ProductCustomizationModalProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customizationCost, setCustomizationCost] = useState(0);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CustomOrderFormData>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      paymentMethod: 'cash_on_delivery',
    },
  });

  const selectedDistrict = watch('district');

  // Calculate total price (base price + customization cost)
  const totalPrice = product ? parseFloat(product.price) + customizationCost : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CustomOrderFormData) => {
    if (!product) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        ...data,
        productId: product.id,
        basePrice: product.price,
        customizationCost: customizationCost.toString(),
        totalPrice: totalPrice.toString(),
        customizationImages: uploadedImages,
      };

      const response = await fetch('/api/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('অর্ডার প্রেরণে সমস্যা হয়েছে');
      }

      const result = await response.json();
      
      // Use the tracking ID from server response
      const trackingId = result.data?.trackingId || result.data?.id || result.id || `CXO${Date.now()}`;

      toast({
        title: 'অর্ডার সফল!',
        description: `আপনার অর্ডার সফলভাবে প্রেরণ করা হয়েছে। ট্র্যাকিং আইডি: ${trackingId}`,
      });

      reset();
      setUploadedImages([]);
      setCustomizationCost(0);
      onOrderPlaced(trackingId);
      onClose();
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: 'ত্রুটি!',
        description: 'অর্ডার প্রেরণে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-6 h-6 text-orange-500" />
            প্রোডাক্ট কাস্টমাইজেশন
          </DialogTitle>
          <DialogDescription>
            আপনার পছন্দমতো প্রোডাক্টটি কাস্টমাইজ করুন এবং সরাসরি অর্ডার করুন
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Info */}
          <Card>
            <CardContent className="p-4">
              <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{product.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>মূল দাম:</span>
                  <span className="font-medium">{formatPrice(parseFloat(product.price))}</span>
                </div>
                <div className="flex justify-between">
                  <span>কাস্টমাইজেশন খরচ:</span>
                  <span className="font-medium">{formatPrice(customizationCost)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>মোট দাম:</span>
                    <span className="text-orange-600">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customization Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Customer Information */}
            <div className="space-y-4">
              <h4 className="font-medium">গ্রাহকের তথ্য</h4>
              
              <div>
                <Label htmlFor="customerName">নাম *</Label>
                <Input
                  id="customerName"
                  {...register('customerName')}
                  placeholder="আপনার নাম লিখুন"
                  data-testid="input-customer-name"
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customerPhone">ফোন নম্বর *</Label>
                <Input
                  id="customerPhone"
                  {...register('customerPhone')}
                  placeholder="01xxxxxxxxx"
                  data-testid="input-customer-phone"
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerPhone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="customerEmail">ইমেইল (ঐচ্ছিক)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  {...register('customerEmail')}
                  placeholder="example@email.com"
                  data-testid="input-customer-email"
                />
                {errors.customerEmail && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerEmail.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="district">জেলা *</Label>
                  <select
                    id="district"
                    {...register('district')}
                    className="w-full p-2 border rounded-md"
                    data-testid="select-district"
                  >
                    <option value="">জেলা নির্বাচন করুন</option>
                    {bangladeshDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-sm text-red-500 mt-1">{errors.district.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="thana">থানা *</Label>
                  <Input
                    id="thana"
                    {...register('thana')}
                    placeholder="থানার নাম"
                    data-testid="input-thana"
                  />
                  {errors.thana && (
                    <p className="text-sm text-red-500 mt-1">{errors.thana.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="customerAddress">সম্পূর্ণ ঠিকানা *</Label>
                <Textarea
                  id="customerAddress"
                  {...register('customerAddress')}
                  placeholder="বিস্তারিত ঠিকানা লিখুন"
                  rows={3}
                  data-testid="input-customer-address"
                />
                {errors.customerAddress && (
                  <p className="text-sm text-red-500 mt-1">{errors.customerAddress.message}</p>
                )}
              </div>
            </div>

            {/* Customization Section */}
            <div className="space-y-4">
              <h4 className="font-medium">কাস্টমাইজেশন</h4>
              
              <div>
                <Label htmlFor="customizationInstructions">কাস্টমাইজেশন নির্দেশনা *</Label>
                <Textarea
                  id="customizationInstructions"
                  {...register('customizationInstructions')}
                  placeholder="আপনি কিভাবে প্রোডাক্টটি কাস্টমাইজ করতে চান তা বিস্তারিত লিখুন..."
                  rows={4}
                  data-testid="input-customization-instructions"
                />
                {errors.customizationInstructions && (
                  <p className="text-sm text-red-500 mt-1">{errors.customizationInstructions.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <Label>রেফারেন্স ছবি আপলোড করুন</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">ছবি আপলোড করতে ক্লিক করুন</p>
                  </label>
                </div>

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customization Cost */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="customizationCost">অতিরিক্ত কাস্টমাইজেশন খরচ (টাকা)</Label>
                <Input
                  id="customizationCost"
                  type="number"
                  value={customizationCost}
                  onChange={(e) => setCustomizationCost(Number(e.target.value))}
                  placeholder="0"
                  min="0"
                  data-testid="input-customization-cost"
                />
                <p className="text-xs text-gray-600 mt-1">
                  জটিল কাস্টমাইজেশনের জন্য অতিরিক্ত খরচ যোগ করতে পারেন
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h4 className="font-medium">পেমেন্ট পদ্ধতি</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'cash_on_delivery', label: 'ক্যাশ অন ডেলিভারি' },
                  { value: 'bkash', label: 'বিকাশ' },
                  { value: 'nagad', label: 'নগদ' },
                  { value: 'rocket', label: 'রকেট' },
                ].map(method => (
                  <label key={method.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      {...register('paymentMethod')}
                      value={method.value}
                      className="form-radio"
                    />
                    <span className="text-sm">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="button-cancel-order"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600"
                data-testid="button-proceed-checkout"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {isSubmitting ? 'প্রক্রিয়াকরণ...' : 'চেকআউটে যান'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}