import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Badge } from '@/components/ui';
import { 
  X, 
  Palette, 
  Type, 
  Image as ImageIcon, 
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  tags: string[];
  customizationOptions: {
    sizes: string[];
    colors: string[];
    materials: string[];
  };
}

interface PerfectCustomizeModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export function PerfectCustomizeModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: PerfectCustomizeModalProps) {
  const [selectedSize, setSelectedSize] = React.useState(product.customizationOptions.sizes[0] || '');
  const [selectedColor, setSelectedColor] = React.useState(product.customizationOptions.colors[0] || '');
  const [selectedMaterial, setSelectedMaterial] = React.useState(product.customizationOptions.materials[0] || '');
  const [customText, setCustomText] = React.useState('');
  const [customImage, setCustomImage] = React.useState<File | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  const basePrice = product.price;
  const customizationFee = 5.99;
  const totalPrice = (basePrice + customizationFee) * quantity;

  const handleAddToCart = () => {
    const customizedProduct = {
      ...product,
      customization: {
        size: selectedSize,
        color: selectedColor,
        material: selectedMaterial,
        customText,
        customImage: customImage?.name,
        customizationFee
      },
      quantity,
      totalPrice
    };
    
    onAddToCart(customizedProduct);
    onClose();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCustomImage(file);
    }
  };

  const features = [
    { icon: Truck, text: 'Free Shipping' },
    { icon: Shield, text: 'Quality Guarantee' },
    { icon: Star, text: 'Premium Materials' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-blue-600" />
            Customize {product.name}
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Image & Info */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-80 object-cover rounded-lg"
              />
              <div className="absolute top-3 left-3">
                <Badge className="bg-blue-600 text-white">
                  {product.category}
                </Badge>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600 dark:text-gray-300">{product.description}</p>
              
              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-600">
                  ${basePrice.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-gray-500 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="flex items-center gap-4 pt-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <feature.icon className="w-4 h-4 text-green-500" />
                    {feature.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Customization Options */}
          <div className="space-y-6">
            {/* Size Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Size</Label>
              <div className="grid grid-cols-2 gap-2">
                {product.customizationOptions.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 text-center rounded-lg border-2 transition-all ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Color</Label>
              <div className="grid grid-cols-2 gap-2">
                {product.customizationOptions.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`p-3 text-center rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Material Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Material</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {product.customizationOptions.materials.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Text */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Type className="w-4 h-4" />
                Custom Text
              </Label>
              <Textarea
                placeholder="Enter your custom text here..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Custom Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Custom Image
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="custom-image-upload"
                />
                <label
                  htmlFor="custom-image-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {customImage ? customImage.name : 'Click to upload image'}
                  </span>
                </label>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quantity</Label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span>${basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Customization Fee:</span>
                <span>${customizationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>× {quantity}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="px-6"
                size="lg"
              >
                <Heart className="w-5 h-5 mr-2" />
                Wishlist
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 