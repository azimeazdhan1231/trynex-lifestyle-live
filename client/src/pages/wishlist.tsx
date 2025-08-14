import { useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingCart, Trash2, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist, isLoaded } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleAddToCart = (item: any) => {
    if (item.stock === 0) {
      toast({
        title: "স্টক নেই",
        description: "এই পণ্যটি বর্তমানে স্টকে নেই",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      quantity: 1
    });

    toast({
      title: "কার্টে যোগ করা হয়েছে!",
      description: `${item.name} সফলভাবে কার্টে যোগ করা হয়েছে`,
    });
  };

  const handleRemoveFromWishlist = (id: string) => {
    setRemovingItems(prev => new Set(prev).add(id));
    
    setTimeout(() => {
      removeFromWishlist(id);
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      toast({
        title: "পছন্দের তালিকা থেকে সরানো হয়েছে",
        description: "পণ্যটি আপনার পছন্দের তালিকা থেকে সরিয়ে দেওয়া হয়েছে",
      });
    }, 300);
  };

  const handleClearWishlist = () => {
    clearWishlist();
    toast({
      title: "পছন্দের তালিকা পরিষ্কার করা হয়েছে",
      description: "সব পণ্য পছন্দের তালিকা থেকে সরিয়ে দেওয়া হয়েছে",
    });
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">পছন্দের তালিকা লোড হচ্ছে...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-red-500 mr-3 fill-current" />
              <h1 className="text-3xl font-bold text-gray-900">আমার পছন্দের তালিকা</h1>
            </div>
            <p className="text-gray-600">
              {wishlist.length > 0 
                ? `আপনার পছন্দের ${wishlist.length}টি পণ্য`
                : "আপনার পছন্দের কোনো পণ্য নেই"
              }
            </p>
          </div>

          {/* Wishlist Items */}
          {wishlist.length > 0 ? (
            <>
              {/* Clear All Button */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-600">
                  মোট {wishlist.length}টি পণ্য
                </div>
                <Button
                  variant="outline"
                  onClick={handleClearWishlist}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid="button-clear-wishlist"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  সব সরান
                </Button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((item) => (
                  <Card 
                    key={item.id}
                    className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${
                      removingItems.has(item.id) ? 'opacity-50 scale-95' : ''
                    }`}
                    data-testid={`wishlist-item-${item.id}`}
                  >
                    <div className="relative">
                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden bg-gray-50">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        data-testid={`button-remove-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      {/* Stock Status */}
                      {item.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">স্টক নেই</Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Category */}
                      {item.category && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {item.category}
                        </p>
                      )}

                      {/* Product Name */}
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
                        {item.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-xs text-gray-500">
                          স্টক: {item.stock}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={item.stock <= 0}
                          className="w-full"
                          data-testid={`button-add-to-cart-${item.id}`}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          কার্টে যোগ করুন
                        </Button>
                        
                        <Link href={`/product/${item.id}`}>
                          <Button
                            variant="outline"
                            className="w-full"
                            data-testid={`button-view-details-${item.id}`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            বিস্তারিত দেখুন
                          </Button>
                        </Link>
                      </div>

                      {/* Added Date */}
                      <div className="text-xs text-gray-400 mt-2 text-center">
                        যোগ করা হয়েছে: {new Date(item.added_at).toLocaleDateString('bn-BD')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="text-center mt-8">
                <Link href="/products">
                  <Button size="lg" className="px-8">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    আরও কেনাকাটা করুন
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  আপনার পছন্দের তালিকা খালি
                </h2>
                <p className="text-gray-600 mb-6">
                  পণ্যের পাশের হার্ট আইকনে ক্লিক করে আপনার পছন্দের পণ্য সংরক্ষণ করুন
                </p>
                
                <Link href="/products">
                  <Button size="lg" className="px-8">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    কেনাকাটা শুরু করুন
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}