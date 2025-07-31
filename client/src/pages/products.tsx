import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Filter } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import ProductModal from "@/components/product-modal";
import CustomizeModal from "@/components/customize-modal";
import { useCart } from "@/hooks/use-cart";
import { useAnalytics } from "@/hooks/use-analytics";
import type { Product, Category } from "@shared/schema";

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const { addToCart } = useCart();
  const { trackEvent } = useAnalytics();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-12">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <Input
            type="search"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-gray-500" />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full mb-6" style={{gridTemplateColumns: `repeat(${Math.min(categories.length + 1, 6)}, 1fr)`}}>
            <TabsTrigger value="all" className="text-xs sm:text-sm">সব প্রোডাক্ট</TabsTrigger>
            {categories.filter(cat => cat.is_active).map((category) => (
              <TabsTrigger key={category.name} value={category.name} className="text-xs sm:text-sm">
                {category.name_bengali}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all">
            <ProductGrid products={filteredProducts} />
          </TabsContent>

          {categories.filter(cat => cat.is_active).map((category) => (
            <TabsContent key={category.name} value={category.name}>
              <ProductGrid 
                products={filteredProducts.filter(p => p.category === category.name)} 
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
}

function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
    });
  };

  const handleCustomizeClick = (product: Product) => {
    setSelectedProduct(product);
    setShowCustomizeModal(true);
  };

  const handleCloseCustomizeModal = () => {
    setShowCustomizeModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="bg-white shadow-md rounded-lg overflow-hidden">
          <CardHeader className="px-4 py-2">
            <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="aspect-w-4 aspect-h-3 mb-4">
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover rounded-md"
              />
            </div>
            <p className="text-gray-600">Price: {formatPrice(product.price)}</p>
            <div className="flex justify-between items-center mt-4">
              <Badge>{product.stock > 0 ? "In Stock" : "Out of Stock"}</Badge>
              <Button size="sm" onClick={() => handleAddToCart(product)}>
                Add to Cart
              </Button>
            </div>
            <Button size="sm" onClick={() => handleCustomizeClick(product)}>
              Customize
            </Button>
          </CardContent>
        </Card>
      ))}
      <CustomizeModal
        isOpen={showCustomizeModal}
        onClose={handleCloseCustomizeModal}
        product={selectedProduct}
      />
    </div>
  );
}