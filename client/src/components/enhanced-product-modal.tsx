import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, MessageCircle, X, Plus, Minus, Palette, Expand, Star, Heart, Package, Shield, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface EnhancedProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onCustomize?: (product: Product) => void;
}

export default function EnhancedProductModal({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  onCustomize 
}: EnhancedProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isImageOverlayOpen, setIsImageOverlayOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const { toast } = useToast();

  if (!product) {
    return null;
  }

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedSize("");
      setSelectedColor("");
      setIsFavorite(false);
    }
  }, [product]);

  // Track product view when modal opens
  useEffect(() => {
    if (isOpen && product) {
      trackProductView(product.id, product.name, product.category || "uncategorized");
    }
  }, [isOpen, product]);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি currently স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    // Call the parent's add to cart handler with the product
    onAddToCart(product);

    // Track add to cart event
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    trackAddToCart(product.id, product.name, price * quantity);

    toast({
      title: "কার্টে যোগ করা হয়েছে",
      description: `${product.name} (${quantity}টি) কার্টে যোগ করা হয়েছে`,
    });
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const totalPrice = price * quantity;
    const sizeText = selectedSize ? ` (সাইজ: ${selectedSize})` : '';
    const colorText = selectedColor ? ` (রঙ: ${selectedColor})` : '';
    const message = `আমি ${product.name}${sizeText}${colorText} কিনতে চাই। দাম ${formatPrice(price)} x ${quantity} = ${formatPrice(totalPrice)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleCustomize = () => {
    // Only allow customization for specific product types
    const customizableTypes = ['t-shirt', 'tshirt', 'mug', 'photo canvas', 'canvas'];
    const productName = product.name?.toLowerCase() || '';
    const productCategory = product.category?.toLowerCase() || '';
    
    const isCustomizable = customizableTypes.some(type => 
      productName.includes(type) || productCategory.includes(type)
    );
    
    if (isCustomizable) {
      // Navigate to customize page with product data
      onClose();
      window.location.href = `/customize?productId=${product.id}`;
    } else {
      toast({
        title: "কাস্টমাইজেশন উপলব্ধ নয়",
        description: "এই পণ্যটি কাস্টমাইজ করা যায় না",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "ফেভারিট থেকে সরানো হয়েছে" : "ফেভারিটে যোগ করা হয়েছে",
      description: `${product.name} ${isFavorite ? 'সরানো হয়েছে' : 'যোগ করা হয়েছে'}`,
    });
  };

  const rating = 4.5; // Mock rating
  const reviewCount = Math.floor(Math.random() * 100) + 20; // Mock review count

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full h-[90vh] p-0 overflow-hidden bg-white" data-testid="enhanced-product-modal">
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-4">
                <DialogTitle className="text-2xl font-bold text-gray-800 mb-2 leading-tight">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-gray-600 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating}</span>
                    <span className="text-sm">({reviewCount} রিভিউ)</span>
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    বিভাগ: {product.category}
                  </Badge>
                </DialogDescription>
              </div>
              <Button
                onClick={toggleFavorite}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-red-50"
                data-testid="button-toggle-favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
              {/* Product Image Section */}
              <div className="relative bg-gray-50 p-6 flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-square">
                  <img
                    src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300"
                    loading="lazy"
                    onClick={() => setIsImageOverlayOpen(true)}
                    data-testid="product-image"
                  />
                  
                  {/* Image Expand Overlay */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 flex items-center justify-center cursor-pointer rounded-lg"
                       onClick={() => setIsImageOverlayOpen(true)}>
                    <div className="bg-white/90 p-3 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <Expand className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>

                  {/* Product Badges */}
                  <div className="absolute top-4 left-4 space-y-2">
                    {product.is_featured && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        ফিচার্ড
                      </Badge>
                    )}
                    {product.is_latest && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                        নতুন
                      </Badge>
                    )}
                    {product.is_best_selling && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                        বেস্ট সেলার
                      </Badge>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="absolute top-4 right-4">
                    {product.stock <= 5 && product.stock > 0 && (
                      <Badge className="bg-orange-500 text-white shadow-lg animate-pulse">
                        মাত্র {product.stock}টি বাকি
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge className="bg-red-500 text-white shadow-lg">
                        স্টক নেই
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className="p-6 space-y-6">
                {/* Price Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        ✅ ২০০০ টাকার ওপরে অর্ডারে ফ্রি ডেলিভারি
                      </p>
                    </div>
                    <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-lg px-3 py-1">
                      স্টক: {product.stock}
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <Shield className="w-6 h-6 mx-auto text-green-600 mb-1" />
                      <p className="text-xs text-gray-600">গ্যারান্টি</p>
                    </div>
                    <div className="text-center">
                      <Truck className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                      <p className="text-xs text-gray-600">দ্রুত ডেলিভারি</p>
                    </div>
                    <div className="text-center">
                      <Package className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                      <p className="text-xs text-gray-600">নিরাপদ প্যাকেজিং</p>
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">পরিমাণ:</label>
                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 p-0"
                        data-testid="button-quantity-decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-xl font-semibold w-12 text-center" data-testid="text-quantity">
                        {quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="h-10 w-10 p-0"
                        data-testid="button-quantity-increase"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-bold py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50"
                    data-testid="button-add-to-cart"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleWhatsAppOrder}
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50 font-medium py-3 rounded-lg transition-all duration-300"
                      data-testid="button-whatsapp-order"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp অর্ডার
                    </Button>

                    {onCustomize && (
                      <Button
                        onClick={handleCustomize}
                        variant="outline"
                        className="bg-purple-500 text-white hover:bg-purple-600 border-purple-500 font-medium py-3 rounded-lg transition-all duration-300"
                        data-testid="button-customize"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        কাস্টমাইজ করুন
                      </Button>
                    )}
                  </div>
                </div>

                {/* Product Description */}
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">পণ্যের বিবরণ:</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.description || `${product.name} একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে। বিশেষ ছাড়ে পাওয়া যাচ্ছে।`}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Overlay Modal */}
      {isImageOverlayOpen && (
        <Dialog open={isImageOverlayOpen} onOpenChange={setIsImageOverlayOpen}>
          <DialogContent className="max-w-3xl p-2 bg-black">
            <div className="relative">
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                alt={product.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <Button
                onClick={() => setIsImageOverlayOpen(false)}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-white hover:bg-white/20"
                data-testid="button-close-image-overlay"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}