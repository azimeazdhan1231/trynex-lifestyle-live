import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, Mail, Phone, MapPin, Clock, Palette, Shield, BarChart, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SiteSettings {
  site_name: string;
  site_description: string;
  site_logo: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  business_address: string;
  google_analytics_id: string;
  facebook_pixel_id: string;
  delivery_fee_dhaka: number;
  delivery_fee_outside: number;
  min_order_amount: number;
  currency: string;
  timezone: string;
  maintenance_mode: boolean;
  allow_guest_checkout: boolean;
  auto_approve_orders: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  theme_primary_color: string;
  theme_secondary_color: string;
  max_file_upload_size: number;
  session_timeout: number;
}

export default function EnhancedSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Default settings
  const defaultSettings: SiteSettings = {
    site_name: "Trynex Lifestyle",
    site_description: "Bangladesh এর সেরা গিফট এবং লাইফস্টাইল পণ্যের দোকান",
    site_logo: "",
    contact_email: "support@trynex.com",
    contact_phone: "+8801XXXXXXXXX",
    whatsapp_number: "+8801XXXXXXXXX",
    business_address: "ঢাকা, বাংলাদেশ",
    google_analytics_id: "",
    facebook_pixel_id: "",
    delivery_fee_dhaka: 60,
    delivery_fee_outside: 120,
    min_order_amount: 200,
    currency: "BDT",
    timezone: "Asia/Dhaka",
    maintenance_mode: false,
    allow_guest_checkout: true,
    auto_approve_orders: false,
    email_notifications: true,
    sms_notifications: true,
    theme_primary_color: "#2563eb",
    theme_secondary_color: "#16a34a",
    max_file_upload_size: 5,
    session_timeout: 24
  };

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  // Fetch current settings
  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ["/api/settings"]
  });

  // Update settings when data is fetched
  React.useEffect(() => {
    if (currentSettings) {
      setSettings({ ...defaultSettings, ...currentSettings });
    }
  }, [currentSettings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      const response = await apiRequest("PATCH", "/api/settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "সেটিংস আপডেট হয়েছে",
        description: "সাইট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "সেটিংস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-10 bg-gray-100 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            সাধারণ সেটিংস
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site_name">সাইটের নাম</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                placeholder="আপনার সাইটের নাম"
              />
            </div>
            <div>
              <Label htmlFor="currency">মুদ্রা</Label>
              <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BDT">BDT (৳)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="site_description">সাইটের বর্ণনা</Label>
            <Textarea
              id="site_description"
              value={settings.site_description}
              onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
              placeholder="আপনার সাইট সম্পর্কে বলুন"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            যোগাযোগের তথ্য
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email">ইমেইল</Label>
              <Input
                id="contact_email"
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                placeholder="support@example.com"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">ফোন নম্বর</Label>
              <Input
                id="contact_phone"
                value={settings.contact_phone}
                onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                placeholder="+8801XXXXXXXXX"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="whatsapp_number">WhatsApp নম্বর</Label>
              <Input
                id="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                placeholder="+8801XXXXXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="business_address">ব্যবসার ঠিকানা</Label>
              <Input
                id="business_address"
                value={settings.business_address}
                onChange={(e) => setSettings(prev => ({ ...prev, business_address: e.target.value }))}
                placeholder="আপনার ব্যবসার ঠিকানা"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            ডেলিভারি ও মূল্য নির্ধারণ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="delivery_fee_dhaka">ঢাকার ভিতর ডেলিভারি চার্জ (৳)</Label>
              <Input
                id="delivery_fee_dhaka"
                type="number"
                value={settings.delivery_fee_dhaka}
                onChange={(e) => setSettings(prev => ({ ...prev, delivery_fee_dhaka: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="delivery_fee_outside">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</Label>
              <Input
                id="delivery_fee_outside"
                type="number"
                value={settings.delivery_fee_outside}
                onChange={(e) => setSettings(prev => ({ ...prev, delivery_fee_outside: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="min_order_amount">ন্যূনতম অর্ডার পরিমাণ (৳)</Label>
              <Input
                id="min_order_amount"
                type="number"
                value={settings.min_order_amount}
                onChange={(e) => setSettings(prev => ({ ...prev, min_order_amount: Number(e.target.value) }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            অ্যানালিটিক্স ও ট্র্যাকিং
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
              <Input
                id="google_analytics_id"
                value={settings.google_analytics_id}
                onChange={(e) => setSettings(prev => ({ ...prev, google_analytics_id: e.target.value }))}
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
              <Input
                id="facebook_pixel_id"
                value={settings.facebook_pixel_id}
                onChange={(e) => setSettings(prev => ({ ...prev, facebook_pixel_id: e.target.value }))}
                placeholder="XXXXXXXXXX"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            সিস্টেম সেটিংস
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="maintenance_mode">মেইনটেনেন্স মোড</Label>
                <Switch
                  id="maintenance_mode"
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenance_mode: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="allow_guest_checkout">গেস্ট চেকআউট অনুমতি</Label>
                <Switch
                  id="allow_guest_checkout"
                  checked={settings.allow_guest_checkout}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_guest_checkout: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto_approve_orders">স্বয়ংক্রিয় অর্ডার অনুমোদন</Label>
                <Switch
                  id="auto_approve_orders"
                  checked={settings.auto_approve_orders}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_approve_orders: checked }))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_notifications">ইমেইল নোটিফিকেশন</Label>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="sms_notifications">SMS নোটিফিকেশন</Label>
                <Switch
                  id="sms_notifications"
                  checked={settings.sms_notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sms_notifications: checked }))}
                />
              </div>
              
              <div>
                <Label htmlFor="session_timeout">সেশন টাইমআউট (ঘণ্টা)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={settings.session_timeout}
                  onChange={(e) => setSettings(prev => ({ ...prev, session_timeout: Number(e.target.value) }))}
                  min="1"
                  max="168"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            থিম কাস্টমাইজেশন
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="theme_primary_color">প্রাথমিক রং</Label>
              <div className="flex gap-2">
                <Input
                  id="theme_primary_color"
                  type="color"
                  value={settings.theme_primary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme_primary_color: e.target.value }))}
                  className="w-20 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.theme_primary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme_primary_color: e.target.value }))}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="theme_secondary_color">সেকেন্ডারি রং</Label>
              <div className="flex gap-2">
                <Input
                  id="theme_secondary_color"
                  type="color"
                  value={settings.theme_secondary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme_secondary_color: e.target.value }))}
                  className="w-20 h-10 p-1 border rounded"
                />
                <Input
                  value={settings.theme_secondary_color}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme_secondary_color: e.target.value }))}
                  placeholder="#16a34a"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
        >
          {updateSettingsMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              সেভ করা হচ্ছে...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              সেটিংস সেভ করুন
            </>
          )}
        </Button>
      </div>
    </div>
  );
}