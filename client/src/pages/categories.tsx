import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Grid3X3, Package } from "lucide-react";
// Using simple loading and image components

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
}

export default function Categories() {
  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                  </button>
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">সব ক্যাটাগরি</h1>
              </div>
              <Grid3X3 className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">ক্যাটাগরি লোড করতে সমস্যা</h3>
          <p className="text-gray-600">অনুগ্রহ করে পরে আবার চেষ্টা করুন</p>
          <Link href="/">
            <button className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              হোমে ফিরুন
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">সব ক্যাটাগরি</h1>
              <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                {categories.length} টি
              </span>
            </div>
            <Grid3X3 className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">কোন ক্যাটাগরি পাওয়া যায়নি</h3>
            <p className="text-gray-600">শীঘ্রই নতুন ক্যাটাগরি যোগ করা হবে</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
              >
                <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
                  {/* Category Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                        <Package className="h-8 w-8 text-primary/60" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  {/* Category Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer Message */}
        <div className="text-center mt-12 py-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            আরও পণ্য দেখতে ক্যাটাগরিতে ক্লিক করুন
          </p>
        </div>
      </div>
    </div>
  );
}