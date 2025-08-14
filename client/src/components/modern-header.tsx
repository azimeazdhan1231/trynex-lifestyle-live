import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, User, Menu, X, Heart, MapPin, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import ProfessionalCartModal from './professional-cart-modal';
import UserRegistration from './user-registration';
import UserLogin from './user-login';
import SearchBar from './search-bar';

interface UserData {
  firstName: string;
  email?: string;
  id?: string;
}

export default function ModernHeader() {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const handleNavigationClick = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: '/', label: 'হোম', icon: '🏠' },
    { href: '/products', label: 'পণ্যসমূহ', icon: '🛍️' },
    { href: '/custom-order', label: 'কাস্টমাইজ', icon: '🎨' },
    { href: '/tracking', label: 'ট্র্যাকিং', icon: '📦' },
    { href: '/about', label: 'আমাদের সম্পর্কে', icon: '💡' },
    { href: '/contact', label: 'যোগাযোগ', icon: '📞' },
    { href: '/blog', label: 'ব্লগ', icon: '📝' }
  ];

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 text-center text-sm font-medium">
        🎉 বিশেষ ছাড়! সব পণ্যে ২০% পর্যন্ত ছাড় - আজই অর্ডার করুন! 🎉
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 shadow-lg border-gray-200' 
          : 'bg-white/90 border-gray-100'
      }`}>
        
        {/* Contact Info Bar - Hidden on mobile */}
        <div className="hidden lg:block bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3 h-3" />
                  <span>+880 1234-567890</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3 h-3" />
                  <span>সারাদেশে হোম ডেলিভারি</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span>🚚 ফ্রি হোম ডেলিভারি ১৫০০+ অর্ডারে</span>
                <span>💳 bKash/Nagad পেমেন্ট গ্রহণযোগ্য</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-105">
                T
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  TryneX
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Lifestyle</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 hover:text-orange-500 ${
                    location === link.href
                      ? 'text-orange-500'
                      : 'text-gray-700 hover:bg-orange-50 rounded-lg'
                  }`}
                  data-testid={`nav-link-${link.href.replace('/', '') || 'home'}`}
                >
                  <span className="mr-1">{link.icon}</span>
                  {link.label}
                  {location === link.href && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:bg-white focus:border-orange-300 transition-all rounded-full"
                  data-testid="search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden p-2 hover:bg-orange-50 hover:text-orange-500 rounded-full"
                data-testid="button-mobile-search"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex p-2 hover:bg-orange-50 hover:text-orange-500 rounded-full relative"
                data-testid="button-wishlist"
              >
                <Heart className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center">
                  0
                </Badge>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-orange-50 hover:text-orange-500 rounded-full relative transition-all duration-200"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs min-w-5 h-5 flex items-center justify-center animate-pulse">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* User Account */}
              {user ? (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="p-2 hover:bg-orange-50 hover:text-orange-500 rounded-full"
                    data-testid="button-profile"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs px-3 py-1 hover:bg-red-50 hover:text-red-500 rounded-full"
                    data-testid="button-logout"
                  >
                    প্রস্থান
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowLogin(true)}
                    className="text-xs px-3 py-1 hover:bg-orange-50 hover:text-orange-500 rounded-full"
                    data-testid="button-login"
                  >
                    প্রবেশ
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowRegistration(true)}
                    className="text-xs px-4 py-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full"
                    data-testid="button-register"
                  >
                    নিবন্ধন
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden p-2 hover:bg-orange-50 hover:text-orange-500 rounded-full"
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    
                    {/* Mobile Menu Header */}
                    <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">
                            T
                          </div>
                          <div>
                            <h2 className="font-bold">TryneX Lifestyle</h2>
                            <p className="text-xs text-white/80">আপনার পছন্দের গিফট</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Navigation Links */}
                    <div className="flex-1 py-4">
                      {navLinks.map(link => (
                        <button
                          key={link.href}
                          onClick={() => handleNavigationClick(link.href)}
                          className={`w-full flex items-center space-x-4 px-6 py-4 text-left transition-colors ${
                            location === link.href
                              ? 'bg-orange-50 text-orange-500 border-r-2 border-orange-500'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          data-testid={`mobile-nav-${link.href.replace('/', '') || 'home'}`}
                        >
                          <span className="text-xl">{link.icon}</span>
                          <span className="font-medium">{link.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Mobile Account Section */}
                    <div className="border-t p-6 space-y-4">
                      {user ? (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <User className="w-8 h-8 p-2 bg-orange-100 text-orange-500 rounded-full" />
                            <div>
                              <p className="font-medium">{user.firstName}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNavigationClick('/profile')}
                              data-testid="mobile-button-profile"
                            >
                              প্রোফাইল
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleLogout}
                              data-testid="mobile-button-logout"
                            >
                              প্রস্থান
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowLogin(true)}
                            data-testid="mobile-button-login"
                          >
                            প্রবেশ
                          </Button>
                          <Button
                            onClick={() => setShowRegistration(true)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            data-testid="mobile-button-register"
                          >
                            নিবন্ধন
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <ProfessionalCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      <UserRegistration
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onLoginClick={() => {
          setShowRegistration(false);
          setShowLogin(true);
        }}
      />

      <UserLogin
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onRegisterClick={() => {
          setShowLogin(false);
          setShowRegistration(true);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}