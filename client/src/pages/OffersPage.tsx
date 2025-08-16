import Layout from "@/components/Layout";
import OfferGrid from "@/components/OfferGrid";

const OffersPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">বিশেষ অফার</h1>
        <OfferGrid />
      </div>
    </Layout>
  );
};

export default OffersPage;