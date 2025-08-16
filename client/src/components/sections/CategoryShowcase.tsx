import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Smartphone, Shirt, Home, Package, Sparkles } from "lucide-react";

const CategoryShowcase = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 5 * 60 * 1000,
  });

  const defaultCategories = [
    {
      id: "1",
      name: "Gift Items",
      name_bengali: "গিফট আইটেম",
      description: "বিশেষ উপহারের জন্য",
      icon: Gift,
      color: "from-pink-500 to-rose-500",
      count: "১০০+"
    },
    {
      id: "2", 
      name: "Electronics",
      name_bengali: "ইলেকট্রনিক্স",
      description: "ল্যাপটপ, ফোন এবং আরো",
      icon: Smartphone,
      color: "from-blue-500 to-cyan-500",
      count: "৫০+"
    },
    {
      id: "3",
      name: "Fashion",
      name_bengali: "ফ্যাশন",
      description: "কাপড় এবং এক্সেসরিজ",
      icon: Shirt,
      color: "from-purple-500 to-indigo-500",
      count: "২০০+"
    },
    {
      id: "4",
      name: "Home & Living",
      name_bengali: "ঘর সাজানো",
      description: "ঘরের জিনিসপত্র",
      icon: Home,
      color: "from-green-500 to-emerald-500",
      count: "৮০+"
    },
    {
      id: "5",
      name: "Beauty",
      name_bengali: "সৌন্দর্য",
      description: "মেকআপ এবং স্কিনকেয়ার",
      icon: Sparkles,
      color: "from-orange-500 to-yellow-500",
      count: "৬০+"
    },
    {
      id: "6",
      name: "Others",
      name_bengali: "অন্যান্য",
      description: "বিবিধ পণ্য",
      icon: Package,
      color: "from-gray-500 to-slate-500",
      count: "৩০+"
    }
  ];

  const categoriesToShow = categories && categories.length > 0 
    ? categories.slice(0, 6).map((cat: any, index: number) => ({
        ...cat,
        icon: defaultCategories[index]?.icon || Package,
        color: defaultCategories[index]?.color || "from-gray-500 to-slate-500",
        count: "নতুন"
      }))
    : defaultCategories;

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            আমাদের ক্যাটেগরি
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            বিভিন্ন ধরনের পণ্যের বিশাল সংগ্রহ থেকে আপনার পছন্দের জিনিস খুঁজে নিন
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categoriesToShow.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <Link href={`/products?category=${category.name.toLowerCase()}`}>
                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-5 rounded-xl group-hover:opacity-10 transition-opacity`} />
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {category.name_bengali}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {category.description}
                  </p>
                  
                  <span className="text-xs font-medium text-primary">
                    {category.count} পণ্য
                  </span>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-xl transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;