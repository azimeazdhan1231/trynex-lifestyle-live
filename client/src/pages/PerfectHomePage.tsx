import React from 'react';
import { PerfectProductCard } from '@/components/PerfectProductCard';
import { PerfectCustomizeModal } from '@/components/PerfectCustomizeModal';
import { PerfectCartModal } from '@/components/perfect-modals/perfect-cart-modal';
import { PerfectPopupOffer } from '@/components/perfect-modals/perfect-popup-offer';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  Truck, 
  Shield, 
  RefreshCw,
  Zap,
  Gift,
  Palette,
  Coffee
} from 'lucide-react';

// Sample product data
const sampleProducts = [
  {
    id: 1,
    name: "Custom Lifestyle T-Shirt",
    description: "Premium cotton t-shirt with your custom design",
    price: 29.99,
    originalPrice: 39.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
    category: "clothing",
    tags: ["custom", "premium", "cotton"],
    customizationOptions: {
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["White", "Black", "Navy", "Gray"],
      materials: ["100% Cotton", "Premium Cotton Blend"]
    }
  },
  {
    id: 2,
    name: "Personalized Coffee Mug",
    description: "Ceramic mug with your custom text or artwork",
    price: 19.99,
    originalPrice: 24.99,
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=500&fit=crop",
    category: "drinkware",
    tags: ["personalized", "ceramic", "coffee"],
    customizationOptions: {
      sizes: ["Standard", "Large", "Travel"],
      colors: ["White", "Black", "Blue", "Red"],
      materials: ["Ceramic", "Porcelain"]
    }
  },
  {
    id: 3,
    name: "Custom Wall Art",
    description: "Beautiful canvas print with your personal design",
    price: 49.99,
    originalPrice: 69.99,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=500&fit=crop",
    category: "artwork",
    tags: ["custom", "canvas", "wall-art"],
    customizationOptions: {
      sizes: ["12x12", "16x16", "20x20", "24x24"],
      colors: ["Natural Canvas", "White Canvas", "Black Canvas"],
      materials: ["Canvas", "Premium Canvas", "Gallery Wrap"]
    }
  },
  {
    id: 4,
    name: "Personalized Phone Case",
    description: "Custom phone case with your design",
    price: 24.99,
    originalPrice: 34.99,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=500&fit=crop",
    category: "accessories",
    tags: ["phone", "custom", "protective"],
    customizationOptions: {
      sizes: ["iPhone 13", "iPhone 14", "iPhone 15", "Samsung S23", "Samsung S24"],
      colors: ["Clear", "Black", "White", "Transparent"],
      materials: ["Silicone", "Hard Plastic", "Hybrid"]
    }
  }
];

const features = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Free Shipping",
    description: "Free shipping on orders over $50"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Quality Guarantee",
    description: "30-day money back guarantee"
  },
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: "Easy Returns",
    description: "Hassle-free returns and exchanges"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Fast Production",
    description: "Custom orders ready in 3-5 days"
  }
];

const categories = [
  {
    name: "Clothing",
    icon: <Gift className="w-8 h-8" />,
    description: "Custom t-shirts, hoodies, and more",
    color: "from-blue-500 to-purple-600"
  },
  {
    name: "Drinkware",
    icon: <Coffee className="w-8 h-8" />,
    description: "Personalized mugs and bottles",
    color: "from-green-500 to-teal-600"
  },
  {
    name: "Artwork",
    icon: <Palette className="w-8 h-8" />,
    description: "Custom wall art and prints",
    color: "from-pink-500 to-red-600"
  }
];

export default function PerfectHomePage() {
  const { addToCart, items: cartItems } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = React.useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = React.useState(false);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleCustomize = (product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setIsCustomizeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            TryneX Lifestyle Shop
          </h1>
          <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto">
            Create your perfect lifestyle with custom products designed just for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            >
              Shop Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-purple-600"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-br ${category.color} text-white p-8 rounded-2xl text-center hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-white/90">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our collection of customizable lifestyle products. Each item can be personalized to match your unique style and preferences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleProducts.map((product) => (
              <PerfectProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onCustomize={handleCustomize}
                onQuickView={handleQuickView}
                onAddToWishlist={() => addToWishlist(product)}
                onRemoveFromWishlist={() => removeFromWishlist(product.id)}
                isInWishlist={isInWishlist(product.id)}
                isInCart={cartItems.some(item => item.id === product.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Something Amazing?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start customizing your products today and bring your vision to life
          </p>
          <Button 
            size="lg" 
            className="bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
          >
            Start Customizing
          </Button>
        </div>
      </section>

      {/* Modals */}
      {selectedProduct && (
        <PerfectCustomizeModal
          product={selectedProduct}
          isOpen={isCustomizeModalOpen}
          onClose={() => setIsCustomizeModalOpen(false)}
          onAddToCart={handleAddToCart}
        />
      )}

      <PerfectCartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
      />

      <PerfectPopupOffer />
    </div>
  );
} 