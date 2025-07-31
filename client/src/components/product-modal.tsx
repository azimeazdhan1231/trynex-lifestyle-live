import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MessageCircle, X, Plus, Minus, Palette } from "lucide-react";
import { useState } from "react";
import { formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import type { Product } from "@shared/schema";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  if (!product) return null;

  // Track product view when modal opens
  if (isOpen && product) {
    trackProductView(product.id, product.name, product.category || "uncategorized");
  }

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
    const message = `আমি ${product.name} কিনতে চাই। দাম ${formatPrice(product.price)} x ${quantity} = ${formatPrice(parseFloat(product.price.toString()) * quantity)}`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            {product.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={product.image_url || "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
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
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock === 0 ? "স্টক নেই" : "কার্টে যোগ করুন"}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleWhatsAppOrder}
                  variant="outline"
                  className="bg-green-500 text-white hover:bg-green-600 border-green-500"
                  size="lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  হোয়াটসঅ্যাপে অর্ডার
                </Button>
                <Button
                  onClick={() => {
                    // This will be handled by parent component
                    console.log('Customize button clicked');
                  }}
                  variant="outline"
                  className="bg-purple-500 text-white hover:bg-purple-600 border-purple-500"
                  size="lg"
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
                {product.name} একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে। 
                আমাদের সকল পণ্য যত্নসহকারে নির্বাচিত এবং মান নিয়ন্ত্রিত।
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
      </DialogContent>
    </Dialog>
  );
}