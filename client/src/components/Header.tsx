import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import IntegratedCartSystem from "./integrated-cart-system";
import { useQuery } from "@tanstack/react-query";
import EnhancedCartModal from "@/components/EnhancedCartModal";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  MapPin,
  Phone,
  Mail,
  Globe,
  Sun,
  Moon,
  Bell
} from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [location] = useLocation();
  const { items: cartItems, getTotalItems } = useCart();

  // Get site settings for branding
  const { data: siteSettings } = useQuery({
    queryKey: ['/api/settings'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const siteTitle = (siteSettings as any)?.site_title || "TryneX Lifestyle";
  const cartItemCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
  };

  useEffect(() => {
    // Set night mode as default
    const savedDarkMode = localStorage.getItem('darkMode');
    const shouldUseDarkMode = savedDarkMode !== null ? savedDarkMode === 'true' : true;
    setIsDarkMode(shouldUseDarkMode);
    document.documentElement.classList.toggle('dark', shouldUseDarkMode);
    if (savedDarkMode === null) {
      localStorage.setItem('darkMode', 'true');
    }
  }, []);

  const navigation = [
    { name: "হোম", href: "/", bengali: true },
    { name: "পণ্য", href: "/products", bengali: true },
    { name: "ট্র্যাকিং", href: "/tracking", bengali: true },
    { name: "অফার", href: "/offers", bengali: true },
    { name: "যোগাযোগ", href: "/contact", bengali: true },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span className="hidden sm:inline">01747292277</span>
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span className="hidden md:inline">trynexlifestyle@gmail.com</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium">🎉 ফ্রি ডেলিভারি ১৬০০ টাকার উপরে 🎉</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header
        className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'header-glass shadow-lg nav-premium'
            : 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm nav-premium'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" data-testid="logo-link">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg lg:text-xl">T</span>
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                    {siteTitle}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                    বাংলাদেশের প্রিমিয়াম গিফট স্টোর
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.span
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      location === item.href
                        ? 'text-primary border-b-2 border-primary pb-1'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    whileHover={{ y: -1 }}
                    data-testid={`nav-${item.name.toLowerCase()}`}
                  >
                    {item.name}
                  </motion.span>
                </Link>
              ))}
            </nav>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary bg-gray-50 dark:bg-gray-800"
                  data-testid="search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="hidden lg:flex"
                data-testid="theme-toggle"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>

              {/* Wishlist */}
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" data-testid="wishlist-button">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>

              {/* Integrated Cart System */}
              <IntegratedCartSystem />

              {/* User Account */}
              <Link href="/profile">
                <Button variant="ghost" size="icon" data-testid="profile-button">
                  <User className="w-5 h-5" />
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden"
                data-testid="mobile-menu-toggle"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-24 left-0 right-0 z-40 bg-white dark:bg-gray-900 shadow-xl lg:hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  data-testid="mobile-search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location === item.href
                          ? 'bg-primary text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                ))}
              </nav>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isDarkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    লগইন
                  </Button>
                  <Button size="sm">
                    রেজিস্টার
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Cart Modal */}
      <EnhancedCartModal 
        isOpen={showCartModal} 
        onClose={() => setShowCartModal(false)} 
      />
    </>
  );
};

export default Header;