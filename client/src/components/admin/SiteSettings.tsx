import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Save, RefreshCw, Settings, Globe, Facebook, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";

interface SiteSetting {
  key: string;
  value: string;
  description: string;
}

interface SiteSettingsForm {
  site_title: string;
  site_description: string;
  site_keywords: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  facebook_pixel_id: string;
  google_analytics_id: string;
  whatsapp_number: string;
  delivery_charge_dhaka: string;
  delivery_charge_outside_dhaka: string;
  min_order_amount: string;
  currency_symbol: string;
  business_hours: string;
  about_us_text: string;
  return_policy_text: string;
  privacy_policy_text: string;
  terms_conditions_text: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  maintenance_mode: string;
  announcement_text: string;
  featured_product_limit: string;
  latest_product_limit: string;
  bestseller_product_limit: string;
}

export default function SiteSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  const {
    data: settings,
    isLoading,
    error,
    refetch
  } = useQuery<SiteSetting[]>({
    queryKey: ['/api/settings'],
  });

  const form = useForm<SiteSettingsForm>();

  useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      form.reset({
        site_title: settingsMap.site_title || "Trynex Lifestyle",
        site_description: settingsMap.site_description || "বাংলাদেশের সেরা কাস্টম গিফট স্টোর",
        site_keywords: settingsMap.site_keywords || "কাস্টম গিফট, মগ, টি-শার্ট, ফ্রেম",
        contact_phone: settingsMap.contact_phone || "+8801XXXXXXXXX",
        contact_email: settingsMap.contact_email || "info@trynexlifestyle.com",
        contact_address: settingsMap.contact_address || "ঢাকা, বাংলাদেশ",
        facebook_pixel_id: settingsMap.facebook_pixel_id || "",
        google_analytics_id: settingsMap.google_analytics_id || "",
        whatsapp_number: settingsMap.whatsapp_number || "+8801XXXXXXXXX",
        delivery_charge_dhaka: settingsMap.delivery_charge_dhaka || "60",
        delivery_charge_outside_dhaka: settingsMap.delivery_charge_outside_dhaka || "120",
        min_order_amount: settingsMap.min_order_amount || "500",
        currency_symbol: settingsMap.currency_symbol || "৳",
        business_hours: settingsMap.business_hours || "সকাল ৯টা - রাত ১০টা",
        about_us_text: settingsMap.about_us_text || "",
        return_policy_text: settingsMap.return_policy_text || "",
        privacy_policy_text: settingsMap.privacy_policy_text || "",
        terms_conditions_text: settingsMap.terms_conditions_text || "",
        social_facebook: settingsMap.social_facebook || "",
        social_instagram: settingsMap.social_instagram || "",
        social_youtube: settingsMap.social_youtube || "",
        maintenance_mode: settingsMap.maintenance_mode || "false",
        announcement_text: settingsMap.announcement_text || "",
        featured_product_limit: settingsMap.featured_product_limit || "6",
        latest_product_limit: settingsMap.latest_product_limit || "8",
        bestseller_product_limit: settingsMap.bestseller_product_limit || "4",
      });
    }
  }, [settings, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SiteSettingsForm) => {
      const updates = Object.entries(data).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      return Promise.all(
        updates.map(update =>
          apiRequest('/api/settings', {
            method: 'POST',
            body: update
          })
        )
      );
    },
    onSuccess: () => {
      toast({
        title: "সফল",
        description: "সাইট সেটিংস আপডেট হয়েছে",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: "ত্রুটি",
        description: "সেটিংস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: SiteSettingsForm) => {
    updateSettingsMutation.mutate(data);
  };

  const tabs = [
    { id: "general", label: "সাধারণ", icon: Settings },
    { id: "contact", label: "যোগাযোগ", icon: Globe },
    { id: "analytics", label: "অ্যানালিটিক্স", icon: Search },
    { id: "social", label: "সোশ্যাল মিডিয়া", icon: Facebook },
    { id: "policies", label: "নীতিমালা", icon: Settings },
    { id: "ecommerce", label: "ই-কমার্স", icon: Settings }
  ];

  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          সেটিংস লোড করতে সমস্যা হয়েছে
          <Button onClick={() => refetch()} className="ml-4">
            পুনরায় চেষ্টা
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">সাইট সেটিংস</h1>
          <p className="text-gray-600">ওয়েবসাইটের সব ধরনের সেটিংস পরিচালনা করুন</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            রিফ্রেশ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>ক্যাটাগরি</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {tabs.find(tab => tab.id === activeTab)?.label} সেটিংস
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* General Settings */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">সাইট টাইটেল</label>
                      <Input
                        {...form.register("site_title")}
                        placeholder="Trynex Lifestyle"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">কারেন্সি সিম্বল</label>
                      <Input
                        {...form.register("currency_symbol")}
                        placeholder="৳"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">সাইট বিবরণ</label>
                    <Textarea
                      {...form.register("site_description")}
                      placeholder="বাংলাদেশের সেরা কাস্টম গিফট স্টোর"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">কীওয়ার্ড (SEO)</label>
                    <Input
                      {...form.register("site_keywords")}
                      placeholder="কাস্টম গিফট, মগ, টি-শার্ট, ফ্রেম"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">ব্যবসার সময়</label>
                    <Input
                      {...form.register("business_hours")}
                      placeholder="সকাল ৯টা - রাত ১০টা"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">ঘোষণা (যদি থাকে)</label>
                    <Textarea
                      {...form.register("announcement_text")}
                      placeholder="বিশেষ ছাড় বা গুরুত্বপূর্ণ তথ্য"
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Contact Settings */}
              {activeTab === "contact" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">ফোন নম্বর</label>
                      <Input
                        {...form.register("contact_phone")}
                        placeholder="+8801XXXXXXXXX"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">ইমেইল</label>
                      <Input
                        {...form.register("contact_email")}
                        type="email"
                        placeholder="info@trynexlifestyle.com"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">ঠিকানা</label>
                    <Textarea
                      {...form.register("contact_address")}
                      placeholder="ঢাকা, বাংলাদেশ"
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">WhatsApp নম্বর</label>
                    <Input
                      {...form.register("whatsapp_number")}
                      placeholder="+8801XXXXXXXXX"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      গ্রাহকরা এই নম্বরে WhatsApp করতে পারবেন
                    </p>
                  </div>
                </div>
              )}

              {/* Analytics Settings */}
              {activeTab === "analytics" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Facebook Pixel ID</label>
                    <Input
                      {...form.register("facebook_pixel_id")}
                      placeholder="123456789012345"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Facebook Ads ট্র্যাকিংয়ের জন্য Pixel ID দিন
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Google Analytics ID</label>
                    <Input
                      {...form.register("google_analytics_id")}
                      placeholder="G-XXXXXXXXXX"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Google Analytics 4 (GA4) Measurement ID
                    </p>
                  </div>
                </div>
              )}

              {/* Social Media Settings */}
              {activeTab === "social" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Facebook Page URL</label>
                    <Input
                      {...form.register("social_facebook")}
                      placeholder="https://facebook.com/trynexlifestyle"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Instagram URL</label>
                    <Input
                      {...form.register("social_instagram")}
                      placeholder="https://instagram.com/trynexlifestyle"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">YouTube URL</label>
                    <Input
                      {...form.register("social_youtube")}
                      placeholder="https://youtube.com/@trynexlifestyle"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Policies */}
              {activeTab === "policies" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">আমাদের সম্পর্কে</label>
                    <Textarea
                      {...form.register("about_us_text")}
                      placeholder="কোম্পানির বিবরণ লিখুন..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">রিটার্ন পলিসি</label>
                    <Textarea
                      {...form.register("return_policy_text")}
                      placeholder="রিটার্ন পলিসি লিখুন..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">প্রাইভেসি পলিসি</label>
                    <Textarea
                      {...form.register("privacy_policy_text")}
                      placeholder="প্রাইভেসি পলিসি লিখুন..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">শর্তাবলী</label>
                    <Textarea
                      {...form.register("terms_conditions_text")}
                      placeholder="শর্তাবলী লিখুন..."
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* E-commerce Settings */}
              {activeTab === "ecommerce" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">ঢাকার ভিতর ডেলিভারি চার্জ</label>
                      <Input
                        {...form.register("delivery_charge_dhaka")}
                        type="number"
                        placeholder="60"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">ঢাকার বাইরে ডেলিভারি চার্জ</label>
                      <Input
                        {...form.register("delivery_charge_outside_dhaka")}
                        type="number"
                        placeholder="120"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">মিনিমাম অর্ডার</label>
                      <Input
                        {...form.register("min_order_amount")}
                        type="number"
                        placeholder="500"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">ফিচারড প্রোডাক্ট সংখ্যা</label>
                      <Input
                        {...form.register("featured_product_limit")}
                        type="number"
                        placeholder="6"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">লেটেস্ট প্রোডাক্ট সংখ্যা</label>
                      <Input
                        {...form.register("latest_product_limit")}
                        type="number"
                        placeholder="8"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">বেস্ট সেলার সংখ্যা</label>
                      <Input
                        {...form.register("bestseller_product_limit")}
                        type="number"
                        placeholder="4"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={updateSettingsMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {updateSettingsMutation.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}