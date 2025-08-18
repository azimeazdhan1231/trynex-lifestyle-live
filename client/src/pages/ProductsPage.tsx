import Layout from "@/components/Layout";
import ProductGrid from "@/components/ProductGrid";
import ProductFilters from "@/components/ProductFilters";
import { useState } from "react";

const ProductsPage = () => {
  const [filters, setFilters] = useState({
    category: "",
    priceRange: [0, 10000] as [number, number],
    sortBy: "featured"
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
          </div>
          <div className="lg:w-3/4">
            <ProductGrid filters={filters} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;