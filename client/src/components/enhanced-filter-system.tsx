import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, Grid3X3, SlidersHorizontal } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface EnhancedFilterSystemProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
  resultsCount: number;
  totalCount: number;
  onFilterChange?: () => void;
}

const SORT_OPTIONS = [
  { value: "newest", label: "নতুন আগে" },
  { value: "oldest", label: "পুরাতন আগে" },
  { value: "price_asc", label: "দাম: কম থেকে বেশি" },
  { value: "price_desc", label: "দাম: বেশি থেকে কম" },
  { value: "name_asc", label: "নাম: A-Z" },
];

export default function EnhancedFilterSystem({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortOption,
  setSortOption,
  resultsCount,
  totalCount,
  onFilterChange
}: EnhancedFilterSystemProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    search: searchTerm,
    category: selectedCategory,
    sort: sortOption
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOption("newest");
    setTempFilters({ search: "", category: "all", sort: "newest" });
    onFilterChange?.();
  };

  const applyFilters = () => {
    setSearchTerm(tempFilters.search);
    setSelectedCategory(tempFilters.category);
    setSortOption(tempFilters.sort);
    setIsFilterOpen(false);
    onFilterChange?.();
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "all",
    sortOption !== "newest"
  ].filter(Boolean).length;

  const getSelectedCategoryName = () => {
    const category = PRODUCT_CATEGORIES.find(cat => cat.id === selectedCategory);
    return category?.bengaliName || category?.name || "সব পণ্য";
  };

  const getSortOptionLabel = () => {
    const option = SORT_OPTIONS.find(opt => opt.value === sortOption);
    return option?.label || "নতুন আগে";
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop Filter Bar */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search Input */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="পণ্য খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-10 border-gray-300 focus:border-primary rounded-lg"
              data-testid="input-search-products"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 h-10 border-gray-300 rounded-lg" data-testid="select-category">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
            </SelectTrigger>
            <SelectContent className="max-h-60 w-64">
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id} className="py-2">
                  <div className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.bengaliName || category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Options */}
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-44 h-10 border-gray-300 rounded-lg" data-testid="select-sort">
              <Grid3X3 className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue placeholder="সাজান" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="py-2">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-10 text-gray-600 border-gray-300 hover:bg-gray-50"
              data-testid="button-clear-filters"
            >
              <X className="w-4 h-4 mr-1" />
              সব মুছুন
            </Button>
          )}
        </div>

        {/* Mobile Filter Bar */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 mb-3">
            {/* Search Input - Mobile */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="পণ্য খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm border-gray-300 focus:border-primary rounded-lg"
                data-testid="input-search-products-mobile"
              />
            </div>

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-10 px-3 border-gray-300 relative"
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile Filter Panel */}
          {isFilterOpen && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
              {/* Category Filter - Mobile */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">বিভাগ</label>
                <Select value={tempFilters.category} onValueChange={(value) => setTempFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-full h-10 border-gray-300 rounded-lg">
                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="py-2">
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span className="text-sm">{category.bengaliName || category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options - Mobile */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">সাজান</label>
                <Select value={tempFilters.sort} onValueChange={(value) => setTempFilters(prev => ({ ...prev, sort: value }))}>
                  <SelectTrigger className="w-full h-10 border-gray-300 rounded-lg">
                    <Grid3X3 className="w-4 h-4 mr-2 text-gray-500" />
                    <SelectValue placeholder="সাজানোর ধরন" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="py-2">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons - Mobile */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex-1 h-9 text-sm"
                >
                  সব মুছুন
                </Button>
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="flex-1 h-9 text-sm"
                >
                  প্রয়োগ করুন
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{resultsCount}</span> টি পণ্য দেখানো হচ্ছে
            {totalCount !== resultsCount && (
              <span> (মোট <span className="font-medium">{totalCount}</span> টি)</span>
            )}
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">ফিল্টার:</span>
              <div className="flex gap-1">
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {getSelectedCategoryName()}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => setSelectedCategory("all")}
                    />
                  </Badge>
                )}
                {sortOption !== "newest" && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {getSortOptionLabel()}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => setSortOption("newest")}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}