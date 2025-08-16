import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import { Filter, X, Star, Zap, Award } from "lucide-react";

interface ProductFiltersProps {
  filters: {
    category: string;
    priceRange: [number, number];
    sortBy: string;
  };
  onFiltersChange: (filters: any) => void;
}

const ProductFilters = ({ filters, onFiltersChange }: ProductFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    staleTime: 5 * 60 * 1000,
  });

  const sortOptions = [
    { value: 'featured', label: 'ফিচারড' },
    { value: 'newest', label: 'নতুন' },
    { value: 'price-low', label: 'দাম: কম থেকে বেশি' },
    { value: 'price-high', label: 'দাম: বেশি থেকে কম' },
    { value: 'name', label: 'নাম অনুসারে' },
  ];

  const defaultCategories = [
    { name: 'Gift Items', name_bengali: 'গিফট আইটেম' },
    { name: 'Electronics', name_bengali: 'ইলেকট্রনিক্স' },
    { name: 'Fashion', name_bengali: 'ফ্যাশন' },
    { name: 'Home & Living', name_bengali: 'ঘর সাজানো' },
    { name: 'Beauty', name_bengali: 'সৌন্দর্য' },
    { name: 'Others', name_bengali: 'অন্যান্য' },
  ];

  const categoriesToShow = categories && categories.length > 0 ? categories : defaultCategories;

  const specialFilters = [
    {
      id: 'featured',
      label: 'ফিচারড পণ্য',
      icon: Star,
      checked: false
    },
    {
      id: 'latest',
      label: 'নতুন পণ্য',
      icon: Zap,
      checked: false
    },
    {
      id: 'bestselling',
      label: 'বেস্ট সেলার',
      icon: Award,
      checked: false
    }
  ];

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === filters.category ? '' : category
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: range
    });
  };

  const handleSortChange = (sortBy: string) => {
    onFiltersChange({
      ...filters,
      sortBy
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      category: '',
      priceRange: [0, 10000],
      sortBy: 'featured'
    });
  };

  const hasActiveFilters = filters.category || 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 10000 ||
    filters.sortBy !== 'featured';

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            ফিল্টার
          </div>
          {hasActiveFilters && (
            <Badge variant="destructive" className="ml-2">
              সক্রিয়
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Content */}
      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Sort By */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            সর্ট করুন
          </h3>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="সর্ট অপশন বেছে নিন" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Categories */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">ক্যাটেগরি</h3>
          <div className="space-y-2">
            <Button
              variant={filters.category === '' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => handleCategoryChange('')}
            >
              সব ক্যাটেগরি
            </Button>
            {categoriesToShow.map((category: any) => (
              <Button
                key={category.name}
                variant={filters.category === category.name.toLowerCase() ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleCategoryChange(category.name.toLowerCase())}
              >
                {category.name_bengali || category.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Price Range */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">দামের রেঞ্জ</h3>
          <div className="space-y-4">
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handlePriceRangeChange(value as [number, number])}
              max={10000}
              min={0}
              step={100}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{formatPrice(filters.priceRange[0])}</span>
              <span>{formatPrice(filters.priceRange[1])}</span>
            </div>
          </div>
        </Card>

        {/* Special Filters */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">বিশেষ ফিল্টার</h3>
          <div className="space-y-3">
            {specialFilters.map((filter) => (
              <div key={filter.id} className="flex items-center space-x-2">
                <Checkbox
                  id={filter.id}
                  checked={filter.checked}
                  onCheckedChange={() => {}}
                />
                <label
                  htmlFor={filter.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center cursor-pointer"
                >
                  <filter.icon className="w-4 h-4 mr-2" />
                  {filter.label}
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            সব ফিল্টার মুছুন
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;