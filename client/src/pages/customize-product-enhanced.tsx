import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Upload, Palette, Type, Heart, ShoppingCart, Star, Zap } from "lucide-react";
import OrderNowModal from "@/components/order-now-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import MobileOptimizedLayout from "@/components/mobile-optimized-layout";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface CustomizationData {
  text?: string;
  fontSize?: number;
  color?: string;
  position: { x: number; y: number };
  image?: File | null;
  instructions?: string;
}

export default function CustomizeProductEnhanced() {
  const [, params] = useRoute("/customize/:id");
  const [, setLocation] = useLocation();
  const productId = params?.id;
  
  const [customization, setCustomization] = useState<CustomizationData>({
    fontSize: 16,
    color: '#000000',
    position: { x: 50, y: 50 },
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isOrderNowOpen, setIsOrderNowOpen] = useState(false);
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Fetch product data
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    enabled: !!productId,
  });

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCustomization(prev => ({ ...prev, image: file }));
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    const customizedProduct = {
      id: `${product.id}-custom-${Date.now()}`,
      name: `${product.name} (কাস্টমাইজড)`,
      price: Number(product.price) + 50, // Additional customization fee
      image: product.image_url || '',
      quantity: 1,
      customization: customization,
    };

    addToCart(customizedProduct);
    
    toast({
      title: "কাস্টমাইজড পণ্য কার্টে যোগ করা হয়েছে!",
      description: "আপনার কাস্টমাইজেশন সেভ করা হয়েছে",
    });
  };

  if (isLoading) {
    return (
      <MobileOptimizedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">লোড হচ্ছে...</p>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  if (!product) {
    return (
      <MobileOptimizedLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">পণ্য পাওয়া যায়নি</h2>
            <Button onClick={() => setLocation('/products')} className="bg-orange-500 hover:bg-orange-600">
              পণ্য তালিকায় ফিরে যান
            </Button>
          </div>
        </div>
      </MobileOptimizedLayout>
    );
  }

  return (
    <MobileOptimizedLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation(`/product/${productId}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              ফিরে যান
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">পণ্য কাস্টমাইজ করুন</h1>
              <p className="text-gray-600">{product.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Preview */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    প্রিভিউ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={product.image_url || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Custom Text Overlay */}
                    {customization.text && (
                      <div
                        className="absolute pointer-events-none"
                        style={{
                          left: `${customization.position?.x || 50}%`,
                          top: `${customization.position?.y || 50}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${customization.fontSize}px`,
                          color: customization.color,
                          fontWeight: 'bold',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                        }}
                      >
                        {customization.text}
                      </div>
                    )}
                    
                    {/* Custom Image Overlay */}
                    {previewUrl && (
                      <div
                        className="absolute"
                        style={{
                          left: `${customization.position?.x || 50}%`,
                          top: `${customization.position?.y || 50}%`,
                          transform: 'translate(-50%, -50%)',
                          width: '100px',
                          height: '100px',
                        }}
                      >
                        <img
                          src={previewUrl}
                          alt="Custom upload"
                          className="w-full h-full object-cover rounded-lg border-2 border-white shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{product.category}</Badge>
                        {product.is_featured && (
                          <Badge className="bg-orange-500">
                            <Star className="w-3 h-3 mr-1" />
                            ফিচার্ড
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">মূল দাম</p>
                      <p className="text-lg font-bold">{formatPrice(Number(product.price))}</p>
                      <p className="text-sm text-orange-600">+ ৳৫০ কাস্টমাইজেশন</p>
                      <p className="text-xl font-bold text-orange-600">
                        {formatPrice(Number(product.price) + 50)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customization Options */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>কাস্টমাইজেশন অপশন</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="text">টেক্সট</TabsTrigger>
                      <TabsTrigger value="image">ছবি</TabsTrigger>
                      <TabsTrigger value="instructions">নির্দেশনা</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="space-y-4">
                      <div>
                        <Label htmlFor="customText">কাস্টম টেক্সট</Label>
                        <Input
                          id="customText"
                          placeholder="আপনার টেক্সট লিখুন..."
                          value={customization.text || ''}
                          onChange={(e) => setCustomization(prev => ({ ...prev, text: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fontSize">ফন্ট সাইজ</Label>
                          <Input
                            id="fontSize"
                            type="number"
                            min="10"
                            max="48"
                            value={customization.fontSize}
                            onChange={(e) => setCustomization(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="textColor">রং</Label>
                          <Input
                            id="textColor"
                            type="color"
                            value={customization.color}
                            onChange={(e) => setCustomization(prev => ({ ...prev, color: e.target.value }))}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="image" className="space-y-4">
                      <div>
                        <Label htmlFor="customImage">কাস্টম ছবি আপলোড করুন</Label>
                        <div className="mt-2">
                          <input
                            id="customImage"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById('customImage')?.click()}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            ছবি নির্বাচন করুন
                          </Button>
                        </div>
                        {selectedFile && (
                          <p className="text-sm text-gray-600 mt-2">
                            নির্বাচিত: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="instructions" className="space-y-4">
                      <div>
                        <Label htmlFor="instructions">বিশেষ নির্দেশনা</Label>
                        <Textarea
                          id="instructions"
                          placeholder="আপনার বিশেষ নির্দেশনা লিখুন..."
                          value={customization.instructions || ''}
                          onChange={(e) => setCustomization(prev => ({ ...prev, instructions: e.target.value }))}
                          rows={4}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Position Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>অবস্থান নিয়ন্ত্রণ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="positionX">X অবস্থান (%)</Label>
                      <Input
                        id="positionX"
                        type="number"
                        min="0"
                        max="100"
                        value={customization.position?.x || 50}
                        onChange={(e) => setCustomization(prev => ({
                          ...prev,
                          position: { x: Number(e.target.value), y: prev.position?.y || 50 }
                        }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="positionY">Y অবস্থান (%)</Label>
                      <Input
                        id="positionY"
                        type="number"
                        min="0"
                        max="100"
                        value={customization.position?.y || 50}
                        onChange={(e) => setCustomization(prev => ({
                          ...prev,
                          position: { x: prev.position?.x || 50, y: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    কার্টে যোগ করুন
                  </Button>
                  
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsOrderNowOpen(true)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    অর্ডার করুন
                  </Button>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => setLocation('/contact')}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  সাহায্য চান
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Now Modal */}
        <OrderNowModal
          isOpen={isOrderNowOpen}
          onClose={() => setIsOrderNowOpen(false)}
          product={product}
          customization={customization}
        />
      </div>
    </MobileOptimizedLayout>
  );
}