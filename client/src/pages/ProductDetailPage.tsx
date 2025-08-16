import Layout from "@/components/Layout";
import ProductDetail from "@/components/ProductDetail";
import RelatedProducts from "@/components/RelatedProducts";
import { useParams } from "wouter";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>পণ্য পাওয়া যায়নি</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProductDetail productId={id} />
      <RelatedProducts productId={id} />
    </Layout>
  );
};

export default ProductDetailPage;