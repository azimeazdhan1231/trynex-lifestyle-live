
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, MessageCircle, Settings, X, Star, Truck, Shield, RefreshCw } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
}

const formatPrice = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `৳${numPrice.toFixed(0)}`;
};

const createWhatsAppUrl = (message: string): string => {
  const phoneNumber = "8801700000000"; // Replace with actual WhatsApp number
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

export default function ProductModalFixed({ product, isOpen, onClose, onAddToCart, onCustomize }: ProductModalProps) {
  const { toast } = useToast();
  const [imageLoading, setImageLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoading(true);
  }, [product?.id]);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product);
    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} আপনার কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleCustomize = () => {
    onClose();
    onCustomize(product);
  };

  const handleWhatsAppOrder = () => {
    const message = `আমি এই পণ্যটি অর্ডার করতে চাই:\n\n📦 পণ্য: ${product.name}\n💰 দাম: ${formatPrice(product.price)}\n\nদয়া করে অর্ডার কনফার্ম করুন।`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  // Get product images (main + additional)
  const productImages = [product.image_url];
  if (product.additional_images) {
    try {
      const additionalImages = typeof product.additional_images === 'string' 
        ? JSON.parse(product.additional_images) 
        : product.additional_images;
      if (Array.isArray(additionalImages)) {
        productImages.push(...additionalImages);
      }
    } catch (e) {
      console.error('Error parsing additional images:', e);
    }
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    setImageLoading(true);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    setImageLoading(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-override max-w-4xl w-[95vw] max-h-[95vh] p-0 flex flex-col [&>button]:hidden overflow-hidden">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-white shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              {product.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              {product.is_featured && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  ফিচার্ড
                </Badge>
              )}
              {product.is_latest && (
                <Badge variant="outline" className="text-xs">নতুন</Badge>
              )}
              {product.is_best_selling && (
                <Badge variant="default" className="text-xs">বেস্ট সেলার</Badge>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                )}
                <img
                  src={productImages[currentImageIndex] || '/placeholder.jpg'}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => {
                    setImageLoading(false);
                    (e.target as HTMLImageElement).src = '/placeholder.jpg';
                  }}
                />
                
                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-opacity"
                    >
                      ›
                    </button>
                    
                    {/* Image Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {productImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setImageLoading(true);
                          }}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setImageLoading(true);
                      }}
                      className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Price Section */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 rounded-xl">
                <div className="text-center">
                  <span className="text-sm text-gray-600">দাম</span>
                  <div className="text-3xl sm:text-4xl font-bold text-green-600 mt-1">
                    {formatPrice(product.price)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">ফ্রি ডেলিভারি সহ</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">বিবরণ</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description || "এই পণ্যটি উচ্চ মানের উপাদান দিয়ে তৈরি এবং দীর্ঘস্থায়ী। আমাদের এই পণ্যটি আপনার প্রয়োজন মেটাতে সক্ষম।"}
                  </p>
                </div>

                {/* Additional Product Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">ক্যাটেগরি:</span>
                    <Badge variant="outline" className="text-xs">
                      {product.category || "সাধারণ"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">স্টক:</span>
                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.stock > 0 ? `${product.stock} টি পাওয়া যাচ্ছে` : 'স্টক নেই'}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>ফ্রি হোম ডেলিভারি</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>৭ দিনের রিটার্ন গ্যারান্টি</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                    <span>২৪/৭ কাস্টমার সাপোর্ট</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="border-t bg-white p-4 sm:p-6 shrink-0">
          <div className="flex flex-col gap-3">
            {/* Primary Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                className="bg-green-600 hover:bg-green-700 text-white h-12"
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                কার্টে যোগ করুন
              </Button>
              <Button
                onClick={handleCustomize}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 h-12"
              >
                <Settings className="w-4 h-4 mr-2" />
                কাস্টমাইজ করুন
              </Button>
            </div>

            {/* Secondary Action */}
            <Button
              onClick={handleWhatsAppOrder}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 h-12 w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp এ অর্ডার করুন
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
