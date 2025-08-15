import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import {
  ArrowRight,
  Star,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  Heart,
  TrendingUp,
  Award,
  Zap,
  Users,
  Gift,
  Palette,
  Sparkles,
  Crown,
  Flame,
  Camera,
  Coffee,
  Shirt,
  Smartphone,
  Home,
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Eye
} from 'lucide-react';
import PerfectProductCard from '@/components/PerfectProductCard';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { ProductGridSkeleton, HeroSkeleton, FeatureSkeleton } from '@/components/EnhancedLoadingSkeleton';
import type { Product } from '@shared/schema';
import { AlertCircle } from 'lucide-react';

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Custom Personalized T-Shirt',
    description: 'Premium cotton t-shirt with custom text and design',
    price: '25.99',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    category: 'clothing',
    stock: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Personalized Coffee Mug',
    description: 'Ceramic mug with custom text and images',
    price: '15.99',
    image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400',
    category: 'drinkware',
    stock: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Custom Photo Canvas Print',
    description: 'High-quality canvas print with your photos',
    price: '45.99',
    image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400',
    category: 'artwork',
    stock: 50,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Personalized Water Tumbler',
    description: 'Stainless steel tumbler with custom design',
    price: '29.99',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    category: 'drinkware',
    stock: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Custom Hoodie',
    description: 'Warm hoodie with personalized text and graphics',
    price: '39.99',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    category: 'clothing',
    stock: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Personalized Phone Case',
    description: 'Custom phone case with your design',
    price: '19.99',
    image_url: 'https://images.unsplash.com/photo-1603314585442-ee3b5c8151b5?w=400',
    category: 'accessories',
    stock: 200,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const categories = [
  { id: 'clothing', name: 'Clothing', icon: Shirt, color: 'bg-blue-500', count: 45 },
  { id: 'drinkware', name: 'Drinkware', icon: Coffee, color: 'bg-orange-500', count: 32 },
  { id: 'artwork', name: 'Artwork', icon: Camera, color: 'bg-purple-500', count: 28 },
  { id: 'accessories', name: 'Accessories', icon: Smartphone, color: 'bg-green-500', count: 38 }
];

const features = [
  {
    icon: Palette,
    title: '100% Customizable',
    description: 'Every product can be personalized with your text, images, and design preferences'
  },
  {
    icon: Crown,
    title: 'Premium Quality',
    description: 'We use only the finest materials and printing techniques for lasting results'
  },
  {
    icon: Zap,
    title: 'Fast Turnaround',
    description: 'Most orders ship within 2-3 business days with express options available'
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: '100% satisfaction guaranteed or your money back - no questions asked'
  }
];

export default function PerfectHomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'newest'>('popular');
  const [showFilters, setShowFilters] = useState(false);

  const { getTotalItems } = useCart();
  const { toast } = useToast();

  // Simulate loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = mockProducts.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0; // popular - keep original order
    }
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleSortChange = (sort: typeof sortBy) => {
    setSortBy(sort);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <HeroSkeleton />
        <div className="container mx-auto px-4 py-8">
          <FeatureSkeleton />
        </div>
        <div className="container mx-auto px-4 py-8">
          <ProductGridSkeleton variant="product-grid" count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white border-0 mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Premium Customization Shop
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Create Your Perfect
              <span className="block text-yellow-300">Personalized Items</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              From custom t-shirts to personalized mugs, bring your ideas to life with our premium customization services
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-4">
                <Palette className="h-5 w-5 mr-2" />
                Start Customizing
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-4">
                <Eye className="h-5 w-5 mr-2" />
                View Gallery
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Shirt className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="absolute top-32 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Coffee className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce" style={{ animationDelay: '2s' }}>
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
            <Camera className="h-7 w-7 text-white" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose Our Customization?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We combine cutting-edge technology with artisanal craftsmanship to deliver exceptional personalized products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Explore Our Categories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find the perfect canvas for your creativity across our diverse product range
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${category.color} flex items-center justify-center`}>
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.count} products
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {/* Header with filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {selectedCategory ? `${categories.find(c => c.id === selectedCategory)?.name} Products` : 'All Products'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {sortedProducts.length} products found
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Sort by
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                
                {showFilters && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      {[
                        { value: 'popular', label: 'Most Popular' },
                        { value: 'price-low', label: 'Price: Low to High' },
                        { value: 'price-high', label: 'Price: High to Low' },
                        { value: 'newest', label: 'Newest First' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleSortChange(option.value as typeof sortBy);
                            setShowFilters(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            sortBy === option.value
                              ? 'bg-primary text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {sortedProducts.map((product, index) => (
              <PerfectProductCard
                key={product.id}
                product={product}
                variant={index < 2 ? 'featured' : index < 4 ? 'premium' : 'default'}
                priority={index < 4}
                className={viewMode === 'list' ? 'flex flex-row' : ''}
              />
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" className="px-8 py-4">
              <RefreshCw className="h-5 w-5 mr-2" />
              Load More Products
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have personalized their world with our products
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold text-lg px-8 py-4">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Start Shopping
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary font-semibold text-lg px-8 py-4">
              <Phone className="h-5 w-5 mr-2" />
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TryneX Lifestyle</h3>
              <p className="text-gray-400 mb-4">
                Your premium destination for personalized lifestyle products
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/customize" className="hover:text-white transition-colors">Customization</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Returns</Link></li>
                <li><Link href="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Dhaka, Bangladesh</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+880 1234-567890</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@trynex.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TryneX Lifestyle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 