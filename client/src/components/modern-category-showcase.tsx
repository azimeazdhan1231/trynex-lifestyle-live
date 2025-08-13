import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Gift,
  Heart,
  Users,
  Baby,
  Calendar,
  Star,
  Shirt,
  Coffee,
  Phone,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface CategoryItem {
  id: string;
  name: string;
  bengaliName: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  count: number;
  trending: boolean;
  image: string;
}

const ModernCategoryShowcase = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const categories: CategoryItem[] = [
    {
      id: "gift-for-her",
      name: "Gift for Her",
      bengaliName: "তার জন্য গিফট",
      description: "নারীদের জন্য বিশেষ উপহার সংগ্রহ",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      gradient: "from-pink-100 to-rose-100",
      count: 150,
      trending: true,
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: "gift-for-him",
      name: "Gift for Him",
      bengaliName: "তার জন্য গিফট",
      description: "পুরুষদের জন্য আকর্ষণীয় উপহার",
      icon: Users,
      color: "from-blue-500 to-indigo-500",
      gradient: "from-blue-100 to-indigo-100",
      count: 120,
      trending: false,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: "gift-for-babies",
      name: "Gift for Babies",
      bengaliName: "শিশুদের জন্য গিফট",
      description: "নবজাতক ও শিশুদের জন্য নিরাপদ উপহার",
      icon: Baby,
      color: "from-green-500 to-emerald-500",
      gradient: "from-green-100 to-emerald-100",
      count: 80,
      trending: true,
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: "birthday",
      name: "Birthday Gifts",
      bengaliName: "জন্মদিনের গিফট",
      description: "জন্মদিনের জন্য বিশেষ উপহার",
      icon: Calendar,
      color: "from-purple-500 to-violet-500",
      gradient: "from-purple-100 to-violet-100",
      count: 200,
      trending: true,
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: "t-shirt",
      name: "T-Shirts",
      bengaliName: "টি-শার্ট",
      description: "কাস্টম ডিজাইনের টি-শার্ট",
      icon: Shirt,
      color: "from-orange-500 to-red-500",
      gradient: "from-orange-100 to-red-100",
      count: 250,
      trending: false,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    },
    {
      id: "mug",
      name: "Mugs",
      bengaliName: "মগ",
      description: "পার্সোনালাইজড মগ কালেকশন",
      icon: Coffee,
      color: "from-amber-500 to-yellow-500",
      gradient: "from-amber-100 to-yellow-100",
      count: 100,
      trending: false,
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    setLocation(`/products?category=${categoryId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="bg-orange-100 text-orange-800 px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            বিশেষ ক্যাটেগরি
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            আপনার পছন্দের ক্যাটেগরি খুঁজুন
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            বিভিন্ন ধরনের গিফট এবং পণ্যের বিশাল সংগ্রহ থেকে আপনার পছন্দের আইটেম বেছে নিন
          </p>
        </motion.div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <motion.div
                key={category.id}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl bg-white cursor-pointer transform transition-all duration-500 h-full"
                  onClick={() => handleCategoryClick(category.id)}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="relative">
                    {/* Background Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.bengaliName}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-80 transition-opacity duration-300 ${
                        hoveredCategory === category.id ? 'opacity-90' : 'opacity-70'
                      }`} />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {category.trending && (
                          <Badge className="bg-red-500/90 text-white text-xs px-2 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            ট্রেন্ডিং
                          </Badge>
                        )}
                        <Badge className="bg-black/30 text-white text-xs px-2 py-1 backdrop-blur-sm">
                          {category.count}+ আইটেম
                        </Badge>
                      </div>

                      {/* Icon */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                          className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30"
                        >
                          <IconComponent className="w-8 h-8 text-white" />
                        </motion.div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Category Name */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {category.bengaliName}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {category.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span>৪.৮ রেটিং</span>
                        </div>
                        <span className="text-sm font-medium text-orange-600">
                          {category.count}+ পণ্য
                        </span>
                      </div>

                      {/* CTA Button */}
                      <Button
                        className="w-full group/button bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 font-medium"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <span>দেখুন</span>
                        <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover/button:translate-x-1" />
                      </Button>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* All Categories Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            onClick={() => setLocation('/products')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-full font-bold transform transition-all duration-300 hover:scale-105 shadow-xl"
          >
            সব ক্যাটেগরি দেখুন
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernCategoryShowcase;