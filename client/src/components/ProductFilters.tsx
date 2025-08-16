import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FilterX, Package2 } from "lucide-react";

interface FilterState {
  category: string;
  priceRange: [number, number];
  sortBy: string;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const ProductFilters = ({ filters, onFiltersChange }: ProductFiltersProps) => {
  const [tempPriceRange, setTempPriceRange] = useState(filters.priceRange);

  // Fetch categories for filter options
  const { data: categories } = useQuery<any[]>({
    queryKey: ['/api/categories'],
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep categories in memory for 30 minutes
    refetchOnWindowFocus: false,
  });

  const sortOptions = [
    { value: "featured", label: "ফিচারড পণ্য" },
    { value: "newest", label: "নতুন পণ্য" },
    { value: "price-low", label: "দাম: কম থেকে বেশি" },
    { value: "price-high", label: "দাম: বেশি থেকে কম" },
    { value: "name", label: "নাম অনুযায়ী" },
  ];

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handlePriceRangeChange = (value: number[]) => {
    setTempPriceRange([value[0], value[1]]);
  };

  const applyPriceRange = () => {
    onFiltersChange({ ...filters, priceRange: tempPriceRange });
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: "",
      priceRange: [0, 10000] as [number, number],
      sortBy: "featured"
    };
    setTempPriceRange(defaultFilters.priceRange);
    onFiltersChange(defaultFilters);
  };

  const activeFiltersCount = [
    filters.category && filters.category !== "",
    filters.priceRange[0] > 0 || filters.priceRange[1] < 10000,
  ].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <Package2 className="w-5 h-5 mr-2" />
            ফিল্টার
          </h3>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              <FilterX className="w-4 h-4 mr-1" />
              পরিষ্কার ({activeFiltersCount})
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {/* Sort By */}
          <div>
            <label className="text-sm font-medium mb-3 block">সাজান</label>
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="সাজানোর পদ্ধতি নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Categories */}
          <div>
            <label className="text-sm font-medium mb-3 block">ক্যাটেগরি</label>
            <div className="space-y-2">
              <Button
                variant={filters.category === "" ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange("")}
                className="w-full justify-start"
              >
                সব ক্যাটেগরি
              </Button>
              {(categories || []).map((category: any) => (
                <Button
                  key={category.id}
                  variant={filters.category === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category.name)}
                  className="w-full justify-start"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">মূল্য পরিসীমা</label>
              <Badge variant="secondary" className="text-xs">
                ৳{tempPriceRange[0]} - ৳{tempPriceRange[1]}
              </Badge>
            </div>
            <div className="px-2">
              <Slider
                value={tempPriceRange}
                onValueChange={handlePriceRangeChange}
                max={10000}
                min={0}
                step={100}
                className="mb-4"
              />
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>৳০</span>
                <span>৳১০,০০০+</span>
              </div>
              <Button
                size="sm"
                onClick={applyPriceRange}
                className="w-full"
                variant="outline"
              >
                প্রয়োগ করুন
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-3">সক্রিয় ফিল্টার</h4>
          <div className="flex flex-wrap gap-2">
            {filters.category && filters.category !== "" && (
              <Badge variant="secondary" className="text-xs">
                {filters.category}
                <button
                  onClick={() => handleCategoryChange("")}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
              <Badge variant="secondary" className="text-xs">
                ৳{filters.priceRange[0]} - ৳{filters.priceRange[1]}
                <button
                  onClick={() => onFiltersChange({ ...filters, priceRange: [0, 10000] })}
                  className="ml-1 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </Card>
      )}
    </motion.div>
  );
};

export default ProductFilters;