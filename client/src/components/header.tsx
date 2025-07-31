import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Search, ShoppingCart, User, Menu, X, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { COMPANY_NAME } from "@/lib/constants";
import CartModal from "@/components/cart-modal";
import SearchBar from "@/components/search-bar";
import ProductModal from "@/components/product-modal";
import type { Product } from "@shared/schema";

interface HeaderProps {
  cartCount: number;
  onCartOpen: () => void;
}

export default function Header({ cartCount, onCartOpen }: HeaderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { name: "হোম", href: "/" },
    { name: "পণ্য", href: "/products" },
    { name: "অফার", href: "/offers" },
    { name: "যোগাযোগ", href: "/contact" },
  ];

  const isActive = (href: string) => {
    return location === href;
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  return (
    <>
      <header className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors">
              {COMPANY_NAME}
            </h1>
          </Link>
        </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors ${
                  isActive(item.href) 
                    ? "text-primary font-semibold" 
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
              ))}
            </nav>

            {/* Search, Cart and Mobile Menu */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-gray-700 hover:text-primary transition-colors"
              >
                <Search className="h-6 w-6" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-primary transition-colors"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-2 font-medium ${
                    isActive(item.href) 
                      ? "text-primary font-semibold" 
                      : "text-gray-600 hover:text-primary"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Search Modal */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="top" className="h-auto max-h-[90vh] overflow-y-auto">
          <div className="space-y-6 mt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">পণ্য খুঁজুন</h2>
              <p className="text-gray-600">রিয়েল-টাইম সার্চ - টাইপ করুন এবং তাৎক্ষণিক ফলাফল পান</p>
            </div>
            <SearchBar
              onProductSelect={(product) => {
                setSelectedProduct(product);
                setIsProductModalOpen(true);
                setIsSearchOpen(false);
              }}
              placeholder="পণ্যের নাম, ক্যাটেগরি বা বর্ণনা লিখুন..."
              className="w-full"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Modal from Search */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          onAddToCart={(product, quantity) => {
            // Handle add to cart functionality
            console.log('Adding to cart:', product.name, 'Quantity:', quantity);
            // Close modal after adding to cart
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}