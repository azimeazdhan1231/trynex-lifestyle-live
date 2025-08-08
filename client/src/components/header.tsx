import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Search, ShoppingCart, User, Menu, X, Phone, Mail, MapPin, Clock, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { COMPANY_NAME } from "@/lib/constants";
import CartModal from "@/components/cart-modal";
import SearchBar from "@/components/search-bar";
import ProductModal from "@/components/product-modal";
import { useSimpleAuth } from "@/hooks/use-simple-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const { user, isLoading, isAuthenticated, logout } = useSimpleAuth();

  const navItems = [
    { name: "হোম", href: "/" },
    { name: "পণ্য", href: "/products" },
    { name: "কাস্টমাইজেশন", href: "/products?customize=true" },
    { name: "কাস্টম অর্ডার", href: "/custom-order" },
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
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-primary cursor-pointer hover:text-primary/80 transition-colors truncate">
                  {COMPANY_NAME}
                </h1>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-medium transition-colors text-sm lg:text-base ${
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
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-colors"
              >
                <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative p-1.5 sm:p-2 text-gray-700 hover:text-primary transition-colors"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-secondary text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {cartCount}
                  </span>
                )}
              </Button>

              {/* User Authentication */}
              {!isLoading && (
                <>
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={''} alt={user?.firstName || 'User'} />
                            <AvatarFallback>
                              {user?.firstName?.[0] || user?.phone?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user?.firstName && user?.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user?.phone}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user?.phone}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem asChild>
                            <Link href="/dashboard" className="cursor-pointer">
                              <User className="mr-2 h-4 w-4" />
                              <span>ড্যাশবোর্ড</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/profile" className="cursor-pointer">
                              <User className="mr-2 h-4 w-4" />
                              <span>প্রোফাইল</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/orders" className="cursor-pointer">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              <span>আমার অর্ডার</span>
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            logout();
                            window.location.href = '/';
                          }}
                          className="cursor-pointer"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>লগআউট</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                      <div className="flex items-center space-x-1 sm:space-x-2">
                      <Button asChild variant="default" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                        <Link href="/auth">
                          <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">লগইন</span>
                          <span className="sm:hidden">লগ</span>
                        </Link>
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden p-1.5 sm:p-2">
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                  <div className="flex flex-col space-y-6 mt-6">
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-primary">{COMPANY_NAME}</h2>
                      <p className="text-sm text-gray-600">নেভিগেশন মেনু</p>
                    </div>

                    <div className="flex flex-col space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`block py-3 px-4 rounded-lg font-medium transition-all ${
                            isActive(item.href) 
                              ? "bg-primary text-white font-semibold shadow-lg" 
                              : "text-gray-600 hover:text-primary hover:bg-primary/10"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>

                    {/* User section in mobile menu */}
                    {!isLoading && !isAuthenticated && (
                      <div className="border-t pt-4 mt-6">
                        <div className="flex flex-col space-y-2">
                          <Button asChild variant="outline" className="w-full">
                            <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                              <User className="mr-2 h-4 w-4" />
                              লগইন
                            </Link>
                          </Button>
                          <Button asChild variant="default" className="w-full">
                            <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                              <User className="mr-2 h-4 w-4" />
                              রেজিস্টার
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Search Modal */}
      <SearchBar
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onProductSelect={(product) => {
          setSelectedProduct(product);
          setIsProductModalOpen(true);
        }}
      />

      {/* Product Modal from Search */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          onAddToCart={(product) => {
            // Handle add to cart functionality
            console.log('Adding to cart:', product.name);
            // Close modal after adding to cart
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </>
  );
}