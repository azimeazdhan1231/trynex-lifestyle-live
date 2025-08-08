import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Search, 
  Menu, 
  X, 
  User, 
  Heart, 
  Phone,
  MapPin,
  Clock,
  Star
} from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { COMPANY_NAME, WHATSAPP_NUMBER } from '@/lib/constants';

export default function EnhancedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location] = useLocation();
  const { totalItems } = useCart();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Close menu and remove effects when clicking close
  const handleMenuClose = () => {
    setIsMenuOpen(false);
    // Force reset any persisting effects
    setTimeout(() => {
      document.body.classList.remove('menu-open');
    }, 100);
  };

  const navigation = [
    { name: 'হোম', href: '/', icon: '🏠' },
    { name: 'পণ্যসমূহ', href: '/products', icon: '🛍️' },
    { name: 'ক্যাটাগরি', href: '/categories', icon: '📂' },
    { name: 'অফার', href: '/offers', icon: '🎉' },
    { name: 'আমাদের সম্পর্কে', href: '/about', icon: 'ℹ️' },
    { name: 'ব্লগ', href: '/blog', icon: '📝' },
    { name: 'যোগাযোগ', href: '/contact', icon: '📞' }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>


      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50' 
          : 'bg-white shadow-sm border-b border-gray-100'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center text-white font-bold text-lg lg:text-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                {COMPANY_NAME.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
                  {COMPANY_NAME}
                </h1>
                <p className="text-xs text-gray-500">আপনার পছন্দের গিফট শপ</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden lg:block flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg"
                >
                  খুঁজুন
                </Button>
              </div>
            </form>

            {/* Navigation Icons */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Search - Mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden w-10 h-10 p-0 hover:bg-gray-100 rounded-full"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex w-10 h-10 p-0 hover:bg-gray-100 rounded-full"
              >
                <Heart className="w-5 h-5" />
              </Button>

              {/* Account */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex w-10 h-10 p-0 hover:bg-gray-100 rounded-full"
              >
                <User className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative w-10 h-10 p-0 hover:bg-gray-100 rounded-full"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 bg-primary text-white text-xs flex items-center justify-center rounded-full animate-pulse">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={isMenuOpen ? handleMenuClose : () => setIsMenuOpen(true)}
                className="lg:hidden w-10 h-10 p-0 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label={isMenuOpen ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center py-4 border-t border-gray-100">
            <nav className="flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-primary/10 hover:text-primary ${
                    location === item.href 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm animate-slide-down">
            {/* Mobile Search */}
            <div className="p-4 border-b border-gray-100">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-20 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 input-mobile"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 text-white px-4 py-1.5"
                >
                  খুঁজুন
                </Button>
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="py-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-item flex items-center space-x-4 px-6 py-4 font-medium transition-all duration-200 touch-target ${
                    location === item.href 
                      ? 'bg-primary/10 text-primary border-r-4 border-primary' 
                      : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                  }`}
                  onClick={handleMenuClose}
                >
                  <span className="text-xl w-6 flex justify-center">{item.icon}</span>
                  <span className="text-lg">{item.name}</span>
                  {location === item.href && (
                    <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="p-6 border-t border-gray-100 space-y-4 bg-gray-50/50">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl btn-mobile touch-target">
                <User className="w-5 h-5 mr-3" />
                <span className="text-lg font-medium">লগইন / সাইন আপ</span>
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="py-4 rounded-xl btn-mobile touch-target border-2">
                  <Heart className="w-5 h-5 mr-2" />
                  <span className="font-medium">উইশলিস্ট</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="py-4 rounded-xl btn-mobile touch-target border-2"
                  onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`, '_blank')}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  <span className="font-medium">কল করুন</span>
                </Button>
              </div>
              
              {/* Quick Contact Info */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">দ্রুত যোগাযোগ</p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="font-medium">{WHATSAPP_NUMBER}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>২৪/৭</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}