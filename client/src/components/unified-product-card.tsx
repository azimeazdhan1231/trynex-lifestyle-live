
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, MessageCircle, Palette, Plus, Minus, Heart, Share2 } from "lucide-react";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import ProductModal from "@/components/product-modal";
import CustomizeModal from "@/components/customize-modal";
import type { Product } from "@shared/schema";

interface UnifiedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  variant?: 'compact' | 'detailed' | 'mini';
  showCustomizeButton?: boolean;
}

export default function UnifiedProductCard({ 
  product, 
  onAddToCart, 
  variant = 'detailed', 
  showCustomizeButton = true 
}: UnifiedProductCardProps) {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const handleViewDetails = () => {
    console.log("👁️ UnifiedProductCard: View details clicked for:", product.name);
    setIsProductModalOpen(true);
    trackProductView(product.id, product.name, product.category || 'uncategorized');
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

    // Add multiple quantities if needed
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }

    trackAddToCart(product.id, product.name, Number(product.price) * quantity);

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${product.name} (${quantity}টি) কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleWhatsAppOrder = () => {
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(product.price)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleCustomize = () => {
    setIsCustomizeModalOpen(true);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/product?id=${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `${product.name} - ${formatPrice(product.price)}`,
          url: shareUrl
        });
      } catch (err) {
        // Share was cancelled or failed
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "লিংক কপি হয়েছে",
        description: "পণ্যের লিংক ক্লিপবোর্ডে কপি হয়েছে",
      });
    }
  };

  const isCompact = variant === 'compact' || variant === 'mini';
  const isMini = variant === 'mini';

  return (
    <>
      <Card className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border border-gray-200 ${
        isMini ? 'h-auto' : 'h-full'
      }`}>
        <div className={`relative overflow-hidden ${isMini ? 'aspect-square' : 'aspect-[4/3]'}`}>
          {/* Product Image */}
          <img
            src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">ফিচার্ড</Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-blue-500 text-white text-xs px-2 py-1">নতুন</Badge>
            )}
            {product.is_best_selling && (
              <Badge className="bg-green-500 text-white text-xs px-2 py-1">বেস্ট সেলার</Badge>
            )}
          </div>

          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-xs">
              {product.stock > 0 ? `স্টক: ${product.stock}` : "স্টক নেই"}
            </Badge>
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleViewDetails}
                className="bg-white text-gray-800 hover:bg-gray-100"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`bg-white hover:bg-gray-100 ${isFavorite ? 'text-red-500' : 'text-gray-800'}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleShare}
                className="bg-white text-gray-800 hover:bg-gray-100"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className={`p-${isMini ? '3' : '4'} flex flex-col flex-grow`}>
          {/* Product Info */}
          <div className="flex-grow">
            <h3 className={`font-semibold text-gray-800 mb-2 line-clamp-2 ${
              isMini ? 'text-sm' : 'text-base'
            }`}>
              {product.name}
            </h3>

            <div className="flex items-center justify-between mb-3">
              <span className={`font-bold text-primary ${isMini ? 'text-base' : 'text-lg'}`}>
                {formatPrice(product.price)}
              </span>
              {product.category && !isMini && (
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              )}
            </div>

            {/* Quantity Selector for Detailed View */}
            {!isCompact && product.stock > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">পরিমাণ:</span>
                <div className="flex items-center border rounded">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="px-2 text-sm font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mt-auto">
            {isMini ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  size="sm"
                  className="text-xs"
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {product.stock === 0 ? "স্টক নেই" : "কার্ট"}
                </Button>
                <Button
                  onClick={handleViewDetails}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  দেখুন
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="w-full"
                  size={isCompact ? "sm" : "default"}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
                </Button>
                
                <div className={`grid ${isCompact ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  <Button
                    onClick={handleViewDetails}
                    variant="outline"
                    size={isCompact ? "sm" : "default"}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {isCompact ? "দেখুন" : "বিস্তারিত"}
                  </Button>
                  
                  <Button
                    onClick={handleWhatsAppOrder}
                    variant="outline"
                    size={isCompact ? "sm" : "default"}
                    className="border-green-500 text-green-600 hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {isCompact ? "WhatsApp" : "অর্ডার"}
                  </Button>

                  {showCustomizeButton && !isCompact && (
                    <Button
                      onClick={handleCustomize}
                      variant="outline"
                      size="default"
                      className="border-purple-500 text-purple-600 hover:bg-purple-50"
                    >
                      <Palette className="w-4 h-4 mr-1" />
                      কাস্টমাইজ
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Details Modal */}
      <ProductModal
        product={product}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={onAddToCart}
        onCustomize={showCustomizeButton ? handleCustomize : undefined}
      />

      {/* Customize Modal */}
      {showCustomizeButton && (
        <CustomizeModal
          isOpen={isCustomizeModalOpen}
          onClose={() => setIsCustomizeModalOpen(false)}
          product={product}
          onAddToCart={async (product, customization) => {
            // Add customized product to cart
            onAddToCart({
              ...product,
              customization: customization
            });

            toast({
              title: "কাস্টমাইজড পণ্য যোগ করা হয়েছে!",
              description: `${product.name} আপনার পছন্দমতো কাস্টমাইজ করে কার্টে যোগ করা হয়েছে`,
            });

            setIsCustomizeModalOpen(false);
          }}
        />
      )}
    </>
  );
}
