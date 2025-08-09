import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, User, Menu, X, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/hooks/use-cart';
import CartModal from './cart-modal';
import UserRegistration from './user-registration';
import UserLogin from './user-login';

interface UserData {
  firstName: string;
  email?: string;
  id?: string;
}

export default function EnhancedHeader() {
  const [location, navigate] = useLocation();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for the search modal

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false); // Close search modal after search
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

  const navLinks = [
    { href: '/', label: 'হোম' },
    { href: '/products', label: 'পণ্যসমূহ' },
    { href: '/categories', label: 'ক্যাটেগরি' },
    { href: '/about', label: 'আমাদের সম্পর্কে' },
    { href: '/contact', label: 'যোগাযোগ' },
    { href: '/blog', label: 'ব্লগ' }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">


        {/* Main Header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-1 sm:flex-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                T
              </div>
              <div className="block">
                <h1 className="text-base sm:text-xl font-bold text-gray-800">TryneX Shop</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Lifestyle Collection</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-8 px-3"
                >
                  খুঁজুন
                </Button>
              </form>
            </div>

            {/* Mobile Search Icon */}
            <div className="flex items-center gap-1 sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)} // Open search modal
                className="p-2 touch-button hover:bg-gray-100 rounded-lg transition-all duration-200"
                data-testid="button-mobile-search"
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Account */}
              <div className="hidden sm:block">
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {user.firstName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-xs"
                    >
                      লগআউট
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLogin(true)}
                      className="text-sm"
                    >
                      <User className="w-4 h-4 mr-1" />
                      লগইন
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRegistration(true)}
                      className="text-sm"
                    >
                      রেজিস্টার
                    </Button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 touch-button hover:bg-gray-100 rounded-lg transition-all duration-200"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="lg:hidden p-2 touch-button hover:bg-gray-100 rounded-lg transition-all duration-200"
                    data-testid="button-mobile-menu"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm bg-white border-l border-gray-200 shadow-xl p-0">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          T
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-800">TryneX Shop</h2>
                          <p className="text-xs text-gray-500">Lifestyle Collection</p>
                        </div>
                      </div>

                      {/* Mobile Search */}
                      <form onSubmit={handleSearch} className="relative">
                        <Input
                          type="text"
                          placeholder="পণ্য খুঁজুন..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-16 h-11 rounded-xl border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Button
                          type="submit"
                          size="sm"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 px-3 text-sm rounded-lg"
                        >
                          খুঁজুন
                        </Button>
                      </form>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto">
                      <nav className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">মেনু</h3>
                        <div className="space-y-2">
                          {navLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                              <Button
                                variant="ghost"
                                className={`w-full justify-start h-12 px-4 text-base font-medium rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 ${
                                  location === link.href 
                                    ? 'bg-primary text-white hover:bg-primary hover:text-white' 
                                    : 'text-gray-700'
                                }`}
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  navigate(link.href);
                                }}
                              >
                                {link.label}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </nav>

                      {/* User Actions in Mobile Menu */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        {user ? (
                          <div className="flex flex-col gap-3">
                            <div className="text-center">
                              <p className="font-medium text-gray-800">স্বাগতম, {user.firstName}</p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={handleLogout}
                              className="w-full"
                            >
                              লগআউট
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                            <Button
                              onClick={() => {
                                setShowLogin(true);
                                setIsMenuOpen(false);
                              }}
                              className="w-full"
                            >
                              <User className="w-4 h-4 mr-2" />
                              লগইন
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setShowRegistration(true);
                                setIsMenuOpen(false);
                              }}
                              className="w-full"
                            >
                              রেজিস্টার করুন
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-orange-600 ${
                  location === link.href
                    ? 'text-orange-600 border-b-2 border-orange-600 pb-1'
                    : 'text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Modals */}
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

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

      {/* YouTube-style Search Bar Modal */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}