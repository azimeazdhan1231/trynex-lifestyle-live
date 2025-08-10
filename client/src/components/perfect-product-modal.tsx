import { useState } from "react";
import PerfectModalBase from "./perfect-modal-base";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Palette, 
  Package, 
  Star,
  Truck,
  Shield,
  Plus,
  Minus,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number | string;
  image_url?: string | null;
  description?: string | null;
  category?: string | null;
  stock?: number;
  rating?: number;
  is_featured?: boolean | null;
  is_latest?: boolean | null;
  is_best_selling?: boolean | null;
  created_at?: Date | null;
}

interface PerfectProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onAddToCart: (product: Product) => void;
  onCustomize: (product: Product) => void;
}

export default function PerfectProductModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onCustomize
}: PerfectProductModalProps) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image_url || "");

  const createWhatsAppUrl = () => {
    const phoneNumber = "8801765555593";
    const message = `আসসালামু আলাইকুম! আমি ${product.name} সম্পর্কে জানতে চাই।

পণ্যের তথ্য:
নাম: ${product.name}
দাম: ৳${product.price}
পরিমাণ: ${quantity}

দয়া করে আরও তথ্য দিন।`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${quantity} টি ${product.name} কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ৳${product.price}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "লিংক কপি হয়েছে!",
        description: "পণ্যের লিংক ক্লিপবোর্ডে কপি করা হয়েছে",
      });
    }
  };

  const updateQuantity = (change: number) => {
    setQuantity(prev => Math.max(1, Math.min(prev + change, product.stock || 99)));
  };

  const productPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const totalPrice = productPrice * quantity;

  return (
    <PerfectModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      description={product.description || "পণ্যের বিস্তারিত তথ্য"}
      maxWidth="7xl"
      data-testid="modal-product-details"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Product Images */}
        <div className="space-y-6">
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Package className="w-32 h-32" />
              </div>
            )}
          </div>

          {/* Additional features */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-xs font-medium">ফ্রি ডেলিভারি</div>
              <div className="text-xs text-gray-500">২০০০+ টাকায়</div>
            </Card>
            <Card className="p-4 text-center">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-xs font-medium">গুণগত মান</div>
              <div className="text-xs text-gray-500">নিশ্চয়তা</div>
            </Card>
            <Card className="p-4 text-center">
              <MessageCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-xs font-medium">২৪/৭ সাপোর্ট</div>
              <div className="text-xs text-gray-500">হোয়াটসঅ্যাপে</div>
            </Card>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.category && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {product.category}
                </Badge>
              )}
              {product.stock !== undefined && (
                <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                  {product.stock > 0 ? `স্টকে আছে (${product.stock})` : "স্টক নেই"}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating!) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.rating}/5)</span>
              </div>
            )}

            <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-4">
              ৳{typeof product.price === 'string' ? parseFloat(product.price) : product.price}
              {quantity > 1 && (
                <span className="text-lg text-gray-500 ml-2">× {quantity}</span>
              )}
            </div>

            {quantity > 1 && (
              <div className="text-xl font-semibold text-blue-600 mb-4">
                মোট: ৳{totalPrice}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-lg">পণ্যের বিবরণ</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed mb-4">
                {product.description || `${product.name} একটি উচ্চমানের পণ্য যা বিশেষ যত্নে তৈরি করা হয়েছে। এই পণ্যটি আপনার প্রত্যাশা পূরণ করবে এবং দীর্ঘদিন ব্যবহার করতে পারবেন।`}
              </p>
              
              {/* Product Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">বৈশিষ্ট্য:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• উচ্চমানের উপাদান দিয়ে তৈরি</li>
                    <li>• টেকসই এবং দীর্ঘস্থায়ী</li>
                    <li>• নিরাপদ এবং পরিবেশবান্ধব</li>
                    <li>• সহজ রক্ষণাবেক্ষণ</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-800">সুবিধা:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ১০০% মানি ব্যাক গ্যারান্টি</li>
                    <li>• ৬ মাসের ওয়ারেন্টি</li>
                    <li>• বিনামূল্যে হোম ডেলিভারি</li>
                    <li>• ২৪/৭ কাস্টমার সাপোর্ট</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">পণ্যের তথ্য:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">ব্র্যান্ড:</span>
                <span className="ml-2 text-gray-600">ট্রাইনেক্স লাইফস্টাইল</span>
              </div>
              <div>
                <span className="font-medium">ক্যাটেগরি:</span>
                <span className="ml-2 text-gray-600">{product.category || 'সাধারণ'}</span>
              </div>
              <div>
                <span className="font-medium">স্টক:</span>
                <span className="ml-2 text-gray-600">{product.stock || 0} টি</span>
              </div>
              <div>
                <span className="font-medium">প্রোডাক্ট কোড:</span>
                <span className="ml-2 text-gray-600">#{product.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label className="font-medium">পরিমাণ:</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium bg-gray-50 py-2 rounded">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(1)}
                  disabled={quantity >= (product.stock || 99)}
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                data-testid="button-share-product"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                data-testid="button-wishlist"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="bg-green-600 hover:bg-green-700 text-white py-3"
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                কার্টে যোগ করুন
              </Button>

              <Button
                onClick={() => onCustomize(product)}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50 py-3"
                data-testid="button-customize-product"
              >
                <Palette className="w-5 h-5 mr-2" />
                কাস্টমাইজ করুন
              </Button>
            </div>

            <Button
              onClick={() => window.open(createWhatsAppUrl(), '_blank')}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50 py-3"
              data-testid="button-whatsapp-inquiry"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              হোয়াটসঅ্যাপে জিজ্ঞাসা করুন
            </Button>
          </div>

          {/* Shipping & Return Policy */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg space-y-4">
            <h4 className="font-semibold text-gray-900 text-lg">শিপিং এবং রিটার্ন নীতি:</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-green-600" />
                  ডেলিভারি তথ্য:
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• ঢাকার ভিতরে: ১-২ দিন</li>
                  <li>• ঢাকার বাইরে: ৩-৫ দিন</li>
                  <li>• ২০০০+ টাকায় ফ্রি ডেলিভারি</li>
                  <li>• ক্যাশ অন ডেলিভারি সুবিধা</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-blue-600" />
                  গ্যারান্টি ও সার্ভিস:
                </h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• ৭ দিন রিটার্ন পলিসি</li>
                  <li>• ৬ মাস ওয়ারেন্টি</li>
                  <li>• ১০০% অরিজিনাল প্রোডাক্ট</li>
                  <li>• ২৪/৭ কাস্টমার সাপোর্ট</li>
                </ul>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h5 className="font-medium text-gray-800 mb-2">যোগাযোগ করুন:</h5>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>📞 +৮৮০১৭৬৫৫৫৫৫৯৳</span>
                <span>📧 support@trynexlifestyle.com</span>
                <span>⏰ সকাল ৯টা - রাত ১০টা</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PerfectModalBase>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium text-gray-700 ${className}`}>{children}</label>;
}