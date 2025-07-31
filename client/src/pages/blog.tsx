import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, User, Eye, Share2, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import Header from "@/components/header";
import { useCart } from "@/hooks/use-cart";
import { COMPANY_NAME, formatPrice, createWhatsAppUrl } from "@/lib/constants";
import { format } from "date-fns";
import type { Blog } from "@shared/schema";

export default function BlogPage() {
  const { cartCount, openCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["/api/blogs"],
  });

  const filteredBlogs = blogs.filter((blog: Blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(blogs.map((blog: Blog) => blog.category))];

  const handleShare = (blog: Blog) => {
    const message = `${blog.title}\n\n${blog.content.substring(0, 100)}...\n\nবিস্তারিত দেখুন: ${window.location.origin}/blog`;
    window.open(createWhatsAppUrl(message), '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartCount={cartCount} onCartOpen={openCart} />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              আমাদের ব্লগ
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {COMPANY_NAME} ব্লগ
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              সর্বশেষ আপডেট, টিপস এবং পণ্যের তথ্য পান
            </p>
            <p className="text-lg leading-relaxed max-w-3xl mx-auto opacity-80">
              আমাদের ব্লগে পাবেন পণ্যের বিস্তারিত তথ্য, ব্যবহারের টিপস, 
              লাইফস্টাইল পরামর্শ এবং আরও অনেক কিছু।
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="ব্লগ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 text-lg"
            />
          </div>
          
          {categories.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button
                variant={searchTerm === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSearchTerm("")}
              >
                সবগুলো
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={searchTerm === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSearchTerm(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                কোনো ব্লগ পোস্ট পাওয়া যায়নি
              </h3>
              <p className="text-gray-500">
                শীঘ্রই নতুন ব্লগ পোস্ট যোগ করা হবে। আমাদের সাথে থাকুন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog: Blog) => (
                <Card key={blog.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                  {blog.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {blog.category}
                        </Badge>
                        {blog.is_featured && (
                          <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600">
                            ফিচার্ড
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>

                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                        {blog.content}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(blog.created_at), 'dd/MM/yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{blog.author}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Eye className="w-4 h-4" />
                          <span>{blog.views || 0} ভিউ</span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShare(blog)}
                            className="text-xs"
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            শেয়ার
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs"
                          >
                            <ArrowRight className="w-3 h-3 mr-1" />
                            পড়ুন
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                আপডেট পেতে চান?
              </h3>
              <p className="text-gray-600 mb-6">
                নতুন ব্লগ পোস্ট এবং অফারের খবর পেতে আমাদের সাথে যুক্ত থাকুন
              </p>
              <Button
                asChild
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <a
                  href={createWhatsAppUrl("আমি Trynex Lifestyle এর ব্লগ আপডেট পেতে চাই")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 w-5 h-5" />
                  হোয়াটসঅ্যাপে যোগ দিন
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{COMPANY_NAME}</h3>
            <p className="text-gray-300 mb-6">
              সর্বশেষ আপডেট পেতে আমাদের ব্লগ ফলো করুন
            </p>
            <p className="text-gray-400">
              © 2025 {COMPANY_NAME}. সকল অধিকার সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}