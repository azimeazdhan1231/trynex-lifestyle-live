
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createWhatsAppUrl } from "@/lib/constants";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send via WhatsApp
      const message = `নাম: ${formData.name}\nইমেইল: ${formData.email}\nফোন: ${formData.phone}\nবার্তা: ${formData.message}`;
      window.open(createWhatsAppUrl(message), '_blank');
      
      toast({
        title: "বার্তা পাঠানো হয়েছে!",
        description: "আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "বার্তা পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Contact Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            আমাদের সাথে যোগাযোগ করুন
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">নাম *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="আপনার নাম লিখুন"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">ফোন নম্বর *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="আপনার ইমেইল ঠিকানা"
                value={formData.email}
                onChange={handleInputChange}
                className="border-gray-300 focus:border-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">বার্তা *</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="আপনার বার্তা এখানে লিখুন..."
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={5}
                className="border-gray-300 focus:border-blue-500 resize-none"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
            >
              {isSubmitting ? (
                "পাঠানো হচ্ছে..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  বার্তা পাঠান
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">যোগাযোগের তথ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
            <Phone className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">হোয়াটসঅ্যাপ</p>
              <p className="font-medium text-green-700">+8801648534981</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">ইমেইল</p>
              <p className="font-medium text-blue-700">info@trynexlifestyle.com</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
            <MapPin className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">ঠিকানা</p>
              <p className="font-medium text-gray-800">ঢাকা, বাংলাদেশ</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactForm;
