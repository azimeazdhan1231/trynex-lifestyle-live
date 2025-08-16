import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/constants";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Zap,
  Award
} from "lucide-react";

interface ProductDetailProps {
  productId: string;
}

const ProductDetail = ({ productId }: ProductDetailProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${productId}`],
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">পণ্য পাওয়া যায়নি</h2>
          <p className="text-gray-600 mb-6">দুঃখিত, এই পণ্যটি খুঁজে পাওয়া যায়নি।</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image_url || "",
      quantity
    });
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(product.stock, quantity + delta)));
  };

  const discountPercentage = Math.floor(Math.random() * 30) + 10;
  const originalPrice = Math.round(parseFloat(product.price) * 1.2);

  // Mock multiple images (in real app, this would come from product data)
  const images = [
    product.image_url,
    product.image_url,
    product.image_url,
    product.image_url
  ].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Main Image */}
          <div className="relative bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden aspect-square">
            {images.length > 0 ? (
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-500 dark:text-gray-400">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">ছবি নেই</p>
                </div>
              </div>
            )}
            
            {/* Discount Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                -{discountPercentage}% ছাড়
              </Badge>
            </div>
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Category */}
          {product.category && (
            <Badge variant="outline" className="text-primary border-primary">
              {product.category}
            </Badge>
          )}

          {/* Product Badges */}
          <div className="flex flex-wrap gap-2">
            {product.is_featured && (
              <Badge className="bg-red-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                ফিচারড
              </Badge>
            )}
            {product.is_latest && (
              <Badge className="bg-green-500 text-white">
                <Zap className="w-3 h-3 mr-1" />
                নতুন
              </Badge>
            )}
            {product.is_best_selling && (
              <Badge className="bg-blue-500 text-white">
                <Award className="w-3 h-3 mr-1" />
                বেস্ট সেলার
              </Badge>
            )}
          </div>

          {/* Product Name */}
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < 4
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              ৪.৮ (১২৩ রিভিউ)
            </span>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatPrice(parseFloat(product.price))}
              </span>
              <span className="text-xl text-gray-500 line-through">
                ৳{originalPrice}
              </span>
              <Badge className="bg-green-500 text-white">
                ৳{originalPrice - parseFloat(product.price)} সাশ্রয়
              </Badge>
            </div>
            <p className="text-green-600 dark:text-green-400 font-medium">
              স্টক আছে ({product.stock} টি বাকি)
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">বিবরণ</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">পরিমাণ:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full text-lg"
                disabled={product.stock === 0}
                data-testid="add-to-cart-detail"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                কার্টে যোগ করুন - {formatPrice(parseFloat(product.price) * quantity)}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="lg">
                  <Heart className="w-4 h-4 mr-2" />
                  উইশলিস্ট
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4 mr-2" />
                  শেয়ার
                </Button>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-green-500" />
                <span>ফ্রি ডেলিভারি</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>নিরাপদ পেমেন্ট</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="w-4 h-4 text-purple-500" />
                <span>৭ দিন রিটার্ন</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;