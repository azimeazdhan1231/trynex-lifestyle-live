
import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Settings, 
  Save, 
  Globe, 
  Type, 
  Image,
  Phone,
  Mail,
  MapPin,
  Facebook,
  MessageCircle
} from "lucide-react";

interface SiteSettings {
  site_title: string;
  site_description: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_button_text: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  whatsapp_number: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  bkash_number: string;
  nagad_number: string;
  delivery_charge_inside_dhaka: number;
  delivery_charge_outside_dhaka: number;
  free_delivery_threshold: number;
  site_maintenance_mode: boolean;
  show_popup_offers: boolean;
  currency_symbol: string;
  timezone: string;
}

export default function SiteSettingsManagement() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SiteSettings>({
    site_title: "TryneX Lifestyle",
    site_description: "Premium T-Shirts & Custom Printing Service",
    hero_title: "কাস্টমাইজড গিফট সলিউশন",
    hero_subtitle: "আপনার কল্পনাকে বাস্তব করুন",
    hero_description: "কাস্টম গিফট • নাম লেখা • স্পেশাল ডিজাইনের",
    hero_button_text: "কাস্টম অর্ডার",
    contact_phone: "01747292277",
    contact_email: "info@trynexlifestyle.com",
    contact_address: "Dhaka, Bangladesh",
    whatsapp_number: "8801747292277",
    facebook_url: "https://facebook.com/trynexlifestyle",
    instagram_url: "https://instagram.com/trynexlifestyle",
    youtube_url: "",
    bkash_number: "01747292277",
    nagad_number: "01747292277",
    delivery_charge_inside_dhaka: 60,
    delivery_charge_outside_dhaka: 120,
    free_delivery_threshold: 1000,
    site_maintenance_mode: false,
    show_popup_offers: true,
    currency_symbol: "৳",
    timezone: "Asia/Dhaka"
  });

  // Fetch current settings
  const { data: currentSettings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: () => apiRequest('GET', '/api/settings'),
    onSuccess: (data) => {
      if (data) {
        setFormData(prev => ({ ...prev, ...data }));
      }
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<SiteSettings>) => {
      return apiRequest("POST", "/api/settings", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "সফল",
        description: "সাইট সেটিংস সফলভাবে আপডেট করা হয়েছে।",
      });
    },
    onError: (error: any) => {
      toast({
        title: "ত্রুটি",
        description: error.message || "সেটিংস আপডেট করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">সাইট সেটিংস</h2>
          <p className="text-gray-600">আপনার ওয়েবসাইটের সাধারণ সেটিংস পরিবর্তন করুন</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSettingsMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Site Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              সাইট তথ্য
            </CardTitle>
            <CardDescription>মূল সাইট তথ্য পরিবর্তন করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site_title">সাইট টাইটেল</Label>
              <Input
                id="site_title"
                value={formData.site_title}
                onChange={(e) => handleInputChange('site_title', e.target.value)}
                placeholder="TryneX Lifestyle"
              />
            </div>
            <div>
              <Label htmlFor="site_description">সাইট বর্ণনা</Label>
              <Textarea
                id="site_description"
                value={formData.site_description}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="Premium T-Shirts & Custom Printing Service"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="currency_symbol">মুদ্রা প্রতীক</Label>
              <Input
                id="currency_symbol"
                value={formData.currency_symbol}
                onChange={(e) => handleInputChange('currency_symbol', e.target.value)}
                placeholder="৳"
                className="w-20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hero Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Type className="w-5 h-5 mr-2" />
              হিরো সেকশন
            </CardTitle>
            <CardDescription>হোমপেজের হিরো সেকশন টেক্সট</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hero_title">মূল শিরোনাম</Label>
              <Input
                id="hero_title"
                value={formData.hero_title}
                onChange={(e) => handleInputChange('hero_title', e.target.value)}
                placeholder="কাস্টমাইজড গিফট সলিউশন"
              />
            </div>
            <div>
              <Label htmlFor="hero_subtitle">উপশিরোনাম</Label>
              <Input
                id="hero_subtitle"
                value={formData.hero_subtitle}
                onChange={(e) => handleInputChange('hero_subtitle', e.target.value)}
                placeholder="আপনার কল্পনাকে বাস্তব করুন"
              />
            </div>
            <div>
              <Label htmlFor="hero_description">বিবরণ</Label>
              <Input
                id="hero_description"
                value={formData.hero_description}
                onChange={(e) => handleInputChange('hero_description', e.target.value)}
                placeholder="কাস্টম গিফট • নাম লেখা • স্পেশাল ডিজাইনের"
              />
            </div>
            <div>
              <Label htmlFor="hero_button_text">বাটন টেক্সট</Label>
              <Input
                id="hero_button_text"
                value={formData.hero_button_text}
                onChange={(e) => handleInputChange('hero_button_text', e.target.value)}
                placeholder="কাস্টম অর্ডার"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              যোগাযোগের তথ্য
            </CardTitle>
            <CardDescription>গ্রাহকদের যোগাযোগের তথ্য</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact_phone">ফোন নম্বর</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="01747292277"
              />
            </div>
            <div>
              <Label htmlFor="contact_email">ইমেইল</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="info@trynexlifestyle.com"
              />
            </div>
            <div>
              <Label htmlFor="contact_address">ঠিকানা</Label>
              <Textarea
                id="contact_address"
                value={formData.contact_address}
                onChange={(e) => handleInputChange('contact_address', e.target.value)}
                placeholder="Dhaka, Bangladesh"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp_number">WhatsApp নম্বর</Label>
              <Input
                id="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                placeholder="8801747292277"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              পেমেন্ট সেটিংস
            </CardTitle>
            <CardDescription>bKash/Nagad পেমেন্ট তথ্য</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bkash_number">bKash নম্বর</Label>
              <Input
                id="bkash_number"
                value={formData.bkash_number}
                onChange={(e) => handleInputChange('bkash_number', e.target.value)}
                placeholder="01747292277"
              />
            </div>
            <div>
              <Label htmlFor="nagad_number">Nagad নম্বর</Label>
              <Input
                id="nagad_number"
                value={formData.nagad_number}
                onChange={(e) => handleInputChange('nagad_number', e.target.value)}
                placeholder="01747292277"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              ডেলিভারি সেটিংস
            </CardTitle>
            <CardDescription>ডেলিভারি চার্জ ও নীতি</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="delivery_charge_inside_dhaka">ঢাকার ভিতরে ডেলিভারি চার্জ (৳)</Label>
              <Input
                id="delivery_charge_inside_dhaka"
                type="number"
                value={formData.delivery_charge_inside_dhaka}
                onChange={(e) => handleInputChange('delivery_charge_inside_dhaka', parseInt(e.target.value) || 0)}
                placeholder="60"
              />
            </div>
            <div>
              <Label htmlFor="delivery_charge_outside_dhaka">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</Label>
              <Input
                id="delivery_charge_outside_dhaka"
                type="number"
                value={formData.delivery_charge_outside_dhaka}
                onChange={(e) => handleInputChange('delivery_charge_outside_dhaka', parseInt(e.target.value) || 0)}
                placeholder="120"
              />
            </div>
            <div>
              <Label htmlFor="free_delivery_threshold">ফ্রি ডেলিভারির জন্য মিনিমাম অর্ডার (৳)</Label>
              <Input
                id="free_delivery_threshold"
                type="number"
                value={formData.free_delivery_threshold}
                onChange={(e) => handleInputChange('free_delivery_threshold', parseInt(e.target.value) || 0)}
                placeholder="1000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Facebook className="w-5 h-5 mr-2" />
              সামাজিক মাধ্যম
            </CardTitle>
            <CardDescription>সামাজিক মাধ্যমের লিংক</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="facebook_url">Facebook পেজ URL</Label>
              <Input
                id="facebook_url"
                value={formData.facebook_url}
                onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/trynexlifestyle"
              />
            </div>
            <div>
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/trynexlifestyle"
              />
            </div>
            <div>
              <Label htmlFor="youtube_url">YouTube Channel URL</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@trynexlifestyle"
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              উন্নত সেটিংস
            </CardTitle>
            <CardDescription>সাইটের উন্নত কনফিগারেশন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="site_maintenance_mode">সাইট রক্ষণাবেক্ষণ মোড</Label>
                <p className="text-sm text-gray-500">সাইট অস্থায়ীভাবে বন্ধ করুন</p>
              </div>
              <Switch
                id="site_maintenance_mode"
                checked={formData.site_maintenance_mode}
                onCheckedChange={(checked) => handleInputChange('site_maintenance_mode', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show_popup_offers">পপআপ অফার দেখান</Label>
                <p className="text-sm text-gray-500">ভিজিটরদের জন্য অফার পপআপ</p>
              </div>
              <Switch
                id="show_popup_offers"
                checked={formData.show_popup_offers}
                onCheckedChange={(checked) => handleInputChange('show_popup_offers', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
