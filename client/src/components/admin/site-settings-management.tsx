import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, Globe, Palette, Bell, Shield, Database, Zap } from "lucide-react";

interface SiteSettings {
  site_title?: string;
  site_description?: string;
  site_logo?: string;
  site_favicon?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  whatsapp_number?: string;
  fb_pixel_id?: string;
  google_analytics_id?: string;
  google_tag_manager_id?: string;
  maintenance_mode?: boolean;
  allow_registration?: boolean;
  enable_reviews?: boolean;
  enable_wishlist?: boolean;
  enable_chat?: boolean;
  currency_symbol?: string;
  currency_position?: "before" | "after";
  timezone?: string;
  date_format?: string;
  min_order_amount?: number;
  max_order_amount?: number;
  shipping_cost?: number;
  free_shipping_threshold?: number;
  tax_rate?: number;
  enable_cod?: boolean;
  enable_online_payment?: boolean;
}

export default function SiteSettingsManagement() {
  const [activeSection, setActiveSection] = useState("general");
  const { toast } = useToast();

  // Fetch current settings
  const { data: settings, isLoading } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
    refetchInterval: 60000,
  });

  const [formData, setFormData] = useState<SiteSettings>(settings || {});

  // Update settings whenever data changes
  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      return apiRequest("PATCH", "/api/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
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

  const handleInputChange = (key: keyof SiteSettings, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const sections = [
    { id: "general", label: "সাধারণ", icon: Settings },
    { id: "contact", label: "যোগাযোগ", icon: Globe },
    { id: "social", label: "সোশ্যাল মিডিয়া", icon: Bell },
    { id: "tracking", label: "ট্র্যাকিং", icon: Database },
    { id: "features", label: "ফিচার", icon: Zap },
    { id: "payment", label: "পেমেন্ট", icon: Shield },
    { id: "appearance", label: "চেহারা", icon: Palette },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>সাইট সেটিংস</CardTitle>
          <CardDescription>
            ওয়েবসাইটের সেটিংস এবং কনফিগারেশন পরিচালনা করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <nav className="space-y-2">
                {sections.map(section => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id 
                          ? "bg-blue-50 text-blue-700 font-medium" 
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      data-testid={`nav-settings-${section.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* General Settings */}
                {activeSection === "general" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">সাধারণ সেটিংস</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="site_title">সাইটের নাম</Label>
                        <Input
                          id="site_title"
                          value={formData.site_title || ""}
                          onChange={(e) => handleInputChange("site_title", e.target.value)}
                          placeholder="TryneX Lifestyle"
                          data-testid="input-site-title"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency_symbol">মুদ্রার প্রতীক</Label>
                        <Input
                          id="currency_symbol"
                          value={formData.currency_symbol || ""}
                          onChange={(e) => handleInputChange("currency_symbol", e.target.value)}
                          placeholder="৳"
                          data-testid="input-currency-symbol"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site_description">সাইটের বিবরণ</Label>
                      <Textarea
                        id="site_description"
                        value={formData.site_description || ""}
                        onChange={(e) => handleInputChange("site_description", e.target.value)}
                        placeholder="আপনার ই-কমার্স ওয়েবসাইটের বিবরণ"
                        className="min-h-20"
                        data-testid="textarea-site-description"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="site_logo">সাইট লোগো URL</Label>
                        <Input
                          id="site_logo"
                          value={formData.site_logo || ""}
                          onChange={(e) => handleInputChange("site_logo", e.target.value)}
                          placeholder="https://example.com/logo.png"
                          data-testid="input-site-logo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="site_favicon">ফ্যাভিকন URL</Label>
                        <Input
                          id="site_favicon"
                          value={formData.site_favicon || ""}
                          onChange={(e) => handleInputChange("site_favicon", e.target.value)}
                          placeholder="https://example.com/favicon.ico"
                          data-testid="input-site-favicon"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Settings */}
                {activeSection === "contact" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">যোগাযোগের তথ্য</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">ইমেইল</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email || ""}
                          onChange={(e) => handleInputChange("contact_email", e.target.value)}
                          placeholder="info@trynex.com"
                          data-testid="input-contact-email"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">ফোন নম্বর</Label>
                        <Input
                          id="contact_phone"
                          value={formData.contact_phone || ""}
                          onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                          placeholder="+8801712345678"
                          data-testid="input-contact-phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_address">ঠিকানা</Label>
                      <Textarea
                        id="contact_address"
                        value={formData.contact_address || ""}
                        onChange={(e) => handleInputChange("contact_address", e.target.value)}
                        placeholder="আপনার ব্যবসার ঠিকানা"
                        className="min-h-20"
                        data-testid="textarea-contact-address"
                      />
                    </div>
                  </div>
                )}

                {/* Social Media Settings */}
                {activeSection === "social" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">সোশ্যাল মিডিয়া</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="facebook_url">ফেসবুক পেজ URL</Label>
                        <Input
                          id="facebook_url"
                          value={formData.facebook_url || ""}
                          onChange={(e) => handleInputChange("facebook_url", e.target.value)}
                          placeholder="https://facebook.com/yourpage"
                          data-testid="input-facebook-url"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram_url">ইনস্টাগ্রাম URL</Label>
                        <Input
                          id="instagram_url"
                          value={formData.instagram_url || ""}
                          onChange={(e) => handleInputChange("instagram_url", e.target.value)}
                          placeholder="https://instagram.com/youraccount"
                          data-testid="input-instagram-url"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="youtube_url">ইউটিউব চ্যানেল URL</Label>
                        <Input
                          id="youtube_url"
                          value={formData.youtube_url || ""}
                          onChange={(e) => handleInputChange("youtube_url", e.target.value)}
                          placeholder="https://youtube.com/yourchannel"
                          data-testid="input-youtube-url"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp_number">হোয়াটসঅ্যাপ নম্বর</Label>
                        <Input
                          id="whatsapp_number"
                          value={formData.whatsapp_number || ""}
                          onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                          placeholder="8801712345678"
                          data-testid="input-whatsapp-number"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tracking Settings */}
                {activeSection === "tracking" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">ট্র্যাকিং এবং অ্যানালিটিক্স</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fb_pixel_id">Facebook Pixel ID</Label>
                        <Input
                          id="fb_pixel_id"
                          value={formData.fb_pixel_id || ""}
                          onChange={(e) => handleInputChange("fb_pixel_id", e.target.value)}
                          placeholder="123456789012345"
                          data-testid="input-fb-pixel-id"
                        />
                        <p className="text-sm text-gray-600">
                          Facebook রূপান্তর ট্র্যাকিংয়ের জন্য
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                        <Input
                          id="google_analytics_id"
                          value={formData.google_analytics_id || ""}
                          onChange={(e) => handleInputChange("google_analytics_id", e.target.value)}
                          placeholder="GA-XXXXXXXXX-X"
                          data-testid="input-google-analytics-id"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="google_tag_manager_id">Google Tag Manager ID</Label>
                        <Input
                          id="google_tag_manager_id"
                          value={formData.google_tag_manager_id || ""}
                          onChange={(e) => handleInputChange("google_tag_manager_id", e.target.value)}
                          placeholder="GTM-XXXXXXX"
                          data-testid="input-google-tag-manager-id"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Features Settings */}
                {activeSection === "features" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">ফিচার সেটিংস</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="maintenance_mode">মেইনটেনেন্স মোড</Label>
                          <p className="text-sm text-gray-600">সাইট রক্ষণাবেক্ষণ মোডে রাখুন</p>
                        </div>
                        <Switch
                          id="maintenance_mode"
                          checked={formData.maintenance_mode || false}
                          onCheckedChange={(checked) => handleInputChange("maintenance_mode", checked)}
                          data-testid="switch-maintenance-mode"
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="allow_registration">নিবন্ধন অনুমতি</Label>
                          <p className="text-sm text-gray-600">নতুন ব্যবহারকারী নিবন্ধন অনুমতি দিন</p>
                        </div>
                        <Switch
                          id="allow_registration"
                          checked={formData.allow_registration !== false}
                          onCheckedChange={(checked) => handleInputChange("allow_registration", checked)}
                          data-testid="switch-allow-registration"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable_reviews">পর্যালোচনা সক্রিয়</Label>
                          <p className="text-sm text-gray-600">পণ্যের পর্যালোচনা ফিচার সক্রিয় করুন</p>
                        </div>
                        <Switch
                          id="enable_reviews"
                          checked={formData.enable_reviews !== false}
                          onCheckedChange={(checked) => handleInputChange("enable_reviews", checked)}
                          data-testid="switch-enable-reviews"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable_wishlist">উইশলিস্ট সক্রিয়</Label>
                          <p className="text-sm text-gray-600">পণ্যের উইশলিস্ট ফিচার সক্রিয় করুন</p>
                        </div>
                        <Switch
                          id="enable_wishlist"
                          checked={formData.enable_wishlist !== false}
                          onCheckedChange={(checked) => handleInputChange("enable_wishlist", checked)}
                          data-testid="switch-enable-wishlist"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable_chat">চ্যাট সক্রিয়</Label>
                          <p className="text-sm text-gray-600">লাইভ চ্যাট ফিচার সক্রিয় করুন</p>
                        </div>
                        <Switch
                          id="enable_chat"
                          checked={formData.enable_chat !== false}
                          onCheckedChange={(checked) => handleInputChange("enable_chat", checked)}
                          data-testid="switch-enable-chat"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Settings */}
                {activeSection === "payment" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">পেমেন্ট সেটিংস</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="min_order_amount">ন্যূনতম অর্ডার পরিমাণ</Label>
                        <Input
                          id="min_order_amount"
                          type="number"
                          min="0"
                          value={formData.min_order_amount || ""}
                          onChange={(e) => handleInputChange("min_order_amount", parseFloat(e.target.value) || 0)}
                          placeholder="100"
                          data-testid="input-min-order-amount"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_order_amount">সর্বোচ্চ অর্ডার পরিমাণ</Label>
                        <Input
                          id="max_order_amount"
                          type="number"
                          min="0"
                          value={formData.max_order_amount || ""}
                          onChange={(e) => handleInputChange("max_order_amount", parseFloat(e.target.value) || 0)}
                          placeholder="50000"
                          data-testid="input-max-order-amount"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shipping_cost">ডেলিভারি চার্জ</Label>
                        <Input
                          id="shipping_cost"
                          type="number"
                          min="0"
                          value={formData.shipping_cost || ""}
                          onChange={(e) => handleInputChange("shipping_cost", parseFloat(e.target.value) || 0)}
                          placeholder="60"
                          data-testid="input-shipping-cost"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="free_shipping_threshold">ফ্রি ডেলিভারি সীমা</Label>
                        <Input
                          id="free_shipping_threshold"
                          type="number"
                          min="0"
                          value={formData.free_shipping_threshold || ""}
                          onChange={(e) => handleInputChange("free_shipping_threshold", parseFloat(e.target.value) || 0)}
                          placeholder="1000"
                          data-testid="input-free-shipping-threshold"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable_cod">ক্যাশ অন ডেলিভারি</Label>
                          <p className="text-sm text-gray-600">ডেলিভারির সময় পেমেন্ট গ্রহণ করুন</p>
                        </div>
                        <Switch
                          id="enable_cod"
                          checked={formData.enable_cod !== false}
                          onCheckedChange={(checked) => handleInputChange("enable_cod", checked)}
                          data-testid="switch-enable-cod"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="enable_online_payment">অনলাইন পেমেন্ট</Label>
                          <p className="text-sm text-gray-600">অনলাইন পেমেন্ট গেটওয়ে সক্রিয় করুন</p>
                        </div>
                        <Switch
                          id="enable_online_payment"
                          checked={formData.enable_online_payment !== false}
                          onCheckedChange={(checked) => handleInputChange("enable_online_payment", checked)}
                          data-testid="switch-enable-online-payment"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Settings */}
                {activeSection === "appearance" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">চেহারা এবং ডিসপ্লে</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">টাইমজোন</Label>
                        <Input
                          id="timezone"
                          value={formData.timezone || ""}
                          onChange={(e) => handleInputChange("timezone", e.target.value)}
                          placeholder="Asia/Dhaka"
                          data-testid="input-timezone"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_format">তারিখের ফর্ম্যাট</Label>
                        <Input
                          id="date_format"
                          value={formData.date_format || ""}
                          onChange={(e) => handleInputChange("date_format", e.target.value)}
                          placeholder="DD/MM/YYYY"
                          data-testid="input-date-format"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={updateSettingsMutation.isPending}
                    className="min-w-32"
                    data-testid="button-save-settings"
                  >
                    {updateSettingsMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}