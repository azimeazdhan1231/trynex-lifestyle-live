import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Badge, Separator, Card, CardContent, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { 
  X, 
  Palette, 
  Upload, 
  Eye, 
  ShoppingCart, 
  Heart, 
  Star, 
  Zap, 
  Award, 
  Crown, 
  Flame, 
  Gift, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Type,
  Palette as ColorPalette,
  Ruler,
  FileText,
  Camera
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import type { Product } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';

interface PerfectCustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  productType: string;
  pricing: {
    basePrice: number;
    customizationFee: number;
    totalPrice: number;
    savings: number;
  };
}

interface CustomizationOptions {
  text?: string;
  color?: string;
  size?: string;
  material?: string;
  specialInstructions?: string;
  referenceImage?: File | null;
  quantity: number;
}

export default function PerfectCustomizeModal({
  isOpen,
  onClose,
  product,
  productType,
  pricing
}: PerfectCustomizeModalProps) {
  const [customization, setCustomization] = useState<CustomizationOptions>({
    text: '',
    color: '',
    size: '',
    material: '',
    specialInstructions: '',
    referenceImage: null,
    quantity: 1
  });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [selectedTab, setSelectedTab] = useState('customize');

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const isWishlisted = isInWishlist(product.id);

  // Product type specific options
  const getProductOptions = () => {
    switch (productType) {
      case 'clothing':
        return {
          sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
          colors: ['White', 'Black', 'Navy', 'Gray', 'Red', 'Blue', 'Green'],
          materials: ['100% Cotton', 'Polyester Blend', 'Premium Cotton', 'Organic Cotton'],
          features: ['Customizable Text', 'Premium Fabric', 'Multiple Colors', 'Size Options']
        };
      case 'drinkware':
        return {
          sizes: ['12oz', '16oz', '20oz', '24oz', '32oz'],
          colors: ['White', 'Black', 'Stainless Steel', 'Clear', 'Colored'],
          materials: ['Ceramic', 'Stainless Steel', 'Glass', 'Plastic'],
          features: ['Heat Resistant', 'Eco-Friendly', 'Customizable Design', 'Dishwasher Safe']
        };
      case 'artwork':
        return {
          sizes: ['8x10"', '11x14"', '16x20"', '20x24"', '24x36"'],
          colors: ['Full Color', 'Black & White', 'Sepia', 'Vintage'],
          materials: ['Canvas', 'Photo Paper', 'Vinyl', 'Fabric'],
          features: ['High Quality Print', 'Custom Design', 'Multiple Sizes', 'Frame Options']
        };
      default:
        return {
          sizes: ['Standard', 'Large', 'Extra Large'],
          colors: ['Default', 'Custom'],
          materials: ['Standard', 'Premium'],
          features: ['Customizable', 'Quality Material']
        };
    }
  };

  const options = getProductOptions();

  const handleInputChange = (field: keyof CustomizationOptions, value: string | number | File | null) => {
    setCustomization(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return;
      }
      handleInputChange('referenceImage', file);
    }
  };

  const handleAddToCart = useCallback(async () => {
    if (!customization.text && !customization.referenceImage) {
      toast({
        title: "Customization required",
        description: "Please add text or upload a reference image.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);

    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: pricing.totalPrice,
        image_url: product.image_url,
        quantity: customization.quantity,
        customization: {
          ...customization,
          type: productType,
          basePrice: pricing.basePrice,
          customizationFee: pricing.customizationFee
        }
      };

      addToCart(cartItem);

      toast({
        title: "Added to Cart! 🛒",
        description: `${product.name} with customization has been added to your cart.`,
      });

      // Close modal after successful add
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, product, pricing, productType, customization, toast, onClose]);

  const handleToggleWishlist = useCallback(async () => {
    setIsAddingToWishlist(true);

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast({
          title: "Removed from Wishlist",
          description: `${product.name} removed from wishlist.`,
        });
      } else {
        await addToWishlist(product);
        toast({
          title: "Added to Wishlist! ❤️",
          description: `${product.name} added to wishlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  }, [isWishlisted, removeFromWishlist, addToWishlist, product, toast]);

  const getProductIcon = () => {
    switch (productType) {
      case 'clothing':
        return <Crown className="h-6 w-6 text-blue-500" />;
      case 'drinkware':
        return <Flame className="h-6 w-6 text-orange-500" />;
      case 'artwork':
        return <Sparkles className="h-6 w-6 text-purple-500" />;
      default:
        return <Palette className="h-6 w-6 text-primary" />;
    }
  };

  const totalPrice = pricing.totalPrice * customization.quantity;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 border-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            {getProductIcon()}
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 line-clamp-2">
                Customize {product.name}
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create your perfect {productType} design
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Side - Customization Options */}
          <div className="flex-1 p-6 pt-0">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setSelectedTab('customize')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'customize'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Palette className="h-4 w-4 inline mr-2" />
                Customize
              </button>
              <button
                onClick={() => setSelectedTab('preview')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === 'preview'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Preview
              </button>
            </div>

            {selectedTab === 'customize' && (
              <div className="space-y-6">
                {/* Text Customization */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Type className="h-5 w-5 text-blue-500" />
                      <Label className="font-semibold">Text Customization</Label>
                    </div>
                    <Textarea
                      placeholder="Enter your custom text here..."
                      value={customization.text}
                      onChange={(e) => handleInputChange('text', e.target.value)}
                      className="min-h-[80px]"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Add your personal message, name, or custom text
                    </p>
                  </CardContent>
                </Card>

                {/* Color Selection */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ColorPalette className="h-5 w-5 text-green-500" />
                      <Label className="font-semibold">Color Selection</Label>
                    </div>
                    <Select value={customization.color} onValueChange={(value) => handleInputChange('color', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Size Selection */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Ruler className="h-5 w-5 text-purple-500" />
                      <Label className="font-semibold">Size Selection</Label>
                    </div>
                    <Select value={customization.size} onValueChange={(value) => handleInputChange('size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a size" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.sizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Material Selection */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-orange-500" />
                      <Label className="font-semibold">Material Selection</Label>
                    </div>
                    <Select value={customization.material} onValueChange={(value) => handleInputChange('material', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a material" />
                      </SelectTrigger>
                      <SelectContent>
                        {options.materials.map((material) => (
                          <SelectItem key={material} value={material}>
                            {material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Reference Image Upload */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="h-5 w-5 text-pink-500" />
                      <Label className="font-semibold">Reference Image</Label>
                    </div>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="reference-image"
                      />
                      <label
                        htmlFor="reference-image"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Upload reference image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </label>
                    </div>
                    {customization.referenceImage && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          {customization.referenceImage.name}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Special Instructions */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-5 w-5 text-indigo-500" />
                      <Label className="font-semibold">Special Instructions</Label>
                    </div>
                    <Textarea
                      placeholder="Any special requests or instructions..."
                      value={customization.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </CardContent>
                </Card>

                {/* Quantity */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <Label className="font-semibold">Quantity</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('quantity', Math.max(1, customization.quantity - 1))}
                        disabled={customization.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="text-lg font-semibold min-w-[3rem] text-center">
                        {customization.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('quantity', customization.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTab === 'preview' && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Preview Coming Soon</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Live preview of your customization will be available here
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Side - Product Info & Actions */}
          <div className="w-full lg:w-80 p-6 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
            {/* Product Image */}
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
              <img
                src={product.image_url || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  (4.8 • 127 reviews)
                </span>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Pricing Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>{formatPrice(pricing.basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customization:</span>
                    <span>{formatPrice(pricing.customizationFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total per item:</span>
                    <span>{formatPrice(pricing.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total ({customization.quantity}):</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Features</h4>
                <div className="space-y-2">
                  {options.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                size="lg"
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Adding to Cart...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart - {formatPrice(totalPrice)}
                  </div>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleToggleWishlist}
                disabled={isAddingToWishlist}
                className="w-full"
                size="lg"
              >
                {isAddingToWishlist ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                    {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </div>
                )}
              </Button>
            </div>

            {/* Guarantee */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-sm">Quality Guarantee</span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                100% satisfaction guaranteed or your money back
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 