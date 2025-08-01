import { useState } from "react";
import {
  Drawer,
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Grid3X3, X } from "lucide-react";

interface MobileSearchDrawerProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  sortOption: string;
  setSortOption: (value: string) => void;
  categories: Array<{ id: string; name: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  resultsCount: number;
  totalCount: number;
}

export default function MobileSearchDrawer({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortOption,
  setSortOption,
  categories,
  sortOptions,
  resultsCount,
  totalCount
}: MobileSearchDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortOption("newest");
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="md:hidden fixed bottom-4 right-4 z-50 bg-white shadow-lg border-2 border-primary/20 hover:border-primary/40 rounded-full w-14 h-14"
        >
          <Search className="w-6 h-6 text-primary" />
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[85vh]" style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95vw',
        maxWidth: '500px',
        zIndex: 9999
      }}>
        <DrawerHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-lg font-semibold">
              পণ্য খুঁজুন ও ফিল্টার করুন
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
          <p className="text-sm text-gray-600">
            {resultsCount} টি পণ্য দেখানো হচ্ছে (মোট {totalCount} টি)
          </p>
        </DrawerHeader>

        <div className="px-4 pb-8 space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">পণ্যের নাম</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="যা খুঁজছেন তা লিখুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 text-base border-2 focus:border-primary rounded-xl"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">বিভাগ</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 border-2 rounded-xl text-base">
                <Filter className="w-5 h-5 mr-2" />
                <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-base py-3">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">সাজান</label>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="h-12 border-2 rounded-xl text-base">
                <Grid3X3 className="w-5 h-5 mr-2" />
                <SelectValue placeholder="সাজানোর ধরন নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-base py-3">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex-1 h-12 text-base"
            >
              সব ফিল্টার মুছুন
            </Button>
            <DrawerClose asChild>
              <Button className="flex-1 h-12 text-base">
                ফিল্টার প্রয়োগ করুন
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}