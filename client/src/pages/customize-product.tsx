
import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { 
  Upload, 
  X, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Camera, 
  Palette, 
  Ruler,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Star,
  Heart,
  Zap,
  Package,
  Home,
  Search,
  User,
  Menu,
  Coffee,
  Shirt,
  ImageIcon
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";

// Enhanced header component
const CustomizePageHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Trynex</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                হোম
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="ghost" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                পণ্যসমূহ
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                যোগাযোগ
              </Button>
            </Link>
          </nav>

          {/* Mobile menu */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

// Available customization options based on product type
const PRODUCT_TYPES = {
  'tshirt': {
    name: 'টি-শার্ট',
    icon: Shirt,
    sizes: [
      { value: 'XS', label: 'XS', price: 0 },
      { value: 'S', label: 'S (ছোট)', price: 0 },
      { value: 'M', label: 'M (মাঝারি)', price: 0 },
      { value: 'L', label: 'L (বড়)', price: 0 },
      { value: 'XL', label: 'XL (অতিরিক্ত বড়)', price: 50 },
      { value: 'XXL', label: 'XXL', price: 100 }
    ],
    colors: [
      { value: 'white', label: 'সাদা', hex: '#ffffff' },
      { value: 'black', label: 'কালো', hex: '#000000' },
      { value: 'red', label: 'লাল', hex: '#ef4444' },
      { value: 'blue', label: 'নীল', hex: '#3b82f6' },
      { value: 'green', label: 'সবুজ', hex: '#10b981' },
      { value: 'yellow', label: 'হলুদ', hex: '#f59e0b' },
      { value: 'purple', label: 'বেগুনি', hex: '#8b5cf6' },
      { value: 'pink', label: 'গোলাপী', hex: '#ec4899' }
    ],
    printAreas: [
      { value: 'front', label: 'সামনে', price: 0 },
      { value: 'back', label: 'পিছনে', price: 50 },
      { value: 'both', label: 'উভয় দিকে', price: 150 },
      { value: 'sleeve', label: 'হাতায়', price: 100 }
    ]
  },
  'mug': {
    name: 'মগ',
    icon: Coffee,
    sizes: [
      { value: 'standard', label: 'স্ট্যান্ডার্ড (11oz)', price: 0 },
      { value: 'large', label: 'বড় (15oz)', price: 50 }
    ],
    colors: [
      { value: 'white', label: 'সাদা', hex: '#ffffff' },
      { value: 'black', label: 'কালো', hex: '#000000' },
      { value: 'red', label: 'লাল', hex: '#ef4444' },
      { value: 'blue', label: 'নীল', hex: '#3b82f6' },
      { value: 'green', label: 'সবুজ', hex: '#10b981' }
    ],
    printAreas: [
      { value: 'front', label: 'সামনে', price: 0 },
      { value: 'both_sides', label: 'উভয় পাশে', price: 100 }
    ]
  },
  'canvas': {
    name: 'ফটো ক্যানভাস',
    icon: ImageIcon,
    sizes: [
      { value: '8x10', label: '8"×10"', price: 0 },
      { value: '11x14', label: '11"×14"', price: 200 },
      { value: '16x20', label: '16"×20"', price: 400 },
      { value: '20x24', label: '20"×24"', price: 600 }
    ],
    colors: [
      { value: 'glossy', label: 'গ্লসি ফিনিশ', hex: '#ffffff' },
      { value: 'matte', label: 'ম্যাট ফিনিশ', hex: '#f5f5f5' }
    ],
    printAreas: [
      { value: 'full', label: 'সম্পূর্ণ ক্যানভাস', price: 0 }
    ]
  }
};

// Function to detect product type from name
const detectProductType = (productName: string): keyof typeof PRODUCT_TYPES => {
  const name = productName.toLowerCase();
  
  if (name.includes('t-shirt') || name.includes('tshirt') || name.includes('টি-শার্ট') || name.includes('shirt')) {
    return 'tshirt';
  }
  if (name.includes('mug') || name.includes('মগ') || name.includes('cup')) {
    return 'mug';
  }
  if (name.includes('canvas') || name.includes('ক্যানভাস') || name.includes('photo') || name.includes('ছবি')) {
    return 'canvas';
  }
  
  return 'tshirt'; // Default to t-shirt
};

export default function CustomizeProduct() {
  const [match, params] = useRoute('/customize/:id');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  
  // Get productId from URL params or query params
  const urlParams = new URLSearchParams(window.location.search);
  const productId = params?.id || urlParams.get('productId');
  
  console.log('Customize Product - productId:', productId);
  console.log('URL params:', Object.fromEntries(urlParams.entries()));
  console.log('Route params:', params);

  // Form states
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPrintArea, setSelectedPrintArea] = useState('');
  const [customText, setCustomText] = useState('');
  const [customImages, setCustomImages] = useState<any[]>([]);
  const [instructions, setInstructions] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Fetch product details
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      if (!productId) throw new Error('No product ID provided');
      
      console.log('Fetching product with ID:', productId);
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error(`Product not found: ${response.status}`);
      }
      const data = await response.json();
      console.log('Product data received:', data);
      return data;
    },
    enabled: !!productId
  });

  // Detect product type and get customization options
  const productType = product ? detectProductType(product.name) : 'tshirt';
  const customizationOptions = PRODUCT_TYPES[productType];

  // Set default selections when product loads
  useEffect(() => {
    if (product && customizationOptions) {
      if (!selectedSize && customizationOptions.sizes.length > 0) {
        setSelectedSize(customizationOptions.sizes[0].value);
      }
      if (!selectedColor && customizationOptions.colors.length > 0) {
        setSelectedColor(customizationOptions.colors[0].value);
      }
      if (!selectedPrintArea && customizationOptions.printAreas.length > 0) {
        setSelectedPrintArea(customizationOptions.printAreas[0].value);
      }
    }
  }, [product, customizationOptions]);

  const calculateCustomizationPrice = () => {
    let additionalPrice = 0;
    
    // Size-based pricing
    const sizeOption = customizationOptions.sizes.find(s => s.value === selectedSize);
    if (sizeOption) additionalPrice += sizeOption.price;
    
    // Print area pricing
    const printAreaOption = customizationOptions.printAreas.find(p => p.value === selectedPrintArea);
    if (printAreaOption) additionalPrice += printAreaOption.price;
    
    // Custom text pricing
    if (customText.trim()) additionalPrice += 150;
    
    // Custom images pricing
    if (customImages.length > 0) additionalPrice += customImages.length * 100;
    
    return additionalPrice;
  };

  const calculateTotal = () => {
    if (!product) return 0;
    const basePrice = Number(product.price) || 0;
    const customPrice = calculateCustomizationPrice();
    return (basePrice + customPrice) * quantity;
  };

  // File upload handler with comprehensive validation
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB per file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (customImages.length + files.length > maxFiles) {
      toast({
        title: "ফাইল সীমা অতিক্রম",
        description: `সর্বোচ্চ ${maxFiles} টি ছবি আপলোড করা যাবে`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "অসমর্থিত ফাইল",
          description: "শুধুমাত্র JPG, PNG, GIF এবং WebP ছবি সমর্থিত",
          variant: "destructive"
        });
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast({
          title: "ফাইল অত্যধিক বড়",
          description: "ফাইলের সাইজ ১০MB এর কম হতে হবে",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target?.result as string,
          uploadedAt: new Date().toISOString()
        };

        setCustomImages(prev => [...prev, newImage]);
        setIsUploading(false);

        toast({
          title: "ছবি সফলভাবে আপলোড হয়েছে",
          description: `${file.name} আপলোড সম্পন্ন`,
        });
      };

      reader.onerror = () => {
        toast({
          title: "আপলোড ব্যর্থ",
          description: "ছবি আপলোড করতে সমস্যা হয়েছে",
          variant: "destructive"
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId: number) => {
    setCustomImages(prev => prev.filter(img => img.id !== imageId));
    toast({
      title: "ছবি সরানো হয়েছে",
      description: "ছবিটি সফলভাবে সরিয়ে দেওয়া হয়েছে"
    });
  };

  // Custom order mutation
  const customOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/custom-orders", orderData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-orders"] });
      toast({
        title: "অর্ডার সফল! 🎉",
        description: "আপনার কাস্টম অর্ডারটি সফলভাবে প্রেরণ করা হয়েছে",
      });

      // Reset form
      setCustomImages([]);
      setQuantity(1);
      setSelectedSize(customizationOptions.sizes[0]?.value || '');
      setSelectedColor(customizationOptions.colors[0]?.value || '');
      setSelectedPrintArea(customizationOptions.printAreas[0]?.value || '');
      setCustomText('');
      setInstructions('');
      setCustomerInfo({ name: '', phone: '', email: '', address: '' });
    },
    onError: (error) => {
      toast({
        title: "অর্ডার ব্যর্থ",
        description: "অর্ডার প্রেরণে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।",
        variant: "destructive"
      });
    }
  });

  const handleAddToCart = () => {
    // Validation
    if (!selectedSize) {
      toast({ title: "সাইজ নির্বাচন করুন", description: "অনুগ্রহ করে একটি সাইজ বেছে নিন", variant: "destructive" });
      return;
    }

    if (!selectedColor) {
      toast({ title: "রঙ নির্বাচন করুন", description: "অনুগ্রহ করে একটি রঙ বেছে নিন", variant: "destructive" });
      return;
    }

    const customizationData = {
      productType,
      size: selectedSize,
      color: selectedColor,
      printArea: selectedPrintArea,
      customText: customText.trim(),
      customImages: customImages,
      instructions: instructions.trim(),
      additionalPrice: calculateCustomizationPrice()
    };

    addToCart({
      ...product,
      price: product.price + calculateCustomizationPrice(),
      customization: customizationData
    }, quantity);

    toast({
      title: "কার্টে যোগ হয়েছে! 🛒",
      description: "কাস্টমাইজড পণ্যটি কার্টে যোগ করা হয়েছে",
    });
  };

  const handlePlaceOrder = () => {
    // Validation
    if (!customerInfo.name.trim()) {
      toast({ title: "নাম প্রয়োজন", description: "অনুগ্রহ করে আপনার নাম লিখুন", variant: "destructive" });
      return;
    }

    if (!customerInfo.phone.trim()) {
      toast({ title: "ফোন নম্বর প্রয়োজন", description: "অনুগ্রহ করে ফোন নম্বর লিখুন", variant: "destructive" });
      return;
    }

    if (!customerInfo.address.trim()) {
      toast({ title: "ঠিকানা প্রয়োজন", description: "অনুগ্রহ করে ঠিকানা লিখুন", variant: "destructive" });
      return;
    }

    if (!selectedSize) {
      toast({ title: "সাইজ নির্বাচন করুন", description: "অনুগ্রহ করে একটি সাইজ বেছে নিন", variant: "destructive" });
      return;
    }

    if (!selectedColor) {
      toast({ title: "রঙ নির্বাচন করুন", description: "অনুগ্রহ করে একটি রঙ বেছে নিন", variant: "destructive" });
      return;
    }

    const orderData = {
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productType,
      quantity,
      selectedSize,
      selectedColor,
      selectedPrintArea,
      customText: customText.trim(),
      customImages,
      instructions: instructions.trim(),
      customizationPrice: calculateCustomizationPrice(),
      totalPrice: calculateTotal(),
      customerName: customerInfo.name,
      phone: customerInfo.phone,
      email: customerInfo.email,
      address: customerInfo.address,
      hasCustomImages: customImages.length > 0,
      imageCount: customImages.length
    };

    customOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return (
      <>
        <CustomizePageHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">পণ্যের তথ্য লোড হচ্ছে...</p>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <CustomizePageHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">পণ্য পাওয়া যায়নি</h2>
            <p className="text-gray-600 mb-4">এই পণ্যটি আর উপলব্ধ নেই বা সরানো হয়েছে</p>
            <Link href="/products">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                পণ্য পাতায় ফিরে যান
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const ProductTypeIcon = customizationOptions.icon;

  return (
    <>
      <CustomizePageHeader />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/products">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                পণ্য তালিকায় ফিরে যান
              </Button>
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <ProductTypeIcon className="w-8 h-8 text-yellow-500" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{customizationOptions.name} কাস্টমাইজ করুন</h1>
                  <p className="text-gray-600">আপনার পছন্দ অনুযায়ী ডিজাইন করুন</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  ১০০% কাস্টমাইজেবল
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                  <Heart className="w-4 h-4 mr-1" />
                  প্রিমিয়াম কোয়ালিটি
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  দ্রুত ডেলিভারি
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product & Customization */}
            <div className="space-y-6">
              {/* Product Information */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <ProductTypeIcon className="w-3 h-3" />
                      {customizationOptions.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ProductTypeIcon className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                      <Badge variant="secondary">স্টক: {product.stock}</Badge>
                    </div>
                    {product.description && (
                      <p className="text-gray-600">{product.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Size Selection */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="w-5 h-5" />
                    সাইজ নির্বাচন করুন *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {customizationOptions.sizes.map((size) => (
                      <Button
                        key={size.value}
                        variant={selectedSize === size.value ? "default" : "outline"}
                        className={`h-12 text-center ${selectedSize === size.value ? 'bg-blue-600 text-white' : ''}`}
                        onClick={() => setSelectedSize(size.value)}
                      >
                        <div>
                          <div className="text-sm font-medium">{size.label}</div>
                          {size.price > 0 && (
                            <div className="text-xs">+৳{size.price}</div>
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      নির্বাচিত সাইজ: {customizationOptions.sizes.find(s => s.value === selectedSize)?.label}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Color Selection */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    রঙ/ফিনিশ নির্বাচন করুন *
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {customizationOptions.colors.map((color) => (
                      <Button
                        key={color.value}
                        variant="outline"
                        className={`h-16 relative ${selectedColor === color.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                        onClick={() => setSelectedColor(color.value)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-xs text-center">{color.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                  {selectedColor && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      নির্বাচিত: {customizationOptions.colors.find(c => c.value === selectedColor)?.label}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Print Area Selection */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>প্রিন্ট এরিয়া নির্বাচন</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedPrintArea} onValueChange={setSelectedPrintArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="প্রিন্ট এরিয়া নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {customizationOptions.printAreas.map((area) => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
                          {area.price > 0 && ` (+৳${area.price})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Custom Text */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>কাস্টম টেক্সট (+১৫০ টাকা)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="আপনার পছন্দের টেক্সট লিখুন (যেমন: নাম, বার্তা)"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      rows={3}
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500">
                      সর্বোচ্চ ১০০ অক্ষর। প্রিন্ট/এমব্রয়ডারি করা হবে। ({customText.length}/100)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Image Upload & Order Form */}
            <div className="space-y-6">
              {/* Image Upload */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    আপনার ডিজাইন আপলোড করুন (+১০০ টাকা প্রতি ছবি)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <input
                        id="image-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={isUploading}
                      />
                      
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-gray-600">আপলোড হচ্ছে...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="w-12 h-12 text-gray-400" />
                          <div>
                            <p className="text-lg font-semibold text-gray-700">ছবি আপলোড করুন</p>
                            <p className="text-sm text-gray-500">JPG, PNG, GIF, WebP (সর্বোচ্চ ১০MB)</p>
                            <p className="text-xs text-blue-600 mt-1">সর্বোচ্চ ৫টি ছবি</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Uploaded Images */}
                    {customImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {customImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img 
                                src={image.dataUrl} 
                                alt={image.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(image.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <p className="text-xs text-gray-600 mt-1 truncate">{image.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Special Instructions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>বিশেষ নির্দেশনা (ঐচ্ছিক)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="আপনার ডিজাইন সম্পর্কে কোন বিশেষ তথ্য বা নির্দেশনা থাকলে এখানে লিখুন..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Advance Payment Information */}
              <Card className="shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Zap className="w-5 h-5" />
                    অগ্রিম পেমেন্ট তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-orange-800">
                  <div className="text-center p-4 bg-white/50 rounded-lg">
                    <p className="text-lg font-bold">১০০ টাকা অগ্রিম</p>
                    <p className="text-sm">bKash/Nagad: 01747292277</p>
                    <p className="text-xs mt-1">পেমেন্ট করার পর অর্ডার করুন</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quantity & Customer Info */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>অর্ডার তথ্য</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Quantity */}
                  <div>
                    <Label htmlFor="quantity">পরিমাণ</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">নাম *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">ফোন নম্বর *</Label>
                      <Input
                        id="phone"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">ইমেইল (ঐচ্ছিক)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">সম্পূর্ণ ঠিকানা *</Label>
                      <Textarea
                        id="address"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="বাসা/রোড নম্বর, এলাকা, জেলা"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">অর্ডার সারসংক্ষেপ</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>পণ্যের দাম:</span>
                        <span>{formatPrice(product.price)}</span>
                      </div>
                      {calculateCustomizationPrice() > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <span>কাস্টমাইজেশন চার্জ:</span>
                          <span>+{formatPrice(calculateCustomizationPrice())}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>পরিমাণ:</span>
                        <span>{quantity} টি</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>মোট:</span>
                        <span className="text-green-600">{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg"
                      onClick={handleAddToCart}
                      disabled={isUploading}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      কার্টে যোগ করুন
                    </Button>

                    <Button
                      className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold text-lg"
                      onClick={handlePlaceOrder}
                      disabled={customOrderMutation.isPending || isUploading}
                    >
                      {customOrderMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          অর্ডার প্রক্রিয়াকরণ...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          কাস্টম অর্ডার করুন
                        </div>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    * চিহ্নিত ক্ষেত্রগুলো পূরণ করা বাধ্যতামূলক
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
