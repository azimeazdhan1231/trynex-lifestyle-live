import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Gift, Heart, Baby, Users, Cake, PartyPopper } from "lucide-react";
import { Link } from "wouter";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface GiftCategoryShowcaseProps {
  onCategorySelect?: (categoryId: string) => void;
}

export default function GiftCategoryShowcase({ onCategorySelect }: GiftCategoryShowcaseProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Featured gift categories for the homepage showcase
  const featuredCategories = [
    {
      id: "gift-for-her",
      title: "তার জন্য উপহার",
      subtitle: "বিশেষ মহিলাদের জন্য",
      icon: Heart,
      gradient: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      textColor: "text-pink-700",
      description: "আপনার প্রিয় মানুষের জন্য সুন্দর উপহার"
    },
    {
      id: "gift-for-him",
      title: "তার জন্য উপহার",
      subtitle: "পুরুষদের জন্য বিশেষ",
      icon: Gift,
      gradient: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      description: "পুরুষদের পছন্দের আকর্ষণীয় উপহার"
    },
    {
      id: "gift-for-babies",
      title: "শিশুদের জন্য উপহার",
      subtitle: "ছোট্ট সোনাদের জন্য",
      icon: Baby,
      gradient: "from-yellow-400 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      description: "নিরাপদ ও মজাদার শিশু উপহার"
    },
    {
      id: "gift-for-parents",
      title: "বাবা-মায়ের জন্য",
      subtitle: "অভিভাবকদের সম্মান",
      icon: Users,
      gradient: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      description: "বাবা-মায়ের জন্য বিশেষ উপহার"
    },
    {
      id: "birthday-gift",
      title: "জন্মদিনের উপহার",
      subtitle: "জন্মদিন উদযাপন",
      icon: Cake,
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      description: "জন্মদিনের জন্য বিশেষ উপহার"
    },
    {
      id: "anniversary-gift",
      title: "বার্ষিকীর উপহার",
      subtitle: "স্মৃতি রক্ষার উপহার",
      icon: PartyPopper,
      gradient: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      description: "বার্ষিকী উদযাপনের জন্য"
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gift className="w-12 h-12 text-primary mr-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              উপহারের বিভাগসমূহ
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            প্রতিটি বিশেষ মুহূর্তের জন্য পারফেক্ট উপহার খুঁজে নিন। আমাদের কাছে রয়েছে সব ধরনের গিফট কালেকশন।
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card
                key={category.id}
                className={`group cursor-pointer transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl border-2 ${category.borderColor} ${category.bgColor} overflow-hidden relative`}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => handleCategoryClick(category.id)}
                data-testid={`card-category-${category.id}`}
              >
                <CardContent className="p-6 relative z-10">
                  {/* Category Icon */}
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Category Info */}
                  <div className="space-y-3">
                    <h3 className={`text-xl font-bold ${category.textColor} group-hover:text-gray-900 transition-colors duration-300`}>
                      {category.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-600">
                      {category.subtitle}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Link href={`/products?category=${category.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`mt-4 w-full group-hover:bg-gradient-to-r group-hover:${category.gradient} group-hover:text-white group-hover:border-transparent transition-all duration-300`}
                      data-testid={`button-view-category-${category.id}`}
                    >
                      <span className="mr-2">দেখুন</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>

                  {/* Hover Effect Badge */}
                  {hoveredCategory === category.id && (
                    <Badge className={`absolute top-4 right-4 bg-gradient-to-r ${category.gradient} text-white shadow-lg animate-bounce`}>
                      নতুন
                    </Badge>
                  )}
                </CardContent>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center">
          <Link href="/products">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white px-8 py-4 rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              data-testid="button-view-all-categories"
            >
              <Gift className="w-5 h-5 mr-3" />
              সব উপহার দেখুন
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}