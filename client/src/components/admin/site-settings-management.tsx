import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Globe, 
  Truck, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Store,
  Image as ImageIcon,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SiteSettingsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Site settings state
  const [settings, setSettings] = useState({
    // Basic Settings
    site_name: 'Trynex Life',
    site_name_bengali: 'ট্রাইনেক্স লাইফ',
    site_description: 'Your trusted gift shop for all occasions',
    site_description_bengali: 'সকল অনুষ্ঠানের জন্য আপনার বিশ্বস্ত গিফট শপ',
    site_logo: '/logo.png',
    site_favicon: '/favicon.ico',
    
    // Contact Information
    contact_phone: '+880 1234 567890',
    contact_email: 'info@trynexlife.com',
    contact_address: 'Dhaka, Bangladesh',
    contact_address_bengali: 'ঢাকা, বাংলাদেশ',
    
    // Business Hours
    business_hours: 'Mon-Sat: 9AM-9PM, Sun: 10AM-8PM',
    business_hours_bengali: 'সোম-শনি: সকাল ৯টা - রাত ৯টা, রবি: সকাল ১০টা - রাত ৮টা',
    
    // Shipping Settings
    delivery_charge_dhaka: '60',
    delivery_charge_outside_dhaka: '120',
    free_delivery_minimum: '1000',
    estimated_delivery_days: '1-3',
    
    // Payment Settings
    payment_methods_enabled: true,
    cod_enabled: true,
    advance_payment_percentage: '20',
    
    // Social Media
    facebook_url: 'https://facebook.com/trynexlife',
    instagram_url: 'https://instagram.com/trynexlife',
    youtube_url: '',
    whatsapp_number: '+880 1234 567890',
    
    // SEO Settings
    meta_keywords: 'gifts, personalized gifts, bangladesh, online gift shop',
    meta_keywords_bengali: 'গিফট, ব্যক্তিগত উপহার, বাংলাদেশ, অনলাইন গিফট শপ',
    google_analytics_id: '',
    facebook_pixel_id: '',
    
    // Features
    customization_enabled: true,
    gift_wrapping_enabled: true,
    gift_wrapping_charge: '50',
    reviews_enabled: true,
    wishlist_enabled: true,
    
    // Maintenance
    maintenance_mode: false,
    maintenance_message: 'We are currently under maintenance. Please check back later.',
    maintenance_message_bengali: 'আমরা বর্তমানে রক্ষণাবেক্ষণের কাজ করছি। পরে আবার চেষ্টা করুন।',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'সফল!',
        description: 'সাইট সেটিংস সফলভাবে সংরক্ষিত হয়েছে',
      });
    } catch (error) {
      toast({
        title: 'ত্রুটি!',
        description: 'সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (amount: string) => {
    return `৳${parseFloat(amount || '0').toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">সাইট সেটিংস</h2>
          <p className="text-gray-600">ওয়েবসাইটের সকল সেটিংস এবং কনফিগারেশন পরিচালনা করুন</p>
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          data-testid="button-save-settings"
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              সংরক্ষণ হচ্ছে...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              সেটিংস সংরক্ষণ করুন
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>মূল তথ্য</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>যোগাযোগ</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>ডেলিভারি</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>পেমেন্ট</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>সোশ্যাল</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>অ্যাডভান্সড</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Settings */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="h-5 w-5 mr-2" />
                সাইটের মূল তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="site_name">সাইটের নাম (ইংরেজি)</Label>
                  <Input
                    id="site_name"
                    data-testid="input-site-name"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="Trynex Life"
                  />
                </div>
                
                <div>
                  <Label htmlFor="site_name_bengali">সাইটের নাম (বাংলা)</Label>
                  <Input
                    id="site_name_bengali"
                    data-testid="input-site-name-bengali"
                    value={settings.site_name_bengali}
                    onChange={(e) => handleInputChange('site_name_bengali', e.target.value)}
                    placeholder="ট্রাইনেক্স লাইফ"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="site_description">সাইটের বর্ণনা (ইংরেজি)</Label>
                  <Textarea
                    id="site_description"
                    data-testid="textarea-site-description"
                    value={settings.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    placeholder="Your trusted gift shop for all occasions"
                  />
                </div>
                
                <div>
                  <Label htmlFor="site_description_bengali">সাইটের বর্ণনা (বাংলা)</Label>
                  <Textarea
                    id="site_description_bengali"
                    data-testid="textarea-site-description-bengali"
                    value={settings.site_description_bengali}
                    onChange={(e) => handleInputChange('site_description_bengali', e.target.value)}
                    placeholder="সকল অনুষ্ঠানের জন্য আপনার বিশ্বস্ত গিফট শপ"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="site_logo">সাইট লোগো URL</Label>
                  <Input
                    id="site_logo"
                    data-testid="input-site-logo"
                    value={settings.site_logo}
                    onChange={(e) => handleInputChange('site_logo', e.target.value)}
                    placeholder="/logo.png"
                  />
                </div>
                
                <div>
                  <Label htmlFor="site_favicon">ফ্যাভিকন URL</Label>
                  <Input
                    id="site_favicon"
                    data-testid="input-site-favicon"
                    value={settings.site_favicon}
                    onChange={(e) => handleInputChange('site_favicon', e.target.value)}
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">লোগো প্রিভিউ</h4>
                </div>
                <div className="flex items-center space-x-4">
                  <img 
                    src={settings.site_logo} 
                    alt="Site Logo" 
                    className="h-12 w-auto object-contain bg-white rounded border"
                    onError={(e) => {
                      e.currentTarget.src = '/api/placeholder/100/40';
                    }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{settings.site_name_bengali}</p>
                    <p className="text-sm text-gray-600">{settings.site_description_bengali}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Settings */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                যোগাযোগের তথ্য
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contact_phone">ফোন নম্বর</Label>
                  <Input
                    id="contact_phone"
                    data-testid="input-contact-phone"
                    value={settings.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="+880 1234 567890"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_email">ইমেইল ঠিকানা</Label>
                  <Input
                    id="contact_email"
                    data-testid="input-contact-email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="info@trynexlife.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contact_address">ঠিকানা (ইংরেজি)</Label>
                  <Textarea
                    id="contact_address"
                    data-testid="textarea-contact-address"
                    value={settings.contact_address}
                    onChange={(e) => handleInputChange('contact_address', e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_address_bengali">ঠিকানা (বাংলা)</Label>
                  <Textarea
                    id="contact_address_bengali"
                    data-testid="textarea-contact-address-bengali"
                    value={settings.contact_address_bengali}
                    onChange={(e) => handleInputChange('contact_address_bengali', e.target.value)}
                    placeholder="ঢাকা, বাংলাদেশ"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="business_hours">ব্যবসার সময় (ইংরেজি)</Label>
                  <Input
                    id="business_hours"
                    data-testid="input-business-hours"
                    value={settings.business_hours}
                    onChange={(e) => handleInputChange('business_hours', e.target.value)}
                    placeholder="Mon-Sat: 9AM-9PM, Sun: 10AM-8PM"
                  />
                </div>
                
                <div>
                  <Label htmlFor="business_hours_bengali">ব্যবসার সময় (বাংলা)</Label>
                  <Input
                    id="business_hours_bengali"
                    data-testid="input-business-hours-bengali"
                    value={settings.business_hours_bengali}
                    onChange={(e) => handleInputChange('business_hours_bengali', e.target.value)}
                    placeholder="সোম-শনি: সকাল ৯টা - রাত ৯টা, রবি: সকাল ১০টা - রাত ৮টা"
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">যোগাযোগের তথ্য প্রিভিউ</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{settings.contact_phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{settings.contact_email}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{settings.contact_address_bengali}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{settings.business_hours_bengali}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                ডেলিভারি সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="delivery_charge_dhaka">ঢাকার ভিতর ডেলিভারি চার্জ (৳)</Label>
                  <Input
                    id="delivery_charge_dhaka"
                    data-testid="input-delivery-charge-dhaka"
                    type="number"
                    value={settings.delivery_charge_dhaka}
                    onChange={(e) => handleInputChange('delivery_charge_dhaka', e.target.value)}
                    placeholder="60"
                  />
                </div>
                
                <div>
                  <Label htmlFor="delivery_charge_outside_dhaka">ঢাকার বাইরে ডেলিভারি চার্জ (৳)</Label>
                  <Input
                    id="delivery_charge_outside_dhaka"
                    data-testid="input-delivery-charge-outside-dhaka"
                    type="number"
                    value={settings.delivery_charge_outside_dhaka}
                    onChange={(e) => handleInputChange('delivery_charge_outside_dhaka', e.target.value)}
                    placeholder="120"
                  />
                </div>
                
                <div>
                  <Label htmlFor="free_delivery_minimum">ফ্রি ডেলিভারির মিনিমাম অর্ডার (৳)</Label>
                  <Input
                    id="free_delivery_minimum"
                    data-testid="input-free-delivery-minimum"
                    type="number"
                    value={settings.free_delivery_minimum}
                    onChange={(e) => handleInputChange('free_delivery_minimum', e.target.value)}
                    placeholder="1000"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="estimated_delivery_days">আনুমানিক ডেলিভারির সময়</Label>
                <Input
                  id="estimated_delivery_days"
                  data-testid="input-estimated-delivery-days"
                  value={settings.estimated_delivery_days}
                  onChange={(e) => handleInputChange('estimated_delivery_days', e.target.value)}
                  placeholder="1-3 days"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">ডেলিভারি তথ্য প্রিভিউ</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded border">
                    <Truck className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold">ঢাকার ভিতর</p>
                    <p className="text-blue-600 font-bold">{formatPrice(settings.delivery_charge_dhaka)}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <Truck className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold">ঢাকার বাইরে</p>
                    <p className="text-green-600 font-bold">{formatPrice(settings.delivery_charge_outside_dhaka)}</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white mb-2">
                      ফ্রি ডেলিভারি
                    </Badge>
                    <p className="font-semibold">{formatPrice(settings.free_delivery_minimum)}+ অর্ডারে</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-gray-600">আনুমানিক ডেলিভারি সময়: <span className="font-semibold">{settings.estimated_delivery_days} দিন</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                পেমেন্ট সেটিংস
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>অনলাইন পেমেন্ট সক্রিয়</Label>
                    <p className="text-sm text-gray-600">কার্ড, মোবাইল ব্যাংকিং ইত্যাদি</p>
                  </div>
                  <Switch
                    data-testid="switch-payment-methods"
                    checked={settings.payment_methods_enabled}
                    onCheckedChange={(checked) => handleInputChange('payment_methods_enabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>ক্যাশ অন ডেলিভারি সক্রিয়</Label>
                    <p className="text-sm text-gray-600">হাতে পেয়ে টাকা দিন</p>
                  </div>
                  <Switch
                    data-testid="switch-cod"
                    checked={settings.cod_enabled}
                    onCheckedChange={(checked) => handleInputChange('cod_enabled', checked)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="advance_payment_percentage">অগ্রিম পেমেন্টের শতাংশ (%)</Label>
                <Input
                  id="advance_payment_percentage"
                  data-testid="input-advance-payment"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.advance_payment_percentage}
                  onChange={(e) => handleInputChange('advance_payment_percentage', e.target.value)}
                  placeholder="20"
                />
                <p className="text-sm text-gray-600 mt-1">কাস্টমাইজেশনের জন্য কত শতাংশ অগ্রিম নিতে হবে</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-3">পেমেন্ট অপশন প্রিভিউ</h4>
                <div className="space-y-3">
                  {settings.payment_methods_enabled && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">অনলাইন পেমেন্ট</p>
                        <p className="text-sm text-gray-600">কার্ড, বিকাশ, নগদ, রকেট</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                    </div>
                  )}
                  
                  {settings.cod_enabled && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Truck className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">ক্যাশ অন ডেলিভারি</p>
                        <p className="text-sm text-gray-600">হাতে পেয়ে টাকা দিন</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">সক্রিয়</Badge>
                    </div>
                  )}
                  
                  <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-sm">
                      <strong>কাস্টমাইজেশনের জন্য অগ্রিম:</strong> {settings.advance_payment_percentage}% 
                      (উদাহরণ: ১০০০ টাকার অর্ডারে {parseFloat(settings.advance_payment_percentage) * 10} টাকা অগ্রিম)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                সোশ্যাল মিডিয়া ও মার্কেটিং
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="facebook_url">ফেইসবুক পেজ URL</Label>
                  <Input
                    id="facebook_url"
                    data-testid="input-facebook-url"
                    value={settings.facebook_url}
                    onChange={(e) => handleInputChange('facebook_url', e.target.value)}
                    placeholder="https://facebook.com/trynexlife"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instagram_url">ইনস্টাগ্রাম URL</Label>
                  <Input
                    id="instagram_url"
                    data-testid="input-instagram-url"
                    value={settings.instagram_url}
                    onChange={(e) => handleInputChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/trynexlife"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="youtube_url">ইউটিউব চ্যানেল URL</Label>
                  <Input
                    id="youtube_url"
                    data-testid="input-youtube-url"
                    value={settings.youtube_url}
                    onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                    placeholder="https://youtube.com/trynexlife"
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsapp_number">হোয়াটসঅ্যাপ নম্বর</Label>
                  <Input
                    id="whatsapp_number"
                    data-testid="input-whatsapp-number"
                    value={settings.whatsapp_number}
                    onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                    placeholder="+880 1234 567890"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold">SEO ও ট্র্যাকিং</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="meta_keywords">মেটা কিওয়ার্ড (ইংরেজি)</Label>
                    <Textarea
                      id="meta_keywords"
                      data-testid="textarea-meta-keywords"
                      value={settings.meta_keywords}
                      onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                      placeholder="gifts, personalized gifts, bangladesh"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="meta_keywords_bengali">মেটা কিওয়ার্ড (বাংলা)</Label>
                    <Textarea
                      id="meta_keywords_bengali"
                      data-testid="textarea-meta-keywords-bengali"
                      value={settings.meta_keywords_bengali}
                      onChange={(e) => handleInputChange('meta_keywords_bengali', e.target.value)}
                      placeholder="গিফট, ব্যক্তিগত উপহার, বাংলাদেশ"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                    <Input
                      id="google_analytics_id"
                      data-testid="input-google-analytics"
                      value={settings.google_analytics_id}
                      onChange={(e) => handleInputChange('google_analytics_id', e.target.value)}
                      placeholder="GA4-XXXXXXXXX"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                    <Input
                      id="facebook_pixel_id"
                      data-testid="input-facebook-pixel"
                      value={settings.facebook_pixel_id}
                      onChange={(e) => handleInputChange('facebook_pixel_id', e.target.value)}
                      placeholder="123456789012345"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced">
          <div className="space-y-6">
            {/* Features Card */}
            <Card>
              <CardHeader>
                <CardTitle>ফিচার সেটিংস</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>কাস্টমাইজেশন সক্রিয়</Label>
                    <p className="text-sm text-gray-600">পণ্যে নাম, ছবি যোগ করার সুবিধা</p>
                  </div>
                  <Switch
                    data-testid="switch-customization"
                    checked={settings.customization_enabled}
                    onCheckedChange={(checked) => handleInputChange('customization_enabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>গিফট র‌্যাপিং সক্রিয়</Label>
                    <p className="text-sm text-gray-600">বিশেষ প্যাকেজিং সেবা</p>
                  </div>
                  <Switch
                    data-testid="switch-gift-wrapping"
                    checked={settings.gift_wrapping_enabled}
                    onCheckedChange={(checked) => handleInputChange('gift_wrapping_enabled', checked)}
                  />
                </div>
                
                {settings.gift_wrapping_enabled && (
                  <div>
                    <Label htmlFor="gift_wrapping_charge">গিফট র‌্যাপিং চার্জ (৳)</Label>
                    <Input
                      id="gift_wrapping_charge"
                      data-testid="input-gift-wrapping-charge"
                      type="number"
                      value={settings.gift_wrapping_charge}
                      onChange={(e) => handleInputChange('gift_wrapping_charge', e.target.value)}
                      placeholder="50"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>রিভিউ সিস্টেম সক্রিয়</Label>
                    <p className="text-sm text-gray-600">কাস্টমাররা রিভিউ দিতে পারবে</p>
                  </div>
                  <Switch
                    data-testid="switch-reviews"
                    checked={settings.reviews_enabled}
                    onCheckedChange={(checked) => handleInputChange('reviews_enabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>উইশলিস্ট সক্রিয়</Label>
                    <p className="text-sm text-gray-600">পছন্দের তালিকা তৈরি করার সুবিধা</p>
                  </div>
                  <Switch
                    data-testid="switch-wishlist"
                    checked={settings.wishlist_enabled}
                    onCheckedChange={(checked) => handleInputChange('wishlist_enabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Maintenance Mode Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">রক্ষণাবেক্ষণ মোড</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-red-600">রক্ষণাবেক্ষণ মোড সক্রিয় করুন</Label>
                    <p className="text-sm text-gray-600">সাইট বন্ধ রাখুন আপডেটের জন্য</p>
                  </div>
                  <Switch
                    data-testid="switch-maintenance-mode"
                    checked={settings.maintenance_mode}
                    onCheckedChange={(checked) => handleInputChange('maintenance_mode', checked)}
                  />
                </div>
                
                {settings.maintenance_mode && (
                  <>
                    <div>
                      <Label htmlFor="maintenance_message">রক্ষণাবেক্ষণ বার্তা (ইংরেজি)</Label>
                      <Textarea
                        id="maintenance_message"
                        data-testid="textarea-maintenance-message"
                        value={settings.maintenance_message}
                        onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                        placeholder="We are currently under maintenance..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="maintenance_message_bengali">রক্ষণাবেক্ষণ বার্তা (বাংলা)</Label>
                      <Textarea
                        id="maintenance_message_bengali"
                        data-testid="textarea-maintenance-message-bengali"
                        value={settings.maintenance_message_bengali}
                        onChange={(e) => handleInputChange('maintenance_message_bengali', e.target.value)}
                        placeholder="আমরা বর্তমানে রক্ষণাবেক্ষণের কাজ করছি..."
                      />
                    </div>
                    
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-medium">⚠️ সতর্কতা</p>
                      <p className="text-yellow-700 text-sm mt-1">
                        রক্ষণাবেক্ষণ মোড সক্রিয় করলে সাধারণ ভিজিটররা সাইট দেখতে পাবে না। শুধুমাত্র অ্যাডমিনরা অ্যাক্সেস করতে পারবেন।
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}