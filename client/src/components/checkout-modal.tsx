import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DISTRICTS, formatPrice } from "@/lib/constants";
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
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order: Order) => {
      toast({
        title: "অর্ডার সফল!",
        description: `আপনার অর্ডার সফলভাবে প্লেস হয়েছে। ট্র্যাকিং আইডি: ${order.tracking_id}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onOrderComplete();
      setFormData({
        customer_name: "",
        phone: "",
        district: "",
        thana: "",
        address: "",
      });
    },
    onError: (error) => {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "অর্ডার প্রক্রিয়ায় সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_name || !formData.phone || !formData.district || !formData.thana) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      ...formData,
      items: cart,
      total: totalPrice.toString(),
    };

    createOrderMutation.mutate(orderData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>অর্ডার সম্পূর্ণ করুন</DialogTitle>
        </DialogHeader>

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
              <Select value={formData.district} onValueChange={(value) => handleInputChange("district", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="জেলা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="thana">থানা *</Label>
              <Input
                id="thana"
                type="text"
                value={formData.thana}
                onChange={(e) => handleInputChange("thana", e.target.value)}
                placeholder="থানার নাম লিখুন"
                required
              />
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
            <div className="flex justify-between items-center font-semibold">
              <span>মোট পরিমাণ:</span>
              <span className="text-lg text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <p className="text-sm text-gray-600">
              পেমেন্ট পদ্ধতি: ক্যাশ অন ডেলিভারি
            </p>
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
      </DialogContent>
    </Dialog>
  );
}
