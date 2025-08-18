import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Palette,
  Type,
  Heart,
  Star,
  Gift,
  Check,
  X,
  Camera,
  Sparkles
} from "lucide-react";

export default function CustomizeProductPage() {
  const [, setLocation] = useLocation();
  const { addItem } = useCart();
  const { toast } = useToast();
  
  // Get product ID from URL params
  const searchParams = new URLSearchParams(window.location.search);
  const productId = searchParams.get('productId');

  // Form state
  const [customText, setCustomText] = useState("");
  const [customFont, setCustomFont] = useState("arial");
  const [customColor, setCustomColor] = useState("#000000");
  const [customSize, setCustomSize] = useState("medium");
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Fetch product details
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });

  // Redirect if no product ID
  useEffect(() => {
    if (!productId) {
      setLocation('/products');
    }
  }, [productId, setLocation]);

  // Customization options
  const fontOptions = [
    { value: "arial", label: "Arial" },
    { value: "helvetica", label: "Helvetica" },
    { value: "times", label: "Times New Roman" },
    { value: "georgia", label: "Georgia" },
    { value: "verdana", label: "Verdana" },
    { value: "trebuchet", label: "Trebuchet MS" },
    { value: "comic", label: "Comic Sans MS" },
    { value: "impact", label: "Impact" },
  ];

  const sizeOptions = [
    { value: "small", label: "ছোট", price: 0 },
    { value: "medium", label: "মধ্যম", price: 50 },
    { value: "large", label: "বড়", price: 100 },
    { value: "xl", label: "অতিরিক্ত বড়", price: 150 },
  ];

  const additionalOptions = [
    { value: "gift_wrap", label: "গিফট র‍্যাপিং", price: 100 },
    { value: "express_delivery", label: "দ্রুত ডেলিভারি", price: 200 },
    { value: "premium_quality", label: "প্রিমিয়াম কোয়ালিটি", price: 300 },
    { value: "custom_box", label: "কাস্টম বক্স", price: 150 },
  ];

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    const basePrice = parseFloat(product.price);
    const sizePrice = sizeOptions.find(s => s.value === customSize)?.price || 0;
    const optionsPrice = selectedOptions.reduce((total, option) => {
      const opt = additionalOptions.find(o => o.value === option);
      return total + (opt?.price || 0);
    }, 0);
    const imageUploadPrice = uploadedImages.length * 50; // 50 TK per image
    
    return (basePrice + sizePrice + optionsPrice + imageUploadPrice) * quantity;
  };

  // Handle file upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length + uploadedImages.length > 5) {
      toast({
        title: "সীমা অতিক্রম",
        description: "সর্বোচ্চ ৫টি ছবি আপলোড করতে পারবেন",
        variant: "destructive",
      });
      return;
    }
    
    setUploadedImages(prev => [...prev, ...imageFiles]);
  };

  // Remove uploaded image
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle option toggle
  const toggleOption = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  // Handle add to cart with customization
  const handleAddToCart = () => {
    if (!product) return;

    const customizationData = {
      text: customText,
      font: customFont,
      color: customColor,
      size: customSize,
      options: selectedOptions,
      images: uploadedImages.map(file => file.name),
      specialInstructions,
    };

    addItem({
      id: product.id,
      name: `${product.name} (কাস্টমাইজড)`,
      price: calculateTotalPrice() / quantity,
      image_url: product.image_url || "",
      quantity,
      customization: customizationData,
    });

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${quantity}টি কাস্টমাইজড ${product.name}`,
    });

    setLocation('/cart');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">পণ্য পাওয়া যায়নি</h2>
            <Button onClick={() => setLocation('/products')}>
              পণ্য তালিকায় ফিরে যান
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          onClick={() => setLocation(`/product/${product.id}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ফিরে যান</span>
        </Button>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Sparkles className="w-4 h-4 mr-1" />
          কাস্টমাইজেশন
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>পণ্য প্রিভিউ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Product Image */}
                <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden aspect-square">
                  <img
                    src={product.image_url || "/placeholder.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {customText && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center p-4"
                      style={{
                        fontFamily: customFont,
                        color: customColor,
                        fontSize: customSize === 'small' ? '14px' : 
                                 customSize === 'medium' ? '18px' : 
                                 customSize === 'large' ? '24px' : '32px',
                        textAlign: 'center',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      {customText}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {product.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-4">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(calculateTotalPrice())}
                    </span>
                    <Badge variant="outline">
                      মূল দাম: {formatPrice(parseFloat(product.price))}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>আপলোড করা ছবি</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {uploadedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Customization Options */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Text Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Type className="w-5 h-5" />
                <span>টেক্সট কাস্টমাইজেশন</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-text">কাস্টম টেক্সট</Label>
                <Textarea
                  id="custom-text"
                  placeholder="আপনার কাস্টম টেক্সট লিখুন..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="font">ফন্ট</Label>
                  <Select value={customFont} onValueChange={setCustomFont}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">রঙ</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Size Selection */}
          <Card>
            <CardHeader>
              <CardTitle>সাইজ নির্বাচন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {sizeOptions.map(size => (
                  <Button
                    key={size.value}
                    variant={customSize === size.value ? "default" : "outline"}
                    onClick={() => setCustomSize(size.value)}
                    className="flex flex-col items-center p-4 h-auto"
                  >
                    <span className="font-medium">{size.label}</span>
                    {size.price > 0 && (
                      <span className="text-xs text-gray-500">
                        +৳{size.price}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ImageIcon className="w-5 h-5" />
                <span>ছবি আপলোড</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ক্লিক করে ছবি আপলোড করুন
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    সর্বোচ্চ ৫টি ছবি • প্রতিটি ছবির জন্য ৳৫০ অতিরিক্ত
                  </p>
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card>
            <CardHeader>
              <CardTitle>অতিরিক্ত অপশন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {additionalOptions.map(option => (
                  <div key={option.value} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedOptions.includes(option.value)}
                        onCheckedChange={() => toggleOption(option.value)}
                      />
                      <Label className="font-medium">{option.label}</Label>
                    </div>
                    <Badge variant="outline">
                      +৳{option.price}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>বিশেষ নির্দেশনা</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="কোন বিশেষ নির্দেশনা থাকলে লিখুন..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Quantity & Add to Cart */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>পরিমাণ:</Label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </Button>
                    <span className="text-lg font-medium w-12 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">মোট:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(calculateTotalPrice())}
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="w-full"
                  disabled={!customText && uploadedImages.length === 0}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  কার্টে যোগ করুন
                </Button>

                {!customText && uploadedImages.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">
                    কাস্টমাইজেশনের জন্য টেক্সট অথবা ছবি যোগ করুন
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}