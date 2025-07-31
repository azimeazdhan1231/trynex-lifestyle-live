import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Settings, BarChart3, Target, Facebook, BarChart2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface AnalyticsSettings {
  google_analytics_id: string;
  facebook_pixel_id: string;
  analytics_enabled: boolean;
  pixel_enabled: boolean;
  conversion_tracking: boolean;
  ecommerce_tracking: boolean;
}

export default function AnalyticsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [analyticsForm, setAnalyticsForm] = useState<AnalyticsSettings>({
    google_analytics_id: "",
    facebook_pixel_id: "",
    analytics_enabled: true,
    pixel_enabled: true,
    conversion_tracking: true,
    ecommerce_tracking: true,
  });

  const [testResults, setTestResults] = useState({
    ga_status: "unknown",
    fb_status: "unknown",
    last_tested: null as Date | null,
  });

  // Load current analytics settings
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Update form when settings data changes
  useEffect(() => {
    if (settings && settings.length > 0) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setAnalyticsForm({
        google_analytics_id: settingsMap.google_analytics_id || "",
        facebook_pixel_id: settingsMap.facebook_pixel_id || "",
        analytics_enabled: settingsMap.analytics_enabled !== "false",
        pixel_enabled: settingsMap.pixel_enabled !== "false",
        conversion_tracking: settingsMap.conversion_tracking !== "false",
        ecommerce_tracking: settingsMap.ecommerce_tracking !== "false",
      });
    }
  }, [settings]);

  // API request helper
  const apiRequest = async (url: string, method: string, data?: any) => {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`${method} ${url} failed`);
    return response.json();
  };

  // Save analytics settings
  const saveSettingsMutation = useMutation({
    mutationFn: (settings: AnalyticsSettings) => 
      Promise.all([
        apiRequest("/api/settings/google_analytics_id", "PUT", { value: settings.google_analytics_id }),
        apiRequest("/api/settings/facebook_pixel_id", "PUT", { value: settings.facebook_pixel_id }),
        apiRequest("/api/settings/analytics_enabled", "PUT", { value: settings.analytics_enabled.toString() }),
        apiRequest("/api/settings/pixel_enabled", "PUT", { value: settings.pixel_enabled.toString() }),
        apiRequest("/api/settings/conversion_tracking", "PUT", { value: settings.conversion_tracking.toString() }),
        apiRequest("/api/settings/ecommerce_tracking", "PUT", { value: settings.ecommerce_tracking.toString() }),
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "সেটিংস সংরক্ষিত হয়েছে!" });
    },
    onError: () => {
      toast({ title: "সেটিংস সংরক্ষণে ত্রুটি!", variant: "destructive" });
    },
  });

  // Test analytics integration
  const testAnalytics = async () => {
    try {
      // Test Google Analytics
      const gaTest = analyticsForm.google_analytics_id && 
                   typeof window !== 'undefined' && 
                   window.gtag;
      
      // Test Facebook Pixel
      const fbTest = analyticsForm.facebook_pixel_id && 
                   typeof window !== 'undefined' && 
                   (window as any).fbq;

      setTestResults({
        ga_status: gaTest ? "connected" : "error",
        fb_status: fbTest ? "connected" : "error",
        last_tested: new Date(),
      });

      if (gaTest && fbTest) {
        toast({ title: "সব অ্যানালিটিক্স সংযুক্ত!" });
      } else {
        toast({ 
          title: "কিছু সমস্যা আছে", 
          description: "পেজ রিফ্রেশ করে আবার চেষ্টা করুন",
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: "টেস্টে ত্রুটি!", variant: "destructive" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(analyticsForm);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      connected: { variant: "default" as const, icon: CheckCircle, text: "সংযুক্ত" },
      error: { variant: "destructive" as const, icon: AlertCircle, text: "সমস্যা" },
      unknown: { variant: "secondary" as const, icon: Settings, text: "অজানা" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.unknown;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">অ্যানালিটিক্স সেটিংস</h2>
          <p className="text-gray-600 mt-1">Google Analytics এবং Facebook Pixel কনফিগার করুন</p>
        </div>
        <Button onClick={testAnalytics} variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          সংযোগ টেস্ট করুন
        </Button>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">সেটআপ</TabsTrigger>
          <TabsTrigger value="status">স্ট্যাটাস</TabsTrigger>
          <TabsTrigger value="help">সাহায্য</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Google Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="w-5 h-5" />
                    Google Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ga-id">Measurement ID</Label>
                    <Input
                      id="ga-id"
                      value={analyticsForm.google_analytics_id}
                      onChange={(e) => setAnalyticsForm({ ...analyticsForm, google_analytics_id: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Google Analytics 4 Measurement ID
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="ga-enabled">Analytics চালু</Label>
                    <Switch
                      id="ga-enabled"
                      checked={analyticsForm.analytics_enabled}
                      onCheckedChange={(checked) => setAnalyticsForm({ ...analyticsForm, analytics_enabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="ecommerce-tracking">E-commerce ট্র্যাকিং</Label>
                    <Switch
                      id="ecommerce-tracking"
                      checked={analyticsForm.ecommerce_tracking}
                      onCheckedChange={(checked) => setAnalyticsForm({ ...analyticsForm, ecommerce_tracking: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Facebook Pixel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Facebook className="w-5 h-5" />
                    Facebook Pixel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fb-id">Pixel ID</Label>
                    <Input
                      id="fb-id"
                      value={analyticsForm.facebook_pixel_id}
                      onChange={(e) => setAnalyticsForm({ ...analyticsForm, facebook_pixel_id: e.target.value })}
                      placeholder="123456789012345"
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Facebook Pixel ID (15 ডিজিট)
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="pixel-enabled">Pixel চালু</Label>
                    <Switch
                      id="pixel-enabled"
                      checked={analyticsForm.pixel_enabled}
                      onCheckedChange={(checked) => setAnalyticsForm({ ...analyticsForm, pixel_enabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="conversion-tracking">Conversion ট্র্যাকিং</Label>
                    <Switch
                      id="conversion-tracking"
                      checked={analyticsForm.conversion_tracking}
                      onCheckedChange={(checked) => setAnalyticsForm({ ...analyticsForm, conversion_tracking: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button type="submit" size="lg" disabled={saveSettingsMutation.isPending}>
              {saveSettingsMutation.isPending ? "সংরক্ষণ করা হচ্ছে..." : "সেটিংস সংরক্ষণ করুন"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="status">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics স্ট্যাটাস</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>সংযোগ স্ট্যাটাস:</span>
                  <StatusBadge status={testResults.ga_status} />
                </div>
                {analyticsForm.google_analytics_id && (
                  <p className="text-sm text-gray-600 mt-2">
                    ID: {analyticsForm.google_analytics_id}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facebook Pixel স্ট্যাটাস</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>সংযোগ স্ট্যাটাস:</span>
                  <StatusBadge status={testResults.fb_status} />
                </div>
                {analyticsForm.facebook_pixel_id && (
                  <p className="text-sm text-gray-600 mt-2">
                    ID: {analyticsForm.facebook_pixel_id}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {testResults.last_tested && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600">
                  শেষ টেস্ট: {testResults.last_tested.toLocaleString('bn-BD')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="help">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Google Analytics সেটআপ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-semibold mb-2">১. Google Analytics অ্যাকাউন্ট তৈরি করুন:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>analytics.google.com এ যান</li>
                    <li>নতুন প্রপার্টি তৈরি করুন</li>
                    <li>GA4 (Google Analytics 4) সিলেক্ট করুন</li>
                    <li>Measurement ID কপি করুন</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <h4 className="font-semibold mb-2">২. Measurement ID খুঁজে পেতে:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Admin → Property → Data Streams</li>
                    <li>Web stream সিলেক্ট করুন</li>
                    <li>Measurement ID (G-XXXXXXXXXX) কপি করুন</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Facebook Pixel সেটআপ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <h4 className="font-semibold mb-2">১. Facebook Business Manager এ যান:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>business.facebook.com</li>
                    <li>Events Manager → Pixels</li>
                    <li>নতুন Pixel তৈরি করুন</li>
                    <li>Pixel ID কপি করুন</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <h4 className="font-semibold mb-2">২. বিজ্ঞাপনের জন্য প্রস্তুত:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Facebook Ads Manager</li>
                    <li>Custom Audiences তৈরি করুন</li>
                    <li>Conversion tracking সেট করুন</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}