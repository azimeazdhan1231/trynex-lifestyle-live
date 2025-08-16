import Layout from "@/components/Layout";
import WishlistGrid from "@/components/WishlistGrid";

const WishlistPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">আমার উইশলিস্ট</h1>
        <WishlistGrid />
      </div>
    </Layout>
  );
};

export default WishlistPage;