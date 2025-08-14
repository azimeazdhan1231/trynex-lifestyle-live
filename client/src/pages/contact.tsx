
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, MessageCircle, Clock, Facebook } from "lucide-react";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import { createWhatsAppUrl, WHATSAPP_NUMBER, FACEBOOK_PAGE } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMessage = `নাম: ${formData.name}
ইমেইল: ${formData.email}
ফোন: ${formData.phone}
বিষয়: ${formData.subject}
বার্তা: ${formData.message}`;
    
    window.open(createWhatsAppUrl(whatsappMessage), '_blank');
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
    
    toast({
      title: "বার্তা পাঠানো হয়েছে",
      description: "আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <MobileOptimizedLayout>
      
      <div className="pt-20 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">যোগাযোগ করুন</h1>
            <p className="text-gray-600 text-lg">আমাদের সাথে যোগাযোগ করুন এবং আপনার প্রয়োজনের কথা জানান</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">আমাদের একটি বার্তা পাঠান</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">নাম *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="আপনার নাম"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">ফোন *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="আপনার ফোন নম্বর"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">ইমেইল</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="আপনার ইমেইল"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">বিষয় *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="বার্তার বিষয়"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">বার্তা *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="আপনার বার্তা লিখুন"
                      rows={5}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    হোয়াটসঅ্যাপে পাঠান
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">যোগাযোগের তথ্য</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-primary mr-3" />
                      <div>
                        <p className="font-semibold">ফোন</p>
                        <p className="text-gray-600">{WHATSAPP_NUMBER}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-primary mr-3" />
                      <div>
                        <p className="font-semibold">ইমেইল</p>
                        <p className="text-gray-600">trynexlifestyle@gmail.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-primary mr-3" />
                      <div>
                        <p className="font-semibold">ঠিকানা</p>
                        <p className="text-gray-600">ঢাকা, বাংলাদেশ</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-primary mr-3" />
                      <div>
                        <p className="font-semibold">কর্মঘণ্টা</p>
                        <p className="text-gray-600">সকাল ৯টা - রাত ১০টা</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">তাৎক্ষণিক সাহায্য</h3>
                  <p className="text-gray-600 mb-4">
                    জরুরি সাহায্যের জন্য সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।
                  </p>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 mb-3"
                    onClick={() => window.open(createWhatsAppUrl("আসসালামু আলাইকুম। আমি সাহায্য চাই।"), '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    হোয়াটসঅ্যাপে চ্যাট করুন
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                    onClick={() => window.open(FACEBOOK_PAGE, '_blank')}
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    ফেসবুক পেজে যান
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-orange-50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">পেমেন্ট তথ্য</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-pink-600">bKash:</span>
                      <span className="text-gray-700">01747292277</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-orange-600">Nagad:</span>
                      <span className="text-gray-700">01747292277</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    পেমেন্ট করার পর অবশ্যই ট্রানজ্যাকশন আইডি জানান।
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MobileOptimizedLayout>
  );
}
