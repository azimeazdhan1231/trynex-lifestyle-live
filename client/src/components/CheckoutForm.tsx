import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Smartphone, MapPin, User } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন"),
  email: z.string().email("সঠিক ইমেইল দিন").optional().or(z.literal("")),
  address: z.string().min(10, "সম্পূর্ণ ঠিকানা দিন"),
  district: z.string().min(1, "জেলা নির্বাচন করুন"),
  thana: z.string().min(1, "থানা দিন"),
  paymentMethod: z.string().min(1, "পেমেন্ট পদ্ধতি নির্বাচন করুন"),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const CheckoutForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { items, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      address: "",
      district: "",
      thana: "",
      paymentMethod: "cash_on_delivery",
      notes: "",
    },
  });

  const districts = [
    "ঢাকা", "চট্টগ্রাম", "সিলেট", "রাজশাহী", "খুলনা", "বরিশাল", "রংপুর", "ময়মনসিংহ"
  ];

  const paymentMethods = [
    { value: "cash_on_delivery", label: "ক্যাশ অন ডেলিভারি", icon: CreditCard },
    { value: "bkash", label: "বিকাশ", icon: Smartphone },
    { value: "nagad", label: "নগদ", icon: Smartphone },
  ];

  const onSubmit = async (data: CheckoutFormData) => {
    setIsLoading(true);
    
    try {
      const orderData = {
        ...data,
        items: JSON.stringify(items),
        total: getTotalPrice().toString(),
        payment_info: JSON.stringify({
          method: data.paymentMethod,
          amount: getTotalPrice(),
        }),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "অর্ডার সফল!",
          description: `আপনার অর্ডার নং: ${result.tracking_id || result.tracking_number}`,
        });
        clearCart();
        // Redirect to order success page or tracking
        window.location.href = `/track/${result.tracking_id || result.tracking_number}`;
      } else {
        throw new Error(result.message || "অর্ডার প্রক্রিয়া করতে সমস্যা হয়েছে");
      }
    } catch (error) {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: error instanceof Error ? error.message : "আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">চেকআউট তথ্য</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="w-5 h-5 mr-2" />
                ব্যক্তিগত তথ্য
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>পূর্ণ নাম *</FormLabel>
                      <FormControl>
                        <Input placeholder="আপনার নাম লিখুন" {...field} data-testid="customer-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ফোন নম্বর *</FormLabel>
                      <FormControl>
                        <Input placeholder="01XXXXXXXXX" {...field} data-testid="customer-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ইমেইল (ঐচ্ছিক)</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" type="email" {...field} data-testid="customer-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Delivery Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                ডেলিভারি ঠিকানা
              </h3>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>সম্পূর্ণ ঠিকানা *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="বাড়ির নম্বর, রাস্তার নাম, এলাকা"
                        {...field}
                        data-testid="customer-address"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>জেলা *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="customer-district">
                            <SelectValue placeholder="জেলা নির্বাচন করুন" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {districts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thana"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>থানা/উপজেলা *</FormLabel>
                      <FormControl>
                        <Input placeholder="থানার নাম" {...field} data-testid="customer-thana" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                পেমেন্ট পদ্ধতি
              </h3>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        {paymentMethods.map((method) => (
                          <div key={method.value} className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <RadioGroupItem value={method.value} id={method.value} />
                            <Label htmlFor={method.value} className="flex items-center space-x-2 cursor-pointer flex-1">
                              <method.icon className="w-5 h-5" />
                              <span>{method.label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>অতিরিক্ত নোট (ঐচ্ছিক)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="বিশেষ নির্দেশনা বা মন্তব্য"
                      {...field}
                      data-testid="order-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isLoading}
              data-testid="place-order-button"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>অর্ডার প্রক্রিয়া করা হচ্ছে...</span>
                </div>
              ) : (
                "অর্ডার কনফার্ম করুন"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </motion.div>
  );
};

export default CheckoutForm;