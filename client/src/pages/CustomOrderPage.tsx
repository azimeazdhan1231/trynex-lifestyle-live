import Layout from "@/components/Layout";
import CustomOrderForm from "@/components/CustomOrderForm";
import { useParams } from "wouter";

const CustomOrderPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">কাস্টম অর্ডার</h1>
        <CustomOrderForm productId={id} />
      </div>
    </Layout>
  );
};

export default CustomOrderPage;