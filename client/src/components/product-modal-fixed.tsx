import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MessageCircle, X, Plus, Minus, Palette, Expand } from "lucide-react";
import { useState, useEffect } from "react";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onCustomize?: (product: Product) => void;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart, onCustomize }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isImageOverlayOpen, setIsImageOverlayOpen] = useState(false);
  const { toast } = useToast();

  // Debug logging
  console.log("🔍 ProductModal: Received props:", { product: product?.name, isOpen });

  if (!product) {
    console.log("❌ ProductModal: No product provided, returning null");
    return null;
  }

  console.log("✅ ProductModal: Rendering with product:", product.name, "isOpen:", isOpen);
  console.log("✅ ProductModal: Product details:", product);

  // Track product view when modal opens
  useEffect(() => {
    if (isOpen && product) {
      console.log("📈 Tracking product view:", product.name);
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

    // Create cart item with proper structure
    const cartItem = {
      id: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image_url: product.image_url,
      image: product.image_url,
      quantity: quantity
    };

    onAddToCart(cartItem);

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
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(price)} x ${quantity} = ${formatPrice(totalPrice)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-override p-3 sm:p-4 md:p-6 overflow-y-auto" aria-describedby="product-description">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-800 pr-12">
            {product.name} - পণ্যের বিস্তারিত
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {product.name} এর সম্পূর্ণ তথ্য, দাম ৳{formatPrice(Number(product.price))}, স্টক {product.stock}টি। পণ্যটি কার্টে যোগ করুন বা কাস্টমাইজ করুন।
          </DialogDescription>
        </DialogHeader>
        <div className="modal-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 min-h-[300px] sm:min-h-[400px]">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-50 cursor-pointer group">
              <img
                src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onClick={() => setIsImageOverlayOpen(true)}
              />
              {/* Expand Icon Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Expand className="w-5 h-5 text-gray-700" />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl md:text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
                  <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                    স্টক: {product.stock}
                  </Badge>
                </div>

                <p className="text-gray-600 mb-4">
                  বিভাগ: <span className="font-medium">{product.category}</span>
                </p>
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
                      className="w-10 h-10 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-lg font-semibold min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="w-10 h-10 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    সর্বোচ্চ {product.stock}টি উপলব্ধ
                  </p>
                </div>
              )}

              {/* Total Price */}
              {quantity > 1 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">মোট দাম:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(parseFloat(product.price.toString()) * quantity)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="modal-buttons pt-6">
                {/* First Row - Add to Cart and WhatsApp Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleAddToCart}
                    variant="outline"
                    className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                    size="lg"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    কার্টে যোগ করুন
                  </Button>
                  <Button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                    size="lg"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp অর্ডার
                  </Button>
                </div>

                {/* Second Row - Customize Button */}
                <div className="w-full">
                  <Button
                    onClick={() => {
                      onClose();
                      if (onCustomize) onCustomize(product);
                    }}
                    className="w-full bg-purple-500 text-white hover:bg-purple-600"
                    size="lg"
                    disabled={!onCustomize}
                  >
                    <Palette className="w-5 h-5 mr-2" />
                    কাস্টমাইজ করুন
                  </Button>
                </div>
              </div>

              {/* Product Description */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">পণ্যের বিবরণ:</h4>
                <p className="text-sm text-blue-800">
                  {product.description || `${product.name} একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে। আমাদের সকল পণ্য যত্নসহকারে নির্বাচিত এবং মান নিয়ন্ত্রিত।`}
                </p>
              </div>

              {/* Delivery Info */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">ডেলিভারি তথ্য:</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• ঢাকায় ডেলিভারি চার্জ: ৮০ টাকা</li>
                  <li>• ঢাকার বাইরে: ৮০-১৩০ টাকা</li>
                  <li>• ডেলিভারি সময়: ২-৩ কার্যদিবস</li>
                  <li>• অগ্রিম পেমেন্ট প্রয়োজন</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Image Overlay Modal */}
      <Dialog open={isImageOverlayOpen} onOpenChange={setIsImageOverlayOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] p-0 bg-black/95 border-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {product.name} - সম্পূর্ণ ছবি
          </DialogTitle>
          <DialogDescription className="sr-only">
            {product.name} এর সম্পূর্ণ আকারের ছবি দেখুন। বন্ধ করতে ESC চাপুন বা ছবির বাইরে ক্লিক করুন।
          </DialogDescription>
          
          {/* Close Button */}
          <button
            onClick={() => setIsImageOverlayOpen(false)}
            className="absolute top-4 right-4 z-50 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-200 shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Full Size Image Container - Click to close */}
          <div 
            className="flex items-center justify-center h-full p-8 cursor-pointer"
            onClick={() => setIsImageOverlayOpen(false)}
          >
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=1200"}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              loading="lazy"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image itself
            />
          </div>

          {/* Product Name Overlay */}
          <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-sm text-white p-4 rounded-lg border border-white/10">
            <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
            <p className="text-sm opacity-90">ছবির বাইরে ক্লিক করুন অথবা ESC চাপুন বন্ধ করতে</p>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}