import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, ShoppingCart, Zap, Heart, Share2, Truck, Shield, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onCustomize: (product: Product) => void;
}

export default function QuickViewModal({ product, isOpen, onClose, onCustomize }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  // Mock additional images - in real app, these would come from product data
  const images = [
    product.image_url || "/placeholder.jpg",
    product.image_url || "/placeholder.jpg", // Would be different angles
    product.image_url || "/placeholder.jpg"
  ];

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cartItems.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cartItems.push({ ...product, quantity });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    onClose();
  };

  const handleCustomize = () => {
    onClose();
    onCustomize(product);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">পণ্যের বিস্তারিত</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-3">
                {product.is_featured && (
                  <Badge className="bg-red-500">ফিচার্ড</Badge>
                )}
                {product.is_latest && (
                  <Badge className="bg-green-500">নতুন</Badge>
                )}
                {product.is_best_selling && (
                  <Badge className="bg-blue-500">জনপ্রিয়</Badge>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8) 156 রিভিউ</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(parseFloat(product.price.toString()) * 1.2)}
                </span>
                <Badge variant="destructive" className="text-xs">20% ছাড়</Badge>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">বিবরণ</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="font-semibold mb-3">বৈশিষ্ট্য</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ক্যাটেগরি:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">স্টক:</span>
                  <span className="font-medium">{product.stock} টি</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ম্যাটেরিয়াল:</span>
                  <span className="font-medium">১০০% কটন</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ওজন:</span>
                  <span className="font-medium">200 গ্রাম</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">পরিমাণ</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Features */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Truck className="w-6 h-6 text-primary mb-2" />
                    <span className="text-xs text-gray-600">ফ্রি ডেলিভারি</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Shield className="w-6 h-6 text-primary mb-2" />
                    <span className="text-xs text-gray-600">গুণগত মান</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <RefreshCw className="w-6 h-6 text-primary mb-2" />
                    <span className="text-xs text-gray-600">রিটার্ন পলিসি</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleCustomize}
                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                size="lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                কাস্টমাইজ ও অর্ডার করুন
              </Button>
              
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                কার্টে যোগ করুন
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}