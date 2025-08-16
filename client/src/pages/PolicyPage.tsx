import Layout from "@/components/Layout";
import PolicyContent from "@/components/PolicyContent";
import { useLocation } from "wouter";

const PolicyPage = () => {
  const [location] = useLocation();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PolicyContent path={location} />
      </div>
    </Layout>
  );
};

export default PolicyPage;